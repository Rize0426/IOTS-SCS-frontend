<template>
    <div class="history-page">
        <el-button @click="goBack" type="default" class="back-btn">
            <el-icon>
                <ArrowLeft />
            </el-icon>
            返回
        </el-button>
        <el-card class="page-header-111">
            <h1>浏览历史</h1>
            <p class="page-description">查看您的知识库浏览记录</p>
            <div class="header-actions">
                <el-button type="danger" @click="clearHistory" :loading="clearing">
                    清空历史
                </el-button>
            </div>
        </el-card>

        <div class="content-section">
            <div v-if="loading" class="loading-section">
                <el-skeleton :rows="3" animated />
            </div>

            <div v-else-if="historyList.length === 0" class="empty-section">
                <el-empty description="暂无浏览记录" :image-size="200">
                    <el-button type="primary" @click="goToKnowledgeList">去浏览知识库</el-button>
                </el-empty>
            </div>

            <div v-else class="history-list">
                <el-card v-for="history in historyList" :key="history.id" class="history-card" shadow="hover">
                    <div class="card-header">
                        <div class="title-section">
                            <h3 class="knowledge-title" @click="viewKnowledge(history.kpId)">
                                {{ history.title }}
                            </h3>
                            <div class="meta-info">
                                <span class="view-time">浏览于 {{ formatDate(history.viewedAt) }}</span>
                                <span v-if="history.duration > 0" class="duration">
                                    停留 {{ formatDuration(history.duration) }}
                                </span>
                            </div>
                        </div>
                        <div class="actions">
                            <el-button type="primary" size="small" @click="viewKnowledge(history.kpId)">
                                重新查看
                            </el-button>
                        </div>
                    </div>

                    <div class="card-content">
                        <p class="knowledge-content">{{ history.simpleContent }}</p>
                    </div>

                    <div class="card-footer">
                        <div class="creator-info">
                            <el-avatar :src="history.creator.avatar" :size="24" />
                            <span class="creator-name">{{ history.creator.name }}</span>
                        </div>
                        <div class="tags-section">
                            <el-tag v-for="tag in parseTags(history.tags)" :key="tag" size="small" class="tag">
                                {{ tag }}
                            </el-tag>
                        </div>
                    </div>
                </el-card>

                <!-- 加载更多 -->
                <div v-if="hasMore" class="load-more-section">
                    <el-button type="text" @click="loadMore" :loading="loadingMore" class="load-more-btn">
                        {{ loadingMore ? '加载中...' : '加载更多' }}
                    </el-button>
                </div>
                <div v-else-if="historyList.length > 0" class="no-more">
                    没有更多内容了
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { customFetch } from '../../../api/customFetch'
import router from '../../../router'

interface Creator {
    id: number
    name: string
    avatar: string
}

interface HistoryItem {
    id: number
    kpId: number
    title: string
    simpleContent: string
    creator: Creator
    tags: string
    viewedAt: Date
    duration: number
    createdAt: Date
}

const historyList = ref<HistoryItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const clearing = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)

const fetchHistory = async (page = 1, append = false) => {
    if (page === 1) {
        loading.value = true
    } else {
        loadingMore.value = true
    }

    try {
        const res = await customFetch(`/api/knowledge/history?page=${page}&size=10`)
        const data = await res.json()

        if (data.code === 200) {
            const newHistory = data.data
            if (append) {
                historyList.value.push(...newHistory)
            } else {
                historyList.value = newHistory
            }

            // 判断是否还有更多数据
            hasMore.value = newHistory.length === 10
            currentPage.value = page
        } else {
            ElMessage.error('获取浏览历史失败')
        }
    } catch (e) {
        console.error('获取浏览历史失败：', e)
        ElMessage.error('获取浏览历史失败')
    } finally {
        loading.value = false
        loadingMore.value = false
    }
}

const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return
    await fetchHistory(currentPage.value + 1, true)
}

const clearHistory = async () => {
    try {
        await ElMessageBox.confirm('确定要清空所有浏览历史吗？此操作不可恢复。', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        clearing.value = true
        const res = await customFetch('/api/knowledge/history', {
            method: 'DELETE'
        })
        const data = await res.json()

        if (data.code === 200) {
            ElMessage.success('清空历史成功')
            historyList.value = []
            hasMore.value = false
        } else {
            ElMessage.error('清空历史失败')
        }
    } catch (e) {
        if (e !== 'cancel') {
            console.error('清空历史失败：', e)
            ElMessage.error('清空历史失败')
        }
    } finally {
        clearing.value = false
    }
}

const viewKnowledge = (kpId: number) => {
    router.push(`/knowledge-base/detail/${kpId}`)
}
const goBack = () => {
  router.go(-1)
}
const goToKnowledgeList = () => {
    router.push('/knowledge-base')
}

const formatDate = (date: Date) => {
    if (!date) return ''
    if (typeof date === 'string') {
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

const formatDuration = (seconds: number) => {
    if (seconds < 60) {
        return `${seconds}秒`
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        return `${minutes}分钟`
    } else {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}小时${minutes}分钟`
    }
}

const parseTags = (tags: string) => {
    if (!tags) return []
    try {
        return JSON.parse(tags)
    } catch {
        return []
    }
}

onMounted(() => {
    fetchHistory(1, false)
})
</script>

<style scoped>
.history-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 90vh;
    background-color: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 16px;
}

.back-btn {
  margin-bottom: 20px;
}

.page-header-111 {
    text-align: center;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.page-header-111 h1 {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 10px 0;
}

.page-description {
    color: #909399;
    font-size: 16px;
    margin: 10px 0 20px 10px;
}

.content-section {
    animation: fadeIn 0.3s ease;
}

.loading-section {
    padding: 40px;
}

.empty-section {
    padding: 60px 20px;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.history-card {
    background: white;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.history-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.title-section {
    flex: 1;
}

.knowledge-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.3s ease;
}

.knowledge-title:hover {
    color: #409eff;
}

.meta-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.view-time {
    font-size: 12px;
    color: #909399;
}

.duration {
    font-size: 12px;
    color: #67c23a;
    background: #f0f9ff;
    padding: 2px 8px;
    border-radius: 4px;
}

.actions {
    margin-left: 20px;
}

.card-content {
    margin-bottom: 15px;
}

.knowledge-content {
    color: #606266;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.creator-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.creator-name {
    font-size: 14px;
    color: #606266;
}

.tags-section {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tag {
    margin: 0;
}

.load-more-section {
    text-align: center;
    margin-top: 30px;
    padding: 20px;
}

.load-more-btn {
    color: #409eff;
    font-size: 14px;
}

.load-more-btn:hover {
    color: #66b1ff;
}

.no-more {
    text-align: center;
    padding: 20px;
    color: #c0c4cc;
    font-size: 14px;
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
    .history-page {
        padding: 15px;
    }

    .header-actions {
        position: static;
        margin-top: 15px;
    }

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .actions {
        margin-left: 0;
        align-self: flex-end;
    }

    .card-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .meta-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>