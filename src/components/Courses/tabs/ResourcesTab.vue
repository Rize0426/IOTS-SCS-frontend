<template>
  <div class="resources-section">
    <div class="section-title">课程资源</div>

    <div v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="chapters.length === 0 || chapters.every(c => c.resources.length === 0)">
      <el-empty description="暂无资源内容"></el-empty>
    </div>
    <div v-else v-for="(chapter, index) in chapters" :key="index" class="chapter-block">
      <div class="chapter-title">
        <el-divider content-position="left">{{ chapter.chapter_title }}</el-divider>
      </div>

      <div class="resource-list">
        <div
            v-for="(resource, resIndex) in chapter.resources"
            :key="resIndex"
            class="resource-item"
        >
          <div class="resource-icon">
            <el-icon v-if="resource.type === 'document'"><Document /></el-icon>
            <el-icon v-else-if="resource.type === 'video'"><VideoPlay /></el-icon>
            <el-icon v-else-if="resource.type === 'attachment' || !resource.type"><Paperclip /></el-icon>
            <el-icon v-else><Files /></el-icon>
          </div>

          <div class="resource-info">
            <div class="resource-name">
              <el-tooltip :content="resource.description" placement="top" :show-after="1000">
                <span>{{ resource.name }}</span>
              </el-tooltip>
            </div>
            <div class="resource-meta">
              <span class="resource-size">{{ formatFileSize(resource.size) }}</span>
              <span class="resource-date">{{ formatDate(resource.upload_time) }}</span>
            </div>
          </div>

          <div class="resource-actions">
            <el-button
                size="small"
                :type="resource.type === 'video' ? 'primary' : 'success'"
                @click="$emit('download-resource', resource)"
                :disabled="!resource.allow_download && resource.type !== 'video'"
            >
              {{ resource.type === 'video' ? '预览' : '下载' }}
            </el-button>

            <el-progress
                v-if="resource.type === 'video' && resource.view_progress !== undefined"
                :percentage="resource.view_progress"
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
import { Document, VideoPlay, Paperclip, Files } from '@element-plus/icons-vue';
import { ElTooltip, ElMessage, ElSkeleton, ElEmpty, ElDivider, ElButton, ElProgress } from 'element-plus'; // 引入Element Plus组件

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

defineEmits(['download-resource']);

const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '无日期';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
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

const videoProgressFormat = (percentage) => {
  return `${percentage}%`;
};
</script>

<style scoped>
.resources-section {
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

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.resource-icon {
  font-size: 28px;
  color: #409eff;
  flex-shrink: 0;
}

.resource-info {
  flex-grow: 1;
  min-width: 0;
}

.resource-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
  word-break: break-all;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #909399;
  font-size: 0.85rem;
}

.resource-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}

.video-progress {
  width: 100%;
}
</style>