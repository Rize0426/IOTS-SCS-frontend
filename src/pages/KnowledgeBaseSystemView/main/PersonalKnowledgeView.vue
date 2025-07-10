<template>
  <div class="knowledge-base-app">
    <div class="my-knowledge-page">
      <!-- 作者信息头部 -->
      <el-button @click="goBack" type="default" class="back-btn">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </el-button>
      <div class="page-header">
        <!-- 作者信息 -->
        <div class="author-info">
          <el-avatar :size="50" :src="currentUser?.avatar" class="author-avatar">
            {{ currentUser?.name?.charAt(0) }}
          </el-avatar>
          <div class="author-details">
            <h3 class="author-name">{{ currentUser?.name || '当前用户' }}</h3>
            <p class="author-id">ID: {{ currentUser?.id || '未知' }}</p>
          </div>
        </div>

        <div class="page-content">
          <p class="page-description">{{ pageDescription }}</p>
        </div>

        <div class="filter-tabs" v-if="isMyKnowledge">
          <el-radio-group v-model="myKnowledgeFilter" @change="handleStatusChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="published">已发布</el-radio-button>
            <el-radio-button label="draft">草稿</el-radio-button>
          </el-radio-group>
        </div>
        <el-button v-if="isMyKnowledge" :icon="DocumentAdd" type="primary" class="create-btn"
          @click="createKnowledgeBase">
          新建知识库
        </el-button>
      </div>
      <div class="my-knowledge-list" v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading">
        <el-card v-for="item in knowledgeList" :key="item.kpId" class="my-knowledge-card" shadow="hover"
          @click="viewDetail(item)">
          <div class="my-card-content">
            <div class="my-card-header">
              <div class="title-status">
                <h3 class="title">{{ item.title }}</h3>
                <el-tag v-if="isMyKnowledge" :type="item.status === 'published' ? 'success' : 'warning'" size="small">
                  {{ item.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </div>

              <!-- 只在我的知识库模式下显示操作按钮 -->
              <div v-if="isMyKnowledge" class="actions">
                <el-button type="primary" size="small" @click.stop="editKnowledge(item)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click.stop="deleteKnowledge(item)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="tags">
              <el-tag v-for="tag in item.tags" :key="tag" size="small" class="tag">
                {{ tag }}
              </el-tag>
            </div>

            <p class="content-preview">{{ item.simpleContent }}</p>

            <div class="my-card-footer">
              <div class="time-info">
                <span>创建: {{ formatDate(item.createdAt) }}</span>
                <span>更新: {{ formatDate(item.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <div v-if="knowledgeList.length === 0" class="empty-state">
          <el-empty description="暂无知识库">
            <el-button type="primary" v-if="isMyKnowledge" @click="createKnowledgeBase">创建第一个知识库</el-button>
          </el-empty>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Edit,
  ArrowLeft,
  Delete,
  DocumentAdd,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '../../../router'
import { customFetch } from '../../../api/customFetch'
//import { useAuthStore } from '../../../store/auth'
import { useUserStore } from '@/stores/auth'
const route = useRoute()
//const auth=useAuthStore()
const auth = useUserStore()
// 根据路由判断当前模式
const currentAuthorId = computed(() => route.params.authorId as string)
const isMyKnowledge = computed(() => route.name === 'MyKnowledgeBase' || auth.userInfo.uid.toString() === currentAuthorId.value)

// 页面标题和描述
const pageTitle = computed(() => {
  if (isMyKnowledge.value) {
    return '我的知识库'
  } else {
    return `${currentUser.value?.name || '作者'}的知识库`
  }
})

const pageDescription = computed(() => {
  if (isMyKnowledge.value) {
    return '管理您创建的所有知识库文档'
  } else {
    return `查看${currentUser.value?.name || '该作者'}分享的知识库`
  }
})

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
}

interface Creator {
  id: number;
  name: string;
  avatar: string;
}

// 响应式数据
const knowledgeList = ref<KnowledgeItem[]>([])
const myKnowledgeFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 当前用户信息
const currentUser = computed(() => {
  if (knowledgeList.value.length === 0&&isMyKnowledge.value) {
    return {
      id: auth.userInfo?.uid,
      name: auth.userInfo?.account,
      avatar: auth.userInfo?.avatar_url
    }
  }
  if(knowledgeList.value[0].creator.avatar==null){
    knowledgeList.value[0].creator.avatar = auth.userInfo?.avatar_url
  }
  return knowledgeList.value[0].creator
})

const fetchknowledgeBases = async () => {
  try {
    loading.value = true
    const res = await customFetch(`/api/knowledge?page=${page.value}&size=10&sort=0&createUid=${isMyKnowledge.value ? auth.userInfo?.uid/*123456*/ : currentAuthorId.value}&status=${myKnowledgeFilter.value === 'all' ? '' : myKnowledgeFilter.value}`)
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

const createKnowledgeBase = () => {
  router.push('/knowledge-base/create')
}
// 方法
const viewDetail = (item: KnowledgeItem) => {
  router.push(`/knowledge-base/detail/${item.kpId}`)
}
const handleStatusChange = () => {
  page.value = 1
  hasMore.value = true
  knowledgeList.value = []
  fetchknowledgeBases()
}
const goBack = () => {
  router.go(-1)
}

const editKnowledge = (item: KnowledgeItem) => {
  router.push(`/knowledge-base/create?id=${item.kpId}`)
}

const deleteKnowledge = async (item: KnowledgeItem) => {
  try {
    ElMessageBox.confirm('确定要删除这个知识库吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        const res = await customFetch(`/api/knowledge/${item.kpId}`, {
          method: 'DELETE'
        })
        const data = await res.json()
        if (!data || data.code !== 200) {
          ElMessage.error('删除失败')
          return
        }
        ElMessage.success('删除成功')
        knowledgeList.value = knowledgeList.value.filter((s: KnowledgeItem) => s.kpId !== item.kpId)

      })
  } catch {
    // 用户取消删除
  }
}

const formatDate = (date: Date) => {
  if (!date) {
    return ''
  }
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

// 初始化
onMounted(() => {
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

/* 我的知识库页面样式 */
.author-header-info {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-header-info .author-avatar {
  flex-shrink: 0;
}

.author-header-info .author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-header-info .author-name {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.author-header-info .author-id {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.author-avatar {
  flex-shrink: 0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.author-id {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.page-content {
  flex: 1;
}

.page-content h2 {
  margin: 0;
  color: #303133;
}

.page-content .page-description {
  margin: 8px 0 0 0;
  color: #606266;
  font-size: 14px;
}

.my-knowledge-list {
  display: grid;
  gap: 20px;
}

.my-knowledge-card {
  background: white;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.my-card-content {
  padding: 20px;
}

.my-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.title-status {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.actions {
  display: flex;
  gap: 10px;
}

.my-card-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.my-card-footer .time-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 作者页面样式 */
.author-header {
  margin-bottom: 30px;
}

.back-btn {
  margin-bottom: 20px;
}

.author-info-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.author-details h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.author-title {
  margin: 0 0 5px 0;
  color: #606266;
  font-size: 14px;
}

.author-id {
  margin: 0 0 10px 0;
  color: #909399;
  font-size: 12px;
}

.author-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.author-knowledge-list h3 {
  color: #303133;
  margin-bottom: 20px;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card-content {
  padding: 20px;
}

.card-content .title {
  margin: 12px 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.card-content .content-preview {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content .time-info {
  margin-top: 12px;
  font-size: 12px;
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

  .my-knowledge-page,
  .author-page {
    padding: 0 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .author-info {
    align-self: center;
  }

  .page-content {
    width: 100%;
    text-align: center;
  }

  .filter-tabs {
    align-self: center;
  }

  .my-card-header {
    flex-direction: column;
    gap: 15px;
  }

  .actions {
    align-self: flex-start;
  }

  .author-info-card {
    flex-direction: column;
    text-align: center;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>