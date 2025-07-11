<!-- components/course/CourseHeader.vue -->
<template>
  <el-card class="course-header-card">
    <div class="course-header">
      <div class="course-title">{{ courseName }}</div>
      <div class="course-status">
        <el-tag :type="getStatusType(status)">{{ getStatusText(status) }}</el-tag>
      </div>
    </div>

    <div class="course-info">
      <div class="info-row">
        <el-icon><User /></el-icon>
        <span>{{ teacherName }} 教授</span>
      </div>
      <div class="info-row">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(startDate) }} ~ {{ formatDate(endDate) }}</span>
      </div>
      <div class="info-row">
        <el-icon><Clock /></el-icon>
        <span>总课时: {{ totalLessons }}</span>
      </div>
      <div class="info-row">
        <el-icon><Document /></el-icon>
        <span>学分: {{ credit }}</span>
      </div>
    </div>

    <el-progress
        :percentage="courseProgress"
        :color="progressColor"
        :format="progressFormat"
        :stroke-width="18"
    ></el-progress>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { User, Calendar, Clock, Document } from '@element-plus/icons-vue';

const props = defineProps({
  courseName: String,
  status: String,
  teacherName: String,
  startDate: String,
  endDate: String,
  totalLessons: Number,
  credit: Number,
  progress: Number
});

const courseProgress = computed(() => {
  return props.progress;
});

const progressColor = computed(() => {
  const progress = courseProgress.value;
  if (progress >= 90) return '#67C23A';
  if (progress >= 70) return '#409EFF';
  if (progress >= 60) return '#E6A23C';
  return '#F56C6C';
});

const progressFormat = (percentage) => {
  return `学习进度 ${percentage}%`;
};

const getStatusText = (status) => {
  const statusMap = {
    'in_progress': '进行中',
    'completed': '已完成',
    'not_started': '未开始'
  };
  return statusMap[status] || '未知';
};

const getStatusType = (status) => {
  const typeMap = {
    'in_progress': 'warning',
    'completed': 'success',
    'not_started': 'info'
  };
  return typeMap[status] || 'info';
};

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
.course-header-card {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.course-status {
  margin-left: 10px;
}

.course-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
}

.info-row i {
  font-size: 16px;
}
</style>