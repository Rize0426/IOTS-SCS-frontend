<template>
    <div class="teacher-exam-list-container">
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
        </div>

        <div class="teacher-exam-list-content">
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="header-right">
                    <el-button type="success" @click="createNewExam">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        创建考试
                    </el-button>
                </div>
            </div>

            <!-- 筛选和搜索 -->
            <el-card class="filter-card" shadow="hover">
                <div class="filter-section">
                    <div class="filter-left">
                        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                            <el-tab-pane label="全部考试" name="all">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <List />
                                        </el-icon>
                                        全部考试 ({{ totalExams }})
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="待开始" name="pending">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        待开始
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="进行中" name="ongoing">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <VideoPlay />
                                        </el-icon>
                                        进行中
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="已完成" name="completed">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <Check />
                                        </el-icon>
                                        已完成
                                    </span>
                                </template>
                            </el-tab-pane>
                        </el-tabs>
                    </div>

                    <div class="filter-right">
                        <el-input v-model="searchKeyword" placeholder="搜索考试名称" :prefix-icon="Search" clearable
                            style="width: 300px;" @input="handleSearch" />
                    </div>
                </div>
            </el-card>

            <!-- 考试列表 -->
            <div class="exam-list" v-loading="loading">
                <div v-if="examList.length === 0 && !loading" class="empty-state">
                    <el-empty description="暂无考试数据">
                        <el-button type="primary" @click="refreshData">刷新数据</el-button>
                    </el-empty>
                </div>

                <div v-else-if="!loading" class="exam-cards">
                    <el-card v-for="exam in examList" :key="exam.id" class="exam-card" :class="`exam-${exam.status}`"
                        shadow="hover">
                        <!-- 考试卡片头部 -->
                        <div class="exam-card-header">
                            <div class="exam-title-section">
                                <h3 class="exam-title">{{ exam.title }}</h3>
                                <div class="exam-meta">
                                    <el-tag :type="getStatusTagType(exam.status)" size="small"
                                        v-if="exam.paperStatus == '已发布'">
                                        {{ getStatusText(exam.status) }}
                                    </el-tag>
                                    <el-tag v-else type="warning" size="small">
                                        {{ exam.paperStatus }}
                                    </el-tag>
                                    <el-tag type="info" size="small">
                                        参与人数: {{ exam.participantCount || 0 }}
                                    </el-tag>
                                </div>
                            </div>

                            <div class="exam-status-icon">
                                <el-icon :size="32" :color="getStatusColor(exam.status)">
                                    <Clock v-if="exam.status === 'pending'" />
                                    <VideoPlay v-else-if="exam.status === 'ongoing'" />
                                    <Check v-else-if="exam.status === 'completed'" />
                                </el-icon>
                            </div>
                        </div>

                        <!-- 考试详细信息 -->
                        <div class="exam-details">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    <span class="detail-label">开始时间：</span>
                                    <span class="detail-value">{{ formatDateTime(exam.startTime) }}</span>
                                </div>
                                <div class="detail-item">
                                    <el-icon>
                                        <Timer />
                                    </el-icon>
                                    <span class="detail-label">考试时长：</span>
                                    <span class="detail-value">{{ exam.duration }}分钟</span>
                                </div>
                            </div>

                            <div class="detail-row">
                                <div class="detail-item">
                                    <el-icon>
                                        <Document />
                                    </el-icon>
                                    <span class="detail-label">题目数量：</span>
                                    <span class="detail-value">{{ exam.questionNum }}题</span>
                                </div>
                                <div class="detail-item">
                                    <el-icon>
                                        <Star />
                                    </el-icon>
                                    <span class="detail-label">总分：</span>
                                    <span class="detail-value">{{ exam.totalScore }}分</span>
                                </div>
                            </div>

                            <!-- 统计信息（仅已完成的考试显示） -->
                            <div v-if="exam.status === 'completed'" class="exam-stats">
                                <div class="stats-row">
                                    <div class="stat-item">
                                        <span class="stat-label">平均分：</span>
                                        <span class="stat-value">{{ exam.averageScore || 0 }}分</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">最高分：</span>
                                        <span class="stat-value">{{ exam.highestScore || 0 }}分</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">最低分：</span>
                                        <span class="stat-value">{{ exam.lowestScore || 0 }}分</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="exam-actions">
                            <el-button type="primary" @click="viewExamResults(exam)"
                                :disabled="exam.status === 'pending'" v-if="exam.paperStatus == '已发布'">
                                <el-icon>
                                    <View />
                                </el-icon>
                                查看成绩
                            </el-button>
                            <el-button type="primary" @click="publishExam(exam)" v-else>
                                <el-icon>
                                    <View />
                                </el-icon>
                                发布考试
                            </el-button>
                            <el-button type="success" @click="editExam(exam)" :disabled="exam.status === 'ongoing'">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                                编辑考试
                            </el-button>
                            <el-button type="danger" @click="deleteExam(exam)" :disabled="exam.status === 'ongoing'">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                删除考试
                            </el-button>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>

        <el-dialog v-model="createDialogVisible" title="创建考试" width="700px" :close-on-click-modal="false">
            <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
                <el-form-item label="考试名称" prop="title">
                    <el-input v-model="createForm.title" placeholder="请输入考试名称" />
                </el-form-item>
                <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker v-model="createForm.startTime" type="datetime" placeholder="选择开始时间"
                        style="width: 100%;" />
                </el-form-item>
                <el-form-item label="考试时长" prop="duration">
                    <el-input-number v-model="createForm.duration" :min="1" :max="300" /> 分钟
                </el-form-item>
                <el-form-item label="总分" prop="totalScore">
                    <el-input-number v-model="createForm.totalScore" :min="1" :max="1000" /> 分
                </el-form-item>
                <el-divider>题目管理</el-divider>
                <draggable v-model="createForm.questions" item-key="order" :animation="200" handle=".drag-handle">
                    <template #item="{ element, index }">
                        <el-card class="mb-2">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span class="drag-handle" style="cursor:move;">☰</span>
                                <span>题目{{ index + 1 }}：{{ element.content || '（未填写题干）' }}</span>
                                <div>
                                    <el-button size="small" @click="editQuestion(index, 'create')">编辑</el-button>
                                    <el-button size="small" type="danger"
                                        @click="removeQuestion(index, 'create')">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </template>
                </draggable>
                <el-button type="primary" plain @click="addQuestion('create')" style="margin-top:10px;">添加题目</el-button>
            </el-form>
            <template #footer>
                <el-button @click="createDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitCreateExam">创建</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="editDialogVisible" title="编辑考试" width="700px" :close-on-click-modal="false">
            <el-form :model="editForm" :rules="createRules" ref="editFormRef" label-width="100px">
                <el-form-item label="考试名称" prop="title">
                    <el-input v-model="editForm.title" placeholder="请输入考试名称" />
                </el-form-item>
                <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="选择开始时间"
                        style="width: 100%;" />
                </el-form-item>
                <el-form-item label="考试时长" prop="duration">
                    <el-input-number v-model="editForm.duration" :min="1" :max="300" /> 分钟
                </el-form-item>
                <el-form-item label="总分" prop="totalScore">
                    <el-input-number v-model="editForm.totalScore" :min="1" :max="1000" /> 分
                </el-form-item>
                <el-divider>题目管理</el-divider>
                <draggable v-model="editForm.questions" item-key="order" :animation="200" handle=".drag-handle">
                    <template #item="{ element, index }">
                        <el-card class="mb-2">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span class="drag-handle" style="cursor:move;">☰</span>
                                <span>题目{{ index + 1 }}：{{ element.content || '（未填写题干）' }}</span>
                                <div>
                                    <el-button size="small" @click="editQuestion(index, 'edit')">编辑</el-button>
                                    <el-button size="small" type="danger"
                                        @click="removeQuestion(index, 'edit')">删除</el-button>
                                </div>
                            </div>
                        </el-card>
                    </template>
                </draggable>
                <el-button type="primary" plain @click="addQuestion('edit')" style="margin-top:10px;">添加题目</el-button>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEditExam">保存</el-button>
            </template>
        </el-dialog>

        <!-- 题目编辑弹窗 -->
        <el-dialog v-model="questionDialogVisible" :title="questionDialogMode === 'create' ? '添加题目' : '编辑题目'"
            width="600px">
            <el-form :model="questionForm" :rules="questionRules" ref="questionFormRef" label-width="90px">
                <el-form-item label="题目类型" prop="type">
                    <el-select v-model="questionForm.type" placeholder="请选择题型" @change="changeQuestionType">
                        <el-option label="单选题" value="单选题" />
                        <el-option label="多选题" value="多选题" />
                        <el-option label="判断题" value="判断题" />
                        <el-option label="解答题" value="解答题" />
                    </el-select>
                </el-form-item>
                <el-form-item label="题干" prop="content">
                    <el-input v-model="questionForm.content" type="textarea" placeholder="请输入题干" />
                </el-form-item>
                <el-form-item label="分值" prop="score">
                    <el-input-number v-model="questionForm.score" :min="1" :max="100" />
                </el-form-item>
                <el-form-item label="选项" v-if="questionForm.type === '单选题' || questionForm.type === '多选题'">
                    <div v-for="(opt, idx) in questionForm.options" :key="idx"
                        style="display:flex;align-items:center;margin-bottom:4px;">
                        <el-input v-model="questionForm.options[idx]" placeholder="请输入选项内容" style="flex:1;" />
                        <el-button icon="Delete" size="small" type="danger" @click="removeOption(idx)" circle />
                    </div>
                    <el-button size="small" @click="addOption">添加选项</el-button>
                </el-form-item>
                <el-form-item label="答案" prop="answer">
                    <template v-if="questionForm.type === '单选题'">
                        <el-radio-group v-model="questionForm.answer">
                            <el-radio v-for="(opt, idx) in questionForm.options" :key="idx" :label="opt">{{ opt
                            }}</el-radio>
                        </el-radio-group>
                    </template>
                    <template v-else-if="questionForm.type === '多选题'">
                        <el-checkbox-group v-model="questionForm.answer">
                            <el-checkbox v-for="(opt, idx) in questionForm.options" :key="idx" :label="opt">{{ opt
                            }}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <template v-else-if="questionForm.type === '判断题'">
                        <el-radio-group v-model="questionForm.answer">
                            <el-radio :label="true">正确</el-radio>
                            <el-radio :label="false">错误</el-radio>
                        </el-radio-group>
                    </template>
                    <template v-else-if="questionForm.type === '解答题'">
                        <el-input v-model="questionForm.answer" type="textarea" placeholder="请输入参考答案" />
                    </template>
                </el-form-item>
                <el-form-item label="解析" prop="analysis">
                    <el-input v-model="questionForm.analysis" type="textarea" placeholder="请输入解析" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="questionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitQuestion">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    List,
    Clock,
    VideoPlay,
    Check,
    Calendar,
    Timer,
    Document,
    Star,
    View,
    Edit,
    Delete,
    Search
} from '@element-plus/icons-vue'
import { customFetch } from '../../../api/customFetch'
import draggable from 'vuedraggable'
import {defineProps} from 'vue'

