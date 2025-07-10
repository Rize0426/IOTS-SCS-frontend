<template>
  <el-card class="smart-recommendations">
    <template #header>
      <h3><i class="el-icon-magic-stick"></i> 智能推荐</h3>
    </template>
    
    <div v-if="recommendations" class="recommendations-content">
      <el-tabs v-model="activeTab" class="recommendations-tabs">
        <!-- 课程推荐 -->
        <el-tab-pane label="推荐课程" name="courses">
          <div class="recommendations-grid">
            <div 
              v-for="course in recommendations.courses" 
              :key="course.courseId"
              class="recommendation-card course-card"
            >
              <div class="card-header">
                <img :src="course.thumbnail" :alt="course.courseName" class="course-thumbnail" />
                <div class="match-score">
                  <el-progress 
                    type="circle" 
                    :percentage="course.matchScore" 
                    :width="50"
                    :stroke-width="6"
                  />
                </div>
              </div>
              
              <div class="card-content">
                <h5>{{ course.courseName }}</h5>
                <p class="instructor">讲师: {{ course.instructor }}</p>
                
                <div class="course-meta">
                  <div class="meta-item">
                    <el-rate 
                      v-model="course.rating" 
                      disabled 
                      show-score 
                      text-color="#ff9900"
                      score-template="{value}"
                      :max="5"
                      size="small"
                    />
                  </div>
                  <div class="meta-item">
                    <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                      {{ getDifficultyText(course.difficulty) }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="course-stats">
                  <span class="stat-item">
                    <el-icon><i class="el-icon-time"></i></el-icon>
                    {{ course.duration }}小时
                  </span>
                  <span class="stat-item">
                    <el-icon><i class="el-icon-user"></i></el-icon>
                    {{ course.enrolledCount }}人已学
                  </span>
                </div>
                
                <div class="course-tags">
                  <el-tag 
                    v-for="tag in course.tags.slice(0, 3)" 
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                
                <div class="recommendation-reason">
                  <p>{{ course.reason }}</p>
                </div>
              </div>
              
              <div class="card-actions">
                <el-button type="primary" size="small">立即学习</el-button>
                <el-button size="small">加入收藏</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 实验推荐 -->
        <el-tab-pane label="推荐实验" name="experiments">
          <div class="recommendations-list">
            <div 
              v-for="experiment in recommendations.experiments" 
              :key="experiment.id"
              class="recommendation-item experiment-item"
            >
              <div class="item-header">
                <h5>{{ experiment.title }}</h5>
                <div class="match-badge">
                  <el-tag type="success">匹配度 {{ experiment.matchScore }}%</el-tag>
                </div>
              </div>
              
              <p class="item-description">{{ experiment.description }}</p>
              
              <div class="experiment-meta">
                <div class="meta-row">
                  <span class="meta-label">难度:</span>
                  <el-tag :type="getDifficultyType(experiment.difficulty)" size="small">
                    {{ getDifficultyText(experiment.difficulty) }}
                  </el-tag>
                </div>
                <div class="meta-row">
                  <span class="meta-label">预计时间:</span>
                  <span>{{ experiment.estimatedTime }}小时</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">分类:</span>
                  <el-tag type="info" size="small">{{ experiment.category }}</el-tag>
                </div>
              </div>
              
              <div class="experiment-tools">
                <span class="tools-label">所需工具:</span>
                <div class="tools-list">
                  <el-tag 
                    v-for="tool in experiment.tools" 
                    :key="tool"
                    size="small"
                    type="warning"
                  >
                    {{ tool }}
                  </el-tag>
                </div>
              </div>
              
              <div class="recommendation-reason">
                <p><strong>推荐理由:</strong> {{ experiment.reason }}</p>
              </div>
              
              <div class="item-actions">
                <el-button type="primary" size="small">开始实验</el-button>
                <el-button size="small">查看详情</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 学习资料推荐 -->
        <el-tab-pane label="学习资料" name="materials">
          <div class="recommendations-list">
            <div 
              v-for="material in recommendations.materials" 
              :key="material.id"
              class="recommendation-item material-item"
            >
              <div class="item-header">
                <div class="material-type-icon">
                  <el-icon><i :class="getMaterialIcon(material.type)"></i></el-icon>
                </div>
                <div class="material-info">
                  <h5>{{ material.title }}</h5>
                  <p class="material-author">作者: {{ material.author }}</p>
                </div>
                <div class="match-badge">
                  <el-tag type="success">{{ material.matchScore }}%</el-tag>
                </div>
              </div>
              
              <div class="material-meta">
                <div class="meta-row">
                  <span class="meta-label">类型:</span>
                  <el-tag :type="getMaterialTypeColor(material.type)" size="small">
                    {{ getMaterialTypeText(material.type) }}
                  </el-tag>
                </div>
                <div class="meta-row">
                  <span class="meta-label">时长:</span>
                  <span>{{ material.readingTime }}分钟</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">评分:</span>
                  <el-rate 
                    v-model="material.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    score-template="{value}"
                    :max="5"
                    size="small"
                  />
                </div>
              </div>
              
              <div class="material-tags">
                <el-tag 
                  v-for="tag in material.tags" 
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="recommendation-reason">
                <p><strong>推荐理由:</strong> {{ material.reason }}</p>
              </div>
              
              <div class="item-actions">
                <el-button type="primary" size="small" @click="openMaterial(material.url)">
                  立即查看
                </el-button>
                <el-button size="small">收藏</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <div class="last-updated">
        <p>最后更新: {{ formatDate(recommendations.lastUpdated) }}</p>
      </div>
    </div>
    
    <div v-else class="no-recommendations">
      <el-empty description="暂无推荐内容">
        <el-button type="primary">刷新推荐</el-button>
      </el-empty>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RecommendationData } from './types';

