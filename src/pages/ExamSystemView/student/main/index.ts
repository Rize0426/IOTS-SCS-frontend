/**
 * 考试系统核心模块
 * 包含考试系统的数据结构定义、状态管理和核心功能实现
 */
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Position,
  Timer,
  List,
  Menu,
  Promotion,
  Trophy,
  Medal,
  Star,
  Warning,
  Clock,
  Calendar,
  User,
  Document,
  Close,
  Reading,
  Printer,
  Download,
  Right,
  Monitor,
  Lock,
  TopLeft
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { customFetch } from '../../../../api/customFetch'
import router from '../../../../router'
import { formatAIOutput } from '../../../../utils/aiResponseFormat'
// 工具函数
/**
 * 根据题目类型获取题目图标
 * @param type 题目类型
// 数据结构定义
/**
 * 选项接口定义
 */
/**
 * 选项接口定义
 * 表示题目的一个选项
 */
export interface Option {
  optionId: string // 选项标签
  content: string // 选项文本
}

/**
 * 题目类型定义
 * 支持单选题、多选题、判断题、填空题和解答题五种类型
 */
export type QuestionType = '单选题' | '多选题' | '判断题' | '填空题' | '解答题'

/**
 * 题目接口定义
 * 表示一道考试题目的完整信息
 */
export interface Question {
  questionId: string     // 题目唯一标识
  type: QuestionType     // 题目类型
  content: string        // 题目内容
  options: Option[]      // 题目选项列表
  answer?: string        // 标准答案
  score: number          // 题目分数
  analysis?: string      // 题目解析
  difficulty?: string    // 题目难度
  tags?: string[]        // 题目标签
}

/**
 * 试卷接口定义
 * 表示一份完整的考试试卷
 */
export interface Paper {
  id: string             // 试卷唯一标识
  title: string          // 试卷标题
  description: string    // 试卷描述
  questions: Question[]  // 试卷包含的题目列表
  duration: number       // 考试时长（分钟）
  startTime: Date        // 考试开始时间
  createTime: Date       // 试卷创建时间
  totalScore: number     // 试卷总分
}

/**
 * 考试信息接口定义
 * 包含试卷信息和学生答题情况
 */
export interface Exam {
  paper: Paper           // 考试试卷
  answers: Answers[]     // 用户答案列表
  submit: boolean        // 是否已提交
  start: boolean         // 是否已开始考试
  submitTime?: Date      // 提交时间
  courseName?: string    // 课程名称
  totalScore?: number    // 学生总分
}

/**
 * 答案接口定义
 * 表示学生对一道题目的作答
 */
export interface Answers {
  questionId: string     // 题目ID
  answer: string         // 用户答案
  score?: number         // 得分
}

/**
 * 答案映射接口
 * 用于快速查找和更新用户答案
 */
interface AnswerMap {
  [key: string]: string | string[]; // 键为题目ID，值为用户答案（字符串或字符串数组）
}
// 状态定义
const paperId = ref('')

export const initPaperId = (route: any) => {
  // 从路由参数获取试卷ID
  paperId.value = route.params.paperId
}

/**
 * 是否初始化
 */
export const isInit = ref(false)
/**
 * 当前显示的题目索引
 * 用于控制当前显示哪一道题目
 */
export const currentQuestionIndex = ref(0)

/**
 * 核心状态变量
 */
/**
 * 当前考试信息
 * 包含试卷信息和学生答题情况
 */
export const exam = ref<Exam | null>(null)

/**
 * 考试剩余时间（秒）
 * 默认为60分钟（3600秒）
 */
export const timeRemaining = ref(60 * 60)

/**
 * 考试计时器引用
 * 用于控制和清除计时器
 */
export const examTimer = ref<number | null>(null)

/**
 * 是否显示提交确认对话框
 */
export const showSubmitDialog = ref(false)

/**
 * 数据加载状态
 */
export const loading = ref(false)

/**
 * AI评分加载状态
 */
export const aiScoreLoading = ref(false)

/**
 * AI评分结果
 */
export const aiScoreSuccess = ref(false)
/**
 * 是否已经评过分
 */
export const hasScored = ref(true)
/**
 * 从exam派生的计算属性
 */

/**
 * 当前考试试卷
 */
export const examPaper = computed(() => exam.value?.paper as Paper || null)

/**
 * 考试时长（分钟）
 */
export const examDuration = computed(() => examPaper.value?.duration || 60)

/**
 * 试卷题目列表
 */
export const questions = computed(() => examPaper.value?.questions || [])

