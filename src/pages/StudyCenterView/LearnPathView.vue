<template>
  <el-card class="learning-path">
    <template #header>
      <h3><i class="el-icon-guide"></i> 个性化学习路径</h3>
    </template>
    
    <div v-if="learningPath" class="path-content">
      <!-- 路径概览 -->
      <div class="path-overview">
        <div class="path-header">
          <h4>{{ learningPath.title }}</h4>
          <el-tag :type="getDifficultyType(learningPath.difficulty)">
            {{ getDifficultyText(learningPath.difficulty) }}
          </el-tag>
        </div>
        <p class="path-description">{{ learningPath.description }}</p>
        
        <div class="path-stats">
          <div class="stat-item">
            <el-statistic title="总时长" :value="learningPath.totalDuration" suffix="小时" />
          </div>
          <div class="stat-item">
            <el-statistic title="完成进度" :value="learningPath.progress" suffix="%" :precision="1" />
          </div>
          <div class="stat-item">
            <el-statistic title="学习阶段" :value="learningPath.stages.length" suffix="个" />
          </div>
        </div>
        
        <div class="overall-progress">
          <el-progress 
            :percentage="learningPath.progress" 
            :stroke-width="12"
            :color="getProgressColor(learningPath.progress)"
          />
        </div>
      </div>
      
      <!-- 学习阶段 -->
      <div class="stages-container">
        <h5>学习阶段</h5>
        <div class="stages-timeline">
          <div 
            v-for="(stage, index) in learningPath.stages" 
            :key="stage.id"
            class="stage-item"
            :class="{ 'completed': stage.status === 'completed', 'active': stage.status === 'in_progress' }"
          >
            <div class="stage-number">{{ index + 1 }}</div>
            <div class="stage-content">
              <div class="stage-header">
                <h6>{{ stage.title }}</h6>
                <el-tag 
                  :type="getStatusType(stage.status)" 
                  size="small"
                >
                  {{ getStatusText(stage.status) }}
                </el-tag>
              </div>
              <p class="stage-description">{{ stage.description }}</p>
              
              <div class="stage-details">
                <div class="detail-row">
                  <span class="detail-label">预计时长:</span>
                  <span>{{ stage.duration }}小时</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">技能点:</span>
                  <div class="skills-tags">
                    <el-tag 
                      v-for="skill in stage.skills" 
                      :key="skill"
                      size="small"
                      type="info"
                    >
                      {{ skill }}
                    </el-tag>
                  </div>
                </div>
              </div>
              
              <div class="stage-progress">
                <el-progress 
                  :percentage="stage.progress" 
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
              
              <!-- 阶段课程 -->
              <div class="stage-courses">
                <div 
                  v-for="course in stage.courses" 
                  :key="course.courseId"
                  class="course-item"
                  :class="{ 'completed': course.completed }"
                >
                  <el-icon class="course-icon">
                    <i :class="course.completed ? 'el-icon-check' : 'el-icon-reading'"></i>
                  </el-icon>
                  <span class="course-name">{{ course.courseName }}</span>
                  <el-tag 
                    :type="course.type === 'required' ? 'danger' : 'info'" 
                    size="small"
                  >
                    {{ course.type === 'required' ? '必修' : '选修' }}
                  </el-tag>
                  <span class="course-hours">{{ course.estimatedHours }}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-path">
      <el-empty description="暂无学习路径规划">
        <el-button type="primary">生成学习路径</el-button>
      </el-empty>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { LearningPath } from './types';

defineProps<{
  learningPath?: LearningPath;
}>();

const getDifficultyType = (difficulty: string) => {
  const types = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'danger'
  };
  return types[difficulty as keyof typeof types] || 'info';
};

const getDifficultyText = (difficulty: string) => {
  const texts = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  };
  return texts[difficulty as keyof typeof texts] || difficulty;
};

const getStatusType = (status: string) => {
  const types = {
    'not_started': 'info',
    'in_progress': 'warning',
    'completed': 'success'
  };
  return types[status as keyof typeof types] || 'info';
};

const getStatusText = (status: string) => {
  const texts = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成'
  };
  return texts[status as keyof typeof texts] || status;
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return '#67c23a';
  if (progress >= 70) return '#e6a23c';
  return '#f56c6c';
};
</script>

<style scoped>
.learning-path {
  height: 100%;
}

.path-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.path-overview {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.path-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.path-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.path-description {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  line-height: 1.6;
}

.path-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.overall-progress {
  margin-top: 16px;
}

.stages-container h5 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.stages-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stage-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.stage-item.active {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.stage-item.completed {
  border-color: #67c23a;
  background: #f0f9ff;
}

.stage-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.stage-item.active .stage-number {
  background: #e6a23c;
  color: white;
}

.stage-item.completed .stage-number {
  background: #67c23a;
  color: white;
}

.stage-content {
  flex: 1;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stage-header h6 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.stage-description {
  margin: 0 0 16px 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.stage-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #2c3e50;
  min-width: 80px;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.stage-progress {
  margin-bottom: 16px;
}

.stage-courses {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.course-item.completed {
  background: rgba(103, 194, 58, 0.1);
  border-color: #67c23a;
}

.course-icon {
  color: #7f8c8d;
}

.course-item.completed .course-icon {
  color: #67c23a;
}

.course-name {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.course-hours {
  font-size: 12px;
  color: #7f8c8d;
}

.no-path {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: 768px) {
  .path-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .path-stats {
    grid-template-columns: 1fr;
  }
  
  .stage-item {
    flex-direction: column;
  }
  
  .stage-number {
    align-self: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-item {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>