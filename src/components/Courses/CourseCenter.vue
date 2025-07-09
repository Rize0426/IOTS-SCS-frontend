<template>
  <div class="course-center">
    <div class="left-sidebar">
      <UserCenter />
      <FunctionButtons />
    </div>

    <div class="course-content">
      <h2 class="section-title">我的课程</h2>

      <div class="course-list">
        <el-card
            v-for="course in paginatedCourses"
            :key="course.courseId"
            class="course-card clickable"
            shadow="hover"
            @click="goToCourseDetail(course.course_id)"
        >
          <div class="course-header">
            <h3 class="course-name">{{ course.course_name }}</h3>
          </div>
          <div class="course-info">
            <span class="info-item">
              <i class="el-icon-user"></i> {{ course.teacher_name }} 老师
            </span>
          </div>
        </el-card>

        <div v-if="courses.length === 0 && !isLoading" class="no-courses-message">
          <p>暂无课程信息。</p>
        </div>
        <div v-if="isLoading" class="loading-message">
          <p>课程加载中...</p>
        </div>
      </div>

      <div class="pagination-container" v-if="totalCourses > pageSize">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="totalCourses"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import UserCenter from '@/components/user/UserCenter.vue';
import FunctionButtons from '@/components/tools/FunctionButtons.vue';
import { studentCourseApi } from '@/api/course.js';

export default {
  name: 'CourseCenter',
  components: { UserCenter, FunctionButtons },
  setup() {
    const router = useRouter();

    // 状态定义
    const courses = ref([]);
    const currentPage = ref(1);
    const pageSize = 5; // 每页显示的课程数量
    const isLoading = ref(false); // 添加加载状态

    /**
     * 跳转到课程详情页
     * @param {string} courseId - 课程ID
     */
    const goToCourseDetail = (courseId) => {
      if (courseId) {
        router.push(`/course/${courseId}`);
      } else {
        ElMessage.warning('课程ID无效，无法跳转。');
      }
    };

    /**
     * 获取我的课程列表
     */
    const fetchMyCourses = async () => {
      isLoading.value = true; // 开始加载
      try {
        const res = await studentCourseApi.getMyCourses("all");
        if (res.code === 200 && Array.isArray(res.data)) {
          courses.value = res.data.filter(course => course && course.course_id);
        } else {
          ElMessage.error(res.message || "获取课程列表失败"); // 使用res.message
          courses.value = [];
        }
      } catch (error) {
        console.error('获取我的课程失败:', error);
        ElMessage.error('获取课程列表失败');
        courses.value = [];
      } finally {
        isLoading.value = false; // 结束加载
      }
    };

    // 生命周期钩子
    onMounted(() => {
      fetchMyCourses();
    });

    // 现在所有课程都是一类，直接对 courses.value 进行分页
    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return courses.value.slice(start, end);
    });

    /**
     * 计算所有课程的总数（用于分页组件）
     */
    const totalCourses = computed(() => {
      return courses.value.length;
    });

    /**
     * 处理分页切换事件
     * @param {number} page - 当前页码
     */
    const handlePageChange = (page) => {
      currentPage.value = page;
      // 可选：滚动到列表顶部，提升用户体验
      const courseListElement = document.querySelector('.course-list');
      if (courseListElement) {
        courseListElement.scrollTop = 0;
      }
    };

    // 暴露给模板
    return {
      currentPage,
      pageSize,
      paginatedCourses, // 现在直接使用 paginatedCourses
      totalCourses,
      handlePageChange,
      goToCourseDetail,
      isLoading,
      courses
    };
  }
};
</script>

<style scoped>
/* 样式调整：移除上次访问课程的特殊样式，因为没有该功能了 */
.course-center {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-gap: 16px;
  min-height: 70vh;
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.left-sidebar {
  background: #f0f2f5;
  padding: 16px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  box-sizing: border-box;
}

.course-content {
  padding: 16px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* max-height 根据实际布局调整，如果父容器没有固定高度，这里可以不设 */
  /* 例如：max-height: calc(100vh - 200px); */
  overflow-y: auto;
  min-height: 200px; /* 至少保证一个高度，避免内容为空时塌陷 */
}

.course-card {
  width: 100%;
  background: white;
  border-radius: 8px;
}

/* 移除 .last-accessed 样式，因为已无此概念 */
/* .last-accessed {
  border-left: 4px solid #409EFF;
} */

.course-header {
  margin-bottom: 12px;
}

.course-name {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.course-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  color: #606266;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-item i {
  font-size: 0.9rem;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 统一Element Plus组件的样式穿透 */
:deep(.el-card) {
  transition: transform 0.2s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 移除进度条相关的样式，因为已无此组件 */
/* :deep(.el-progress) {
  margin-top: 8px;
  height: 8px;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.3s ease;
} */

.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.no-courses-message, .loading-message {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 1.1rem;
}
</style>