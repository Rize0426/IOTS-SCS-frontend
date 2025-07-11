<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <el-button type="primary" @click="goBack">返回</el-button>
        <h1 style="margin-left: 20px;">学习中心</h1>
      </el-header>
      <el-main class="app-main" v-loading="loading">
        <div class="content-grid">
          <!-- 学生信息 -->
          <div class="grid-item full-width">
            <!-- StudentProfile -->
            <el-card class="student-profile">
              <div class="profile-header">
                <el-avatar :size="80" :src="learningData.user.avatarUrl" />
                <div class="profile-info">
                  <h2>{{ learningData.user.name }}</h2>
                  <p class="student-id">学号: {{ learningData.user.identity }}</p>
                  <div class="contact-info">
                    <el-tag type="info" size="small" v-if="learningData.user.email">{{ learningData.user.email
                      }}</el-tag>
                    <el-tag type="success" size="small" v-if="learningData.user.phone">{{ learningData.user.phone
                      }}</el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 第一行 -->
          <div class="grid-item half-width">
            <!-- CourseProgress -->
            <el-card class="course-progress">
              <template #header>
                <h3><i class="el-icon-reading"></i> 课程学习进度</h3>
              </template>
              <div class="progress-list">
                <div v-for="course in learningData.courseLearnResults" :key="course.courseId" class="progress-item">
                  <div class="course-info">
                    <h4>{{ course.courseName }}</h4>
                    <p>{{ course.timeAnalysis.studiedHours }} / {{ course.timeAnalysis.totalHours }} 课时</p>
                  </div>
                  <div class="progress-bar">
                    <el-progress :percentage="course.timeAnalysis.progress" :stroke-width="8"
                      :color="getProgressColor(course.timeAnalysis.progress)" />
                  </div>
                  <div class="progress-stats">
                    <el-statistic title="学习进度" :value="course.timeAnalysis.progress" suffix="%" :precision="1" />
                    <el-statistic title="本周学习" :value="course.timeAnalysis.weeklyStudyTime.reduce((a, b) => a + b, 0)"
                      suffix="小时" />
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <div class="grid-item half-width">
            <!-- KnowledgeStats -->
            <el-card class="knowledge-stats">
              <template #header>
                <h3><i class="el-icon-collection"></i> 知识库贡献</h3>
              </template>
              <div class="stats-grid">
                <div v-for="knowledge in learningData.knowledgeAnalysisList" :key="knowledge.id" class="knowledge-item">
                  <h4>{{ knowledge.title }}</h4>
                  <div class="stats-row">
                    <div class="stat-item">
                      <el-icon class="stat-icon like">👍</el-icon>
                      <span>{{ knowledge.likeCount }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon class="stat-icon comment">
                        <ChatLineSquare />
                      </el-icon>
                      <span>{{ knowledge.commentCount }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon class="stat-icon view">
                        <View />
                      </el-icon>
                      <span>{{ knowledge.viewCount }}</span>
                    </div>
                    <div class="stat-item">
                      <el-icon class="stat-icon favorite">
                        <Star />
                      </el-icon>
                      <span>{{ knowledge.favoriteCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 第二行 -->
          <div class="grid-item half-width">
            <!-- ExamChart -->
            <el-card class="exam-chart">
              <template #header>
                <h3><i class="el-icon-data-analysis"></i> 考试成绩分析</h3>
              </template>
              <div class="chart-container">
                <v-chart class="chart" :option="examChartOption" autoresize />
              </div>
            </el-card>
          </div>

          <div class="grid-item half-width">
            <!-- AssignmentChart -->
            <el-card class="assignment-chart">
              <template #header>
                <h3><i class="el-icon-edit"></i> 作业完成情况</h3>
              </template>
              <div class="chart-container">
                <v-chart class="chart" :option="assignmentChartOption" autoresize />
              </div>
            </el-card>
          </div>

          <!-- 第三行 -->
          <div class="grid-item full-width">
            <!-- StudyTimeChart -->
            <el-card class="study-time-chart">
              <template #header>
                <h3><i class="el-icon-time"></i> 每周学习时间分布</h3>
              </template>
              <div class="chart-container">
                <v-chart class="chart" :option="studyTimeChartOption" autoresize />
              </div>
            </el-card>
          </div>
          <!-- AI分析 -->
          <div class="grid-item full-width" style="margin-left: 150px; ">
            <el-card class="ai-analysis">
              <template #header>
                <h3><i class="el-icon-cpu"></i> AI 学习建议</h3>
              </template>
              <div class="analysis-list" v-loading="aiLoading" element-loading-text="AI建议生成中...">
                <el-card v-if="learningData.aiAnalysis" v-html="parseMarkdown(learningData.aiAnalysis)" />
                <div v-else>
                  <el-empty description="AI暂无分析建议,请继续努力" />
                  <el-button type="primary" @click="fetchAI">重新分析</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 学习路径规划 -->
        <div class="grid-item full-width" style="margin-top: 20px;" v-loading="pathLoading || aiLoading"
          element-loading-text="路径规划生成中...">
          <LearnPathView :learning-path="learningData.learningPath"
            v-if="learningData.learningPath && !aiLoading && !pathLoading" />
          <div v-else>
            <el-empty description="暂无学习路径规划" />
            <el-button type="primary" @click="fetchLearningPath">重新规划</el-button>
          </div>
        </div>

        <!-- 智能推荐 -->
        <div class="grid-item full-width" style="margin-top: 20px;"
          v-loading="recommendLoading || aiLoading || pathLoading || recommendLoading"
          element-loading-text="智能推荐生成中...">
          <SmartRecommendView :recommendations="learningData.recommendations"
            v-if="learningData.recommendations && !aiLoading && !pathLoading && !recommendLoading" />
          <div v-else>
            <el-empty description="暂无推荐" />
            <el-button type="primary" @click="fetchRecommendation">重新推荐</el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { mockLearnAnalysisData } from './mockData';
import { customFetch } from '../../api/customFetch';
import { ElMessage } from 'element-plus';
import router from '../../router';
import parseMarkdown from '../../utils/markdownParse';
import LearnPathView from './LearnPathView.vue';
import SmartRecommendView from './SmartRecommendView.vue';
import { useUserStore } from '@/stores/auth';
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart
]);
const userStore = useUserStore();
const loading = ref(false);
const aiLoading = ref(false);
const pathLoading = ref(false)
const recommendLoading = ref(false)
// mock数据扩展
const learningData = reactive(mockLearnAnalysisData);

const getProgressColor = (progress: number) => {
  if (progress >= 90) return '#67c23a';
  if (progress >= 70) return '#e6a23c';
  return '#f56c6c';
};

function getRandomColor() {
  // 生成亮色
  const letters = '89ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

const assignmentChartOption = computed(() => {
  const assignmentData = learningData.courseLearnResults.map(course => {
    const avgScore = course.assignmentAnalysisList.reduce((sum: any, assignment: any) => sum + assignment.score, 0) / course.assignmentAnalysisList.length;
    return {
      value: avgScore,
      name: course.courseName,
      itemStyle: { color: getRandomColor() }
    };
  });
  return {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}分 ({d}%)' },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: assignmentData.map(item => item.name)
    },
    series: [
      {
        name: '作业平均分',
        type: 'pie',
        radius: '50%',
        data: assignmentData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  };
});

const examChartOption = computed(() => {
  const courses = learningData.courseLearnResults.map(course => course.courseName);
  const examData = learningData.courseLearnResults.map(course => {
    if (!course.examAnalysisList || course.examAnalysisList.length === 0) return 0;
    const avgScore = course.examAnalysisList.reduce((sum: any, exam: any) => sum + exam.score, 0) / course.examAnalysisList.length;
    return Number(avgScore.toFixed(1));
  });
  // 生成随机色数组
  const barColors = courses.map(() => getRandomColor());
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: courses, axisLabel: { interval: 0, rotate: 45 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}分' } },
    series: [
      {
        name: '平均成绩',
        type: 'bar',
        data: examData,
        itemStyle: {
          color: (params: any) => barColors[params.dataIndex]
        },
        label: { show: true, position: 'top', formatter: '{c}分' }
      }
    ]
  };
});

const studyTimeChartOption = computed(() => {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const series = learningData.courseLearnResults.map(course => ({
    name: course.courseName,
    type: 'line',
    data: course.timeAnalysis.weeklyStudyTime,
    smooth: true,
    lineStyle: {
      width: 3,
      color: getRandomColor()
    },
    areaStyle: {
      opacity: 0.1,
      color: getRandomColor()
    }
  }));
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: learningData.courseLearnResults.map(course => course.courseName) },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: weekDays },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}h' } },
    series: series
  };
});
function goBack() {
  router.go(-1);
}
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await customFetch('/api/learn/analysis');
    const data = await res.json();
    if (data.code !== 200) {
      ElMessage.error("获取学习分析数据失败");
      return;
    }
    if (data.data.user) {
      learningData.user = data.data.user;
      if (learningData.user.avatarUrl === null) {
        learningData.user.avatarUrl = userStore.userInfo.avatar_url
      }
    } else {
      learningData.user.avatarUrl = userStore.userInfo.avatar_url
      learningData.user.name = userStore.userInfo.account
      learningData.user.uid = userStore.userInfo.uid
    }
    if (data.data.courseLearnResults) {
      const clr = data.data.courseLearnResults;
      if (clr.length < learningData.courseLearnResults.length) {
        learningData.courseLearnResults.splice(0, clr.length);
        learningData.courseLearnResults.push(...clr.map((c: any) => {
          const randomNumbers = Array.from({ length: 7 }, () =>
            Math.floor(Math.random() * 16) // 生成 0-15 之间的整数
          );
          const totalHours = randomNumbers.reduce((sum: any, num: any) => sum + num, 0);
          const studiedHours = Math.floor(Math.random() * totalHours);
          function getRandomDate() {
            const start = new Date(2025, 1, 16);
            const end = new Date(2025, 5, 31);
            const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
            return new Date(randomTime);
          }
          return {
            ...c,
            timeAnalysis: {
              courseId: c.courseId,
              totalHours: totalHours,
              studiedHours: studiedHours,
              progress: parseFloat((studiedHours / totalHours * 100).toFixed(2)),
              weeklyStudyTime: randomNumbers,
              lastStudyDate: getRandomDate().toISOString()
            }
          }
        }));
        console.log(learningData.courseLearnResults)
      }
    }

    learningData.knowledgeAnalysisList = data.data.knowledgeAnalysisList;
    // AI建议先清空
    learningData.aiAnalysisList = [];
  } catch (error) {
    console.log("获取学习分析数据失败:", error);
    ElMessage.error("获取学习分析数据失败");
  } finally {
    loading.value = false;
  }
};

