<!-- components/course/RecommendedCourses.vue -->
<template>
  <el-card class="recommendations-card">
    <template #header>
      <div class="card-header">
        <span>相关课程推荐</span>
      </div>
    </template>

    <div class="recommendations-list">
      <div
          v-for="course in recommendedCourses"
          :key="course.course_id"
          class="recommendation-item"
      >
        <div class="recommendation-image">
          <img :src="course.image_url" alt="课程图片" />
        </div>

        <div class="recommendation-info">
          <div class="recommendation-title">{{ course.course_name }}</div>
          <div class="recommendation-desc">{{ course.description.substring(0, 50) }}...</div>

          <div class="recommendation-meta">
            <span><el-icon><Star /></el-icon> {{ course.popularity }}</span>
            <el-button type="text" size="small">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Star } from '@element-plus/icons-vue';

const props = defineProps({
  recommendedCourses: Array
});
</script>

<style scoped>
.recommendations-card {
  margin-top: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommendation-item {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.recommendation-image {
  width: 80px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-info {
  flex-grow: 1;
}

.recommendation-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.recommendation-desc {
  color: #606266;
  font-size: 0.85rem;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recommendation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #909399;
}
</style>