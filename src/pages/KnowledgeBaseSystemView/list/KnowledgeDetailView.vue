<template>
    <div class="knowledge-base-app">
        <!-- 详情页 -->
        <div class="detail-page">
            <div class="detail-header">
                <el-button @click="goBack" type="primary" plain>
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    返回列表
                </el-button>
            </div>
            
            <el-card class="detail-card" v-if="currentKnowledge" v-infinite-scroll="loadMoreComments"
                :infinite-scroll-disabled="loadingMore">
                <div class="detail-content">
                    <h1 class="detail-title">{{ currentKnowledge.title }}</h1>

                    <div class="detail-meta">
                        <div class="author-section" @click="viewAuthorKnowledgeBase(currentKnowledge.creator)">
                            <el-avatar :src="currentKnowledge.creator.avatar" :size="48" />
                            <div class="author-details">
                                <h4>{{ currentKnowledge.creator.name }}</h4>
                                <p>知识贡献者 </p>
                            </div>
                        </div>

                        <div class="meta-info">
                            <div class="meta-item">
                                <el-icon>
                                    <Clock />
                                </el-icon>
                                <span>创建时间: {{ formatDate(currentKnowledge.createdAt) }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                <span>更新时间: {{ formatDate(currentKnowledge.updatedAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="tags-section">
                        <el-tag v-for="tag in currentKnowledge.tags" :key="tag" size="default" class="detail-tag">
                            {{ tag }}
                        </el-tag>
                    </div>

                    <el-divider />

                    <div class="full-content">
                        <div v-html="currentKnowledge.content"></div>
                    </div>

                    <el-divider />

                    <!-- 互动区域 -->
                    <div class="interaction-section">
                        <div class="interaction-buttons">
                            <el-button :type="currentKnowledge.isLiked ? 'primary' : 'default'" @click="toggleLike"
                                :loading="likeLoading" class="interaction-btn">
                                <el-icon>
                                    <Pointer />
                                </el-icon>
                                <span>{{ currentKnowledge.likeCount || 0 }}</span>
                            </el-button>

                            <el-button :type="currentKnowledge.isFavorited ? 'warning' : 'default'"
                                @click="toggleFavorite" :loading="favoriteLoading" class="interaction-btn">
                                <el-icon>
                                    <Star />
                                </el-icon>
                                <span>{{ currentKnowledge.favoriteCount || 0 }}</span>
                            </el-button>

                            <el-button type="info" @click="showCommentInput = !showCommentInput"
                                class="interaction-btn">
                                <el-icon>
                                    <ChatDotRound />
                                </el-icon>
                                <span>{{ currentKnowledge.commentCount || 0 }}</span>
                            </el-button>

                            <el-button type="success" @click="showAISummary" :loading="aiSummaryLoading" class="interaction-btn">
                                <el-icon>
                                    <MagicStick />
                                </el-icon>
                                <span>AI总结</span>
                            </el-button>
                        </div>

                        <!-- 评论输入区域 -->
                        <div v-if="showCommentInput" class="comment-input-section">
                            <el-input v-model="newComment" type="textarea" :rows="3" placeholder="写下你的评论..."
                                maxlength="500" show-word-limit />
                            <div class="comment-input-actions">
                                <el-button @click="showCommentInput = false">取消</el-button>
                                <el-button type="primary" @click="addComment" :loading="commentLoading">
                                    发表评论
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <el-divider />

                    <div v-if="currentKnowledge.attachments && currentKnowledge.attachments.length > 0"
                        class="attachments-section">
                        <h3>附件</h3>
                        <div class="attachments-list">
                            <el-card v-for="attachment in currentKnowledge.attachments" :key="attachment"
                                class="attachment-card" shadow="hover">
                                <div class="attachment-info">
                                    <el-icon class="attachment-icon">
                                        <Document />
                                    </el-icon>
                                    <div class="attachment-details">
                                        <span class="attachment-name">{{ attachment.split('\\').pop() }}</span>
                                    </div>
                                    <el-button type="primary" size="small" @click="downloadAttachment(attachment)">
                                        下载
                                    </el-button>
                                </div>
                            </el-card>
                        </div>
                    </div>

                    <!-- 评论区域 -->
                    <div class="comments-section">
                        <h3>评论 ({{ currentKnowledge.commentCount || 0 }})</h3>

                        <div v-if="comments.length === 0" class="no-comments">
                            <p>暂无评论，快来发表第一条评论吧！</p>
                        </div>

                        <div v-else class="comments-list">
                            <div v-for="comment in comments" :key="comment.id" class="comment-item">
                                <div class="comment-header">
                                    <el-avatar :src="comment.user.avatar" :size="32" />
                                    <div class="comment-user-info">
                                        <span class="comment-username">{{ comment.user.name }}</span>
                                        <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                                    </div>
                                    <div class="comment-actions">
                                        <el-button type="text" size="small" @click="showReply(comment)">
                                            回复
                                        </el-button>
                                    </div>
                                </div>
                                <div class="comment-content">
                                    {{ comment.content }}
                                </div>

                                <!-- 回复输入框 -->
                                <div v-if="showReplyInput && replyToComment?.id === comment.id"
                                    class="reply-input-section">
                                    <el-input v-model="replyContent" type="textarea" :rows="2" placeholder="写下你的回复..."
                                        maxlength="300" show-word-limit />
                                    <div class="reply-input-actions">
                                        <el-button size="small" @click="cancelReply">取消</el-button>
                                        <el-button type="primary" size="small" @click="addReply(comment)"
                                            :loading="commentLoading">
                                            回复
                                        </el-button>
                                    </div>
                                </div>

                                <!-- 子评论 -->
                                <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
                                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                                        <div class="reply-header">
                                            <el-avatar :src="reply.user.avatar" :size="24" />
                                            <div class="reply-user-info">
                                                <span class="reply-username">{{ reply.user.name }}</span>
                                                <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                                            </div>
                                        </div>
                                        <div class="reply-content">
                                            {{ reply.content }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 加载更多 -->
                            <div v-if="hasMore" class="load-more-section">
                                <el-button type="text" @click="loadMoreComments" :loading="loadingMore"
                                    class="load-more-btn">
                                    {{ loadingMore ? '加载中...' : '加载更多评论' }}
                                </el-button>
                            </div>
                            <div v-if="!hasMore && comments.length > 0" class="no-more">
                                没有更多内容了
                            </div>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
        
        <!-- AI总结弹窗 -->
        <el-dialog
            v-model="showAISummaryDialog"
            :title="aiSummaryTitle"
            width="60%"
            :close-on-click-modal="!aiSummaryLoading"
            :close-on-press-escape="!aiSummaryLoading"
            class="ai-summary-dialog"
            top="1vh"
        >
            <div class="ai-summary-content">
                <div v-if="aiSummaryLoading" class="ai-summary-loading">
                    <el-icon class="is-loading">
                        <Loading />
                    </el-icon>
                    <span>AI正在生成总结，请稍候...</span>
                </div>
                <div v-else class="ai-summary-text" v-html="parseMarkdown(aiSummaryContent)"></div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closeAISummaryDialog">关闭</el-button>
                    <el-button type="primary" @click="copyAISummary" :disabled="!aiSummaryContent">
                        复制总结
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Clock,
    Edit,
    ArrowLeft,
    Document,
    Pointer,
    Star,
    ChatDotRound,
    MagicStick,
    Loading
} from '@element-plus/icons-vue'
import { customFetch } from '../../../api/customFetch';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import router from '../../../router';
import parseMarkdown from '../../../utils/markdownParse';
interface KnowledgeItem {
    /**
     * 知识点唯一标识符
     */
    kpId: number;

    /**
     * 知识点标题
     */
    title: string;

    /**
     * 知识点内容(完整版)
     */
    content: string;

    /**
     * 创建者信息
     */
    creator: Creator;

    /**
     * 标签列表 (JSON数组)
     */
    tags: Array<string>;

    /**
     * 创建时间
     */
    createdAt: Date;

    /**
     * 最后更新时间
     */
    updatedAt: Date;

    /**
     * 状态
     */
    status?: string;
    /**
     * 附件列表
     */
    attachments: Array<string>;

    /**
     * 点赞数
     */
    likeCount?: number;

    /**
     * 评论数
     */
    commentCount?: number;

    /**
     * 收藏数
     */
    favoriteCount?: number;

    /**
     * 当前用户是否已点赞
     */
    isLiked?: boolean;

    /**
     * 当前用户是否已收藏
     */
    isFavorited?: boolean;
}

interface Creator {
    id: number;
    name: string;
    avatar: string;
}
const id = useRoute().params.id

const currentKnowledge = ref<KnowledgeItem | null>(null)

// 互动功能相关的响应式变量
const likeLoading = ref(false)
const favoriteLoading = ref(false)
const commentLoading = ref(false)
const showCommentInput = ref(false)
const newComment = ref('')
const comments = ref<CommentItem[]>([])
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
// 停留时间
const duration = ref(0)
// 评论接口
interface CommentItem {
    id: number
    kpId: number
    user: Creator
    content: string
    parentId?: number
    replies?: CommentItem[]
    createdAt: Date
    updatedAt: Date
}

// 回复相关
const replyToComment = ref<CommentItem | null>(null)
const replyContent = ref('')
const showReplyInput = ref(false)

// AI总结相关
const aiSummaryLoading = ref(false)
const showAISummaryDialog = ref(false)
const aiSummaryContent = ref('')
const aiSummaryTitle = ref('')

const fetchDetail = async () => {
    try {
        const res = await customFetch(`/api/knowledge/${id}`)
        const data = await res.json()
        if (!data || data.code !== 200) {
            ElMessage.error('加载知识库详情失败')
            return
        }
        currentKnowledge.value = {
            ...data.data,
            content: parseMarkdown(data.data.content),
            tags: data.data.tags ? JSON.parse(data.data.tags) : [],
            attachments: data.data.attachmentsJson ? JSON.parse(data.data.attachmentsJson) : []
        }
    } catch (e) {
        console.log("加载知识库详情失败：", e)
        ElMessage.error('加载知识库详情失败')
    }
}
const goBack = () => {
    router.go(-1)
}
const viewAuthorKnowledgeBase = (creator: Creator) => {
    router.push(`/knowledge-base/author/${creator.id}`)
}
const downloadAttachment = async (attachment: string) => {
    ElMessage.success(`开始下载：${attachment}`)
    try {
        attachment = encodeURIComponent(attachment)
        const response = await customFetch(`/api/knowledge/download/${id}?attachment=${attachment}`);

        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'downloaded-file';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('下载失败:', error);
        ElMessage.error('下载失败，请重试')
    }
}

const formatDate = (date: Date) => {
    if (!date) {
        return ''
    }
    if (typeof (date) === 'string') {
        date = new Date(date)
    }
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 点赞功能
const toggleLike = async () => {
    if (!currentKnowledge.value) return

    likeLoading.value = true
    try {
        const res = await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/like`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data.code === 200) {
            // 更新本地状态
            currentKnowledge.value.isLiked = !currentKnowledge.value.isLiked
            currentKnowledge.value.likeCount = (currentKnowledge.value.likeCount || 0) + (currentKnowledge.value.isLiked ? 1 : -1)
            ElMessage.success(currentKnowledge.value.isLiked ? '点赞成功' : '取消点赞成功')
        } else {
            ElMessage.error('操作失败')
        }
    } catch (e) {
        console.error('点赞操作失败：', e)
        ElMessage.error('操作失败')
    } finally {
        likeLoading.value = false
    }
}

// 收藏功能
const toggleFavorite = async () => {
    if (!currentKnowledge.value) return

    favoriteLoading.value = true
    try {
        const res = await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/favorite`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data.code === 200) {
            // 更新本地状态
            currentKnowledge.value.isFavorited = !currentKnowledge.value.isFavorited
            currentKnowledge.value.favoriteCount = (currentKnowledge.value.favoriteCount || 0) + (currentKnowledge.value.isFavorited ? 1 : -1)
            ElMessage.success(currentKnowledge.value.isFavorited ? '收藏成功' : '取消收藏成功')
        } else {
            ElMessage.error('操作失败')
        }
    } catch (e) {
        console.error('收藏操作失败：', e)
        ElMessage.error('操作失败')
    } finally {
        favoriteLoading.value = false
    }
}

// 添加评论
const addComment = async () => {
    if (!currentKnowledge.value || !newComment.value.trim()) return

    commentLoading.value = true
    try {
        const formData = new FormData()
        formData.append('content', newComment.value.trim())

        const res = await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/comments`, {
            method: 'POST',
            body: formData
        })
        const data = await res.json()
        if (data.code === 200) {
            ElMessage.success('评论发表成功')
            newComment.value = ''
            showCommentInput.value = false
            // 刷新评论列表
            await fetchComments(1, false)
            // 更新评论数
            currentKnowledge.value.commentCount = (currentKnowledge.value.commentCount || 0) + 1
        } else {
            ElMessage.error('评论发表失败')
        }
    } catch (e) {
        console.error('评论发表失败：', e)
        ElMessage.error('评论发表失败')
    } finally {
        commentLoading.value = false
    }
}

// 获取评论列表
const fetchComments = async (page = 1, append = false) => {
    if (!currentKnowledge.value) return

    try {
        const res = await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/comments?page=${page}&size=10`)
        const data = await res.json()
        if (data.code === 200) {
            const result = data.data
            if (append) {
                comments.value.push(...result.comments)
            } else {
                comments.value = result.comments
            }
            hasMore.value = result.hasMore
            currentPage.value = page
        }
    } catch (e) {
        console.error('获取评论失败：', e)
    }
}

// 加载更多评论
const loadMoreComments = async () => {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true
    try {
        await fetchComments(currentPage.value, true)
    } finally {
        loadingMore.value = false
    }
}

// 添加回复
const addReply = async (comment: CommentItem) => {
    if (!replyContent.value.trim() || !currentKnowledge.value) return

    commentLoading.value = true
    try {
        const formData = new FormData()
        formData.append('content', replyContent.value.trim())
        formData.append('parentId', comment.id.toString())

        const res = await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/comments`, {
            method: 'POST',
            body: formData
        })
        const data = await res.json()
        if (data.code === 200) {
            ElMessage.success('回复发表成功')
            replyContent.value = ''
            showReplyInput.value = false
            replyToComment.value = null
            // 刷新评论列表
            await fetchComments(1, false)
            // 更新评论数
            currentKnowledge.value.commentCount = (currentKnowledge.value.commentCount || 0) + 1
        } else {
            ElMessage.error('回复发表失败')
        }
    } catch (e) {
        console.error('回复发表失败：', e)
        ElMessage.error('回复发表失败')
    } finally {
        commentLoading.value = false
    }
}

// 显示回复输入框
const showReply = (comment: CommentItem) => {
    replyToComment.value = comment
    showReplyInput.value = true
    replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
    replyToComment.value = null
    showReplyInput.value = false
    replyContent.value = ''
}

// AI总结功能
const showAISummary = async () => {
    if (!currentKnowledge.value) return
    
    aiSummaryLoading.value = true
    showAISummaryDialog.value = true
    aiSummaryContent.value = ''
    aiSummaryTitle.value = `AI总结：${currentKnowledge.value.title}`
    
    try {
        const response = await customFetch(`/api/ai/knowledge/summary?kpId=${currentKnowledge.value.kpId}`, {
            method: 'GET',
        })
        
        if (!response.ok) {
            throw new Error('AI总结请求失败')
        }
        
        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error('无法读取响应流')
        }
        
        const decoder = new TextDecoder()
        let result = ''
        
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            result += chunk
            aiSummaryContent.value = result
        }
        
        ElMessage.success('AI总结生成完成')
    } catch (error) {
        console.error('AI总结失败：', error)
        ElMessage.error('AI总结失败，请重试')
        aiSummaryContent.value = 'AI总结生成失败，请重试'
    } finally {
        aiSummaryLoading.value = false
    }
}

// 复制AI总结
const copyAISummary = async () => {
    if (!aiSummaryContent.value) return
    
    try {
        await navigator.clipboard.writeText(aiSummaryContent.value)
        ElMessage.success('总结已复制到剪贴板')
    } catch (error) {
        console.error('复制失败：', error)
        ElMessage.error('复制失败，请手动复制')
    }
}

// 关闭AI总结弹窗
const closeAISummaryDialog = () => {
    showAISummaryDialog.value = false
    aiSummaryContent.value = ''
    aiSummaryTitle.value = ''
}

onMounted(async () => {
    await fetchDetail()
    //fetchComments(1, false)
    setInterval(() => {
        duration.value++
    }, 1000)
    window.addEventListener('popstate', function (event) {
        // 添加浏览历史
        addViewHistory()
    })
})

// 添加浏览历史
const addViewHistory = async () => {
    if (!currentKnowledge.value) return

    try {
        await customFetch(`/api/knowledge/${currentKnowledge.value.kpId}/history?duration=${duration.value}`, {
            method: 'POST'
        })
    } catch (e) {
        console.error('添加浏览历史失败：', e)
    }
}
</script>
<style scoped>
.knowledge-base-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 90vh;
    background-color: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 16px;
}

/* 详情页样式 */
.detail-page {
    animation: fadeIn 0.3s ease;
}

.detail-header {
    margin-bottom: 20px;
}

.detail-card {
    background: white;
    border-radius: 16px;
}

.detail-content {
    padding: 20px;
}

.detail-title {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 30px 0;
    line-height: 1.4;
}

.detail-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
}

.author-section {
    display: flex;
    align-items: center;
    gap: 15px;
}

.author-details h4 {
    margin: 0;
    color: #303133;
    font-size: 16px;
}

.author-details p {
    margin: 5px 0 0 0;
    color: #909399;
    font-size: 14px;
}

.meta-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 14px;
}

.tags-section {
    margin: 20px 0;
}

.no-more {
    text-align: center;
    padding: 20px;
    color: #c0c4cc;
    font-size: 14px;
}

.detail-tag {
    margin-right: 10px;
    margin-bottom: 8px;
}

.full-content {
    line-height: 1.8;
    color: #303133;
}

.full-content :deep(h2) {
    color: #303133;
    font-size: 20px;
    margin: 25px 0 15px 0;
    font-weight: 600;
}

.full-content :deep(p) {
    margin: 15px 0;
}

.full-content :deep(ul),
.full-content :deep(ol) {
    margin: 15px 0;
    padding-left: 25px;
}

.full-content :deep(li) {
    margin: 8px 0;
}

.attachments-section {
    margin-top: 30px;
}

.attachments-section h3 {
    color: #303133;
    font-size: 18px;
    margin-bottom: 15px;
}

.attachments-list {
    display: grid;
    gap: 10px;
}

.attachment-card {
    background: #f8f9fa;
}

.attachment-info {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
}

.attachment-icon {
    font-size: 24px;
    color: #409eff;
}

.attachment-details {
    flex: 1;
}

.attachment-name {
    display: block;
    font-weight: 500;
    color: #303133;
}

.attachment-size {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
}

/* 互动区域样式 */
.interaction-section {
    margin: 30px 0;
}

.interaction-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
}

.interaction-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 80px;
}

.comment-input-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-top: 15px;
}

.comment-input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

/* 评论区域样式 */
.comments-section {
    margin-top: 30px;
}

.comments-section h3 {
    color: #303133;
    font-size: 18px;
    margin-bottom: 20px;
}

.no-comments {
    text-align: center;
    padding: 40px 20px;
    color: #909399;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.comment-item {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    justify-content: space-between;
}

.comment-actions {
    margin-left: auto;
}

.comment-user-info {
    display: flex;
    flex-direction: column;
}

.comment-username {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
}

.comment-time {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
}

.comment-content {
    color: #606266;
    line-height: 1.6;
    margin-left: 44px;
}

.replies-section {
    margin-top: 15px;
    margin-left: 44px;
    padding-left: 20px;
    border-left: 2px solid #e4e7ed;
}

.reply-item {
    margin-bottom: 15px;
    padding: 15px;
    background: white;
    border-radius: 6px;
}

.reply-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.reply-user-info {
    display: flex;
    flex-direction: column;
}

.reply-username {
    font-weight: 600;
    color: #303133;
    font-size: 13px;
}

.reply-time {
    font-size: 11px;
    color: #909399;
    margin-top: 1px;
}

.reply-content {
    color: #606266;
    line-height: 1.5;
    margin-left: 34px;
    font-size: 14px;
}

/* 回复输入框样式 */
.reply-input-section {
    margin: 15px 0;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
}

.reply-input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

/* 加载更多样式 */
.load-more-section {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
}

.load-more-btn {
    color: #409eff;
    font-size: 14px;
}

.load-more-btn:hover {
    color: #66b1ff;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .knowledge-base-app {
        padding: 15px;
    }

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .detail-meta {
        flex-direction: column;
    }

    .time-info {
        align-self: flex-start;
    }

    .detail-title {
        font-size: 24px;
    }

    .ai-summary-dialog {
        width: 90% !important;
    }
    
    .ai-summary-dialog :deep(.el-dialog__body) {
        padding: 20px;
        max-height: 50vh;
    }

    .interaction-buttons {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .interaction-btn {
        min-width: 70px;
        font-size: 12px;
    }
}

/* AI总结弹窗样式 */
.ai-summary-dialog {
    border-radius: 12px;
}

.ai-summary-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.ai-summary-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
    font-size: 18px;
}

.ai-summary-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 20px;
}

.ai-summary-dialog :deep(.el-dialog__body) {
    padding: 30px;
    max-height: 60vh;
    overflow-y: auto;
}

.ai-summary-content {
    min-height: 200px;
}

.ai-summary-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: 15px;
    color: #606266;
}

.ai-summary-loading .el-icon {
    font-size: 32px;
    color: #409eff;
}

.ai-summary-text {
    line-height: 1.8;
    color: #303133;
    font-size: 15px;
}

.ai-summary-text :deep(h1),
.ai-summary-text :deep(h2),
.ai-summary-text :deep(h3) {
    color: #303133;
    margin: 20px 0 10px 0;
    font-weight: 600;
}

.ai-summary-text :deep(p) {
    margin: 12px 0;
}

.ai-summary-text :deep(ul),
.ai-summary-text :deep(ol) {
    margin: 12px 0;
    padding-left: 20px;
}

.ai-summary-text :deep(li) {
    margin: 6px 0;
}

.ai-summary-text :deep(blockquote) {
    border-left: 4px solid #409eff;
    padding-left: 15px;
    margin: 15px 0;
    color: #606266;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 0 6px 6px 0;
}

.ai-summary-text :deep(code) {
    background: #f1f3f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
}

.ai-summary-text :deep(pre) {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 15px 0;
}

.ai-summary-text :deep(pre code) {
    background: none;
    padding: 0;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>