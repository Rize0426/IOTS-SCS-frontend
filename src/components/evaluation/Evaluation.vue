<template>
  <div class="evaluation-list-container">
    <div class="course-header">
      <h2>{{ courseName }} - 课程评价</h2>
      <div class="course-info">
        <span>授课教师：{{ teacher }}</span>
        <span>平均评分：{{ averageScore.toFixed(1) }}分</span>
      </div>
    </div>

    <el-empty v-if="details.length === 0" description="暂无评价" />

    <div v-else class="evaluation-list">
      <el-card
          v-for="item in details"
          :key="item.evaluationId"
          class="evaluation-item"
          shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span>评价ID：{{ item.evaluationId }}</span>
            <el-tag type="success">匿名评价</el-tag>
          </div>
        </template>

        <div class="score-info">
          <el-rate
              v-model="item.contentEvaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.serviceEvaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.attitudeEvaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.effectEvaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
        </div>

        <p class="content">{{ item.evaluationContent }}</p>
        <p class="time">{{ formatTime(item.createTime) }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getEvaluationDetails } from '@/api/courseEvaluation';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs'; // 时间格式化库

// 路由参数
const route = useRoute();
const courseId = Number(route.params.id);

// 数据
const details = ref([]);
const courseName = ref('');
const teacher = ref('');
const averageScore = ref(0);

// 获取评价详情
const fetchEvaluationDetails = async () => {
  try {
    const res = await getEvaluationDetails(courseId);
    if (res.code !== 200) throw new Error(res.message || '获取评价失败');

    details.value = res.data;
    if (details.value.length > 0) {
      // 提取课程名称和教师（假设所有评价的课程信息一致）
      courseName.value = details.value[0].courseName;
      teacher.value = details.value[0].teacher;

      // 计算平均分（4个评分项的总和 / 4 / 评价数量）
      const totalScore = details.value.reduce((sum, item) =>
          sum + item.contentEvaluation + item.serviceEvaluation + item.attitudeEvaluation + item.effectEvaluation, 0);
      averageScore.value = totalScore / (details.value.length * 4);
    }
  } catch (error) {
    ElMessage.error(error.message || '获取评价失败');
  }
};

// 格式化时间
const formatTime = (timeStr) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
};

// 组件挂载时获取数据
onMounted(() => {
  fetchEvaluationDetails();
});
</script>

<style scoped>
.evaluation-list-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.course-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.course-info {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  color: #666;
}

.evaluation-list {
  display: grid;
  gap: 20px;
}

.evaluation-item {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.score-info {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.content {
  color: #333;
  line-height: 1.6;
  margin: 10px 0;
}

.time {
  color: #999;
  font-size: 12px;
  text-align: right;
}
</style>