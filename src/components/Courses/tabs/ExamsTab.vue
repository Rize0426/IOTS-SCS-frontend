<!-- components/course/tabs/ExamsTab.vue -->
<template>
  <div class="exams-section">
    <div class="section-title">考试列表</div>

    <el-empty v-if="exams.length === 0" description="暂无考试"></el-empty>

    <div v-else class="exam-list">
      <div
          v-for="exam in exams"
          :key="exam.exam_id"
          class="exam-item"
      >
        <div class="exam-header">
          <div class="exam-title">{{ exam.title }}</div>
          <el-tag
              :type="getExamStatusType(exam.status)"
          >{{ getExamStatusText(exam.status) }}</el-tag>
        </div>

        <div class="exam-info">
          <div class="info-row">
            <el-icon><Calendar /></el-icon>
            <span>考试时间: {{ formatDate(exam.start_time) }} ~ {{ formatDate(exam.end_time) }}</span>
          </div>
          <div class="info-row">
            <el-icon><Timer /></el-icon>
            <span>时长: {{ formatDuration(exam.duration) }}</span>
          </div>
        </div>

        <div class="exam-description">{{ exam.description }}</div>

        <div class="exam-actions">
          <el-button
              v-if="exam.status === 'upcoming'"
              type="primary"
              size="small"
              @click="reserveExam(exam.exam_id)"
          >
            预约考试
          </el-button>

          <el-button
              v-if="exam.status === 'ongoing'"
              type="success"
              size="small"
              @click="startExam(exam.exam_id)"
          >
            开始考试
          </el-button>

          <el-button
              v-if="['completed', 'graded'].includes(exam.status)"
              type="info"
              size="small"
              @click="viewExamResult(exam.exam_id)"
          >
            查看成绩
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Calendar, Timer } from '@element-plus/icons-vue';

// 定义props
const props = defineProps({
  exams: Array,
  loading: Boolean
});

// 定义事件
const emit = defineEmits([
  'reserve-exam',
  'start-exam',
  'view-result'
]);

// 获取考试状态文本
const getExamStatusText = (status) => {
  const statusMap = {
    'upcoming': '未开始',
    'ongoing': '进行中',
    'completed': '已结束',
    'graded': '已批改'
  };
  return statusMap[status] || '未知';
};

// 获取考试状态对应的标签类型
const getExamStatusType = (status) => {
  const typeMap = {
    'upcoming': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'graded': 'success'
  };
  return typeMap[status] || 'info';
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

// 格式化时长（转换为小时:分钟格式）
const formatDuration = (durationInSeconds) => {
  if (!durationInSeconds) return '00:00';
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// 预约考试
const reserveExam = (examId) => {
  emit('reserve-exam', examId);
};

// 开始考试
const startExam = (examId) => {
  emit('start-exam', examId);
};

// 查看考试成绩
const viewExamResult = (examId) => {
  emit('view-result', examId);
};
</script>

<style scoped>
.exams-section {
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

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exam-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.exam-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exam-title {
  font-weight: bold;
  color: #303133;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.exam-description {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.5;
}

.exam-actions {
  display: flex;
  gap: 10px;
}
</style>