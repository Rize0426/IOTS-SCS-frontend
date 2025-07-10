<template>
  <div class="student-management">
    <!-- 页面头部 -->
    <!--<div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="importStudents">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="success" @click="addStudent">
          <el-icon><Plus /></el-icon>
          添加学生
        </el-button>
      </div>
    </div>-->

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-section">
        <div class="filter-left">
          <el-select v-model="statusFilter" placeholder="学生状态" style="width: 120px;" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="休学" value="suspended" />
            <el-option label="退学" value="withdrawn" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索学生姓名或学号" 
            :prefix-icon="Search" 
            clearable
            style="width: 300px;" 
            @input="handleSearch" 
          />
        </div>
      </div>
    </el-card>

    <!-- 学生列表 -->
    <el-card class="student-list-card" shadow="hover">
      <div class="student-list" v-loading="loading">
        <el-table :data="studentList" stripe>
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="头像" width="80">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.avatar" />
            </template>
          </el-table-column>
          
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="电话" width="130" />
          
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="注册时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.registerTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewStudent(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button type="success" size="small" @click="editStudent(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleCommand(command, row)">
                <el-button size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="grades">查看成绩</el-dropdown-item>
                    <el-dropdown-item command="assignments">作业情况</el-dropdown-item>
                    <el-dropdown-item command="reset-password">重置密码</el-dropdown-item>
                    <el-dropdown-item divided command="remove">移除学生</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalStudents"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="studentDetailVisible" :title="`${selectedStudent?.name} - 学生详情`" width="800px">
      <div v-if="selectedStudent" class="student-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="selectedStudent.avatar" />
          <div class="student-info">
            <h3>{{ selectedStudent.name }}</h3>
            <p>学号：{{ selectedStudent.studentId }}</p>
            <p>邮箱：{{ selectedStudent.email }}</p>
            <p>电话：{{ selectedStudent.phone }}</p>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-content">
          <h4>课程信息</h4>
          <el-table :data="selectedStudent.courses" size="small">
            <el-table-column prop="name" label="课程名称" />
            <el-table-column prop="semester" label="学期" />
            <el-table-column label="成绩">
              <template #default="{ row }">
                {{ row.grade || '暂无' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="studentDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="editStudent(selectedStudent)">编辑学生</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑学生对话框 -->
    <el-dialog 
      v-model="studentFormVisible" 
      :title="isEditMode ? '编辑学生' : '添加学生'" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="100px">
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="studentForm.studentId" placeholder="请输入学号" :disabled="isEditMode" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入电话" />
        </el-form-item>
        
        <el-form-item label="所属课程" prop="courseIds">
          <el-select v-model="studentForm.courseIds" multiple placeholder="请选择课程" style="width: 100%;">
            <el-option v-for="course in courses" :key="course.id" :label="course.name" :value="course.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="studentForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="suspended">休学</el-radio>
            <el-radio label="withdrawn">退学</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="studentFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStudent" :loading="submitting">
          {{ isEditMode ? '保存' : '添加' }}
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
  UserFilled,
  Upload,
  Plus,
  Search,
  View,
  Edit,
  ArrowDown
} from '@element-plus/icons-vue'
import {defineProps} from 'vue'
const props = defineProps({
    courseId:Number
})
const router = useRouter()

// 响应式数据
const loading = ref(false)
const courseFilter = ref('')
const statusFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalStudents = ref(0)
const studentDetailVisible = ref(false)
const studentFormVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const selectedStudent = ref<any>(null)

// 课程列表
const courses = ref([
  { id: 1, name: '数据结构与算法' },
  { id: 2, name: '计算机网络' },
  { id: 3, name: '机器学习基础' }
])

// 学生列表
const studentList = ref([
  {
    id: 1,
    studentId: '2021001',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: '/src/assets/images/个人信息头像.png',
    status: 'active',
    registerTime: new Date('2021-09-01'),
    courses: [
      { id: 1, name: '数据结构与算法', semester: '2024秋季', grade: 85 },
      { id: 2, name: '计算机网络', semester: '2024秋季', grade: 92 }
    ]
  },
  {
    id: 2,
    studentId: '2021002',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: '/src/assets/images/个人信息头像.png',
    status: 'active',
    registerTime: new Date('2021-09-01'),
    courses: [
      { id: 1, name: '数据结构与算法', semester: '2024秋季', grade: 78 }
    ]
  },
  {
    id: 3,
    studentId: '2021003',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    avatar: '/src/assets/images/个人信息头像.png',
    status: 'suspended',
    registerTime: new Date('2021-09-01'),
    courses: [
      { id: 2, name: '计算机网络', semester: '2024秋季', grade: null }
    ]
  }
])

// 表单数据
const studentForm = ref({
  studentId: '',
  name: '',
  email: '',
  phone: '',
  courseIds: [],
  status: 'active'
})

const studentFormRef = ref()
const studentRules = {
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  courseIds: [{ required: true, message: '请选择课程', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 方法
const handleFilter = () => {
  currentPage.value = 1
  fetchStudents()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchStudents()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchStudents()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchStudents()
}

const fetchStudents = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    totalStudents.value = studentList.value.length
  } catch (error) {
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    suspended: 'warning',
    withdrawn: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    suspended: '休学',
    withdrawn: '退学'
  }
  return texts[status] || '未知'
}

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}

const importStudents = () => {
  ElMessage.info('批量导入功能开发中...')
}

const addStudent = () => {
  isEditMode.value = false
  studentForm.value = {
    studentId: '',
    name: '',
    email: '',
    phone: '',
    courseIds: [],
    status: 'active'
  }
  studentFormVisible.value = true
}

const viewStudent = (student: any) => {
  selectedStudent.value = student
  studentDetailVisible.value = true
}

const editStudent = (student: any) => {
  isEditMode.value = true
  studentForm.value = {
    studentId: student.studentId,
    name: student.name,
    email: student.email,
    phone: student.phone,
    courseIds: student.courses.map((c: any) => c.id),
    status: student.status
  }
  studentFormVisible.value = true
  studentDetailVisible.value = false
}

const handleCommand = (command: string, student: any) => {
  switch (command) {
    case 'grades':
      router.push(`/teacher/student/grades/${student.courses[0]?.id || 123456}`)
      break
    case 'assignments':
      ElMessage.info('作业情况功能开发中...')
      break
    case 'reset-password':
      resetPassword(student)
      break
    case 'remove':
      removeStudent(student)
      break
  }
}

const resetPassword = async (student: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置学生"${student.name}"的密码吗？`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('密码重置成功')
  } catch {
    // 用户取消
  }
}

const removeStudent = async (student: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除学生"${student.name}"吗？此操作不可恢复。`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('学生移除成功')
    fetchStudents()
  } catch {
    // 用户取消
  }
}

const submitStudent = () => {
  studentFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isEditMode.value) {
        ElMessage.success('学生信息更新成功')
      } else {
        ElMessage.success('学生添加成功')
      }
      
      studentFormVisible.value = false
      fetchStudents()
    } catch (error) {
      ElMessage.error(isEditMode.value ? '学生信息更新失败' : '学生添加失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  document.title = '学生管理'
  fetchStudents()
})
</script>

<style scoped>
.student-management {
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

.header-right {
  display: flex;
  gap: 12px;
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

.student-list-card {
  border-radius: 12px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.student-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  gap: 20px;
  align-items: center;
}

.student-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.student-info p {
  margin: 4px 0;
  color: #606266;
}

.detail-content h4 {
  margin: 20px 0 16px 0;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-right {
    width: 100%;
    justify-content: center;
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

  .detail-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
