<!-- components/course/CourseStats.vue -->
<template>
  <el-card class="stats-card">
    <template #header>
      <div class="card-header">
        <span>学习进度概览</span>
      </div>
    </template>

    <div class="stats-content">
      <div class="stat-item">
        <div class="stat-value">{{ totalLessonsCompleted }}/{{ totalLessons }}</div>
        <div class="stat-label">已完成课时</div>
      </div>

      <div class="stat-item">
        <div class="stat-value">{{ totalAssignmentsSubmitted }}/{{ totalAssignments }}</div>
        <div class="stat-label">已提交作业</div>
      </div>

      <div class="stat-item">
        <div class="stat-value">{{ totalExamsTaken }}/{{ totalExams }}</div>
        <div class="stat-label">已参加考试</div>
      </div>
    </div>

    <el-divider></el-divider>

    <!-- 课程完成率 -->
    <div class="completion-chart">
      <div class="chart-title">课程完成率</div>
      <div class="chart-bar-container">
        <div class="chart-bar" :style="{ width: `${courseProgress}%` }">
          <div class="chart-bar-inner">
            <span class="chart-bar-text">{{ courseProgress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近学习活动 -->
    <div class="recent-activities">
      <div class="section-subtitle">最近学习活动</div>

      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in recentActivities"
            :key="index"
            :timestamp="formatDate(activity.time)"
            :type="activity.type"
            :color="activity.color"
            placement="top"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar } from '@element-plus/icons-vue';

const props = defineProps({
  totalLessons: Number,
  totalLessonsCompleted: Number,
  totalAssignments: Number,
  totalAssignmentsSubmitted: Number,
  totalExams: Number,
  totalExamsTaken: Number,
  courseProgress: Number,
  recentActivities: Array
});

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
.stats-card {
  margin-top: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 5px;
}

.completion-chart {
  margin-bottom: 20px;
}

.chart-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.chart-bar-container {
  height: 20px;
  background-color: #ebeef5;
  border-radius: 10px;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 10px;
  transition: width 1s ease;
}

.chart-bar-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-right: 5px;
  box-sizing: border-box;
  color: white;
  font-size: 0.8rem;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.recent-activities {
  margin-top: 20px;
}
</style>