const route = useRoute()
const router = useRouter()
const props=defineProps({
    courseId: Number
})
// 路由参数
//const courseId = route.params.courseId as string
const courseId=props.courseId


// 响应式数据
const loading = ref(false)
const activeTab = ref('all')
const searchKeyword = ref('')
const examList = ref<any[]>([])
const totalExams = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const createDialogVisible = ref(false)
const createForm = ref({
    title: '',
    startTime: '',
    duration: 60,
    totalScore: 100,
    questions: [] as any[]
})
const createRules = {
    title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }],
    totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }]
}
const createFormRef = ref()
const editDialogVisible = ref(false)
const editForm = ref({
    id: '',
    title: '',
    startTime: '',
    duration: 60,
    totalScore: 100,
    questions: [] as any[]
})
const editFormRef = ref()
let editingExamId = ''

// 题目编辑弹窗相关
const questionDialogVisible = ref(false)
const questionDialogMode = ref<'create' | 'edit'>('create')
const questionForm = ref<{
    type: string,
    content: string,
    options: string[],
    answer: string | string[],
    score: number,
    analysis: string,
    order: number
}>({
    type: '单选题',
    content: '',
    options: [],
    answer: '',
    score: 5,
    analysis: '',
    order: 0
})
const questionFormRef = ref()
const questionRules = {
    type: [{ required: true, message: '请选择题型', trigger: 'change' }],
    content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
    score: [{ required: true, message: '请输入分值', trigger: 'blur' }],
    answer: [{ required: true, message: '请设置答案', trigger: 'change' }]
}
let editingQuestionIndex = -1


