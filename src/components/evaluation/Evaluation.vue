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
          v-for="(item, index) in details" :key="index"
          class="evaluation-item"
          shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span>评价ID：{{ item.evaluation_id }}</span>
            <el-tag type="success">匿名评价</el-tag>
          </div>
        </template>

        <div class="score-info">
          <el-rate
              v-model="item.content_evaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.service_evaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.attitude_evaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
          <el-rate
              v-model="item.effect_evaluation"
              disabled
              text-color="#ff9900"
              score-template="{value}"
          />
        </div>

        <p class="content">{{ item.evaluation_content }}</p>
        <p class="time">{{ formatTime(item.create_time) }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEvaluationDetails } from '@/api/courseEvaluation';
import { studentCourseApi } from '@/api/course'; // 新增：引入学生课程API
import { ElMessage } from 'element-plus';
import { computed } from 'vue'; // 添加这行
import dayjs from 'dayjs';

// 路由相关
const route = useRoute();
const router = useRouter();
const courseId = computed(() => Number(route.params.id));

// 数据
const details = ref([]);
const courseInfo = ref({ courseName: '', teacher: '' }); // 初始化课程信息
const averageScore = ref(0);
const courseName = ref('');
const teacher = ref('');
// 获取课程基础信息（关键修改点）
const fetchCourseBaseInfo = async () => {
  try {
    const res = await studentCourseApi.getCourseDetail(courseId.value); // 调用课程详情接口
    if (res.code === 200) {
      courseInfo.value = {
        courseName: res.data.course_name,
        teacher: res.data.teacher_name // 假设接口返回字段为teacher（根据实际接口调整）
      };
    } else {
      throw new Error(res.message || '获取课程信息失败');
    }
  } catch (error) {
    ElMessage.error('获取课程信息失败：' + error.message);
  }
};

// 获取评价详情（仅用于计算平均分）
const fetchEvaluationDetails = async () => {
  if (!courseId.value) return;

  try {
    const res = await getEvaluationDetails(courseId.value);
    if (res.code !== 200) throw new Error(res.message || '获取评价失败');

    details.value = res.data;

    // 计算平均分（仅当有评价时）
    if (details.value.length > 0) {
      courseName.value = details.value[0].course_name;
      teacher.value = details.value[0].teacher;
      const totalScore = details.value.reduce(
          (sum, item) => sum + item.content_evaluation + item.service_evaluation + item.attitude_evaluation + item.effect_evaluation,
          0
      );
      averageScore.value = totalScore / (details.value.length * 4);
    }
  } catch (error) {
    ElMessage.error(error.message || '获取评价失败');
  }
};

// 返回课程列表
const goBack = () => {
  router.push('/courses-list');
};
const formatTime = (timeStr) => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
};
// 组件挂载时同时获取课程信息和评价详情
onMounted(() => {
  fetchCourseBaseInfo(); // 关键：优先获取课程基础信息
  fetchEvaluationDetails();
});
</script>

<style scoped>
/* 整体容器 */
.evaluation-list-container {
  max-width: 1000px; /* 限制最大宽度，适配大屏 */
  margin: 20px auto; /* 水平居中 */
  padding: 20px; /* 内边距 */
  background: #fff; /* 白色背景 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* 轻微阴影 */
}

/* 课程头部信息 */
.course-header {
  margin-bottom: 30px; /* 与下方内容的间距 */
  padding-bottom: 15px; /* 底部内边距 */
  border-bottom: 1px solid #f0f0f0; /* 分割线 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-header h2 {
  margin: 0; /* 重置标题边距 */
  font-size: 20px; /* 标题字体大小 */
  color: #303133; /* 主文本颜色 */
}

.course-info {
  display: flex;
  gap: 20px; /* 两个信息项之间的间距 */
  color: #606266; /* 辅助文本颜色 */
  font-size: 14px;
}

/* 无评价提示 */
.el-empty {
  margin: 40px 0; /* 上下边距 */
  padding: 30px; /* 内边距 */
}

/* 评价列表 */
.evaluation-list {
  margin-bottom: 30px; /* 与返回按钮的间距 */
}

.evaluation-item {
  margin-bottom: 15px; /* 评价卡片之间的间距 */
}

/* 返回按钮 */
.back-button {
  display: flex;
  justify-content: center; /* 按钮水平居中 */
  margin-top: 20px; /* 上边距 */
}

.back-button .el-button {
  padding: 10px 20px; /* 按钮内边距 */
  font-size: 14px; /* 按钮字体大小 */
  color: #409eff; /* 主色 */
  border-color: #409eff; /* 边框色 */
}

.back-button .el-button:hover {
  background: #ecf5ff; /* 悬停背景色 */
}
.content{
  word-break: break-all;
}
</style>