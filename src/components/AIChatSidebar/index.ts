import { ref, computed, nextTick, watch, onMounted, defineComponent } from 'vue'
import {
    Close, Clock, Document, Picture, Paperclip,
    Promotion, Plus, Delete
} from '@element-plus/icons-vue'
// 类型修正：ElementPlus Scrollbar 实例类型
import { ElMessage, type ScrollbarInstance } from 'element-plus'
import { customFetch } from '../../api/customFetch'
import { formatAIOutput } from '../../utils/aiResponseFormat'
interface Message {
    id: number | string,
    role: string,
    content: string,
    images?: UpLoadFile[],
    files?: UpLoadFile[],
    createAt: Date
}
interface UpLoadFile {
    name: string
    url?: string
    file?: File
    size?: number
}
interface ChatHistory {
    chatId: number | string
    title: string
    createTime: Date
}
// 组件逻辑
export const useAIChatSidebar = (props: { visible: boolean }, emit: any) => {
    const aiChatVisible = ref(false)
    const isButtonShow = ref(false)

    const showAIChat = async () => {
        aiChatVisible.value = true;
        // 创建一个新的会话
        await startNewChat()
    }

    // 响应式数据
    const inputMessage = ref('')
    const messages = ref<Message[]>([
        {
            id: 1,
            role: 'assistant',
            content: '你好！我是AI助手，有什么可以帮助你的吗？',
            createAt: new Date()
        }
    ])
    const filePaths = ref<string[]>([])
    const uploadedImages = ref<UpLoadFile[]>([])
    const uploadedFiles = ref<UpLoadFile[]>([])
    const isLoading = ref(false)
    const currentChatId = ref<number | string>(1)

    const messagesScrollbar = ref<ScrollbarInstance | null>(null)
    const showHistoryDialog = ref(false)

    // 历史聊天数据
    const chatHistory = ref<ChatHistory[]>([])

    // 计算属性
    const canSend = computed(() => {
        return inputMessage.value.trim() || uploadedImages.value.length || uploadedFiles.value.length
    })

    // 监听visible变化
    watch(() => props.visible, (newVal) => {
        if (newVal) {
            nextTick(() => {
                scrollToBottom()
            })
        }
    })

    const fetchChatHistory = async () => {
        try {
            const response = await customFetch('/api/ai/chat')
            const data = await response.json()
            if (data && data.code === 200) {
                chatHistory.value = data.data || []
                if (messages.value.length <= 1) {
                    chatHistory.value.unshift({
                        chatId: currentChatId.value,
                        title: "新会话",
                        createTime: new Date()
                    })
                }
                chatHistory.value.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
            } else {
                console.error('获取聊天历史失败:', data.message || '未知错误')
                ElMessage.error('获取聊天历史失败')
            }
        } catch (error) {
            console.error('获取聊天历史时发生错误:', error)
            ElMessage.error('获取聊天历史时发生错误')
        }
    }

    onMounted(() => {
        // 是否显示按钮
        const path = window.location.href
        if (!path.includes('/exam/paper') && localStorage.getItem('token')) {
            isButtonShow.value = true
        } else {
            isButtonShow.value = false
        }

        // 按钮宽高（与 CSS 保持一致）
        const btnWidth = 60;
        const btnHeight = 60;
        // 窗口宽高 - 按钮宽高 - 边距（20px），定位到右下角
        x.value = window.innerWidth - btnWidth - 20;
        y.value = window.innerHeight - btnHeight - 20;
    })

    // 方法
    const closeSidebar = () => {
        emit('update:visible', false)
        emit('close')
        aiChatVisible.value = false
    }

    const handleOverlayClick = () => {
        closeSidebar()
    }

    const sendMessage = async () => {
        if (!canSend.value) return

        const prompt = inputMessage.value.trim()
        const newMessage = {
            id: Date.now(),
            role: 'user',
            content: prompt,
            images: [...uploadedImages.value],
            files: [...uploadedFiles.value],
            createAt: new Date()
        }

        messages.value.push(newMessage)

        // 清空输入
        inputMessage.value = ''
        uploadedImages.value = []
        uploadedFiles.value = []

        // 滚动到底部
        await nextTick()
        scrollToBottom()

        // 获取AI回复
        await getAIResponse(prompt)
    }

    const getAIResponse = async (prompt: string) => {
        isLoading.value = true

        let aiResponse: Message = {
            id: Date.now(),
            role: 'assistant',
            content: '',
            createAt: new Date()
        }
        messages.value.push(aiResponse)
        nextTick(() => {
            // 确保滚动到底部
            scrollToBottom()
        })
        try {
            // 创建AbortController用于取消请求
            const controller = new AbortController();
            const signal = controller.signal;

            // 发送fetch请求
            const response = await customFetch(`/api/ai/chat/res/${currentChatId.value}`, {
                method: 'POST',
                signal: signal,
                body: JSON.stringify({
                    prompt: prompt,
                    files: filePaths.value
                })
            });

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                // 读取数据块
                const { done, value } = await reader.read();

                if (done) {
                    aiResponse.content = formatAIOutput(aiResponse.content)
                    limitChildrenWidth(".message-text")
                    break;
                }
                // 解码二进制数据为文本
                const chunk = decoder.decode(value, { stream: true });

                // 更新数据 (使用nextTick确保UI更新)
                aiResponse.content += chunk;
                nextTick(() => {
                    // 确保滚动到底部
                    scrollToBottom()
                })
            }

            /*const response = await customFetch(`/api/ai/chat/res/${currentChatId.value}`, {
                method: 'POST',
                body: JSON.stringify({
                    prompt: prompt,
                    files: filePaths.value
                })
            });
            const data = await response.json()
            if (!data || data.code !== 200) {
                aiResponse.content = '抱歉，AI助手无法处理您的请求，请稍后再试。'
                ElMessage.error('AI回复失败')
                return
            }
            aiResponse.content = formatAIOutput(data.data)*/
        } catch (error) {
            console.error('AI回复时发生错误:', error)
            ElMessage.error('AI回复时发生错误')
            aiResponse.content = '抱歉，AI助手无法处理您的请求，请稍后再试。'
        } finally {
            filePaths.value = []
        }
        isLoading.value = false
        await nextTick()
        scrollToBottom()
    }

    const uploadFile = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await customFetch(`/api/ai/upload/${currentChatId.value}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json()
            if (!data || data.code !== 200) {
                ElMessage.error('上传文件失败')
                return false
            }
            if (data.data) {
                filePaths.value.push(data.data)
            }
            ElMessage.success('上传成功')
            return true
        } catch (error) {
            console.error('上传文件时发生错误:', error)
            ElMessage.error('上传文件时发生错误')
            return false
        }
    }
    const currentUploadImages = ref<File[]>([])
    const handleImageUpload = async (file: File) => {
        const url = URL.createObjectURL(file)
        const index = uploadedImages.value.length
        uploadedImages.value.push({
            name: file.name,
            url: url,
            file: file
        })
        currentUploadImages.value.push(file)
        const success = await uploadFile(file)

        if (!success) {
            uploadedImages.value.splice(index, 1)
        }
        currentUploadImages.value.splice(currentUploadImages.value.indexOf(file), 1)
        return false
    }

    const currentUploadFiles = ref<File[]>([])
    const handleFileUpload = async (file: File) => {
        const index = uploadedFiles.value.length
        uploadedFiles.value.push({
            name: file.name,
            size: file.size,
            file: file
        })
        currentUploadFiles.value.push(file)
        const success = await uploadFile(file)

        if (!success) {
            uploadedFiles.value.splice(index, 1)
        }
        currentUploadFiles.value.splice(currentUploadFiles.value.indexOf(file), 1)
        return false
    }

    const removeImage = (index: number) => {
        const image = uploadedImages.value[index]
        if (image.url) {
            URL.revokeObjectURL(image.url)
        }
        uploadedImages.value.splice(index, 1)
    }

    const removeFile = (index: number) => {
        uploadedFiles.value.splice(index, 1)
    }

    const formatFileSize = (bytes: number | undefined) => {
        if (!bytes) return '0 B'
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const scrollToBottom = () => {
        if (messagesScrollbar.value && messagesScrollbar.value.wrapRef) {
            messagesScrollbar.value.setScrollTop(messagesScrollbar.value.wrapRef.scrollHeight)
        }
    }

    const selectChat = async (chatId: number | string) => {
        currentChatId.value = chatId
        showHistoryDialog.value = false
        // 这里可以加载对应聊天的消息
        await fetchChatMemory()
        nextTick(() => {
            scrollToBottom()
        })
    }

    const fetchChatMemory = async () => {
        if (!currentChatId.value) return
        try {
            const response = await customFetch(`/api/ai/chat/${currentChatId.value}`)
            const data = await response.json()
            if (!data || data.code !== 200) {
                console.error('获取聊天记忆失败:', data.message || '未知错误')
                ElMessage.error('获取聊天记忆失败')
                return
            }
            messages.value = data.data.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: formatAIOutput(msg.content),
                createAt: msg.createdAt
            }))
            limitChildrenWidth(".message-text")
            // 清空上传的图片和文件
            uploadedFiles.value = []
            uploadedImages.value = []
            filePaths.value = []
        } catch (error) {
            console.error('Error fetching chat memory:', error)
            ElMessage.error('获取聊天记忆失败，请稍后再试')
        }
    }
    const startNewChat = async () => {
        messages.value = [
            {
                id: Date.now(),
                role: 'assistant',
                content: '你好！我是AI助手，有什么可以帮助你的吗？',
                createAt: new Date()
            }
        ]
        try {
            const response = await customFetch('/api/ai/chat', {
                method: 'POST'
            })
            const data = await response.json()
            if (!data || data.code !== 200) {
                console.error('创建新聊天失败:', data.message || '未知错误')
                ElMessage.error('创建新聊天失败')
            } else {
                currentChatId.value = data.data || ""
            }
            // 清空上传的图片和文件
            uploadedImages.value = []
            uploadedFiles.value = []
        } catch (error) {
            console.error('Error starting new chat:', error)
            ElMessage.error('创建新聊天失败，请稍后再试')
        }
        showHistoryDialog.value = false
        nextTick(() => {
            scrollToBottom()
        })
    }

    const deleteChat = async (chatId: number | string) => {
        try {
            const response = await customFetch(`/api/ai/chat/${chatId}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (!data || data.code !== 200) {
                console.error('删除聊天失败:', data.message || '未知错误')
                ElMessage.error('删除聊天失败')
                return
            }
            ElMessage.success('聊天已删除')
            chatHistory.value = chatHistory.value.filter(chat => chat.chatId !== chatId)
            // 如果删除的是当前聊天，重置消息列表
            currentChatId.value = chatHistory.value[0]?.chatId || ''
        } catch (error) {
            console.error('Error deleting chat:', error)
            ElMessage.error('删除聊天失败，请稍后再试')
        }

    }
    const showHistory = async () => {
        showHistoryDialog.value = true
        await fetchChatHistory()
    }
    const handleHistoryClose = () => {
        showHistoryDialog.value = false
    }

    const handleShiftEnter = (event: KeyboardEvent) => {
        // Shift+Enter 换行
        const textarea = event.target as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        inputMessage.value = inputMessage.value.substring(0, start) + '\n' + inputMessage.value.substring(end)
        nextTick(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1
        })
    }
    const formatDateTime = (date: Date | undefined | null) => {
        if (!date) return ''
        if (typeof date === 'string') {
            date = new Date(date)
        }
        // 使用toLocaleString格式化为中文日期时间
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    // 按钮初始位置（默认右下角）
    const x = ref(0);
    const y = ref(0);
    // 拖动状态
    const isDragging = ref(false);
    // 记录初始拖动位置
    const startPos = ref({ clientX: 0, clientY: 0 });
    const startBtnPos = ref({ x: 0, y: 0 });

    // 开始拖动（鼠标/触摸按下）
    const startDrag = (e: MouseEvent | TouchEvent) => {
        isDragging.value = true;
        // 区分鼠标和触摸事件
        const event = (e instanceof TouchEvent) ? e.touches[0] : e;
        // 记录初始位置：鼠标按下时的坐标 + 按钮当前位置
        startPos.value = {
            clientX: event.clientX,
            clientY: event.clientY
        };
        startBtnPos.value = { x: x.value, y: y.value };
    };
    const limitChildrenWidth = (parentSelector: string): void => {
        // 获取父元素
        const parent: HTMLElement | null = document.querySelector(parentSelector);
        if (!parent) {
            console.error('父元素不存在');
            return;
        }

        // 获取父元素宽度（包含内边距，不包含边框和外边距）
        const parentWidth: number = parent.offsetWidth;

        // 获取所有直接子元素（不包含嵌套子元素）
        const children: HTMLCollection = parent.children;

        // 遍历子元素，设置最大宽度
        Array.from(children).forEach((child: Element) => {
            // 方式1：设置maxWidth，允许子元素宽度自适应但不超过父元素
            (child as HTMLElement).style.maxWidth = `${parentWidth}px`;
            // 可选：移除子元素可能存在的固定宽度，避免冲突
            (child as HTMLElement).style.width = 'auto'; // 优先让子元素自适应，再通过maxWidth限制
        });
    }

    // 拖动中（鼠标/触摸移动）
    const handleDrag = (e: MouseEvent | TouchEvent) => {
        if (!isDragging.value) return;
        e.preventDefault(); // 防止拖动时页面滚动

        const event = (e instanceof TouchEvent) ? e.touches[0] : e;
        // 计算移动距离 = 当前鼠标位置 - 初始鼠标位置
        const deltaX = event.clientX - startPos.value.clientX;
        const deltaY = event.clientY - startPos.value.clientY;

        // 计算新位置 = 按钮初始位置 + 移动距离
        let newX = startBtnPos.value.x + deltaX;
        let newY = startBtnPos.value.y + deltaY;

        // 边界限制：防止按钮超出可视区域
        const btnWidth = 60; // 与 CSS 中的宽高一致
        const btnHeight = 60;
        newX = Math.max(0, Math.min(newX, window.innerWidth - btnWidth)); // 左右边界
        newY = Math.max(0, Math.min(newY, window.innerHeight - btnHeight)); // 上下边界

        // 更新按钮位置
        x.value = newX;
        y.value = newY;
    };

    // 结束拖动（鼠标/触摸松开）
    const endDrag = () => {
        isDragging.value = false;
    };

    return {
        aiChatVisible,
        isButtonShow,
        showAIChat,
        inputMessage,
        messages,
        uploadedImages,
        uploadedFiles,
        isLoading,
        currentChatId,
        messagesScrollbar,
        showHistoryDialog,
        chatHistory,
        canSend,
        closeSidebar,
        handleOverlayClick,
        sendMessage,
        handleImageUpload,
        handleFileUpload,
        removeImage,
        removeFile,
        formatFileSize,
        selectChat,
        startNewChat,
        deleteChat,
        handleHistoryClose,
        handleShiftEnter,
        showHistory,
        x,
        y,
        isDragging,
        startDrag,
        handleDrag,
        endDrag,
        formatDateTime,
        currentUploadFiles,
        currentUploadImages
    }
}

// 导出组件
export default defineComponent({
    name: 'AIChatSidebarComponent',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:visible', 'close'],
    setup(props, { emit }) {
        return useAIChatSidebar(props, emit)
    }
})

// 导出图标组件，以便在Vue文件中使用
export const icons = {
    Close,
    Clock,
    Document,
    Picture,
    Paperclip,
    Promotion,
    Plus,
    Delete
}