// 方法
const createNewExam = () => {
    createDialogVisible.value = true
    createForm.value = { title: '', startTime: '', duration: 60, totalScore: 100, questions: [] }
}

const refreshData = async () => {
    await fetchExamList()
}
const changeQuestionType = (type: string) => {
    if (type === '多选题') {
        questionForm.value.answer = []
    } else {
        questionForm.value.answer = ''
    }
}

const fetchExamList = async () => {
    loading.value = true
    try {
        const searchParams = new URLSearchParams();

        if (activeTab.value !== 'all') searchParams.append('status', activeTab.value);
        if (searchKeyword.value) searchParams.append('keyword', searchKeyword.value);
        searchParams.append('page', currentPage.value.toString());
        searchParams.append('size', pageSize.value.toString());

        const url = `/api/exams/teacher/course/${courseId}?${searchParams.toString()}`;
        const res = await customFetch(url);
        const response = await res.json()
        if (!response || response.code !== 200) {
            ElMessage.error('获取考试列表失败')
            return
        }
        examList.value = response.data?.records.map((s: any) => {
            return {
                ...s,
                status: s.examStatus
            }
        }) || []
        totalExams.value = response.data?.total || 0

    } catch (error) {
        console.error('获取考试列表失败：', error)
        ElMessage.error('获取考试列表失败')
    } finally {
        loading.value = false
    }
}