/**
 * 用户答案映射
 * 键为题目ID，值为用户答案
 */
export const answers = ref<AnswerMap>({})

/**
 * 考试是否已开始
 */
export const started = ref(exam.value?.start || false)

/**
 * 考试是否已提交
 */
export const submitted = ref(exam.value?.submit || false)

/**
 * 课程名称
 */
export const courseName = computed(() => exam.value?.courseName || '')

/**
 * 考试提交时间
 */
export const submitTime = computed(() => exam.value?.submitTime && new Date(exam.value.submitTime) || null)

/**
 * 考试总分
 */
export const totalScore = computed(() => exam.value?.totalScore || 0)
/**
 * 考试使用时间
 */
export const usedTime = computed(() => {
  if (!exam.value || !exam.value.start || !exam.value.submitTime) return 0
  const start = new Date(exam.value.paper.startTime)
  const end = new Date(exam.value.submitTime)
  if (end.getTime() < start.getTime()) return 0 // 如果提交时间早于开始时间，返回0
  return Math.round((end.getTime() - start.getTime()) / 1000) // 返回秒数
})
/**
 * 考试描述
 */
export const examDescription = computed(() => examPaper.value?.description || '')
/**
 * 其他计算属性
 */

/**
 * 考试标题
 * 如果没有标题则显示"考试"
 */
export const examTitle = computed(() => examPaper.value?.title || '考试')

/**
 * 试卷总题目数
 */
export const totalQuestions = computed(() => questions.value.length)

/**
 * 当前显示的题目
 * 根据currentQuestionIndex获取当前题目
 */
export const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

/**
 * 考试开始时间
 */
export const startTime = computed(() => new Date(examPaper.value?.startTime) || new Date())

/**
 * 考试结束时间
 * 根据开始时间和考试时长计算
 */
export const endTime = computed(() => {
  if (!examPaper.value) return new Date()
  // 计算结束时间
  const end = new Date(examPaper.value.startTime)
  return new Date(end.getTime() + examPaper.value.duration * 60 * 1000)
})

/**
 * 答题进度百分比
 * 已答题数量/总题目数量
 */
export const progressPercentage = computed(() =>
  Math.round((Object.keys(answers.value).length / totalQuestions.value) * 100)
)

/**
 * 进度条颜色
 * 根据完成进度显示不同颜色
 * <30%: 灰色, <70%: 黄色, >=70%: 绿色
 */
export const progressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage < 30) return '#909399'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
})

/**
 * 格式化后的剩余时间
 * 格式为"分钟:秒钟"，如"05:30"
 */
export const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * 时间是否紧急（剩余时间少于10分钟）
 */
export const isTimeCritical = computed(() => timeRemaining.value <= 600) // 10分钟

/**
 * 已答题数量
 */
export const answeredCount = computed(() => Object.keys(answers.value).length)

/**
 * 未答题数量
 */
export const unansweredCount = computed(() => totalQuestions.value - answeredCount.value)

/**
 * 退出确认对话框是否可见
 */
export const exitDialogVisible = ref(false)

export const aiAnalysises = ref<Record<string, string>>({})
/**
 * 题目类型对应的标签样式
 * 不同题型显示不同颜色的标签
 */
export const questionTypeTag = computed(() => {
  if (!currentQuestion.value) return 'info'

  switch (currentQuestion.value.type) {
    case '单选题': return 'primary'
    case '多选题': return 'warning'
    case '判断题': return 'success'
    case '填空题': return 'danger'
    case '解答题': return 'info'
    default: return 'info'
  }
})
/**
 * 倒计时相关
 */

/**
 * 距离考试开始的剩余时间
 * 格式化为天、小时、分钟、秒
 */
export const timeLeft = computed(() => {
  if (exam.value?.start) return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  }
  // 计算时间差（秒）
  const diff = totalSecondsLeft.value

  if (diff <= 0) {
    // 如果结束时间小于等于当前时间，返回全 0
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  // 计算天数、小时数、分钟数和秒数
  const seconds = Math.floor(diff) % 60;
  const minutes = Math.floor(diff / 60) % 60;
  const hours = Math.floor(diff / (60 * 60)) % 24;
  const days = Math.floor(diff / (60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds
  };
})

/**
 * 距离考试开始的总秒数
 */
export const totalSecondsLeft = ref(0)

/**
 * 是否可以进入考试
 * 当倒计时结束时可以进入考试
 */
export const canEnterExam = computed(() => {
  return totalSecondsLeft.value <= 0
})

// 格式化时间
export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}
/**
 * 格式化日期时间
 * 将Date对象格式化为本地日期时间字符串
 * @param date 要格式化的日期
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | undefined | null) => {
  if (!date) return ''
  // 使用toLocaleString格式化为中文日期时间
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 考试开始倒计时定时器
 */
