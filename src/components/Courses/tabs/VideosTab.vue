<template>
  <div class="videos-section">
    <div class="section-title">视频学习</div>

    <div v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="chapters.length === 0 || chapters.every(c => c.videos.length === 0)">
      <el-empty description="暂无视频内容"></el-empty>
    </div>
      <div class="chapter-title">
        <el-divider content-position="left">{{ chapters.chapter_title }}</el-divider>
      </div>

      <div class="video-list">
        <div
            v-for="(video, videoIndex) in chapters.videos"
            :key="videoIndex"
            class="video-item"
        >
          <div class="video-card">
            <div class="video-thumbnail">
              <img :src="video.thumbnail || defaultVideoThumbnail" :alt="video.title || '视频缩略图'" />
              <div class="video-duration">{{ formatDuration(video.duration) }}</div>
              <div class="video-play-icon" @click="playVideo(video)">
                <el-icon><VideoPlay /></el-icon>
              </div>
            </div>

            <div class="video-info">
              <div class="video-title">{{ video.title }}</div>
              <div class="video-meta">
                <span class="video-size">{{ formatFileSize(video.size) }}</span>
                <span class="video-date">{{ formatDate(video.upload_time) }}</span>
              </div>
              <div class="video-description">{{ video.description || '暂无描述' }}</div>
            </div>

            <div class="video-actions">
              <el-button
                  type="primary"
                  size="small"
                  @click="playVideo(video)"
              >
                开始学习
              </el-button>

              <el-progress
                  v-if="video.view_progress !== undefined"
                  :percentage="video.view_progress"
                  :stroke-width="4"
                  :format="videoProgressFormat"
                  class="video-progress"
              ></el-progress>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import { ElMessage, ElSkeleton, ElEmpty } from 'element-plus'; // 引入Element Plus组件

// 定义props
const props = defineProps({
  chapters: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['play-video']);

// 默认视频缩略图
const defaultVideoThumbnail = 'https://via.placeholder.com/300x180?text=视频缩略图';

// 播放视频
const playVideo = (video) => {
  if (!video.video_file_url) {
    ElMessage.warning('视频资源URL缺失，无法播放！');
    return;
  }
  emit('play-video', video);
};

// 格式化视频时长 (假定durationInSeconds以秒为单位)
const formatDuration = (durationInSeconds) => {
  if (typeof durationInSeconds !== 'number' || isNaN(durationInSeconds) || durationInSeconds < 0) return '00:00';
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  const parts = [];
  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'));
  }
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(seconds.toString().padStart(2, '0'));

  return parts.join(':');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '无日期';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // 检查日期是否有效
      return '无效日期';
    }
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    console.error("日期格式化错误:", e);
    return '无效日期';
  }
};

// 视频进度显示格式
const videoProgressFormat = (percentage) => {
  return `${percentage}%`;
};
</script>

<style scoped>
.videos-section {
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

.chapter-block {
  margin-bottom: 30px;
}

.chapter-title {
  margin-bottom: 15px;
}

.chapter-title .el-divider {
  margin: 10px 0;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.video-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.video-card {
  display: flex;
  flex-direction: column;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-thumbnail:hover .video-play-icon {
  opacity: 1;
}

.video-play-icon .el-icon {
  font-size: 24px;
  color: white;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.video-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.video-description {
  color: #606266;
  font-size: 0.9rem;
  margin-bottom: 10px;
  word-break: break-all;
}

.video-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px; /* 元素间距 */
}

.video-progress {
  flex-grow: 1; /* 进度条占据剩余空间 */
  min-width: 150px; /* 确保进度条有最小宽度 */
}
</style>