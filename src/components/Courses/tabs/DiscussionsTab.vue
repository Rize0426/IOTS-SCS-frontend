<!-- components/course/tabs/DiscussionsTab.vue -->
<template>
  <div class="discussions-section">
    <div class="section-title">课程讨论区</div>

    <!-- 发布新帖子 -->
    <div class="post-new-discussion">
      <el-button type="primary" @click="showNewDiscussionDialog = true">
        <el-icon><Edit /></el-icon> 发布新话题
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div v-if="discussions.length === 0" class="no-discussions">
      <el-empty description="暂无讨论帖子"></el-empty>
    </div>

    <div v-else class="discussion-list">
      <div
          v-for="discussion in discussions"
          :key="discussion.post_id"
          class="discussion-item"
          @click="viewDiscussionDetail(discussion.post_id)"
      >
        <div class="discussion-avatar">
          <el-avatar :size="40" :src="discussion.author_avatar || defaultAvatar"></el-avatar>
        </div>

        <div class="discussion-content">
          <div class="discussion-header">
            <div class="discussion-author">{{ discussion.author_name }}</div>
            <div class="discussion-time">{{ formatDate(discussion.create_time) }}</div>
          </div>

          <div class="discussion-title">{{ discussion.title }}</div>

          <div class="discussion-preview">
            {{ discussion.content.substring(0, 100) }}...
          </div>

          <div class="discussion-footer">
            <div class="discussion-stats">
              <span><el-icon><View /></el-icon> {{ discussion.view_count }}</span>
              <span><el-icon><ChatLineRound /></el-icon> {{ discussion.reply_count }}</span>
              <span><el-icon><Star /></el-icon> {{ discussion.like_count }}</span>
            </div>

            <div class="discussion-tags">
              <el-tag
                  v-for="(tag, tagIndex) in discussion.tags"
                  :key="tagIndex"
                  size="small"
              >{{ tag }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Edit, View, ChatLineRound, Star } from '@element-plus/icons-vue';

// 定义props
const props = defineProps({
  discussions: Array,
  loading: Boolean
});

// 定义事件
const emit = defineEmits(['view-discussion', 'new-discussion']);

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 显示新建讨论对话框
const showNewDiscussionDialog = ref(false);

// 查看讨论详情
const viewDiscussionDetail = (postId) => {
  emit('view-discussion', postId);
};

// 发布新讨论
const publishNewDiscussion = () => {
  emit('new-discussion');
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '无日期';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
</script>

<style scoped>
.discussions-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.post-new-discussion {
  margin-bottom: 20px;
}

.discussion-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.discussion-item {
  display: flex;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.discussion-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.discussion-avatar {
  margin-right: 15px;
}

.discussion-content {
  flex-grow: 1;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.discussion-author {
  font-weight: bold;
  color: #303133;
}

.discussion-time {
  font-size: 0.85rem;
  color: #909399;
}

.discussion-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.discussion-preview {
  color: #606266;
  font-size: 0.9rem;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.discussion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.discussion-stats {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 0.85rem;
}

.discussion-tags {
  display: flex;
  gap: 5px;
}
</style>