const startExamTimer = ref<number | null>(null)

/**
 * 是否正在进入考试
 * 用于控制进入考试按钮的加载状态
 */
export const enteringExam = ref(false)

/**
 * 切屏次数
 * 用于防作弊，记录用户切换窗口或标签页的次数
 */
export const switchCount = ref(0)

/**
 * 处理页面可见性变化
 * 当页面隐藏时增加切屏计数，超过限制次数自动提交考试
 */
function handleVisibilityChange() {
  if (document.hidden) {
    switchCount.value++
  }
  if (switchCount.value > 5) {
    ElMessage.error('切屏次数过多，系统将自动提交考试')
    finalSubmit()
  }
}

/**
 * 进入考试
 * 设置加载状态并获取试卷信息
 */
export const enterExam = async () => {
  enteringExam.value = true
  await fetchExamPaper()
  enteringExam.value = false
}

/**
 * 最终提交考试
 * 停止计时器，提交答案，获取AI评分，并清理事件监听
 */
export const finalSubmit = async () => {
  if (examTimer.value !== null) {
    clearInterval(examTimer.value)
  }
  // 提交考试
  try {
    const response = await customFetch(`/api/exams/${examPaper.value?.id}`, {
      method: 'POST',
    })
    const data = await response.json()
    if (!data || data.code != 200) {
      ElMessage.error('提交考试失败')
      return
    }
    ElMessage.success('提交成功')
    submitted.value = true
    // 跳转结果页
    router.push(`/exam/result/${paperId.value}`)
    // 关闭对话框
    showSubmitDialog.value = false
    // 清理切屏事件监听
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    // 退出全屏模式
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
    const mainHeader = document.getElementById('main-head');
    if (mainHeader) {
      mainHeader.removeAttribute('style');
    }
    const mainFooter = document.getElementById('main-foot');
    if (mainFooter) {
      mainFooter.removeAttribute('style');
    }
    // 获取AI评分
    await aiScore()
  } catch (error: any) {
    console.error('提交考试失败:', error)
    ElMessage.error(`提交考试失败: ${error.message}`)
  }
}

/**
 * 初始化考试系统
 * 获取试卷信息
 */
export const init = async (route: any) => {
  initPaperId(route)
  isInit.value = true
  await fetchExamPaper()
}

/**
 * 获取试卷信息
 * 从服务器获取试卷数据并初始化考试状态
 */