const handleTabChange = () => {
    fetchExamList()
}

const handleSearch = () => {
    fetchExamList()
}

const getStatusTagType = (status: string) => {
    switch (status) {
        case 'pending': return 'warning'
        case 'ongoing': return 'primary'
        case 'completed': return 'success'
        default: return 'info'
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'pending': return '待开始'
        case 'ongoing': return '进行中'
        case 'completed': return '已完成'
        default: return '未知'
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#E6A23C'
        case 'ongoing': return '#409EFF'
        case 'completed': return '#67C23A'
        default: return '#909399'
    }
}

const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('zh-CN')
}
const publishExam = async (exam: any) => {
    await ElMessageBox.confirm(

        `确定要发布考试"${exam.title}"吗？`,
        '确认发布',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        // 调用后端接口
        const res = await customFetch(`/api/exams/teacher/${exam.id}/publish`, {
            method: 'PUT'
        })
        const response = await res.json()
        if (response.code === 200) {
            ElMessage.success('发布成功')
            await fetchExamList()
        } else {
            ElMessage.error(response.msg || '发布失败')
        }
    }).catch(() => {
        // 用户取消发布
    })
}

const viewExamResults = (exam: any) => {
    router.push(`/exam/teacher/results/${exam.id}?courseId=${courseId}`)
}

const editExam = async (exam: any) => {
    editingExamId = exam.id
    editForm.value = {
        id: exam.id,
        title: exam.title,
        startTime: exam.startTime ? (typeof exam.startTime === 'string' ? exam.startTime : new Date(exam.startTime).toISOString()) : '',
        duration: exam.duration,
        totalScore: exam.totalScore,
        questions: exam.questions || []
    }
    await fetchQuestions(editingExamId)
    editDialogVisible.value = true
}

