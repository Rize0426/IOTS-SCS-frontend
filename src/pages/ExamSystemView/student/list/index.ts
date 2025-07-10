import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { customFetch } from '../../../../api/customFetch'
import router from '../../../../router';

/**
 * 考试信息接口
 */
interface Exam {
    /**
     * 考试ID
     */
    id: string;

    /**
     * 考试标题
     */
    title: string;

    /**
     * 开始时间
     */
    startTime: Date;

    /**
     * 考试时长(分钟)
     */
    duration: number;

    /**
     * 课程名称
     */
    courseName: string;

    /**
     * 考试状态
     */
    status: string;

    /**
     * 考试成绩
     */
    score: number;

    /**
     * 答题个数
     */
    answerNum: number;

    /**
     * 题目数量
     */
    questionNum: number;

    /**
     * 正确题目数
     */
    correctNum: number;

    /**
     * 考试总分
     */
    totalScore: number;
}

export default function useExamList(courseId:number) {
    // 响应式数据
    const activeTab = ref<'all' | 'pending' | 'ongoing' | 'completed'>('all')
    const searchKeyword = ref('')
    const selectedCourse = ref('全部')
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(6)

    // 科目列表
    const courses = ref<string[]>(["全部"])

    // 考试数据
    const examList = ref<Exam[]>([])
    const remainTimes = ref<Record<string, number>>({})
    let remainTimer: number = 0

    const totalExams = ref<number>(0)

    // 定时器
    let countdownTimer: number = 0

    // 方法定义
    const fetchExams = async () => {
        loading.value = true

        try {
            const status = activeTab.value === 'all' ? '' : activeTab.value
            const courseName = selectedCourse.value === "全部" ? "" : selectedCourse.value
            const title = searchKeyword.value || ''
            const res = await customFetch(`/api/exams?page=${currentPage.value}&size=${pageSize.value}&courseId=${courseId}&status=${status}&courseName=${courseName}&title=${title}`)
            const data = await res.json()
            if (!data || data.code !== 200) {
                ElMessage.error('获取考试列表失败')
                return
            }
            totalExams.value = data.data.total
            examList.value = data.data.list
            examList.value.forEach(exam => {
                exam.startTime = new Date(exam.startTime)
            })
            courses.value = ["全部", ...new Set(examList.value.map(exam => exam.courseName))]
            examList.value.forEach(exam => {
                if (exam.status === 'ongoing') {
                    remainTimes.value[exam.id] = Math.floor(exam.duration * 60 - (Date.now() - exam.startTime.getTime()) / 1000)
                }
            })
        } catch (err) {
            ElMessage.error('获取考试列表失败')
        } finally {
            loading.value = false
        }
    }

    const handleTabChange = async (tabName: 'all' | 'pending' | 'ongoing' | 'completed') => {
        activeTab.value = tabName
        currentPage.value = 1
        await fetchExams()
    }

    const handleSearch = async () => {
        currentPage.value = 1
        await fetchExams()
    }

    const handleCourseFilter = async () => {
        currentPage.value = 1
        await fetchExams()
    }

    const handleSizeChange = async (size: number) => {
        pageSize.value = size
        currentPage.value = 1
        await fetchExams()
    }

    const handleCurrentChange = async (page: number) => {
        currentPage.value = page
        await fetchExams()
    }

    const refreshData = async () => {
        await fetchExams()
        ElMessage.success('数据已刷新')
    }

    // 获取状态相关样式
    const getStatusTagType = (status: string) => {
        const types: Record<string, string> = {
            pending: 'warning',
            ongoing: 'primary',
            completed: 'success'
        }
        return types[status] || 'info'
    }

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            pending: '待开始',
            ongoing: '进行中',
            completed: '已完成'
        }
        return texts[status] || '未知'
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: '#E6A23C',
            ongoing: '#409EFF',
            completed: '#67C23A'
        }
        return colors[status] || '#909399'
    }

    const getCourseTagType = () => {
        const types: string[] = ['primary', 'success', 'warning', 'danger', 'info']
        return types[Math.floor(Math.random() * types.length)]
    }

    const getScoreColor = (score: number, totalScore: number) => {
        const percentage = (score / totalScore) * 100
        if (percentage >= 90) return '#67C23A'
        if (percentage >= 80) return '#E6A23C'
        if (percentage >= 60) return '#409EFF'
        return '#F56C6C'
    }

    // 时间格式化
    const formatDateTime = (date: Date) => {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatTimeRemaining = (sds: number) => {
        const remaining = sds * 1000

        if (remaining <= 0) {
            return '00:00'
        }
        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)

        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // 倒计时计算
    const getCountdown = (startTime: Date) => {
        const now = new Date().getTime()
        const start = startTime.getTime()
        const difference = start - now

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0 }
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        return { days, hours, minutes }
    }

    // 判断是否可以进入考试
    const canEnterExam = (exam: Exam) => {
        const now = new Date().getTime()
        const start = exam.startTime.getTime()
        return exam.status === 'pending' && now > start - 1000 * 60 * 5
    }

    const enterExam = (exam: Exam) => {
        if (!canEnterExam(exam)) {
            ElMessage.warning('考试尚未开始，请耐心等待')
            return
        }
    }

    const continueExam = (exam: Exam) => {
        ElMessage.info('正在恢复考试...')
        router.push(`/exam/paper/${exam.id}`)
    }

    const viewExamResult = (exam: Exam) => {
        ElMessage.info('正在加载考试成绩...')
        router.push(`/exam/result/${exam.id}`)
    }

    // 生命周期
    onMounted(async () => {
        document.title="考试列表"
        await fetchExams()
        // 启动倒计时定时器
        countdownTimer = setInterval(() => {
            // 更新倒计时显示
            examList.value = [...examList.value]
        }, 60000) // 每分钟更新一次
        remainTimer = setInterval(() => {
            //更新剩余时间显示
            Object.keys(remainTimes.value).forEach(id => {
                remainTimes.value[id] = remainTimes.value[id] - 1
            })
        }, 1000) // 每秒更新一次
    })

    onUnmounted(() => {
        if (countdownTimer) {
            clearInterval(countdownTimer)
        }
        if (remainTimer) {
            clearInterval(remainTimer)
        }
    })

    return {
        activeTab,
        searchKeyword,
        selectedCourse,
        loading,
        currentPage,
        pageSize,
        courses,
        examList,
        remainTimes,
        totalExams,
        fetchExams,
        handleTabChange,
        handleSearch,
        handleCourseFilter,
        handleSizeChange,
        handleCurrentChange,
        refreshData,
        getStatusTagType,
        getStatusText,
        getStatusColor,
        getCourseTagType,
        getScoreColor,
        formatDateTime,
        formatTimeRemaining,
        getCountdown,
        canEnterExam,
        enterExam,
        continueExam,
        viewExamResult
    }
}