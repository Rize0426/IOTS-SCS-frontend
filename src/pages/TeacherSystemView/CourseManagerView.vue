<template>
  <div class="course-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Reading /></el-icon>
          课程管理
        </h1>
        <p class="page-description">管理您的所有课程，包括创建、编辑和删除课程</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="createCourse">
          <el-icon><Plus /></el-icon>
          创建课程
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-section">
        <div class="filter-left">
          <el-select v-model="statusFilter" placeholder="课程状态" style="width: 120px;" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="completed" />
            <el-option label="草稿" value="draft" />
          </el-select>
          
          <el-select v-model="semesterFilter" placeholder="学期" style="width: 150px;" @change="handleFilter">
            <el-option label="全部学期" value="" />
            <el-option label="2024春季" value="2024-spring" />
            <el-option label="2024秋季" value="2024-fall" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索课程名称" 
            :prefix-icon="Search" 
            clearable
            style="width: 300px;" 
            @input="handleSearch" 
          />
        </div>
      </div>
    </el-card>

    <!-- 课程列表 -->
    <div class="course-list" v-loading="loading">
      <div v-if="courseList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无课程数据">
          <el-button type="primary" @click="createCourse">创建第一个课程</el-button>
        </el-empty>
      </div>

      <div v-else class="course-grid">
        <el-card 
          v-for="course in courseList" 
          :key="course.id" 
          class="course-card" 
          :class="`course-${course.status}`"
          shadow="hover"
          @click="viewCourse(course)"
        >
          <!-- 课程封面 -->
          <div class="course-cover">
            <img :src="course.cover || '/placeholder.svg?height=200&width=300'" :alt="course.name" />
            <div class="course-overlay">
              <el-tag :type="getStatusType(course.status)" size="small">
                {{ getStatusText(course.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="course-info">
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-description">{{ course.description || '暂无描述' }}</p>
            
            <div class="course-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ course.studentCount }}名学生</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ course.semester }}</span>
              </div>
            </div>

            <div class="course-stats">
              <div class="stat-item">
                <span class="stat-number">{{ course.assignmentCount }}</span>
                <span class="stat-label">作业</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ course.examCount }}</span>
                <span class="stat-label">考试</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ course.resourceCount }}</span>
                <span class="stat-label">资源</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions" @click.stop>
            <el-button type="primary" size="small" @click="viewCourse(course)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="success" size="small" @click="manageCourse(course)">
              <el-icon><Setting /></el-icon>
              管理
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, course)">
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑课程</el-dropdown-item>
                  <el-dropdown-item command="students">学生管理</el-dropdown-item>
                  <el-dropdown-item command="assignments">作业管理</el-dropdown-item>
                  <el-dropdown-item command="exams">考试管理</el-dropdown-item>
                  <el-dropdown-item divided command="delete">删除课程</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="courseList.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48]"
        :total="totalCourses"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建/编辑课程对话框 -->
    <el-dialog 
      v-model="courseDialogVisible" 
      :title="isEditMode ? '编辑课程' : '创建课程'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="课程描述" prop="description">
          <el-input 
            v-model="courseForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入课程描述" 
          />
        </el-form-item>
        
        <el-form-item label="学期" prop="semester">
          <el-select v-model="courseForm.semester" placeholder="请选择学期" style="width: 100%;">
            <el-option label="2024春季" value="2024-spring" />
            <el-option label="2024秋季" value="2024-fall" />
            <el-option label="2025春季" value="2025-spring" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="active">进行中</el-radio>
            <el-radio label="completed">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="课程封面">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
          >
            <img v-if="courseForm.cover" :src="courseForm.cover" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="courseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCourse" :loading="submitting">
          {{ isEditMode ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Reading,
  Plus,
  Search,
  User,
  Calendar,
  View,
  Setting,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const statusFilter = ref('')
const semesterFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCourses = ref(0)
const courseDialogVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)

// 课程列表
const courseList = ref([
  {
    id: 1,
    name: '数据结构与算法',
    description: '深入学习数据结构的基本概念和算法设计',
    cover: '/placeholder.svg?height=200&width=300',
    status: 'active',
    semester: '2024-fall',
    studentCount: 45,
    assignmentCount: 8,
    examCount: 3,
    resourceCount: 15
  },
  {
    id: 2,
    name: '计算机网络',
    description: '学习计算机网络的基本原理和协议',
    cover: '/placeholder.svg?height=200&width=300',
    status: 'active',
    semester: '2024-fall',
    studentCount: 38,
    assignmentCount: 6,
    examCount: 2,
    resourceCount: 12
  },
  {
    id: 3,
    name: '机器学习基础',
    description: '机器学习的基本概念和常用算法',
    cover: '/placeholder.svg?height=200&width=300',
    status: 'draft',
    semester: '2025-spring',
    studentCount: 0,
    assignmentCount: 0,
    examCount: 0,
    resourceCount: 5
  }
])

// 表单数据
const courseForm = ref({
  name: '',
  description: '',
  semester: '',
  status: 'draft',
  cover: ''
})

const courseFormRef = ref()
const courseRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入课程描述', trigger: 'blur' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}

// 方法
const handleFilter = () => {
  currentPage.value = 1
  fetchCourses()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCourses()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchCourses()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchCourses()
}

const fetchCourses = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    totalCourses.value = courseList.value.length
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    completed: 'info',
    draft: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '进行中',
    completed: '已结束',
    draft: '草稿'
  }
  return texts[status] || '未知'
}

const createCourse = () => {
  isEditMode.value = false
  courseForm.value = {
    name: '',
    description: '',
    semester: '',
    status: 'draft',
    cover: ''
  }
  courseDialogVisible.value = true
}

const viewCourse = (course: any) => {
  router.push(`/teacher/course/detail/${course.id}`)
}

const manageCourse = (course: any) => {
  router.push(`/course/${course.id}`)
}

const handleCommand = (command: string, course: any) => {
  switch (command) {
    case 'edit':
      editCourse(course)
      break
    case 'students':
      router.push('/teacher/student/list')
      break
    case 'assignments':
      router.push(`/teacher/assignment/list/${course.id}`)
      break
    case 'exams':
      router.push(`/teacher/exam/list/${course.id}`)
      break
    case 'delete':
      deleteCourse(course)
      break
  }
}

const editCourse = (course: any) => {
  isEditMode.value = true
  courseForm.value = { ...course }
  courseDialogVisible.value = true
}

const deleteCourse = async (course: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${course.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('课程删除成功')
    fetchCourses()
  } catch {
    // 用户取消删除
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any) => {
  courseForm.value.cover = response.url
}

const submitCourse = () => {
  courseFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isEditMode.value) {
        ElMessage.success('课程更新成功')
      } else {
        ElMessage.success('课程创建成功')
      }
      
      courseDialogVisible.value = false
      fetchCourses()
    } catch (error) {
      ElMessage.error(isEditMode.value ? '课程更新失败' : '课程创建失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  document.title = '课程管理'
  fetchCourses()
})
</script>

<style scoped>
.course-management {
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  color: #606266;
  margin: 0;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.filter-left {
  display: flex;
  gap: 12px;
}

.course-list {
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.course-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.course-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.course-info {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.course-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.course-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.course-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-image {
  width: 178px;
  height: 178px;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .filter-section {
    flex-direction: column;
    gap: 12px;
  }

  .filter-left {
    width: 100%;
    justify-content: center;
  }

  .filter-right {
    width: 100%;
  }

  .course-grid {
    grid-template-columns: 1fr;
  }

  .course-actions {
    flex-direction: column;
  }
}
</style>