const fetchExamPaper = async () => {
  loading.value = true
  try {
    const response = await customFetch(`/api/exams/${paperId.value}`)
    const data = await response.json()
    if (!data || data.code != 200) {
      ElMessage.error('获取试卷信息失败')
      return
    }
    // 更新考试数据
    exam.value = data.data as Exam
    if (exam.value.answers) {
      // 将答案数组转换为答案映射，方便查询和更新
      answers.value = exam.value.answers.reduce((acc: AnswerMap, answer) => {
        if (exam.value?.paper.questions.find(q => q.questionId === answer.questionId)?.type === '多选题') {
          acc[answer.questionId] = [...answer.answer]
        } else {
          acc[answer.questionId] = answer.answer
        }
        return acc
      }, {})
    }
    started.value = exam.value.start
    submitted.value = exam.value.submit

    // 如果考试未开始，设置倒计时
    if (!started.value) {
      if (!window.location.href.includes('/exam/paper')) {
        router.push(`/exam/paper/${paperId.value}`)
      }
      document.title = "等待考试..."
      const now = new Date()
      const start = new Date(exam.value.paper.startTime)
      totalSecondsLeft.value = (start.getTime() - now.getTime()) / 1000
      startExamTimer.value = window.setInterval(() => {
        totalSecondsLeft.value--;
        if (totalSecondsLeft.value <= 0) {
          if (startExamTimer.value != null) {
            clearInterval(startExamTimer.value);
          }
        }
      }, 1000)
    }

    // 如果考试已开始但未提交，设置考试环境
    if (started.value && !submitted.value) {
      if (!window.location.href.includes('/exam/paper')) {
        router.push(`/exam/paper/${paperId.value}`)
      }
      // 进入全屏模式
      const el = document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen()
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen()
      }
      // 监听切屏事件（防作弊）
      document.addEventListener('visibilitychange', handleVisibilityChange)
      // 根据考试时长设置倒计时
      const now = new Date()
      const start = new Date(exam.value.paper.startTime)
      timeRemaining.value = Math.round(start.getTime() / 1000 + examDuration.value * 60 - now.getTime() / 1000)
      startTimer()
    }
    // 如果考试已提交，清理计时器
    if (submitted.value) {
      hasScored.value = exam.value.totalScore !== -1
      aiScoreSuccess.value = true
      if (!window.location.href.includes('/exam/result')) {
        router.push(`/exam/result/${paperId.value}`)
      }
    }
  } catch (error: any) {
    console.error('获取试卷信息失败:', error)
    ElMessage.error(`获取试卷信息失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

/**
 * 启动考试计时器
 * 每秒减少剩余时间，时间到后自动提交
 */
const startTimer = () => {
  // 清除可能存在的旧计时器
  if (examTimer.value !== null) {
    clearInterval(examTimer.value)
  }

  examTimer.value = window.setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      if (examTimer.value !== null) {
        clearInterval(examTimer.value)
      }
      showTimeUpNotification()
      setTimeout(() => {
        showSubmitConfirm()
      }, 3000)
    }
  }, 1000)
}

/**
 * 显示考试时间结束通知
 * 提醒用户考试时间已到
 */
const showTimeUpNotification = () => {
  ElMessage({
    message: '考试时间到！系统将自动提交您的答案',
    type: 'warning',
    duration: 5000
  })
}

/**
 * 跳转到指定题目
 * @param index 题目索引
 */
export const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index
}

/**
 * 跳转到上一题
 * 如果当前已是第一题则不操作
 */
export const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

/**
 * 跳转到下一题
 * 如果当前已是最后一题则不操作
 */
export const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

/**
 * 处理答案变更
 * 当用户修改答案时自动保存
 */
export const handleAnswerChange = () => {
  // 自动保存答案
  saveCurrentAnswer()
}

/**
 * 保存当前题目的答案
 * 将用户答案提交到服务器
 */
export const saveCurrentAnswer = async () => {
  if (!currentQuestion.value) return

  try {
    const response = await customFetch(`/api/exams/${examPaper.value?.id}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        questionId: currentQuestion.value.questionId,
        answer: currentQuestion.value.type === '多选题'
          ? ([...answers.value[currentQuestion.value.questionId]].sort().join('')) : answers.value[currentQuestion.value.questionId]
      })
    })
    const data = await response.json()
    if (!data || data.code != 200) {
      ElMessage.error('保存答案失败')
      return
    }
    ElMessage.success('保存答案成功')
  } catch (error: any) {
    console.error('保存答案失败:', error)
    ElMessage.error(`保存答案失败: ${error.message}`)
  }
}

/**
 * 显示提交确认对话框
 * 用于确认用户是否要提交考试
 */
export const showSubmitConfirm = () => {
  showSubmitDialog.value = true
}

/**
 * AI评分功能
 * 调用AI接口对主观题进行自动评分
 */
export const aiScore = async () => {
  try {
    aiScoreLoading.value = true

    const aiRes = await customFetch(`/api/exams/${examPaper.value?.id}/ai-score`)
    const aiData = await aiRes.json()
    if (!aiData || aiData.code != 200) {
      ElMessage.error('获取AI评分失败')
      return
    }
    ElMessage.success('获取AI评分成功')
    exam.value = aiData.data as Exam
    aiScoreSuccess.value = true
    hasScored.value = true
    if (exam.value.answers) {
      // 将答案数组转换为答案映射，方便查询和更新
      answers.value = exam.value.answers.reduce((acc: AnswerMap, answer) => {
        if (exam.value?.paper.questions.find(q => q.questionId === answer.questionId)?.type === '多选题') {
          acc[answer.questionId] = [...answer.answer]
        } else {
          acc[answer.questionId] = answer.answer
        }
        return acc
      }, {})
    }
  } catch (error) {
    ElMessage.error(`获取AI评分失败: ${error}`)
    aiScoreSuccess.value = false
  } finally {
    aiScoreLoading.value = false
  }
}

/**
 * 获取导航按钮类型
 * @param index 题目索引
 * @returns 按钮类型
 * - primary: 当前选中的题目
 * - success: 已作答的题目
 * - '': 未作答的题目
 */
