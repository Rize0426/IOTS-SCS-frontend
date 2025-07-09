<template>
  <div class="discussion-forum">
    <div class="forum-header">
      <h2>学习讨论区</h2>
      <el-button type="primary" @click="createNewPost">
        <el-icon><Plus /></el-icon> 发布新帖
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <div class="post-header">
          <h3>{{ post.title }}</h3>
          <div class="post-meta">
            <span class="author">{{ post.author.name }}</span>
            <span class="time">{{ formatTime(post.createdAt) }}</span>
          </div>
        </div>

        <div class="post-content">{{ post.content }}</div>

        <div class="post-footer">
          <div class="post-actions">
            <el-button type="text" @click="viewPostDetails(post.id)">
              查看回复 ({{ post.replies ? post.replies.length : 0 }})
            </el-button>
            <el-button type="text" @click="handleToggleLike(post.id)" v-if="post.liked">
              <el-icon><Star /></el-icon> 已点赞
            </el-button>
            <el-button type="text" @click="handleToggleLike(post.id)" v-else>
              <el-icon><StarFilled /></el-icon> 点赞 ({{ post.likes }})
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="posts.length === 0" class="no-posts">
        <el-empty description="暂无帖子">
          <template #description>
            <p>成为第一个发布帖子的用户吧！</p>
          </template>
        </el-empty>
      </div>
    </div>

    <!-- 新建帖子对话框 -->
    <el-dialog v-model="showPostDialog" title="发布新帖" width="50%">
      <el-form :model="newPostForm" :rules="postRules" ref="postFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newPostForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
              v-model="newPostForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入帖子内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPostDialog = false">取消</el-button>
          <el-button type="primary" @click="submitPost">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, Star, StarFilled } from '@element-plus/icons-vue';
import { getPosts, createPost, addReply, toggleLikePost as apiToggleLikePost, getCurrentUser } from '@/api/forum';
import PostDetail from '@/components/message/PostDetail.vue'; // 导入帖子详情组件（仅用于路由跳转）

const router = useRouter();
const posts = ref([]);
const showPostDialog = ref(false);
const postFormRef = ref(null);

// 用户相关状态
const currentUser = ref(null);
const replyForm = ref({ content: '' });

// 新建帖子表单
const newPostForm = ref({
  title: '',
  content: ''
});

// 表单验证规则
const postRules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度在3到50个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, max: 5000, message: '内容长度在10到5000个字符之间', trigger: 'blur' }
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

// 初始化加载帖子列表
const initialize = async () => {
  try {
    posts.value = await getPosts();
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    ElMessage.error('获取帖子列表失败，请刷新页面重试');
  }
};

// 创建新帖子
const createNewPost = () => {
  newPostForm.value = { title: '', content: '' };
  showPostDialog.value = true;
};

// 提交新帖子
const submitPost = async () => {
  if (!postFormRef.value) return;

  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const newPost = await createPost(newPostForm.value);
        posts.value.unshift(newPost);
        showPostDialog.value = false;
        ElMessage.success('帖子发布成功');
      } catch (error) {
        console.error('发布帖子失败:', error);
        ElMessage.error('发布帖子失败，请稍后再试');
      }
    } else {
      return false;
    }
  });
};

// 查看帖子详情 - 改为路由跳转
const viewPostDetails = (postId) => {
  router.push(`/post/${postId}`);
};

// 切换点赞状态
const handleToggleLike = async (postId) => {
  try {
    const updatedPost = await apiToggleLikePost(postId);
    // 更新列表中的帖子状态
    const index = posts.value.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts.value[index] = updatedPost;
    }
  } catch (error) {
    console.error('点赞/取消点赞失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

onMounted(() => {
  initialize();
  // 获取当前用户信息
  getCurrentUser().then(user => {
    currentUser.value = user;
  });
});
</script>

<style scoped lang="scss">
.discussion-forum {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  height: 70vh;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  position: relative;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #ebeef5;

  h2 {
    font-size: 24px;
    margin: 0;
    color: #303133;
  }
}

.posts-list {
  .post-item {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 20px;
        color: #303133;
      }

      .post-meta {
        display: flex;
        gap: 12px;
        font-size: 14px;
        color: #909399;
      }
    }

    .post-content {
      margin-bottom: 20px;
      line-height: 1.8;
      color: #606266;
      font-size: 16px;
    }

    .post-footer {
      display: flex;
      justify-content: flex-end;
    }
  }

  .no-posts {
    padding: 40px 0;
    display: flex;
    justify-content: center;
  }
}
</style>