defineProps<{
  recommendations?: RecommendationData;
}>();

const activeTab = ref('courses');

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

const getMaterialIcon = (type: string) => {
  const icons = {
    'article': 'el-icon-document',
    'video': 'el-icon-video-play',
    'book': 'el-icon-reading',
    'tutorial': 'el-icon-guide',
    'documentation': 'el-icon-folder'
  };
  return icons[type as keyof typeof icons] || 'el-icon-document';
};

const getMaterialTypeColor = (type: string) => {
  const colors = {
    'article': 'primary',
    'video': 'success',
    'book': 'warning',
    'tutorial': 'info',
    'documentation': 'danger'
  };
  return colors[type as keyof typeof colors] || 'info';
};

const getMaterialTypeText = (type: string) => {
  const texts = {
    'article': '文章',
    'video': '视频',
    'book': '书籍',
    'tutorial': '教程',
    'documentation': '文档'
  };
  return texts[type as keyof typeof texts] || type;
};

const openMaterial = (url: string) => {
  window.open(url, '_blank');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};
</script>

<style scoped>
.smart-recommendations {
  height: 100%;
}

.recommendations-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendations-tabs {
  flex: 1;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.match-score {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
}

.card-content {
  padding: 16px;
}

.card-content h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.instructor {
  margin: 0 0 12px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #7f8c8d;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.recommendation-reason {
  margin-bottom: 16px;
}

.recommendation-reason p {
  margin: 0;
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.4;
}

.card-actions {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
}

.recommendation-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: #fafafa;
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.material-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 18px;
}

.material-info {
  flex: 1;
}

.material-info h5 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.material-author {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.match-badge {
  flex-shrink: 0;
}

.item-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.item-description {
  margin: 0 0 16px 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.experiment-meta,
.material-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-weight: 500;
  color: #2c3e50;
  min-width: 80px;
}

.experiment-tools {
  margin-bottom: 16px;
}

.tools-label {
  font-weight: 500;
  color: #2c3e50;
  margin-right: 8px;
}

.tools-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

.material-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.last-updated {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.last-updated p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
}

.no-recommendations {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .course-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .course-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .item-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .material-info {
    order: -1;
  }
  
  .meta-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .meta-label {
    min-width: auto;
  }
}
</style>