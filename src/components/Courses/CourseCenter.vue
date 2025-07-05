<!-- components/course/CourseCenter.vue -->
<template>
  <div class="course-center">
    <!-- 左侧边栏 -->
    <div class="left-sidebar">
      <UserCenter />
      <FunctionButtons />
    </div>

    <!-- 右侧课程内容 -->
    <div class="course-content">
      <h2 class="section-title">我的课程</h2>

      <!-- 课程列表容器（带滚动） -->
      <div class="course-list">
        <!-- 上次访问课程（仅在首页显示） -->
        <el-card
            v-if="hasLastAccessed && currentPage === 1"
            class="course-card last-accessed"
            shadow="hover"
            @click="goToCourseDetail(lastAccessedCourse.course_id)"
            :class="{ 'clickable': hasLastAccessed && currentPage === 1 }"
        >
          <div class="course-header">
            <span class="last-accessed-tag">上次访问</span>
            <h3 class="course-name">{{ lastAccessedCourse.course_name }}</h3>
          </div>
          <div class="course-info">
            <span class="info-item">
              <i class="el-icon-user"></i> {{ lastAccessedCourse.teacher_name }} 老师
            </span>
            <span class="info-item">
              <i class="el-icon-book"></i> {{ lastAccessedCourse.credit }} 学分
            </span>
            <span class="info-item">
              <i class="el-icon-date"></i> {{ lastAccessedCourse.start_date }} ~ {{ lastAccessedCourse.end_date }}
            </span>
          </div>
          <el-progress
              :percentage="lastAccessedCourse.progress"
              :color="lastAccessedCourse.progress === 100 ? '#67C23A' : '#E6A23C'"
          />
        </el-card>

        <!-- 分页课程列表（不包含上次访问课程） -->
        <template v-for="(course, index) in paginatedOtherCourses" :key="course.course_id">
          <el-card
              class="course-card"
              shadow="hover"
              @click="goToCourseDetail(course.course_id)"
              :class="{ 'clickable': true }"
          >
            <div class="course-header">
              <h3 class="course-name">{{ course.course_name }}</h3>
            </div>
            <div class="course-info">
              <span class="info-item">
                <i class="el-icon-user"></i> {{ course.teacher_name }} 老师
              </span>
              <span class="info-item">
                <i class="el-icon-book"></i> {{ course.credit }} 学分
              </span>
              <span class="info-item">
                <i class="el-icon-date"></i> {{ course.start_date }} ~ {{ course.end_date }}
              </span>
            </div>
            <el-progress
                :percentage="course.progress"
                :color="course.progress === 100 ? '#67C23A' : '#E6A23C'"
            />
          </el-card>
        </template>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="totalOtherCourses"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UserCenter from '@/components/user/UserCenter.vue'
import FunctionButtons from '@/components/tools/FunctionButtons.vue'
// 导入模拟API方法
import {
  getCourseResources,
  getChapters,
  getAssignments,
  getExams,
  getDiscussions,
  getRecommendedCourses
} from './mockApi'; // 或者导入您的mockApi.js

