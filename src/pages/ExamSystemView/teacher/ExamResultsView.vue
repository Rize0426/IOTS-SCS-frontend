<template>
    <div class="exam-results-container">
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
        </div>

        <div class="exam-results-content">
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="header-left">
                    <el-button @click="goBack" type="primary" plain>
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        返回考试列表
                    </el-button>
                </div>
                <div class="header-center">
                    <h1 class="page-title">{{ examInfo.examTitle || '考试' }} - 成绩管理</h1>
                    <p class="page-subtitle">考试ID: {{ examId }}</p>
                </div>
                <div class="header-right">
                    <!--<el-button type="success" @click="exportResults">
                        <el-icon>
                            <Download />
                        </el-icon>
                        导出成绩
                    </el-button>-->
                </div>
            </div>

            <!-- 考试统计信息 -->
            <el-card class="stats-card" shadow="hover">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <User />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ examInfo.totalStudents || 0 }}</div>
                            <div class="stat-label">参与学生</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <Star />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ examInfo.averageScore || 0 }}</div>
                            <div class="stat-label">平均分</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <Trophy />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ examInfo.highestScore || 0 }}</div>
                            <div class="stat-label">最高分</div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ examInfo.passRate || 0 }}%</div>
                            <div class="stat-label">及格率</div>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 学生成绩列表 -->
            <el-card class="results-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <span class="card-title">学生成绩列表</span>
                        <div class="header-actions">
                            <el-input v-model="searchKeyword" placeholder="搜索学生姓名" :prefix-icon="Search" clearable
                                style="width: 200px;" @input="handleSearch" />
                            <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px;" @change="handleSort">
                                <el-option label="按分数排序" value="score" />
                                <el-option label="按姓名排序" value="name" />
                                <el-option label="按提交时间排序" value="submitTime" />
                            </el-select>
                        </div>
                    </div>
                </template>

                <el-table :data="studentResults" v-loading="loading" stripe>
                    <el-table-column prop="studentNumber" label="学号" min-width="120" />
                    <el-table-column prop="studentName" label="姓名" min-width="120" />
                    <el-table-column prop="score" label="得分" width="100">
                        <template #default="{ row }">
                            <span class="score-cell" :class="getScoreClass(row.score, row.totalScore)">
                                {{ row.score }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalScore" label="总分" width="100" />
                    <el-table-column prop="correctCount" label="正确题数" width="120" />
                    <el-table-column prop="accuracy" label="正确率" width="100">
                        <template #default="{ row }">
                            <span class="accuracy-cell">{{ row.accuracy }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="submitTime" label="提交时间" min-width="180">
                        <template #default="{ row }">
                            {{ formatDateTime(row.submitTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)" size="small">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="{ row }">
                            <div class="actions">
                                <el-button type="primary" size="small" @click="viewDetail(row)">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                    查看详情
                                </el-button>
                                <el-button type="warning" size="small" @click="reScore(row)"
                                    :disabled="row.status !== 'completed'">
                                    <el-icon>
                                        <Refresh />
                                    </el-icon>
                                    重新评分
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-if="studentResults.length>0" class="pagination-section-111">
                    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                        :total="totalStudents" @size-change="handleSizeChange" @current-change="handleCurrentChange" style="margin: auto;"/>
                </div>
            </el-card>
        </div>

        <!-- 学生考试详情弹窗 -->
        <el-dialog v-model="showDetailDialog" :title="`${selectedStudent?.studentName} - 考试详情`" width="80%"
            class="detail-dialog" top="5vh">
            <div class="detail-content" v-loading="detailLoading">
                <div v-if="examDetail" class="exam-detail-info">
                    <!-- 基本信息 -->
                    <div class="basic-info">
                        <h3>基本信息</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">学号：</span>
                                <span class="info-value">{{ examDetail.studentNumber }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">姓名：</span>
                                <span class="info-value">{{ examDetail.studentName }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">得分：</span>
                                <span class="info-value score-highlight">{{ examDetail.score }}/{{ examDetail.totalScore
                                }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">提交时间：</span>
                                <span class="info-value">{{ formatDateTime(examDetail.submitTime) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 题目详情 -->
                    <div class="questions-detail">
                        <h3>题目详情</h3>
                        <div class="questions-list">
                            <div v-for="(question, index) in examDetail.questions" :key="index" class="question-item">
                                <div class="question-header">
                                    <span class="question-number">第{{ index + 1 }}题</span>
                                    <span class="question-type">{{ question.type }}</span>
                                    <span class="question-score">
                                        得分: {{ question.score }}/{{ question.totalScore }}
                                    </span>
                                </div>
                                <div class="question-content">
                                    <div class="question-text">{{ question.content }}</div>
                                    <div class="answer-section">
                                        <div class="student-answer">
                                            <strong>学生答案：</strong>
                                            <span
                                                :style="{ color: question.studentAnswer === question.correctAnswer ? 'forestgreen' : 'red' }">{{
                                                    question.studentAnswer || '未作答' }}</span>
                                        </div>
                                        <div class="correct-answer">
                                            <strong>正确答案：</strong>
                                            <span style="color: forestgreen;">{{ question.correctAnswer }}</span>
                                        </div>

                                        <div class="ai-comment" v-if="question.aiComment">
                                            <strong>AI评语：</strong>
                                            <span>{{ question.aiComment }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showDetailDialog = false">关闭</el-button>
                    <el-button type="primary" @click="reScore(selectedStudent)"
                        :disabled="!selectedStudent || selectedStudent.status !== 'completed'">
                        重新评分
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 手动重新评分弹窗 -->
        <el-dialog v-model="showReScoreDialog" title="手动重新评分" width="80%" class="rescore-dialog" top="1vh">
            <div class="rescore-content" v-loading="reScoreLoading">
                <div class="rescore-header">
                    <h3>为 <strong>{{ selectedStudent?.studentName }}</strong> 重新评分</h3>
                    <p class="rescore-subtitle">请仔细查看每道题的答案，并给出合理的分数</p>
                </div>

                <div v-if="studentExamDetail" class="questions-scoring">
                    <div class="scoring-summary">
                        <div class="summary-item">
                            <span class="summary-label">原总分：</span>
                            <span class="summary-value">{{ studentExamDetail.score }}分</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">新总分：</span>
                            <span class="summary-value new-total">{{ newTotalScore }}分</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">变化：</span>
                            <span class="summary-value" :class="scoreChange >= 0 ? 'positive' : 'negative'">
                                {{ scoreChange >= 0 ? '+' : '' }}{{ scoreChange }}分
                            </span>
                        </div>
                    </div>

                    <div class="questions-list">
                        <div v-for="(question, index) in studentExamDetail.questions" :key="index"
                            class="question-item">
                            <div class="question-header">
                                <h4>第{{ index + 1 }}题 ({{ question.type }})</h4>
                                <div class="question-meta">
                                    <span class="max-score">满分：{{ question.totalScore }}分</span>
                                    <span class="original-score">原得分：{{ question.score }}分</span>
                                </div>
                            </div>

                            <div class="question-content">
                                <div class="question-text" v-html="question.content"></div>

                                <div class="answer-section">
                                    <div class="student-answer">
                                        <h5>学生答案：</h5>
                                        <div class="answer-text">{{ question.studentAnswer || '未作答' }}</div>
                                    </div>

                                    <div v-if="question.correctAnswer" class="correct-answer">
                                        <h5>参考答案：</h5>
                                        <div class="answer-text">{{ question.correctAnswer }}</div>
                                    </div>

                                    <div v-if="question.aiComment" class="ai-comment">
                                        <h5>评语：</h5>
                                        <div class="comment-text">{{ question.aiComment }}</div>
                                    </div>
                                </div>

                                <div class="scoring-section">
                                    <div class="score-input">
                                        <label>新得分：</label>
                                        <el-input-number v-model="questionScores[index]" :min="0"
                                            :max="question.totalScore" :precision="1" size="large"
                                            style="width: 120px;" />
                                        <span class="score-unit">分</span>
                                    </div>

                                    <div class="comment-input">
                                        <label>评语：</label>
                                        <el-input v-model="questionComments[index]" type="textarea" :rows="2"
                                            placeholder="请输入评语（可选）" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showReScoreDialog = false">取消</el-button>
                    <el-button type="primary" @click="confirmManualRescore" :loading="confirmLoading">
                        确认更新分数
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    ArrowLeft,
    Download,
    User,
    Star,
    Trophy,
    TrendCharts,
    Search,
    View,
    Refresh
} from '@element-plus/icons-vue'
import { customFetch } from '../../../api/customFetch'

const route = useRoute()
const router = useRouter()

// 路由参数
const examId = route.params.examId as string
const courseId = route.query.courseId as string

// 响应式数据
const loading = ref(false)
const detailLoading = ref(false)
const reScoreLoading = ref(false)
const searchKeyword = ref('')
const sortBy = ref('score')
const showDetailDialog = ref(false)
const showReScoreDialog = ref(false)
const selectedStudent = ref<any>(null)
const examInfo = ref<any>({})
const examStats = ref({
    totalStudents: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0
})
const studentResults = ref<any[]>([])
const examDetail = ref<any>(null)
const studentExamDetail = ref<any>(null)
const questionScores = ref<number[]>([])
const questionComments = ref<string[]>([])
const confirmLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalStudents = ref(0)

// 计算新总分
const newTotalScore = computed(() => {
    return questionScores.value.reduce((sum, score) => sum + (score || 0), 0)
})

// 计算分数变化
const scoreChange = computed(() => {
    if (!studentExamDetail.value) return 0
    return newTotalScore.value - studentExamDetail.value.score
})
const handleSizeChange = () => {
    currentPage.value = 1
    fetchStudentResults()
}
const handleCurrentChange = () => {
    fetchStudentResults()
}
// 方法
const goBack = () => {
    router.go(-1)
}

const exportResults = async () => {
    try {
        const response = await customFetch(`/api/exams/teacher/${examId}/export`)
        ElMessage.success('导出成功，下载链接：' + response.data)
        // 这里可以添加下载逻辑
    } catch (error) {
        console.error('导出失败：', error)
        ElMessage.error('导出失败')
    }
}

const fetchExamInfo = async () => {
    try {
        const response = await customFetch(`/api/exams/teacher/${examId}/stats`);
        const data = await response.json()
        if (!data || data.code !== 200) {
            ElMessage.error('获取考试信息失败')
            return;
        }
        examInfo.value = data.data
    } catch (error) {
        console.error('获取考试信息失败：', error)
        ElMessage.error('获取考试信息失败')
    }
}

const fetchStudentResults = async () => {
    loading.value = true
    try {
        const searchParams = new URLSearchParams();
        if (searchKeyword.value) searchParams.append('keyword', searchKeyword.value);
        if (sortBy.value) searchParams.append('sortBy', sortBy.value);
        searchParams.append('page', currentPage.value.toString());
        searchParams.append('size', pageSize.value.toString());

        const url = `/api/exams/teacher/${examId}/results?${searchParams.toString()}`;
        const res = await customFetch(url);
        const response = await res.json()
        if (!response || response.code !== 200) {
            ElMessage.error('获取学生成绩失败')
            return
        }
        studentResults.value = response.data?.records || []
        totalStudents.value = response.data?.total || 0

        // 计算统计数据
        if (studentResults.value.length > 0) {
            const totalScore = studentResults.value[0].totalScore
            const scores = studentResults.value.map(r => r.score)
            examStats.value = {
                totalStudents: studentResults.value.length,
                averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                highestScore: Math.max(...scores),
                passRate: Math.round((scores.filter(s => s >= totalScore * 0.6).length / scores.length) * 100)
            }
        }
    } catch (error) {
        console.error('获取学生成绩失败：', error)
        ElMessage.error('获取学生成绩失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    fetchStudentResults()
}

const handleSort = () => {
    fetchStudentResults()
}

const getScoreClass = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100
    if (percentage >= 90) return 'score-excellent'
    if (percentage >= 80) return 'score-good'
    if (percentage >= 70) return 'score-average'
    if (percentage >= 60) return 'score-pass'
    return 'score-fail'
}

const getStatusType = (status: string) => {
    switch (status) {
        case 'completed': return 'success'
        case 'ongoing': return 'primary'
        case 'pending': return 'warning'
        default: return 'info'
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'completed': return '已完成'
        case 'ongoing': return '进行中'
        case 'pending': return '待开始'
        default: return '未知'
    }
}

const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('zh-CN')
}


const viewDetail = async (student: any) => {
    selectedStudent.value = student
    showDetailDialog.value = true
    detailLoading.value = true

    try {
        const response = await customFetch(`/api/exams/teacher/${examId}/student/${student.studentId}/detail`)
        const data = await response.json()
        if (!data || data.code !== 200) {
            ElMessage.error("获取考试详情失败")
            return
        }
        examDetail.value = data.data
    } catch (error) {
        console.error('获取考试详情失败：', error)
        ElMessage.error('获取考试详情失败')
    } finally {
        detailLoading.value = false
    }
}

const reScore = async (student: any) => {
    if (!student || student.status !== 'completed') return

    selectedStudent.value = student
    showReScoreDialog.value = true
    reScoreLoading.value = true
    studentExamDetail.value = null

    try {
        // 获取学生考试详情
        const response = await customFetch(`/api/exams/teacher/${examId}/student/${student.studentId}/detail`)
        const data = await response.json()
        if (data.code !== 200) {
            ElMessage.error("获取考试详情失败")
            return
        }
        studentExamDetail.value = data.data

        // 初始化分数和评语数组
        questionScores.value = studentExamDetail.value.questions.map((q: any) => q.score)
        questionComments.value = new Array(studentExamDetail.value.questions.length).fill('')

    } catch (error) {
        console.error('获取考试详情失败：', error)
        ElMessage.error('获取考试详情失败')
        showReScoreDialog.value = false
    } finally {
        reScoreLoading.value = false
    }
}

const confirmManualRescore = async () => {
    if (!studentExamDetail.value || !selectedStudent.value) return

    confirmLoading.value = true
    try {
        // 构建评分数据
        const scores = studentExamDetail.value.questions.map((question: any, index: number) => ({
            questionId: question.questionId || `question_${index}`,
            score: questionScores.value[index] || 0,
            comment: questionComments.value[index] || ''
        }))

        // 调用手动重新评分API
        const response = await customFetch(`/api/exams/teacher/${examId}/student/${selectedStudent.value.studentId}/manual-rescore`, {
            method: 'POST',
            body: JSON.stringify({ scores })
        });
        const data = await response.json()
        if (data.code !== 200) {
            ElMessage.error('分数更新失败')
            return
        }

        // 更新本地数据
        selectedStudent.value.score = data.data.newScore

        // 重新计算统计数据
        const allScores = studentResults.value.map(r => r.score)
        const totalScore = studentResults.value[0].totalScore

        examStats.value = {
            totalStudents: studentResults.value.length,
            averageScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
            highestScore: Math.max(...allScores),
            passRate: Math.round((allScores.filter(s => s >= 0.6 * totalScore).length / allScores.length) * 100)
        }

        ElMessage.success('分数更新成功')
        showReScoreDialog.value = false
    } catch (error) {
        console.error('更新分数失败：', error)
        ElMessage.error('更新分数失败')
    } finally {
        confirmLoading.value = false
    }
}

onMounted(async () => {
    await fetchExamInfo()
    await fetchStudentResults()
})
</script>

<style scoped>
.exam-results-container {
    min-height: 90vh;
    position: relative;
    overflow: hidden;
}

.background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.circle-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    right: 10%;
    animation-delay: 0s;
}

.circle-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    left: 5%;
    animation-delay: 2s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-20px);
    }
}

.exam-results-content {
    position: relative;
    z-index: 1;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-center {
    text-align: center;
}

.page-title {
    margin: 0 0 5px 0;
    font-size: 28px;
    font-weight: 700;
    color: #303133;
}

.page-subtitle {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.stats-card {
    margin-bottom: 20px;
    border-radius: 12px;
}
.pagination-section-111{
    display: flex ;
    margin-top: 20px;
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    color: #909399;
}

.results-card {
    border-radius: 12px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.score-cell {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
}

.score-excellent {
    color: #67c23a;
    background: #f0f9ff;
}

.score-good {
    color: #409eff;
    background: #f0f9ff;
}

.score-average {
    color: #e6a23c;
    background: #fdf6ec;
}

.score-pass {
    color: #909399;
    background: #f4f4f5;
}

.score-fail {
    color: #f56c6c;
    background: #fef0f0;
}

.accuracy-cell {
    font-weight: 500;
    color: #409eff;
}

.actions {
    display: flex;
    gap: 10px;
}

.detail-dialog {
    border-radius: 12px;
}

.detail-content {
    max-height: 70vh;
    overflow-y: auto;
}

.basic-info {
    margin-bottom: 30px;
}

.basic-info h3 {
    margin: 0 0 15px 0;
    color: #303133;
    font-size: 18px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 60px;
}

.info-item {
    display: flex;
    gap: 10px;
}

.info-label {
    font-weight: 500;
    color: #606266;
    min-width: 80px;
}

.info-value {
    color: #303133;
}

.score-highlight {
    font-weight: 600;
    color: #409eff;
    font-size: 16px;
}

.questions-detail h3 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 18px;
}

.questions-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.question-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 20px;
    background: #fafafa;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.question-number {
    font-weight: 600;
    color: #303133;
}

.question-type {
    background: #e1f3d8;
    color: #67c23a;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.question-score {
    font-weight: 500;
    color: #409eff;
}

.question-content {
    line-height: 1.6;
}

.question-text {
    margin-bottom: 15px;
    color: #303133;
    font-weight: 500;
}

.answer-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.student-answer {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 15px;
}

.correct-answer,
.ai-comment {
    padding: 10px;
    background: white;
    border-radius: 4px;
    border-left: 3px solid #409eff;
}

.ai-comment {
    border-left-color: #67c23a;
    background: #f0f9ff;
}

.rescore-dialog {
    border-radius: 12px;
}

.rescore-content {
    text-align: center;
    padding: 40px 20px;
}

.rescore-info {
    margin-bottom: 30px;
}

.rescore-info p {
    font-size: 16px;
    color: #606266;
}

.rescore-result h4 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 18px;
}

.result-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.result-item {
    text-align: center;
}

.result-label {
    display: block;
    font-size: 14px;
    color: #909399;
    margin-bottom: 5px;
}

.result-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.new-score {
    color: #409eff;
}

.positive {
    color: #67c23a;
}

.negative {
    color: #f56c6c;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* 手动重新评分样式 */
.rescore-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
}

.rescore-header h3 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 20px;
}

.rescore-subtitle {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.questions-scoring {
    max-height: 600px;
    overflow-y: auto;
}

.scoring-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.summary-item {
    text-align: center;
}

.summary-label {
    display: block;
    font-size: 14px;
    color: #909399;
    margin-bottom: 5px;
}

.summary-value {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
}

.summary-value.new-total {
    color: #67c23a;
}

.summary-value.positive {
    color: #67c23a;
}

.summary-value.negative {
    color: #f56c6c;
}

.scoring-section {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding: 15px;
    background: #fafafa;
    border-radius: 6px;
    flex-direction: column;
}

.score-input {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 90%;
}

.score-input label {
    font-weight: 500;
    color: #303133;
}

.score-input .el-input-number {
    min-width: 200px
}

.score-unit {
    color: #909399;
    font-size: 14px;
}

.comment-input {
    flex: 1;
    display: flex;
    width: 90%;
}

.comment-input .el-input {
    min-width: 80%;
}

.comment-input label {
    display: block;
    font-weight: 500;
    color: #303133;
    margin-bottom: 5px;
    min-width: 65px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .exam-results-content {
        padding: 15px;
    }

    .page-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .card-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .header-actions {
        flex-direction: column;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .result-summary {
        flex-direction: column;
        gap: 15px;
    }
}
</style>