const fetchAI = async () => {
  aiLoading.value = true;
  try {
    const res = await customFetch('/api/learn/analysis/ai');
    const data = await res.json();
    if (data.code === 200) {
      learningData.aiAnalysis = data.data;
    } else {
      ElMessage.error("AI建议获取失败");
    }
  } catch (error) {
    ElMessage.error("AI建议获取失败");
  } finally {
    aiLoading.value = false;
  }
};
const fetchLearningPath = async () => {
  pathLoading.value = true;
  try {
    const res = await customFetch('/api/learn/analysis/path');
    const data = await res.json();
    if (data.code === 200) {
      if (data.data) {
        learningData.learningPath = data.data;
      }
    } else {
      ElMessage.error("学习路径获取失败");
    }
  } catch (error) {
    console.log("学习路径获取失败:", error);
    ElMessage.error("学习路径获取失败");
  } finally {
    pathLoading.value = false;
  }
}

const fetchRecommendation = async () => {
  recommendLoading.value = true;
  try {
    const res = await customFetch('/api/learn/analysis/recommend');
    const data = await res.json();
    if (data.code === 200) {
      if (data.data) {
        learningData.recommendations = data.data;
      }
    } else {
      ElMessage.error("推荐数据获取失败");
    }
  } catch (error) {
    console.log("推荐数据获取失败:", error);
    ElMessage.error("推荐数据获取失败");
  } finally {
    recommendLoading.value = false;
  }
}
onMounted(async () => {
  document.title = "学习中心"
  await fetchData()
  await fetchAI();
  await fetchLearningPath();
  await fetchRecommendation();
});

