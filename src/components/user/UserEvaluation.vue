<template>
  <div class="evaluation-report">
    <el-card class="report-header">
      <template #header>
        <div class="card-header">
          <h1>学习效果评估报告</h1>
          <el-radio-group v-model="period" size="small" @change="handlePeriodChange">
            <el-radio-button label="weekly">本周</el-radio-button>
            <el-radio-button label="monthly">本月</el-radio-button>
            <el-radio-button label="term">学期</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-content">
            <el-skeleton-item variant="h2" style="width: 50%" />
            <div style="display: flex; gap: 20px; margin-top: 20px;">
              <el-skeleton-item variant="circle" style="width: 60px; height: 60px;" />
              <el-skeleton-item variant="circle" style="width: 60px; height: 60px;" />
              <el-skeleton-item variant="circle" style="width: 60px; height: 60px;" />
            </div>
          </div>
        </template>

        <template #default>
          <div class="report-summary">
            <div class="summary-title">学习概览</div>
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-value">{{ reportData.overall_progress }}%</div>
                <div class="stat-label">总体进度</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ reportData.average_score.toFixed(1) }}</div>
                <div class="stat-label">平均成绩</div>
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>

    <el-row :gutter="20" class="report-content">
      <!-- 左侧：学习活跃度 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <h2>学习活跃度</h2>
            </div>
          </template>

          <el-skeleton :loading="loading" animated>
            <template #template>
              <div class="skeleton-activity"></div>
            </template>

            <template #default>
              <div class="activity-metrics">
                <div class="activity-item">
                  <div class="activity-icon study-time">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="activity-details">
                    <div class="activity-value">{{ reportData.engagement_metrics.study_time_minutes }}分钟</div>
                    <div class="activity-label">学习时长</div>
                  </div>
                </div>
                <div class="activity-divider"></div>
                <div class="activity-item">
                  <div class="activity-icon login-days">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="activity-details">
                    <div class="activity-value">{{ reportData.engagement_metrics.login_days }}天</div>
                    <div class="activity-label">登录天数</div>
                  </div>
                </div>
                <div class="activity-divider"></div>
                <div class="activity-item">
                  <div class="activity-icon interactive-posts">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="activity-details">
                    <div class="activity-value">{{ reportData.engagement_metrics.interactive_posts }}次</div>
                    <div class="activity-label">互动次数</div>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </el-col>

      <!-- 右侧：课程表现和技能掌握 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-row :gutter="20">
          <!-- 课程表现 -->
          <el-col :span="24">
            <el-card class="course-card">
              <template #header>
                <div class="card-header">
                  <h2>课程表现</h2>
                  <el-tooltip content="各科目的进度和得分情况">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>

              <el-skeleton :loading="loading" animated>
                <template #template>
                  <el-table :data="[]" style="width: 100%">
                    <el-table-column prop="course_name" label="课程名称" />
                    <el-table-column prop="progress" label="进度" width="120">
                      <template #default="scope">
                        <el-progress :percentage="scope.row.progress" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="score" label="得分" width="100">
                      <template #default="scope">
                        <span>{{ scope.row.score }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>

                <template #default>
                  <el-table :data="reportData.performance_by_course" style="width: 100%">
                    <el-table-column prop="course_name" label="课程名称" />
                    <el-table-column prop="progress" label="进度" width="120">
                      <template #default="scope">
                        <el-progress :percentage="scope.row.progress" :color="getColorByProgress(scope.row.progress)" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="score" label="得分" width="100">
                      <template #default="scope">
                        <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>
              </el-skeleton>
            </el-card>
          </el-col>

          <!-- 技能掌握 -->
          <el-col :span="24" v-if="reportData.skill_mastery && reportData.skill_mastery.length > 0">
            <el-card class="skill-card">
              <template #header>
                <div class="card-header">
                  <h2>技能掌握情况</h2>
                  <el-tooltip content="各项技能的掌握程度分析">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>

              <el-skeleton :loading="loading" animated>
                <template #template>
                  <div class="skeleton-skill"></div>
                </template>

                <template #default>
                  <div ref="skillChartRef" class="skill-chart"></div>
                </template>
              </el-skeleton>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 推荐建议 -->
    <el-card class="recommendation-card">
      <template #header>
        <div class="card-header">
          <h2>个性化学习建议</h2>
          <el-tag type="success" effect="plain" v-if="reportData.recommendations && reportData.recommendations.length > 0">AI推荐</el-tag>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-recommendations">
            <el-skeleton-item variant="h3" style="width: 80%" />
            <div style="margin-top: 15px;">
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 90%" />
            </div>
            <div style="margin-top: 15px;">
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 90%" />
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="reportData.recommendations && reportData.recommendations.length > 0" class="recommendations-list">
            <div v-for="(rec, index) in reportData.recommendations" :key="index" class="recommendation-item">
              <el-icon><Eleme /></el-icon>
              <span>{{ rec }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无学习建议"></el-empty>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { Clock, Calendar, ChatDotRound, QuestionFilled, Eleme } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
//import { getEvaluationReport } from '@/api';
import api from '@/api';  // 导入整个 api 对象

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarChart,
  LabelLayout,
  CanvasRenderer
]);