export const getNavButtonType = (index: number): '' | 'primary' | 'success' => {
  if (index === currentQuestionIndex.value) {
    return 'primary'
  }

  const question = questions.value[index]
  const hasAnswer = answers.value[question.questionId] !== undefined &&
    answers.value[question.questionId] !== null &&
    answers.value[question.questionId] !== ''

  return hasAnswer ? 'success' : ''
}
// 获取分数颜色
export const getScoreColor = (score: number) => {
  score = Math.round(score / (examPaper.value.totalScore / 100))
  if (score >= 90) return '#67C23A'
  if (score >= 80) return '#E6A23C'
  if (score >= 60) return '#409EFF'
  return '#F56C6C'
}

// 获取等级类型
export const getGradeType = (score: number) => {
  score = Math.round(score / (examPaper.value.totalScore / 100))
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

// 获取等级文本
export const getGradeText = (score: number) => {
  score = Math.round(score / (examPaper.value.totalScore / 100))
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '不及格'
}

// 获取评语
export const getEvaluationText = (score: number) => {
  score = Math.round(score / (examPaper.value.totalScore / 100))
  if (score >= 90) return '恭喜您！成绩优异，继续保持！'
  if (score >= 80) return '成绩良好，还有进步空间，继续努力！'
  if (score >= 60) return '成绩及格，建议加强薄弱知识点的学习。'
  return '成绩不理想，建议重新学习相关知识点并多加练习。'
}

// 获取题目类型颜色
export const getQuestionTypeColor = (type: string) => {
  switch (type) {
    case '单选题': return 'primary'
    case '多选题': return 'warning'
    case '判断题': return 'success'
    case '填空题': return 'danger'
    case '解答题': return 'info'
    default: return 'info'
  }
}

// 获取难度颜色
export const getDifficultyColor = (difficulty: string | undefined) => {
  if (!difficulty) {
    return 'info'
  }
  const colors: Record<string, string> = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return colors[difficulty] || 'info'
}
// 判断用户是否选择了某个选项
export const isUserSelected = (question: Question, optionId: string) => {
  const userAnswer = answers.value[question.questionId]
  if (!userAnswer) {
    return false
  }
  if (Array.isArray(answers.value[question.questionId])) {
    return userAnswer.includes(optionId)
  }
  return userAnswer == optionId
}

// 判断是否为正确选项
export const isCorrectOption = (question: Question, optionId: string) => {
  return question.answer?.includes(optionId)
}
// 退出考试
export const exitExam = () => {
  router.push('/')
}

export const handleExitDialogClose = () => {
  exitDialogVisible.value = false
}

export const confirmExit = () => {
  exitDialogVisible.value = false
  // TODO 跳转其他页面
  // router.push('/')
}
export const aiAnalysising = ref(false)
export const handleAIAnalysis = async (questionId: string) => {
  aiAnalysises.value[questionId] = ''
  aiAnalysising.value = true
  // 固定AI分析区域的最大宽度
  const question = document.getElementById(`question-${questionId}`)
  if (question) {
    const aiAnalysisContainer = document.querySelector('.ai-analysis') as HTMLElement
    if (aiAnalysisContainer) {
      aiAnalysisContainer.style.maxWidth = question.offsetWidth + 'px'
    }
  }
  try {
    // 创建AbortController用于取消请求
    const controller = new AbortController();
    const signal = controller.signal;

    // 发送fetch请求
    const response = await customFetch(`/api/ai/analysis/exam/${paperId.value}/${questionId}`, {
      method: 'GET',
      signal: signal
    });

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      // 读取数据块
      const { done, value } = await reader.read();

      if (done) {
        console.log(aiAnalysises.value[questionId])
        aiAnalysises.value[questionId] = formatAIOutput(aiAnalysises.value[questionId]);
        ElMessage.success('AI分析完成');
        break;
      }
      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true });

      // 更新数据 (使用nextTick确保UI更新)
      aiAnalysises.value[questionId] += chunk;
    }
  } catch (error) {
    ElMessage.error(`AI分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    aiAnalysising.value = false;
  }
}
/**
 * 导出Element Plus图标组件
 * 用于考试系统界面的图标显示
 */
export {
  ArrowLeft,    // 上一题
  ArrowRight,   // 下一题
  Check,        // 完成/确认
  Position,     // 定位/题目导航
  Timer,        // 计时器
  List,         // 列表
  Menu,         // 菜单
  Promotion,   // 提示
  Trophy,      // 奖杯
  Medal,      // 奖牌
  Star,       // 星星
  Warning,    // 警告
  Clock,      // 时钟
  Calendar,   // 日历
  User,       // 用户
  Document,   // 文档
  Close,      // 关闭
  Reading,    // 阅读
  Printer,    // 打印机
  Download,   // 下载
  Right,      // 右
  Monitor,    // 监视器
  Lock,       // 锁
  TopLeft
}