</script>

<style scoped>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  background: transparent;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.app-main {
  padding: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.half-width {
  min-height: 400px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .half-width {
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding: 16px;
  }

  .content-grid {
    gap: 16px;
  }

  .app-header h1 {
    font-size: 20px;
  }

  .app-header {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .half-width {
    min-height: 300px;
  }
}

/* StudentProfile 样式 */
.student-profile {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-info h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.student-id {
  margin: 0 0 12px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.contact-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-info h2 {
    font-size: 20px;
  }
}

/* CourseProgress 样式 */
.course-progress {
  height: 100%;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.course-info {
  margin-bottom: 12px;
}

.course-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
}

.course-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.progress-bar {
  margin-bottom: 16px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.progress-stats .el-statistic {
  flex: 1;
}

@media (max-width: 768px) {
  .progress-stats {
    flex-direction: column;
    gap: 8px;
  }
}

/* KnowledgeStats 样式 */
.knowledge-stats {
  height: 100%;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.knowledge-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.knowledge-item h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.stat-icon {
  font-size: 16px;
}

.stat-icon.like {
  color: #f56c6c;
}

.stat-icon.comment {
  color: #409eff;
}

.stat-icon.view {
  color: #67c23a;
}

.stat-icon.favorite {
  color: #e6a23c;
}

@media (max-width: 768px) {
  .stats-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .stat-item {
    flex: 1;
    min-width: 45%;
  }
}

/* ExamChart 样式 */
.exam-chart {
  height: 100%;
}

.chart-container {
  height: 300px;
}

.chart {
  height: 100%;
  width: 100%;
}

/* AssignmentChart 样式 */
.assignment-chart {
  height: 100%;
}

/* StudyTimeChart 样式 */
.study-time-chart {
  height: 100%;
}

/* AIAnalysis 样式 */
.ai-main {
  margin-top: 30px;
  margin-left: 12%;
}

.ai-analysis {
  height: 100%;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
  transition: all 0.3s ease;
}

.analysis-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.analysis-icon {
  color: #3b82f6;
  margin-top: 2px;
}

.analysis-content {
  flex: 1;
}

.analysis-content p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
  font-size: 14px;
}

@media (max-width: 768px) {
  .analysis-item {
    padding: 12px;
  }

  .analysis-content p {
    font-size: 13px;
  }
}
</style>