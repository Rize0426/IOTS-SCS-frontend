<!-- src/views/PostDetail.vue -->
<template>
  <div class="post-detail-container">
    <div class="post-detail-header">
      <el-page-header @back="goBack" :content="currentPost?.title || '帖子详情'" />
    </div>

    <div class="post-detail-content">
      <!-- 帖子内容 -->
      <div class="post-main">
        <div class="post-info">
          <div class="author-info">
            <el-avatar :size="40" :src="currentPost?.author.avatar" />
            <div class="author-meta">
              <span class="author-name">{{ currentPost?.author.name }}</span>
              <span class="post-time">{{ formatTime(currentPost?.createdAt) }}</span>
            </div>
          </div>

          <div class="post-body">
            <h2 class="post-title">{{ currentPost?.title }}</h2>
            <div class="post-text">{{ currentPost?.content }}</div>
          </div>

          <div class="post-actions">
            <el-button
                type="text"
                @click="handleToggleLike"
                :class="{ 'liked': currentPost?.liked }"
            >
              <el-icon><Star /></el-icon>
              {{ currentPost?.liked ? '已点赞' : '点赞' }}
              <span class="like-count">({{ currentPost?.likes || 0 }})</span>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 回复区域 -->
      <div class="replies-container">
        <h3 class="replies-title">回复列表 ({{ currentPost?.replies?.length || 0 }})</h3>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="currentPost?.replies?.length === 0" class="no-replies">
          <el-empty description="暂无回复" />
        </div>

        <div v-else class="replies-list">
          <div v-for="reply in currentPost?.replies" :key="reply.id" class="reply-item">
            <div class="reply-header">
              <el-avatar :size="30" :src="reply.author.avatar" />
              <div class="reply-author">
                <span class="reply-name">{{ reply.author.name }}</span>
                <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
              </div>
            </div>
            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回复表单 -->
    <div class="reply-form-container" v-if="currentUser">
      <el-divider>发表回复</el-divider>
      <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef">
        <el-form-item prop="content">
          <el-input
              v-model="replyForm.content"
              type="textarea"
              :rows="4"
              placeholder="写下你的回复..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitReply" :loading="submitting">
            发布回复
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star } from '@element-plus/icons-vue';
import { getPostById, addReply, toggleLikePost as apiToggleLikePost, getCurrentUser } from '@/api/forum';

const route = useRoute();
const router = useRouter();
const postId = ref(Number(route.params.id));
const currentPost = ref(null);
const loading = ref(false);
const submitting = ref(false);
const replyFormRef = ref(null);
const currentUser = ref(null);

// 回复表单
const replyForm = ref({
  content: ''
});

// 表单验证规则
const replyRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 3, max: 5000, message: '内容长度在3到5000个字符之间', trigger: 'blur' }
  ]
};

// 格式化时间函数
const formatTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  // 小于1小时
  else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  // 小于1天
  else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  // 小于1周
  else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  // 其他情况显示具体日期
  else {
    return new Date(date).toLocaleDateString();
  }
};

// 加载帖子详情
const loadPost = async () => {
  loading.value = true;
  try {
    const post = await getPostById(postId.value);
    currentPost.value = post;
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    ElMessage.error('获取帖子详情失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.push('/forum');
};

// 切换点赞状态
const handleToggleLike = async () => {
  if (!currentUser.value) {
    ElMessage.warning('请先登录后再点赞');
    return;
  }

  try {
    const updatedPost = await apiToggleLikePost(postId.value);
    currentPost.value = updatedPost;
    ElMessage.success(currentPost.value.liked ? '点赞成功' : '已取消点赞');
  } catch (error) {
    console.error('点赞/取消点赞失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 提交回复
const submitReply = async () => {
  if (!replyForm.value.content.trim()) return;

  submitting.value = true;
  try {
    const newReply = await addReply(postId.value, replyForm.value.content);
    if (!currentPost.value.replies) currentPost.value.replies = [];
    currentPost.value.replies.unshift(newReply); // 新回复放在前面
    replyForm.value.content = ''; // 清空回复内容
    ElMessage.success('回复发布成功');
  } catch (error) {
    console.error('发布回复失败:', error);
    ElMessage.error('发布回复失败，请稍后再试');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadPost();
  // 获取当前用户信息
  getCurrentUser().then(user => {
    currentUser.value = user;
  });
});
</script>

<style scoped lang="scss">
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 40px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  position: relative;
}

.post-detail-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.post-detail-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.post-main {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.post-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;

  .author-meta {
    display: flex;
    flex-direction: column;

    .author-name {
      font-weight: bold;
      font-size: 16px;
    }

    .post-time {
      font-size: 12px;
      color: #909399;
    }
  }
}

.post-body {
  margin-top: 10px;

  .post-title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #303133;
  }

  .post-text {
    line-height: 1.8;
    color: #606266;
    font-size: 16px;
  }
}

.post-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;

  .liked {
    color: #409eff;
  }

  .like-count {
    margin-left: 5px;
  }
}

.replies-container {
  margin-top: 20px;

  .replies-title {
    font-size: 18px;
    margin-bottom: 16px;
    color: #303133;
    border-left: 4px solid #409eff;
    padding-left: 10px;
  }
}

.loading-container, .no-replies {
  padding: 20px 0;
}

.reply-item {
  background-color: #f7f8fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;

  .reply-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .reply-author {
      margin-left: 12px;

      .reply-name {
        font-weight: 500;
        font-size: 15px;
      }

      .reply-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .reply-content {
    line-height: 1.6;
    color: #606266;
    font-size: 15px;
  }
}

.reply-form-container {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>