const deleteExam = async (exam: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除考试"${exam.title}"吗？此操作不可恢复。`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        // 调用后端接口
        const res = await customFetch(`/api/exams/teacher/${exam.id}`, {
            method: 'DELETE'
        })
        const response = await res.json()
        if (response.code === 200) {
            ElMessage.success('删除成功')
            await fetchExamList()
        } else {
            ElMessage.error(response.msg || '删除失败')
        }
    } catch {
        // 用户取消删除
    }
}

const submitCreateExam = () => {
    createFormRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        const questions = createForm.value.questions.map((q: any) => {
            return transformQuestion(q)
        })
        try {
            const payload = {
                ...createForm.value,
                questions: questions,
                startTime: new Date(createForm.value.startTime).getTime()
            }
            const res = await customFetch(`/api/exams/teacher/course/${courseId}/create`, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            const response = await res.json()
            if (response.code === 200) {
                ElMessage.success('创建成功')
                createDialogVisible.value = false
                fetchExamList()
            } else {
                ElMessage.error(response.msg || '创建失败')
            }
        } catch (e) {
            ElMessage.error('创建失败')
        }
    })
}
const fetchQuestions = async (examId: string) => {
    const res = await customFetch(`/api/exams/teacher/${examId}/questions`)
    const response = await res.json()
    if (response.code === 200) {
        if (response.data) {
            if (response.data.length > 0) {
                let index = 0
                editForm.value.questions = response.data.map((q: any) => {
                    if (q.type === '多选题') {
                        const a = [...q.answer]
                        const op = q.options.map((o: any) => o.content)
                        const answer = a.map((e: any) => {
                            return op[e.charCodeAt(0) - 65]
                        })
                        return {
                            ...q,
                            answer: answer,
                            options: op,
                            order: index++
                        }
                    } else if (q.type === '单选题') {
                        const op = q.options.map((o: any) => o.content)
                        const answer = op[q.answer.charCodeAt(0) - 65]
                        return {
                            ...q,
                            answer: answer,
                            options: op,
                            order: index++
                        }
                    } else if (q.type === '判断题') {
                        const op = q.options.map((o: any) => o.content)
                        const answer = q.answer === 'A' ? true : false
                        return {
                            ...q,
                            answer: answer,
                            options: op,
                            order: index++
                        }
                    } else {
                        return {
                            ...q,
                            order: index++
                        }
                    }
                })
                console.log(editForm.value.questions)
            }
        }
    } else {
        ElMessage.error(response.msg || '获取题目失败')
    }
}
const submitEditExam = () => {
    editFormRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        const questions = editForm.value.questions.map((q: any) => {
            return transformQuestion(q)
        })
        try {
            const payload = {
                ...editForm.value,
                questions: questions,
                startTime: new Date(editForm.value.startTime).getTime()
            }
            const res = await customFetch(`/api/exams/teacher/${editingExamId}/edit`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
            const response = await res.json()
            if (response.code === 200) {
                ElMessage.success('编辑成功')
                editDialogVisible.value = false
                fetchExamList()
            } else {
                ElMessage.error(response.msg || '编辑失败')
            }
        } catch (e) {
            ElMessage.error('编辑失败')
        }
    })
}

function addQuestion(mode: 'create' | 'edit') {
    questionDialogMode.value = 'create'
    questionForm.value = {
        type: '单选题',
        content: '',
        options: [],
        answer: '',
        score: 5,
        analysis: '',
        order: (mode === 'create' ? createForm.value.questions.length : editForm.value.questions.length) + 1
    }
    editingQuestionIndex = -1
    questionDialogVisible.value = true
}

function editQuestion(index: number, mode: 'create' | 'edit') {
    questionDialogMode.value = 'edit'
    const q = mode === 'create' ? createForm.value.questions[index] : editForm.value.questions[index]
    questionForm.value = JSON.parse(JSON.stringify(q))
    editingQuestionIndex = index
    questionDialogVisible.value = true
}

function removeQuestion(index: number, mode: 'create' | 'edit') {
    if (mode === 'create') createForm.value.questions.splice(index, 1)
    else editForm.value.questions.splice(index, 1)
}

function addOption() {
    questionForm.value.options.push('')
}

function removeOption(idx: number) {
    questionForm.value.options.splice(idx, 1)
}
function transformQuestion(question: any) {
    if (question.type === "多选题") {
        const finalAnswer: Set<string> = new Set<string>()
        const a = question.answer as string[]
        const o = question.options
        a.forEach(e => {
            const i = o.indexOf(e)
            if (i !== -1) {
                finalAnswer.add(String.fromCharCode(64 + i + 1))
            }
        });
        return { ...question, answer: Array.from(finalAnswer).sort().join('') }
    } else if (question.type === "单选题") {
        let finalAnswer = ''
        const i = question.options.indexOf(question.answer as string)
        if (i !== -1) {
            finalAnswer = String.fromCharCode(64 + i + 1)
        }
        return { ...question, answer: finalAnswer }
    } else if (question.type === "判断题") {
        question.options = ["正确", "错误"]
        return { ...question, answer: question.answer ? "A" : "B" }
    } else {
        return question
    }
}
function submitQuestion() {
    questionFormRef.value.validate((valid: boolean) => {
        if (!valid) return
        if (questionDialogMode.value === 'create') {
            /*if (questionForm.value.type === "多选题") {
                const finalAnswer: Set<string> = new Set<string>()
                const a = questionForm.value.answer as string[]
                const o = questionForm.value.options
                a.forEach(e => {
                    const i = o.indexOf(e)
                    if (i !== -1) {
                        finalAnswer.add(String.fromCharCode(64 + i + 1))
                    }
                });
                createForm.value.questions.push({ ...questionForm.value, answer: Array.from(finalAnswer).sort().join(''), order: createForm.value.questions.length + 1 })
            } else if (questionForm.value.type === "单选题") {
                let finalAnswer = ''
                const i = questionForm.value.options.indexOf(questionForm.value.answer as string)
                if (i !== -1) {
                    finalAnswer = String.fromCharCode(64 + i + 1)
                }
                createForm.value.questions.push({ ...questionForm.value, answer: finalAnswer, order: createForm.value.questions.length + 1 })
            } else if (questionForm.value.type === "判断题") {
                questionForm.value.options = ["正确", "错误"]
                createForm.value.questions.push({ ...questionForm.value, answer: questionForm.value.answer ? "A" : "B", order: createForm.value.questions.length + 1 })
            } else {
                createForm.value.questions.push({ ...questionForm.value, order: createForm.value.questions.length + 1 })
            }*/
            createForm.value.questions.push({ ...questionForm.value, order: createForm.value.questions.length + 1 })
        } else if (editingQuestionIndex !== -1) {
            /*if (questionForm.value.type === "多选题") {
                const finalAnswer: Set<string> = new Set<string>()
                const a = questionForm.value.answer as string[]
                const o = questionForm.value.options
                a.forEach(e => {
                    const i = o.indexOf(e)
                    if (i !== -1) {
                        finalAnswer.add(String.fromCharCode(64 + i + 1))
                    }
                });
                editForm.value.questions[editingQuestionIndex] = { ...questionForm.value, answer: Array.from(finalAnswer).sort().join(''), order: createForm.value.questions.length + 1 }
            } else if (questionForm.value.type === "单选题") {
                let finalAnswer = ''
                const i = questionForm.value.options.indexOf(questionForm.value.answer as string)
                if (i !== -1) {
                    finalAnswer = String.fromCharCode(64 + i + 1)
                }
                editForm.value.questions[editingQuestionIndex] = { ...questionForm.value, answer: finalAnswer, order: createForm.value.questions.length + 1 }
            } else if (questionForm.value.type === "判断题") {
                questionForm.value.options = ["正确", "错误"]
                editForm.value.questions[editingQuestionIndex] = { ...questionForm.value, answer: questionForm.value.answer ? "A" : "B", order: createForm.value.questions.length + 1 }
            } else {
                editForm.value.questions[editingQuestionIndex] = { ...questionForm.value, order: createForm.value.questions.length + 1 }
            }*/
            editForm.value.questions[editingQuestionIndex] = { ...questionForm.value, order: createForm.value.questions.length + 1 }

        }
        questionDialogVisible.value = false
    })
}

onMounted(() => {
    fetchExamList()
})
</script>

<style scoped>
.teacher-exam-list-container {
    min-height: 100vh;
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

.circle-3 {
    width: 100px;
    height: 100px;
    top: 30%;
    left: 60%;
    animation-delay: 4s;
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

.teacher-exam-list-content {
    position: relative;
    z-index: 1;
    padding: 20px;
    max-width: 1200px;
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

.filter-card {
    margin-bottom: 20px;
    border-radius: 12px;
}

.filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 5px;
}

.exam-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.exam-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
}

.exam-card {
    border-radius: 12px;
    transition: all 0.3s ease;
}

.exam-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.exam-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.exam-title {
    margin: 0 0 10px 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.exam-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.exam-details {
    margin-bottom: 20px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 14px;
}

.detail-label {
    font-weight: 500;
}

.detail-value {
    color: #303133;
}

.exam-stats {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
}

.stats-row {
    display: flex;
    justify-content: space-around;
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-bottom: 5px;
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #409eff;
}

.exam-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .teacher-exam-list-content {
        padding: 15px;
    }

    .page-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .filter-section {
        flex-direction: column;
        align-items: stretch;
    }

    .exam-cards {
        grid-template-columns: 1fr;
    }

    .exam-actions {
        flex-direction: column;
    }
}

.mb-2 {
    margin-bottom: 12px;
}
</style>