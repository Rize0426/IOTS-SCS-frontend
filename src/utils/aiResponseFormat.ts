/**
 * AI响应格式化工具
 * 用于将AI生成的文本（包含Markdown、代码块、数学公式等）转换为格式化的HTML
 */
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import parseMarkdown from './markdownParse';
/**
 * 数学公式块接口定义
 */
interface MathBlock {
  id: string;        // 占位符ID
  content: string;   // 数学公式内容
  type: 'block' | 'inline'; // 公式类型：块级或行内
}

/**
 * 格式化选项接口定义
 */
interface FormatOptions {
  sanitize?: boolean;  // 是否进行HTML安全过滤
  renderMath?: boolean; // 是否渲染数学公式
  baseUrl?: string;    // 图片等资源的基础URL
  codeTheme?: string;  // 代码高亮主题
  allowedTags?: string[]; // 允许的HTML标签
  allowedAttrs?: string[]; // 允许的HTML属性
  highlightCode?: boolean; // 新增
  copyButton?: boolean;    // 新增
  copyButtonText?: string; // 新增
  copiedButtonText?: string; // 新增
}

/**
 * 格式化AI输出文本（支持Markdown、代码块、数学公式、表格）
 * @param text - AI原始输出文本
 * @param options - 配置选项
 * @returns 格式化后的HTML字符串
 */
export function formatAIOutput(text: string, options: FormatOptions = {}): string {
  // 如果输入为空，返回空字符串
  if (!text) return '';

  const {
    sanitize = true,    // 默认进行HTML安全过滤
    renderMath = true,  // 默认渲染数学公式
    baseUrl = '',       // 默认不添加基础URL
    allowedTags = ['iframe'], // 默认允许的额外标签
    allowedAttrs = ['allow', 'allowfullscreen', 'frameborder', 'scrolling'], // 默认允许的额外属性
    highlightCode = true, // 新增：是否启用代码高亮
    copyButton = true,    // 新增：是否显示复制按钮
    copyButtonText = '复制', // 新增：复制按钮文本
    copiedButtonText = '已复制', // 新增：复制成功后按钮文本
  } = options;

  try {
    // 1. 预处理：提取数学公式（避免被Markdown解析器误处理）
    let processedText = text;
    let mathBlocks: MathBlock[] = [];
    if (renderMath) {
      // 处理块级数学公式 ($$...$$)
      processedText = processedText.replace(/\$\$(.*?)\$\$/gs, (match, content) => {
        const id = `__MATH_BLOCK_${mathBlocks.length}__`;
        mathBlocks.push({ id, content, type: 'block' });
        return id;
      });

      // 处理行内数学公式 ($...$)
      processedText = processedText.replace(/\$(.*?)\$/g, (match, content) => {
        const id = `__MATH_INLINE_${mathBlocks.length}__`;
        mathBlocks.push({ id, content, type: 'inline' });
        return id;
      });
    }

    // 2. Markdown解析（包含代码块、表格等）
    let html = parseMarkdown(processedText);

    // 3. 安全过滤（防止XSS攻击）
    if (sanitize) {
      html = DOMPurify.sanitize(html, {
        ADD_TAGS: allowedTags,    // 允许的额外标签
        ADD_ATTR: allowedAttrs    // 允许的额外属性
      });
    }

    // 4. 后处理：渲染数学公式
    if (renderMath && mathBlocks.length > 0) {
      mathBlocks.forEach(math => {
        const id = math.id.slice(2, -2); // 去掉前后的双下划线

        try {
          // 使用KaTeX渲染数学公式
          const rendered = katex.renderToString(math.content, {
            displayMode: math.type === 'block', // 块级公式使用displayMode
            throwOnError: true,  // 错误时抛出异常
            output: 'html'        // 输出HTML
          });
          // 替换占位符ID为渲染后的HTML
          html = html.replace(id, rendered);
        } catch (error) {
          console.warn('数学公式渲染失败:', error);
          // 渲染失败时保留原始公式格式
          html = html.replace(
            id,
            math.type === 'block' ? `$$${math.content}$$` : `$${math.content}$`
          );
        }
      });
    }

    // 5. 处理图片URL（添加baseUrl）
    if (baseUrl) {
      html = html.replace(/<img src="([^"]+)"/g, (match, src) => {
        // 只处理相对路径的图片
        if (!src.startsWith('http') && !src.startsWith('//')) {
          return `<img src="${baseUrl}/${src.replace(/^\//, '')}" >`;
        }
        return match;
      });
    }
    /*// 6. 代码高亮和复制按钮（新增）
    if (highlightCode || copyButton) {
      // 创建临时DOM容器
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // 处理所有代码块
      const codeBlocks = tempDiv.querySelectorAll('pre code');
      codeBlocks.forEach((codeEl) => {
        // 代码高亮
        if (highlightCode && typeof hljs !== 'undefined') {
          hljs.highlightElement(codeEl as HTMLElement);
        }

        // 添加复制按钮
        if (copyButton) {
          const preEl = codeEl.parentElement;
          if (preEl && preEl.tagName === 'PRE') {
            // 创建复制按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'code-copy-container';

            // 创建复制按钮
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-button';
            copyButton.textContent = copyButtonText;
            copyButton.title = '复制代码';
            copyButton.onclick = () => {
              console.log('复制代码:', codeEl.textContent);
              // 复制代码内容
              navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
                // 复制成功后修改按钮文本
                const originalText = copyButton.textContent;
                copyButton.textContent = copiedButtonText;
                // 2秒后恢复原文本
                setTimeout(() => {
                  copyButton.textContent = originalText;
                }, 2000);
              }).catch((err) => {
                console.error('复制失败:', err);
              });
            };

            // 将按钮添加到容器
            buttonContainer.appendChild(copyButton);
            // 将按钮容器插入到pre元素之前
            preEl.parentNode?.insertBefore(buttonContainer, preEl);
          }
        }
      });

      // 更新HTML
      html = tempDiv.innerHTML;
    }*/

    return html;
  } catch (error) {
    console.error('AI输出格式化失败:', error);
    // 发生错误时，返回原始文本，但用pre标签包裹以保持格式
    return `<pre>${text}</pre>`;
  }
}


/**
 * 简化版格式化函数，只处理基本Markdown，不处理数学公式
 * 适用于性能要求高但功能需求简单的场景
 * @param text - 原始文本
 * @returns 格式化后的HTML
 */
export function simpleFormat(text: string): string {
  if (!text) return '';

  try {
    // 只进行基本的Markdown解析，不处理数学公式
    return parseMarkdown(text);
  } catch (error) {
    console.error('简单格式化失败:', error);
    return `<pre>${text}</pre>`;
  }
}

/**
 * 提取纯文本内容（去除所有HTML标签和Markdown语法）
 * 用于需要纯文本的场景，如搜索索引、摘要生成等
 * @param html - HTML或Markdown文本
 * @returns 提取的纯文本
 */
export function extractPlainText(html: string): string {
  if (!html) return '';

  try {
    // 先将Markdown转为HTML
    const htmlContent = parseMarkdown(html);

    // 创建临时DOM元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 获取纯文本内容
    return tempDiv.textContent || tempDiv.innerText || '';
  } catch (error) {
    console.error('提取纯文本失败:', error);
    return html; // 失败时返回原始文本
  }
}