const reportData = reactive({
  overall_progress: 0,
  average_score: 0,
  engagement_metrics: {
    study_time_minutes: 0,
    login_days: 0,
    interactive_posts: 0
  },
  performance_by_course: [],
  skill_mastery: [],
  recommendations: []
});

const loading = ref(true);
const period = ref('term');
const skillChartRef = ref(null);
let skillChart = null;

// 根据进度获取颜色
const getColorByProgress = (progress) => {
  if (progress >= 90) return '#67C23A';
  if (progress >= 70) return '#409EFF';
  if (progress >= 60) return '#E6A23C';
  return '#F56C6C';
};

// 根据分数获取样式类
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
};

// 处理周期变化
const handlePeriodChange = () => {
  fetchReportData();
};

// 获取报告数据
const fetchReportData = async () => {
  loading.value = true;
  try {
    const response = await api.evaluation.getEvaluationReport(period.value);
    if (response.code === 200) {
      Object.assign(reportData, response.data);

      // 初始化技能雷达图
      nextTick(() => {
        initSkillChart();
      });
    } else {
      ElMessage.error(response.message || '获取学习效果报告失败');
    }
  } catch (error) {
    console.error('获取学习效果报告出错:', error);
    ElMessage.error('网络错误，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 初始化技能雷达图
const initSkillChart = () => {
  if (!skillChartRef.value || reportData.skill_mastery.length === 0) return;

  // 如果已存在实例，则销毁
  if (skillChart) {
    skillChart.dispose();
  }

  // 提取技能名称和掌握程度
  const skills = reportData.skill_mastery.map(item => item.skill_name);
  const masteryLevels = reportData.skill_mastery.map(item => item.mastery_level);

  // 配置项
  const option = {
    title: {
      text: '技能掌握雷达图'
    },
    tooltip: {},
    legend: {
      data: ['当前水平']
    },
    radar: {
      indicator: skills.map(skill => {
        return { name: skill, max: 100 };
      })
    },
    series: [{
      name: '技能掌握程度',
      type: 'radar',
      data: [
        {
          value: masteryLevels,
          name: '当前水平',
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
              { color: 'rgba(76, 139, 245, 0.8)', offset: 0 },
              { color: 'rgba(76, 139, 245, 0.2)', offset: 1 }
            ])
          }
        }
      ]
    }]
  };

  // 创建图表实例
  skillChart = echarts.init(skillChartRef.value);
  skillChart.setOption(option);

  // 窗口大小变化时，重新调整图表大小
  window.addEventListener('resize', () => {
    skillChart && skillChart.resize();
  });
};

// 组件挂载后获取数据
onMounted(() => {
  fetchReportData();
});
</script>

<style scoped>
.evaluation-report {
  padding: 20px;
}

.report-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.summary-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}

.report-content {
  margin-top: 20px;
}

.activity-card, .course-card, .skill-card, .recommendation-card {
  margin-bottom: 20px;
}

.activity-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.activity-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.study-time {
  background-color: #409EFF;
}

.login-days {
  background-color: #67C23A;
}

.interactive-posts {
  background-color: #E6A23C;
}

.activity-details {
  flex: 1;
}

.activity-value {
  font-size: 18px;
  font-weight: bold;
}

.activity-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.activity-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 10px 0;
}

.skill-chart {
  height: 400px;
  width: 100%;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 6px;
  line-height: 1.6;
}

.recommendation-item .el-icon {
  color: #67C23A;
  font-size: 18px;
  margin-top: 3px;
}

/* 分数样式 */
.score-excellent {
  color: #67C23A;
  font-weight: bold;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
}

.score-pass {
  color: #E6A23C;
  font-weight: bold;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
}

/* 骨架屏样式 */
.skeleton-content {
  padding: 20px 0;
}

.skeleton-activity {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.skeleton-skill {
  height: 400px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.skeleton-recommendations {
  padding: 10px;
}

@media (max-width: 768px) {
  .summary-stats {
    flex-direction: column;
  }

  .el-col {
    margin-bottom: 15px;
  }
}
</style>