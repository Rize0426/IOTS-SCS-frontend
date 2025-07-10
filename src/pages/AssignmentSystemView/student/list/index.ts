import { ref, onMounted, onUnmounted } from 'vue'
import {
  List,
  Clock,
  Upload,
  Check,
  Warning,
  Search,
  Timer,
  User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { customFetch } from '../../../../api/customFetch';
import router from '../../../../router';
import { useRoute } from 'vue-router';

interface Assignment {
  /**
   * 作业唯一标识符
   */
  assignmentId: number;
  /**
   * 所属课程ID
   */
  courseId: number;
  /**
   * 所属课程名称
   */
  courseName: string;
  /**
   * 发布教师ID
   */
  teacherId: number;
  /**
   * 发布教师名称
   */
  teacherName: string;
  /**
   * 作业标题
   */
  title: string;
  /**
   * 截止日期
   */
  endDate: Date;
  /**
   * 作业状态
   */
  status: string;
  /**
   * 作业总分
   */
  score: number;
  /**
   * 最终提交时间
   */
  submitTime: Date | null;
}

export default function useAssignmentList(courseId:number) {
  // 响应式数据
  const activeTab = ref('all')
  const searchKeyword = ref('')
  const selectedCourse = ref('全部')
  const sortBy = ref<string>('endDate')
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(6)

  // 课程列表
  const courses = ref<string[]>(["全部"])

  // 作业数据
  const assignmentList = ref<Assignment[]>([])

  const totalAssignments = ref<number>(0)

  // 定时器
  let countdownTimer: number | null = null

  const fetchAssignments = async () => {
    loading.value = true
    try {
      const courseName = selectedCourse.value === '全部' ? '' : selectedCourse.value
      const title = searchKeyword.value
      const status = activeTab.value === 'all' ? '' : activeTab.value
      const response = await customFetch(`/api/assignments?page=${currentPage.value}&size=${pageSize.value}&courseId=${courseId}&courseName=${courseName}&title=${title}&status=${status}&sort=${sortBy.value}`)
      const data = await response.json()
      if (!data || data.code !== 200) {
        ElMessage.error('获取作业列表失败')
        return
      }
      assignmentList.value = data.data.list
      assignmentList.value.forEach(a => {
        a.endDate = new Date(a.endDate)
        if (a.submitTime) {
          a.submitTime = new Date(a.submitTime)
        }
      })
      totalAssignments.value = data.data.total
      courses.value = ['全部', ...new Set(assignmentList.value.map(item => item.courseName))]
    } catch (error) {
      ElMessage.error('获取作业列表失败')
    } finally {
      loading.value = false
    }
  }
  // 方法定义
  const handleTabChange = async (tabName: string) => {
    activeTab.value = tabName
    currentPage.value = 1
    await fetchAssignments()
  }

  const handleSearch = async () => {
    currentPage.value = 1
    await fetchAssignments()
  }

  const handleCourseFilter = async () => {
    currentPage.value = 1
    await fetchAssignments()
  }

  const handleSort = async () => {
    currentPage.value = 1
    await fetchAssignments()
  }

  const handleSizeChange = async (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    await fetchAssignments()
  }

  const handleCurrentChange = async (page: number) => {
    currentPage.value = page
    await fetchAssignments()
  }

  const refreshData = async () => {
    await fetchAssignments()
  }

  // 获取状态相关样式
  const getStatusTagType = (status: string) => {
    const types: Record<string, string> = {
      '未完成': 'warning',
      '已提交': 'primary',
      '已评分': 'success',
      '已驳回': 'danger'
    }
    return types[status] || 'info'
  }

  const getCourseTagType = () => {
    const types = ['primary', 'success', 'warning', 'danger', 'info']
    return types[Math.floor(Math.random() * types.length)]
  }
  
  const handleRowClick = (row: Assignment) => {
    startAssignment(row)
  }
  
  const getScoreColor = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100
    if (percentage >= 90) return '#67C23A'
    if (percentage >= 80) return '#E6A23C'
    if (percentage >= 60) return '#409EFF'
    return '#F56C6C'
  }

  const getGradeTagType = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100
    if (percentage >= 90) return 'success'
    if (percentage >= 80) return 'warning'
    if (percentage >= 60) return 'info'
    return 'danger'
  }

  const getGradeText = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100
    if (percentage >= 90) return '优秀'
    if (percentage >= 80) return '良好'
    if (percentage >= 60) return '及格'
    return '不及格'
  }

  const isUrgent = (dueDate: Date) => {
    if (!dueDate) {
      return true
    }
    const now = new Date().getTime()
    const due = dueDate.getTime()
    const timeDiff = due - now
    return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0 // 24小时内
  }

  const getCountdown = (dueDate: Date) => {
    const now = new Date().getTime()
    const due = dueDate.getTime()
    const difference = due - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }

  // 格式化日期（简短版本）
  const formatDate = (date: Date) => {
    if (!date) {
      return null
    }
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取紧凑的倒计时显示
  const getCompactCountdown = (dueDate: Date) => {
    const countdown = getCountdown(dueDate)
    if (countdown.days > 0) {
      return `${countdown.days}天${countdown.hours}时`
    } else if (countdown.hours > 0) {
      return `${countdown.hours}时${countdown.minutes}分`
    } else {
      return `${countdown.minutes}分钟`
    }
  }

  // 获取逾期天数
  const getOverdueDays = (dueDate: Date) => {
    if (!dueDate) {
      return 0
    }
    const now = new Date().getTime()
    const due = dueDate.getTime()
    const daysPassed = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
    return daysPassed
  }

  const startAssignment = (assignment: Assignment) => {
    router.push(`/assignment/detail/${assignment.assignmentId}`)
  }

  // 生命周期
  onMounted(async () => {
    document.title="作业列表"
    await fetchAssignments()
    // 启动倒计时定时器
    countdownTimer = setInterval(() => {
      // 强制更新倒计时显示
      assignmentList.value = [...assignmentList.value]
    }, 60000) // 每分钟更新一次
  })

  onUnmounted(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
  })

  return {
    activeTab,
    searchKeyword,
    selectedCourse,
    sortBy,
    loading,
    currentPage,
    pageSize,
    courses,
    assignmentList,
    totalAssignments,
    fetchAssignments,
    handleTabChange,
    handleSearch,
    handleCourseFilter,
    handleSort,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    getStatusTagType,
    getCourseTagType,
    handleRowClick,
    getScoreColor,
    getGradeTagType,
    getGradeText,
    isUrgent,
    getCountdown,
    formatDate,
    getCompactCountdown,
    getOverdueDays,
    startAssignment,
    List,
    Clock,
    Upload,
    Check,
    Warning,
    Search,
    Timer,
    User
  }
}