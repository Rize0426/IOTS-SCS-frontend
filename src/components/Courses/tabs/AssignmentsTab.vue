<!-- components/course/tabs/AssignmentsTab.vue -->
<template>
  <div class="assignments-section">
    <div class="section-title">作业列表</div>

    <el-empty v-if="assignments.length === 0" description="暂无作业"></el-empty>

    <div v-else class="assignment-list">
      <div
          v-for="assignment in assignments"
          :key="assignment.assignment_id"
          class="assignment-item"
          :class="{ 'completed': assignment.status === 'completed' }"
      >
        <div class="assignment-header">
          <div class="assignment-title">{{ assignment.title }}</div>
          <el-tag
              :type="getAssignmentStatusType(assignment.status)"
          >{{ getAssignmentStatusText(assignment.status) }}</el-tag>
        </div>

        <div class="assignment-info">
          <div class="info-row">
            <el-icon><Calendar /></el-icon>
            <span>截止时间: {{ formatDate(assignment.deadline) }}</span>
          </div>
          <div class="info-row">
            <el-icon><Timer /></el-icon>
            <span>剩余时间: {{ calculateRemainingTime(assignment.deadline) }}</span>
          </div>
        </div>

        <div class="assignment-description">{{ assignment.description }}</div>

        <div class="assignment-actions">
          <el-button
              v-if="assignment.status === 'submitted'"
              type="info"
              size="small"
              @click="viewAssignmentSubmission(assignment.assignment_id)"
          >
            查看提交
          </el-button>

          <el-button
              v-if="assignment.status !== 'completed'"
              type="primary"
              size="small"
              @click="submitAssignment(assignment.assignment_id)"
          >
            提交作业
          </el-button>

          <el-button
              size="small"
              @click="downloadAssignmentAttachments(assignment)"
          >
            下载附件
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
  assignments: Array,
  loading: Boolean
});

// 定义事件
const emit = defineEmits([
  'submit-assignment',
  'view-submission',
  'download-attachments'
]);

// 获取作业状态文本
const getAssignmentStatusText = (status) => {
  const statusMap = {
    'pending': '未开始',
    'submitted': '已提交',
    'graded': '已批改',
    'completed': '已完成'
  };
  return statusMap[status] || '未知';
};

// 获取作业状态对应的标签类型
const getAssignmentStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'submitted': 'warning',
    'graded': 'success',
    'completed': 'success'
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

// 计算剩余时间
const calculateRemainingTime = (deadline) => {
  if (!deadline) return '无截止时间';

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate - now;

  if (diffMs <= 0) return '已截止';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let remainingTime = '';
  if (diffDays > 0) remainingTime += `${diffDays}天 `;
  remainingTime += `${diffHours}小时 ${diffMinutes}分钟`;

  return remainingTime;
};

// 提交作业
const submitAssignment = (assignmentId) => {
  emit('submit-assignment', assignmentId);
};

// 查看作业提交详情
const viewAssignmentSubmission = (assignmentId) => {
  emit('view-submission', assignmentId);
};

// 下载作业附件
const downloadAssignmentAttachments = (assignment) => {
  emit('download-attachments', assignment);
};
</script>

<style scoped>
.assignments-section {
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

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assignment-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.assignment-item.completed {
  border-left: 4px solid #67C23A;
}

.assignment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.assignment-title {
  font-weight: bold;
  color: #303133;
}

.assignment-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.assignment-description {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.5;
}

.assignment-actions {
  display: flex;
  gap: 10px;
}
</style>