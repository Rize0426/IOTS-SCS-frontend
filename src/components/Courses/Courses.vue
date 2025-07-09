<template>
  <div class="courses-container">
    <h2 class="courses-title">在学课程</h2>
    <div class="course-list">
      <el-card
          v-for="course in courses"
          :key="course.id"
          class="course-item"
          shadow="hover"
          :body-style="{ padding: '0' }"
      >
        <div class="course-content">
          <!-- 课程标题改为可跳转的链接 -->
          <router-link
              :to="`/course/${course.id}`"
              class="course-title-link"
          >
            <div class="course-header">
              <h3 class="course-title">{{ course.title }}</h3>
              <el-tag size="small" type="info">进行中</el-tag>
            </div>
          </router-link>

          <!-- 进度条和进度文本 -->
          <el-progress
              :percentage="course.progress"
              :stroke-width="8"
              :color="progressColor(course.progress)"
          />
          <p class="progress-text">{{ course.progress }}% 完成</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      courses: [
        { id: 1, title: '计算机网络基础（必修）', progress: 65 },
        { id: 2, title: '数据结构与算法（核心）', progress: 30 },
        { id: 3, title: '操作系统原理', progress: 80 },
        { id: 4, title: '数据库系统设计', progress: 45 },
        { id: 5, title: '前端开发实践', progress: 20 },
        { id: 6, title: '人工智能导论', progress: 75 },
        { id: 7, title: '计算机组成原理', progress: 55 },
        { id: 8, title: '软件工程', progress: 40 },
        { id: 9, title: '算法竞赛', progress: 70 },
        { id: 10, title: '机器学习基础', progress: 35 }
      ]
    }
  },
  methods: {
    progressColor(progress) {
      if (progress >= 80) return '#67C23A'
      if (progress >= 50) return '#409EFF'
      return '#E6A23C'
    }
  }
}
</script>

<style scoped>
/* 课程容器 */
.courses-container {
  margin: 0;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 400px; /* 固定组件宽度（根据右侧栏调整） */
}

/* 课程列表（滚动容器） */
.course-list {
  max-height: 310px; /* 限制最大高度，超出滚动 */
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 5px; /* 防止滚动条遮挡内容 */
}

/* 单个课程项 */
.course-item {
  width: 100%;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 12px;
  transition: transform 0.2s ease;
}

.course-content {
  padding: 15px;
}

/* 课程标题链接（关键修改点） */
.course-title-link {
  color: #409EFF; /* Element UI 主色 */
  text-decoration: none; /* 去掉下划线 */
  display: block; /* 确保链接包裹整个标题区域 */
  transition: color 0.2s ease;
}

.course-title-link:hover {
  color: #66b1ff; /* 悬停颜色加深 */
  text-decoration: underline; /* 悬停下划线（可选） */
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.course-title {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.progress-text {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 12px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>