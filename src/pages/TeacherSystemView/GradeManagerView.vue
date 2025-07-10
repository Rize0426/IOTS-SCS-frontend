<template>
  <div class="grade-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><TrendCharts /></el-icon>
          成绩管理
        </h1>
        <p class="page-description">管理课程成绩，查看学生学习情况</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="exportGrades">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
        <el-button type="primary" @click="batchGrade">
          <el-icon><Edit /></el-icon>
          批量评分
        </el-button>
      </div>
    </div>

    <!-- 课程信息卡片 -->
    <el-card class="course-info-card" shadow="hover">
      <div class="course-info">
        <div class="course-details">
          <h2>{{ courseInfo.name }}</h2>
          <p>{{ courseInfo.description }}</p>
          <div class="course-meta">
            <span>学期：{{ courseInfo.semester }}</span>
            <span>学生人数：{{ courseInfo.studentCount }}人</span>
            <span>平均成绩：{{ courseStats.averageGrade }}分</span>
          </div>
        </div>
        <div class="course-stats">
          <div class="stat-item">
            <div class="stat-number">{{ courseStats.excellentCount }}</div>
            <div class="stat-label">优秀(90+)</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ courseStats.goodCount }}</div>
            <div class="stat-label">良好(80-89)</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ courseStats.passCount }}</div>
            <div class="stat-label">及格(60-79)</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ courseStats.failCount }}</div>
            <div class="stat-label">不及格(<60)</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-section">
        <div class="filter-left">
          <el-select v-model="gradeTypeFilter" placeholder="成绩类型" style="width: 150px;" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="作业成绩" value="assignment" />
            <el-option label="考试成绩" value="exam" />
            <el-option label="总评成绩" value="final" />
          </el-select>
          
          <el-select v-model="gradeRangeFilter" placeholder="成绩范围" style="width: 150px;" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="优秀(90+)" value="excellent" />
            <el-option label="良好(80-89)" value="good" />
            <el-option label="及格(60-79)" value="pass" />
            <el-option label="不及格(<60)" value="fail" />
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

    <!-- 成绩列表 -->
    <el-card class="grade-list-card" shadow="hover">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="学生成绩" name="students">
          <div class="grade-table" v-loading="loading">
            <el-table :data="gradeList" stripe>
              <el-table-column type="selection" width="55" />
              
              <el-table-column label="头像" width="80">
                <template #default="{ row }">
                  <el-avatar :size="40" :src="row.avatar" />
                </template>
              </el-table-column>
              
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="name" label="姓名" width="100" />
              
              <el-table-column label="作业成绩" width="120">
                <template #default="{ row }">
                  <span :class="getGradeClass(row.assignmentGrade)">
                    {{ row.assignmentGrade || '-' }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column label="考试成绩" width="120">
                <template #default="{ row }">
                  <span :class="getGradeClass(row.examGrade)">
                    {{ row.examGrade || '-' }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column label="总评成绩" width="120">
                <template #default="{ row }">
                  <span :class="getGradeClass(row.finalGrade)" class="final-grade">
                    {{ row.finalGrade || '-' }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column label="等级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getGradeLevelType(row.finalGrade)" size="small">
                    {{ getGradeLevelText(row.finalGrade) }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="排名" width="80">
                <template #default="{ row }">
                  <span class="rank">{{ row.rank }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="最后更新" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.updateTime) }}
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="viewGradeDetail(row)">
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                  <el-button type="success" size="small" @click="editGrade(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="info" size="small" @click="viewProgress(row)">
                    <el-icon><TrendCharts /></el-icon>
                    进度
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="成绩分析" name="analysis">
          <div class="grade-analysis">
            <el-row :gutter="24">
              <el-col :xs="24" :lg="12">
                <div class="chart-container">
                  <h3>成绩分布</h3>
                  <div class="chart-placeholder">
                    <el-icon size="48"><PieChart /></el-icon>
                    <p>成绩分布图表</p>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :lg="12">
                <div class="chart-container">
                  <h3>成绩趋势</h3>
                  <div class="chart-placeholder">
                    <el-icon size="48"><TrendCharts /></el-icon>
                    <p>成绩趋势图表</p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页 -->
      <div class="pagination-section" v-if="activeTab === 'students'">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalGrades"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 成绩详情对话框 -->
    <el-dialog v-model="gradeDetailVisible" :title="`${selectedStudent?.name} - 成绩详情`" width="800px">
      <div v-if="selectedStudent" class="grade-detail">
        <div class="detail-header">
          <el-avatar :size="60" :src="selectedStudent.avatar" />
          <div class="student-info">
            <h3>{{ selectedStudent.name }}</h3>
            <p>学号：{{ selectedStudent.studentId }}</p>
            <p>总评成绩：<span :class="getGradeClass(selectedStudent.finalGrade)">{{ selectedStudent.finalGrade }}分</span></p>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-content">
          <h4>详细成绩</h4>
          <el-table :data="gradeDetails" size="small">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="score" label="得分" />
            <el-table-column prop="totalScore" label="总分" />
            <el-table-column prop="percentage" label="占比" />
            <el-table-column prop="submitTime" label="提交时间" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="gradeDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="editGrade(selectedStudent)">编辑成绩</el-button>
      </template>
    </el-dialog>

    <!-- 编辑成绩对话框 -->
    <el-dialog v-model="gradeEditVisible" title="编辑成绩" width="600px">
      <el-form :model="gradeForm" :rules="gradeRules" ref="gradeFormRef" label-width="100px">
        <el-form-item label="学生" prop="studentName">
          <el-input v-model="gradeForm.studentName" disabled />
        </el-form-item>
        
        <el-form-item label="作业成绩" prop="assignmentGrade">
          <el-input-number v-model="gradeForm.assignmentGrade" :min="0" :max="100" :precision="1" />
        </el-form-item>
        
        <el-form-item label="考试成绩" prop="examGrade">
          <el-input-number v-model="gradeForm.examGrade" :min="0" :max="100" :precision="1" />
        </el-form-item>
        
        <el-form-item label="总评成绩" prop="finalGrade">
          <el-input-number v-model="gradeForm.finalGrade" :min="0" :max="100" :precision="1" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="gradeForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="gradeEditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  TrendCharts,
  Download,
  Edit,
  Search,
  View,
  PieChart
} from '@element-plus/icons-vue'

const route = useRoute()
const courseId = route.params.courseId

// 响应式数据
const loading = ref(false)
const activeTab = ref('students')
const gradeTypeFilter = ref('')
const gradeRangeFilter = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalGrades = ref(0)
const gradeDetailVisible = ref(false)
const gradeEditVisible = ref(false)
const submitting = ref(false)
const selectedStudent = ref<any>(null)

// 课程信息
const courseInfo = ref({
  name: '数据结构与算法',
  description: '深入学习数据结构的基本概念和算法设计',
  semester: '2024秋季',
  studentCount: 45
})

// 课程统计
const courseStats = ref({
  averageGrade: 82.5,
  excellentCount: 12,
  goodCount: 18,
  passCount: 10,
  failCount: 5
})

// 成绩列表
const gradeList = ref([
  {
    id: 1,
    studentId: '2021001',
    name: '张三',
    avatar: '/src/assets/images/个人信息头像.png',
    assignmentGrade: 85,
    examGrade: 88,
    finalGrade: 86.5,
    rank: 8,
    updateTime: new Date()
  },
  {
    id: 2,
    studentId: '2021002',
    name: '李四',
    avatar: '/src/assets/images/个人信息头像.png',
    assignmentGrade: 92,
    examGrade: 95,
    finalGrade: 93.5,
    rank: 2,
    updateTime: new Date()
  },
  {
    id: 3,
    studentId: '2021003',
    name: '王五',
    avatar: '/src/assets/images/个人信息头像.png',
    assignmentGrade: 78,
    examGrade: 75,
    finalGrade: 76.5,
    rank: 15,
    updateTime: new Date()
  }
])

// 成绩详情
const gradeDetails = ref([
  {
    type: '作业',
    name: '第一章作业',
    score: 85,
    totalScore: 100,
    percentage: '20%',
    submitTime: '2024-10-15'
  },
  {
    type: '作业',
    name: '第二章作业',
    score: 90,
    totalScore: 100,
    percentage: '20%',
    submitTime: '2024-10-22'
  },
  {
    type: '考试',
    name: '期中考试',
    score: 88,
    totalScore: 100,
    percentage: '60%',
    submitTime: '2024-11-05'
  }
])

// 表单数据
const gradeForm = ref({
  studentName: '',
  assignmentGrade: 0,
  examGrade: 0,
  finalGrade: 0,
  remark: ''
})

const gradeFormRef = ref()
const gradeRules = {
  assignmentGrade: [{ required: true, message: '请输入作业成绩', trigger: 'blur' }],
  examGrade: [{ required: true, message: '请输入考试成绩', trigger: 'blur' }],
  finalGrade: [{ required: true, message: '请输入总评成绩', trigger: 'blur' }]
}

// 方法
const handleFilter = () => {
  currentPage.value = 1
  fetchGrades()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchGrades()
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'students') {
    fetchGrades()
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchGrades()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchGrades()
}

const fetchGrades = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    totalGrades.value = gradeList.value.length
  } catch (error) {
    ElMessage.error('获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

const getGradeClass = (grade: number) => {
  if (!grade) return ''
  if (grade >= 90) return 'grade-excellent'
  if (grade >= 80) return 'grade-good'
  if (grade >= 60) return 'grade-pass'
  return 'grade-fail'
}

const getGradeLevelType = (grade: number) => {
  if (!grade) return 'info'
  if (grade >= 90) return 'success'
  if (grade >= 80) return 'primary'
  if (grade >= 60) return 'warning'
  return 'danger'
}

const getGradeLevelText = (grade: number) => {
  if (!grade) return '未评分'
  if (grade >= 90) return '优秀'
  if (grade >= 80) return '良好'
  if (grade >= 60) return '及格'
  return '不及格'
}

const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN')
}

const exportGrades = () => {
  ElMessage.info('导出成绩功能开发中...')
}

const batchGrade = () => {
  ElMessage.info('批量评分功能开发中...')
}

const viewGradeDetail = (student: any) => {
  selectedStudent.value = student
  gradeDetailVisible.value = true
}

const editGrade = (student: any) => {
  gradeForm.value = {
    studentName: student.name,
    assignmentGrade: student.assignmentGrade,
    examGrade: student.examGrade,
    finalGrade: student.finalGrade,
    remark: ''
  }
  gradeEditVisible.value = true
  gradeDetailVisible.value = false
}

const viewProgress = (student: any) => {
  ElMessage.info('学习进度功能开发中...')
}

const submitGrade = () => {
  gradeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('成绩保存成功')
      gradeEditVisible.value = false
      fetchGrades()
    } catch (error) {
      ElMessage.error('成绩保存失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  document.title = '成绩管理'
  fetchGrades()
})
</script>

<style scoped>
.grade-management {
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

.course-info-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.course-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-details h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.course-details p {
  margin: 0 0 12px 0;
  color: #606266;
}

.course-meta {
  display: flex;
  gap: 24px;
  color: #909399;
  font-size: 14px;
}

.course-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
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

.grade-list-card {
  border-radius: 12px;
}

.grade-table {
  margin-bottom: 24px;
}

.grade-excellent {
  color: #67c23a;
  font-weight: 600;
}

.grade-good {
  color: #409eff;
  font-weight: 600;
}

.grade-pass {
  color: #e6a23c;
  font-weight: 600;
}

.grade-fail {
  color: #f56c6c;
  font-weight: 600;
}

.final-grade {
  font-size: 16px;
  font-weight: 700;
}

.rank {
  font-weight: 600;
  color: #303133;
}

.grade-analysis {
  padding: 20px 0;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.chart-container h3 {
  margin: 0 0 20px 0;
  color: #303133;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.chart-placeholder p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.grade-detail {
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

  .course-info {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .course-stats {
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
