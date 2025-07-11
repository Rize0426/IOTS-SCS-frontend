<template>
  <div class="videos-section">
    <div class="section-title">视频学习</div>

    <div v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="chapters.length === 0 || chapters.every(c => !c.videos || c.videos.length === 0)">
      <el-empty description="暂无视频内容"></el-empty>
    </div>
    <div v-else>
      <div v-for="(chapter, index) in chapters" :key="index" class="chapter-block">
        <div class="chapter-title">
          <el-divider content-position="left">{{ chapter.chapter_title || '未知章节' }}</el-divider>
        </div>

        <div class="video-list">
          <div
              v-for="(video, videoIndex) in chapter.videos"
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
                <div class="video-title">{{ video.title || '无标题视频' }}</div>
                <div class="video-meta">
                  <span class="video-size">{{ formatFileSize(video.size) }}</span>
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
                    v-if="video.view_progress !== undefined && typeof video.view_progress === 'number'"
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VideoPlay } from '@element-plus/icons-vue';
import { ElMessage, ElSkeleton, ElEmpty } from 'element-plus';

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

// 视频服务的基础 URL
// 请根据您的实际后端服务地址进行修改！
// 例如：如果您的后端API是 'http://localhost:8080/api'
const API_BASE_URL = 'http://localhost:8080';

// 辅助函数：根据 videoFileId 构造视频文件 URL
const getVideoUrl = (videoFileId) => {
  if (!videoFileId) return null;
  // 假设视频文件的下载或播放路径是 /api/files/{videoFileId}
  return `${API_BASE_URL}/api/files/${videoFileId}`;
};

// 播放视频
const playVideo = (video) => {
  const videoUrl = getVideoUrl(video.videoFileId); // 使用后端提供的 videoFileId 构造 URL
  if (!videoUrl) {
    ElMessage.warning('视频资源URL缺失，无法播放！');
    return;
  }
  // 触发 'play-video' 事件，并传递一个包含所有必要信息的视频对象
  // 即使后端只提供了 videoFileId，我们也在这里补全其他信息（使用默认值或空值）
  emit('play-video', {
    ...video, // 复制后端提供的原始视频对象（例如 { videoFileId: 'xxx' }）
    video_file_url: videoUrl, // 添加构造的视频播放 URL
    title: video.title || '无标题视频', // 提供默认标题
    description: video.description || '暂无描述', // 提供默认描述
    duration: video.duration || 0, // 提供默认时长
    size: video.size || 0, // 提供默认大小
    thumbnail: video.thumbnail || defaultVideoThumbnail, // 提供默认缩略图
    view_progress: video.view_progress || 0 // 提供默认观看进度
  });
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

// 格式化日期 (虽然此组件未使用，但保留)
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
/* 这里放置您的样式，保持不变 */
.videos-section {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.video-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.video-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.video-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 比例 */
  background-color: #f0f2f5;
  overflow: hidden;
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
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.video-play-icon:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.video-info {
  padding: 15px;
  flex-grow: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
}

.video-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #303133;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 8px;
}

.video-description {
  font-size: 0.9rem;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 15px;
  flex-grow: 1; /* 允许描述文本占据空间 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 最多显示3行 */
  -webkit-box-orient: vertical;
}

.video-actions {
  padding: 0 15px 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-progress {
  width: 100%;
}
</style>