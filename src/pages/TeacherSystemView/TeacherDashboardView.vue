<template>
  <div class="teacher-dashboard">
    <!-- 主要内容区域 -->
    <el-row :gutter="24" class="main-content">
      <!-- 左侧内容 -->
      <el-col :xs="24" :lg="16">
        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Bell /></el-icon>
                待办事项
              </span>
              <el-button type="primary" size="small" @click="refreshTodos">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <div class="todo-list">
            <div v-if="todos.length === 0" class="empty-todos">
              <el-empty description="暂无待办事项" />
            </div>
            <div v-else>
              <div v-for="todo in todos" :key="todo.id" class="todo-item">
                <div class="todo-content">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-desc">{{ todo.description }}</div>
                  <div class="todo-time">{{ formatTime(todo.deadline) }}</div>
                </div>
                <div class="todo-actions">
                  <el-tag :type="getPriorityType(todo.priority)" size="small">
                    {{ getPriorityText(todo.priority) }}
                  </el-tag>
                  <el-button type="primary" size="small" @click="handleTodo(todo)">
                    处理
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="activity-card" shadow="hover" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Clock /></el-icon>
                最近活动
              </span>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="formatTime(activity.time)"
              :type="getActivityType(activity.type)"
            >
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :xs="24" :lg="8">
        <!-- 课程概览 -->
        <el-card class="course-overview-card" shadow="hover" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Reading /></el-icon>
                课程概览
              </span>
              <el-button type="text" size="small" @click="$router.push('/teacher/course/list')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <div class="course-list">
            <div v-for="course in courses" :key="course.id" class="course-item">
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-stats">
                  <span>{{ course.studentCount }}名学生</span>
                  <span>{{ course.assignmentCount }}个作业</span>
                </div>
              </div>
              <div class="course-progress">
                <el-progress 
                  :percentage="course.progress" 
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Reading,
  Bell,
  Refresh,
  Clock
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/auth'
const router = useRouter()
const userStore = useUserStore()

// 教师信息
const teacherInfo = ref({
    id:userStore.userInfo.uid,
    name:userStore.userInfo.account,
    avatar:userStore.userInfo.avatar_url,
})

// 当前日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

// 统计数据
const stats = ref({
  totalCourses: 5,
  totalStudents: 156,
  pendingAssignments: 23,
  upcomingExams: 3
})

// 待办事项
const todos = ref([
  {
    id: 1,
    title: '批改《数据结构》作业',
    description: '第三章链表作业，共45份待批改',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high'
  },
  {
    id: 2,
    title: '准备期中考试试卷',
    description: '《算法设计》期中考试试卷准备',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium'
  },
  {
    id: 3,
    title: '更新课程资料',
    description: '上传第四章PPT和相关资料',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'low'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '批改了作业',
    description: '《数据结构》第二章作业已全部批改完成',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'assignment'
  },
  {
    id: 2,
    title: '发布了考试',
    description: '《算法设计》期中考试已发布',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'exam'
  },
  {
    id: 3,
    title: '创建了新课程',
    description: '《机器学习基础》课程已创建',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'course'
  }
])

// 快速操作
const quickActions = ref([
  {
    id: 1,
    label: '创建作业',
    type: 'primary',
    icon: 'Plus',
    action: 'createAssignment'
  },
  {
    id: 2,
    label: '创建考试',
    type: 'success',
    icon: 'EditPen',
    action: 'createExam'
  },
  {
    id: 3,
    label: '查看成绩',
    type: 'info',
    icon: 'View',
    action: 'viewGrades'
  },
  {
    id: 4,
    label: '课程设置',
    type: 'warning',
    icon: 'Setting',
    action: 'courseSettings'
  }
])

// 课程概览
const courses = ref([
  {
    id: 1,
    name: '数据结构',
    studentCount: 45,
    assignmentCount: 8,
    progress: 75
  },
  {
    id: 2,
    name: '算法设计',
    studentCount: 38,
    assignmentCount: 6,
    progress: 60
  },
  {
    id: 3,
    name: '机器学习基础',
    studentCount: 32,
    assignmentCount: 4,
    progress: 40
  }
])

// 方法
const refreshTodos = () => {
  ElMessage.success('待办事项已刷新')
}

const formatTime = (time: Date) => {
  return time.toLocaleString('zh-CN')
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || '普通'
}

const getActivityType = (type: string) => {
  const types: Record<string, string> = {
    assignment: 'primary',
    exam: 'success',
    course: 'warning'
  }
  return types[type] || 'info'
}

const handleTodo = (todo: any) => {
  if (todo.title.includes('作业')) {
    router.push('/teacher/assignment/list/123456')
  } else if (todo.title.includes('考试')) {
    router.push('/teacher/exam/list/123456')
  } else {
    ElMessage.info('功能开发中...')
  }
}

const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'createAssignment':
      router.push('/teacher/assignment/list/123456')
      break
    case 'createExam':
      router.push('/teacher/exam/list/123456')
      break
    case 'viewGrades':
      router.push('/teacher/student/grades/123456')
      break
    case 'courseSettings':
      router.push('/teacher/course/list')
      break
    default:
      ElMessage.info('功能开发中...')
  }
}

onMounted(() => {
  document.title = '教师工作台'
})
</script>

<style scoped>
.teacher-dashboard {
  min-height: 100vh;
}


.main-content {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.todo-card,
.activity-card,
.quick-actions-card,
.course-overview-card {
  border-radius: 12px;
}

.todo-list {
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.todo-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.todo-time {
  font-size: 12px;
  color: #909399;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-content {
  margin-bottom: 8px;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #606266;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-button {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.course-info {
  flex: 1;
}

.course-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.course-stats {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
}

.course-progress {
  width: 100px;
}

.empty-todos {
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .todo-actions {
    align-self: flex-end;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .course-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .course-progress {
    width: 100%;
  }
}
</style>