export default {
  components: { UserCenter, FunctionButtons },
  setup() {
    const router = useRouter()

    // 添加跳转到课程详情的方法 - 修改跳转路径
    const goToCourseDetail = (courseId) => {
      router.push(`/course/${courseId}`) // 修改为新的路径
    }

    // 使用模拟数据替代硬编码数据
    // 注意：这里假设您已经在mockApi.js中定义了getMyCourses方法
    const courses = ref([]);

    // 模拟获取我的课程列表
    const fetchMyCourses = async () => {
      try {
        // 使用模拟API获取我的课程
        const response = await getMyCourses(); // 需要在mockApi.js中实现此方法
        courses.value = response.data;
      } catch (error) {
        console.error('获取我的课程失败:', error);
        ElMessage.error('获取课程列表失败');
      }
    }

    // 如果暂时没有实现getMyCourses，可以使用以下模拟数据
    const mockCourses = [
      // 上次访问课程（模拟）
      {
        course_id: 'c001',
        course_name: 'Web前端开发实战教程',
        teacher_name: '张教授',
        credit: 4.0,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 48,
        completed_lessons: 36,
        progress: 75,
        last_accessed_lesson: '2024-07-10', // 标记为上次访问
      },
      // 未完成课程（模拟）
      {
        course_id: 'c002',
        course_name: '数据结构与算法（核心）',
        teacher_name: '李教授',
        credit: 3.5,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 40,
        completed_lessons: 20,
        progress: 50
      },
      {
        course_id: 'c003',
        course_name: '操作系统原理',
        teacher_name: '王教授',
        credit: 4.5,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 50,
        completed_lessons: 15,
        progress: 30
      },
      {
        course_id: 'c004',
        course_name: '数据库系统设计',
        teacher_name: '赵教授',
        credit: 3.0,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 32,
        completed_lessons: 8,
        progress: 25
      },
      {
        course_id: 'c005',
        course_name: '前端开发实践',
        teacher_name: '陈教授',
        credit: 2.5,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 24,
        completed_lessons: 6,
        progress: 25
      },
      {
        course_id: 'c006',
        course_name: '人工智能导论',
        teacher_name: '刘教授',
        credit: 3.0,
        start_date: '2024-03-01',
        end_date: '2024-07-15',
        total_lessons: 36,
        completed_lessons: 9,
        progress: 25
      },
      // 已完成课程（模拟）
      {
        course_id: 'c007',
        course_name: '计算机组成原理',
        teacher_name: '周教授',
        credit: 4.0,
        start_date: '2023-09-01',
        end_date: '2024-01-15',
        total_lessons: 48,
        completed_lessons: 48,
        progress: 100
      },
      {
        course_id: 'c008',
        course_name: '软件工程',
        teacher_name: '吴教授',
        credit: 3.0,
        start_date: '2023-09-01',
        end_date: '2024-01-15',
        total_lessons: 40,
        completed_lessons: 40,
        progress: 100
      }];

    // 初始化课程数据
    onMounted(() => {
      // 暂时使用模拟数据
      courses.value = mockCourses;

      // 正式使用时取消注释下面代码
      // fetchMyCourses();
    });

    // 分页相关状态
    const currentPage = ref(1)
    const pageSize = 5 // 每页5个课程（包含上次访问课程时，第一页可能显示更少）

    // 判断是否有上次访问课程
    const hasLastAccessed = computed(() => {
      return courses.value.some(course => course.last_accessed_lesson)
    })

    // 提取上次访问课程（单独处理）
    const lastAccessedCourse = computed(() => {
      return courses.value.find(course => course.last_accessed_lesson)
    })

    // 提取其他课程（排除上次访问课程）
    const otherCourses = computed(() => {
      return courses.value.filter(course => !course.last_accessed_lesson)
    })

    // 对其他课程按进度排序（未完成在前，按进度降序；已完成在后，按进度降序）
    const sortedOtherCourses = computed(() => {
      return [...otherCourses.value].sort((a, b) => {
        // 未完成课程优先
        if (a.progress < 100 && b.progress === 100) return -1
        if (a.progress === 100 && b.progress < 100) return 1
        // 同为未完成或已完成时，按进度降序
        return b.progress - a.progress
      })
    })

    // 计算当前页显示的其他课程（分页）
    const paginatedOtherCourses = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return sortedOtherCourses.value.slice(start, end)
    })

    // 计算其他课程总数（用于分页）
    const totalOtherCourses = computed(() => {
      return sortedOtherCourses.value.length
    })

    // 分页切换处理
    const handlePageChange = (page) => {
      currentPage.value = page
    }

    return {
      currentPage,
      pageSize,
      hasLastAccessed,
      lastAccessedCourse,
      paginatedOtherCourses,
      totalOtherCourses,
      handlePageChange,
      goToCourseDetail // 添加到返回对象中
    }
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.course-center {
  display: grid;
  grid-template-columns: 250px 1fr; /* 左侧边栏固定250px，右侧自适应 */
  grid-gap: 16px;
  min-height: 70vh;
  margin: 0 auto;
  max-width: 900px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.left-sidebar {
  /* 左侧边栏样式（保持原有） */
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
  max-height: 100vh;
  overflow-y: auto;
}

.course-card {
  width: 100%;
  background: white;
  border-radius: 8px;
}

.last-accessed {
  border-left: 4px solid #409EFF; /* 上次访问课程特殊边框 */
}

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

:deep(.el-card) {
  transition: transform 0.2s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-progress) {
  margin-top: 8px;
  height: 8px;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.3s ease;
}

.course-card.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.course-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}
</style>