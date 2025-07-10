<template>
    <div class="knowledge-base-app">
        <!-- 首页 -->
        <div class="home-page">
            <!-- 搜索栏 -->
            <div class="search-container">
                <el-input v-model="searchQuery" placeholder="搜索知识库..." size="large" class="search-input"
                    @input="handleSearch">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
                <div class="action-buttons">
                    <el-button type="primary" size="small" :icon="Document" class="my-knowledge-btn"
                        @click="goToMyKnowledge">我的知识库</el-button>
                    <el-button type="success" size="small" :icon="Star" class="favorite-btn"
                        @click="goToFavorites">我的收藏</el-button>
                    <el-button type="info" size="small" :icon="Clock" class="history-btn"
                        @click="goToHistory">浏览历史</el-button>
                </div>
            </div>

            <!-- 知识库列表 -->
            <div class="knowledge-list" v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading">
                <el-empty v-if="!loading && knowledgeList.length === 0" description="暂无知识库" />
                <el-card v-for="item in knowledgeList" :key="item.kpId" class="knowledge-card" shadow="hover"
                    @click="viewDetail(item)">
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="title">{{ item.title }}</h3>
                            <div class="tags">
                                <el-tag v-for="tag in item.tags" :key="tag" size="small" class="tag">
                                    {{ tag }}
                                </el-tag>
                                <el-tag type="danger" size="small" class="tag" v-if="searchQuery && item.searchScore">
                                    匹配度：{{ item.searchScore.toFixed(2) }}
                                </el-tag>
                            </div>
                        </div>

                        <p class="content-preview" v-html="item.simpleContent"></p>

                        <div class="card-footer">
                            <div class="author-info">
                                <el-avatar :src="item.creator.avatar" :size="32" class="avatar" />
                                <span class="author-name">{{ item.creator.name }}</span>
                                <el-icon class="like-icon">
                                    👍
                                    <span>{{ item.likeCount || 0 }}</span>
                                </el-icon>
                            </div>
                            <div class="time-info">
                                <div class="time-item">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>创建: {{ formatDate(item.createdAt) }}</span>
                                </div>
                                <div class="time-item">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    <span>更新: {{ formatDate(item.updatedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-card>

                <div v-if="loading" class="loading-container">
                    <el-icon class="is-loading">
                        <Loading />
                    </el-icon>
                    <span>加载中...</span>
                </div>

                <div v-if="!hasMore && knowledgeList.length > 0" class="no-more">
                    没有更多内容了
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
    Search,
    Clock,
    Edit,
    Loading,
    Document,
    Star
} from '@element-plus/icons-vue'
import { customFetch } from '../../../api/customFetch';
import { ElMessage } from 'element-plus';
import router from '../../../router';
//import { useAuthStore } from '../../../store/auth';
// 类型定义
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
     * 知识点内容(省略版)
     */
    simpleContent: string;

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
     * 搜索匹配度
     */
    searchScore?: number;

    /**
     * 点赞数
     */
    likeCount?: number;
}

interface Creator {
    id: number;
    name: string;
    avatar: string;
}

// const auth = useAuthStore()
// 响应式数据
const searchQuery = ref('')
const knowledgeList = ref<KnowledgeItem[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)


// 方法
const fetchknowledgeBases = async () => {
    try {
        loading.value = true
        const res = await customFetch(`/api/knowledge?page=${page.value}&size=10&sort=0&keyword=${searchQuery.value}`)
        const data = await res.json()
        if (!data || data.code !== 200) {
            ElMessage.error('加载知识库失败')
            return
        }
        knowledgeList.value = [...knowledgeList.value, ...data.data.map((s: any) => {
            s.tags = s.tags ? JSON.parse(s.tags) : []
            s.simpleContent = s.simpleContent + '...'
            s.createdAt = new Date(s.createdAt)
            s.updatedAt = new Date(s.updatedAt)
            return s
        })]
        hasMore.value = data.data.length === 10 || data.data === null
        page.value++
    } catch (e) {
        console.log("加载知识库失败：", e)
        ElMessage.error('加载知识库失败')
    } finally {
        loading.value = false
    }
}

const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    await fetchknowledgeBases()
}

const handleSearch = () => {
    page.value = 1
    hasMore.value = true
    knowledgeList.value = []
    fetchknowledgeBases()
}
const viewAuthorKnowledgeBase = (creator: Creator) => {
    router.push(`/knowledge-base/author/${creator.id}`)
}
const viewDetail = (item: KnowledgeItem) => {
    router.push(`/knowledge-base/detail/${item.kpId}`)
};

const goToMyKnowledge = () => {
    router.push('/knowledge-base/my')
}

const goToFavorites = () => {
    router.push('/knowledge-base/favorites')
}

const goToHistory = () => {
    router.push('/knowledge-base/history')
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


// 初始化
onMounted(() => {
    document.title = "知识库"
    loadMore()
})
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

/* 搜索栏样式 */
.search-container {
    margin-bottom: 30px;
    display: flex;
    gap: 15px;
    align-items: center;
}

.search-input {
    flex: 1;
    max-width: 600px;
}

.action-buttons {
    margin-left: auto;
    display: flex;
    gap: 10px;
}

.my-knowledge-btn,
.favorite-btn,
.history-btn {
    border-radius: 16px;
}

/* 知识库列表样式 */
.knowledge-list {
    display: grid;
    gap: 20px;
}

.knowledge-card {
    cursor: pointer;
    transition: transform 0.2s ease;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    transition: all 0.2s ease;
}

.knowledge-card:hover {
    transform: translateY(-2px);
}

.card-content {
    padding: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.title {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
    flex: 1;
    margin-right: 15px;
}

.tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tag {
    margin: 0;
}

.like-icon {
    margin-left: 30px;
}

.content-preview {
    color: #606266;
    line-height: 1.6;
    margin: 15px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.author-name {
    font-weight: 500;
    color: #303133;
}

.time-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: #909399;
}

.time-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 20px;
    color: #909399;
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
}
</style>
