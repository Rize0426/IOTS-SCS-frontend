import { marked } from 'marked';
import hljs from 'highlight.js';

// 配置Markdown解析器
const md = marked.setOptions({
  gfm: true,         // 支持GitHub风格Markdown
  breaks: true,      // 支持换行符渲染为<br>
  highlight: (code, lang) => {
    // 代码高亮处理
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (error) {
      console.warn('代码高亮处理失败:', error);
      // 失败时返回原始代码，但用pre和code标签包裹
      return `<pre><code>${code}</code></pre>`;
    }
  }
});

export default function parseMarkdown(content:string){
    return md.parse(content)
}