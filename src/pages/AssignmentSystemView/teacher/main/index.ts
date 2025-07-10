import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { customFetch } from '../../../../api/customFetch'
import { useRoute } from 'vue-router'

// 定义Submission类型
interface Submission {
  student: {
    studentId: string;
    studentName: string;
    studentClass: string;
    studentAvatar: string;
  };
  submissionId: number;
  submissionNumber: number;
  answerContent: string;
  answersObjectiveJson: string;
  submittedAt: Date;
  attachmentsJson: Array<string>;
  status: string;
  score: number;
  feedback: string;
}

interface SubmissionTreeNode {
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAvatar: string;
  children: Submission[];
}

export default function useStudentSubmissions(route: any) {
  const courseId = route.params.courseId
  const assignmentId = route.params.id

  // 响应式数据
  const loading = ref(false)
  const statusFilter = ref('')
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const submissionDetailVisible = ref(false)
  const selectedStudent = ref<SubmissionTreeNode | null>(null)
  const studentSubmissions = ref<Submission[]>([])
  const totalSize = ref(0)

  // 评分相关
  const gradeDialogVisible = ref(false)
  const currentGradingSubmission = ref<Submission | null>(null)
  const gradeForm = ref({
    score: 0,
    feedback: ''
  })
  const gradeFormRules = {
    score: [
      { required: true, message: '请输入分数', trigger: 'blur' },
      { type: 'number', min: 0, max: 100, message: '分数必须在0-100之间', trigger: 'blur' }
    ],
    feedback: [
      { required: true, message: '请输入评语', trigger: 'blur' }
    ]
  }
  const gradeFormRef = ref()
  const gradeSubmitting = ref(false)

  // 评分弹窗标题，避免模板中 ?. 报错
  const gradeDialogTitle = computed(() => {
    const name = currentGradingSubmission.value && currentGradingSubmission.value.student
      ? currentGradingSubmission.value.student.studentName
      : ''
    return `评分 - ${name || '未知学生'}`
  })

  // 假设后端返回的原始数据
  const rawSubmissions = ref<Submission[]>([])

  // 分组处理为树形结构
  const submissionTree = computed<SubmissionTreeNode[]>(() => {
    const map = new Map<string, SubmissionTreeNode>()
    rawSubmissions.value.forEach(sub => {
      const stu = sub.student
      if (!map.has(stu.studentId)) {
        map.set(stu.studentId, {
          studentId: stu.studentId,
          studentName: stu.studentName,
          studentClass: stu.studentClass,
          studentAvatar: stu.studentAvatar,
          children: []
        })
      }
      map.get(stu.studentId)!.children.push({
        ...sub,
        student: stu
      })
    })
    return Array.from(map.values())
  })

  const fetchSubmissions = async () => {
    loading.value = true
    try {
      const response = await customFetch(`/api/assignments/teacher/submissions/${assignmentId}?page=${currentPage.value}&size=${pageSize.value}&studentKeyWord=${searchKeyword.value}&status=${statusFilter.value}`)
      const data = await response.json()
      if (!data || data.code !== 200) {
        ElMessage.error("获取提交信息列表失败")
        return
      }
      rawSubmissions.value = data.data.list.map((a: any) => {
        return {
          ...a,
          submittedAt: new Date(a.submittedAt),
          attachmentsJson: JSON.parse(a.attachmentsJson),
        }
      })
      totalSize.value = data.data.total
    } catch (error) {
      console.error(error)
      ElMessage.error('获取提交信息列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleStatusFilter = () => {
    currentPage.value = 1
    fetchSubmissions()
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchSubmissions()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    fetchSubmissions()
  }

  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    fetchSubmissions()
  }

  const download = async (attachment: string, tag: string, submissionId: number = 0) => {
    ElMessage.success(`开始下载：${attachment}`)
    try {
      attachment = encodeURIComponent(attachment)
      const response = await customFetch(`/api/assignments/${assignmentId}/download/${tag}?attachment=${attachment}&submissionId=${submissionId}`);

      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'downloaded-file';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('下载失败:', error);
      ElMessage.error('下载失败，请重试')
    }
  }

  const downloadAttachment = (submission: Submission, attachment: string) => {
    download(attachment, 'submission', submission.submissionId)
  }

  const refreshData = () => {
    fetchSubmissions()
  }

  // 获取状态相关样式
  const getSubmissionStatusType = (status: string) => {
    if (status === '已评分') return 'success'
    if (status === '已驳回') return 'danger'
    return 'warning'
  }

  const getSubmissionStatusText = (status: string) => {
    if (status === '已评分') return '已评分'
    if (status === '已驳回') return '已驳回'
    return '未评分'
  }

  // 时间格式化
  const formatDateTime = (date: Date) => {
    if (!date) return ''
    if (typeof (date) === 'string') date = new Date(date)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const viewStudentSubmissions = (studentNode: SubmissionTreeNode) => {
    selectedStudent.value = studentNode
    studentSubmissions.value = studentNode.children
    submissionDetailVisible.value = true
  }

  const handleDetailDialogClose = () => {
    submissionDetailVisible.value = false
    selectedStudent.value = null
    studentSubmissions.value = []
  }

  const openGradeDialog = (submission: Submission) => {
    currentGradingSubmission.value = submission
    gradeForm.value = {
      score: submission.score === -1 ? 0 : submission.score,
      feedback: submission.feedback || ''
    }
    gradeDialogVisible.value = true
  }

  const submitGrade = async () => {
    if (!currentGradingSubmission.value) return

    try {
      await gradeFormRef.value.validate()
      gradeSubmitting.value = true

      const response = await customFetch(`/api/assignments/teacher/grade/${currentGradingSubmission.value.submissionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          score: gradeForm.value.score,
          feedback: gradeForm.value.feedback
        })
      })

      const data = await response.json()
      if (!data || data.code !== 200) {
        throw new Error('评分失败')
      }

      ElMessage.success('评分成功')
      gradeDialogVisible.value = false

      // 刷新数据
      await fetchSubmissions()

      // 如果详情页面打开，刷新详情数据
      if (selectedStudent.value) {
        const updatedStudent = submissionTree.value.find(s => s.studentId === selectedStudent.value!.studentId)
        if (updatedStudent) {
          selectedStudent.value = updatedStudent
          studentSubmissions.value = updatedStudent.children
        }
      }
    } catch (error) {
      console.error('评分失败:', error)
      ElMessage.error('评分失败，请重试')
    } finally {
      gradeSubmitting.value = false
    }
  }

  const rejectSubmission = async (submission: Submission) => {
    ElMessageBox.confirm('确定驳回该作业吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await _rejectSubmission(submission)
    }).catch(() => {
      // do nothing
    })
  }

  const _rejectSubmission = async (submission: Submission) => {
    try {
      const response = await customFetch(`/api/assignments/teacher/submissions/reject/${submission.submissionId}`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (!data || data.code !== 200) {
        ElMessage.error('驳回失败')
        return
      }
      ElMessage.success('驳回成功')
      rawSubmissions.value = rawSubmissions.value.map(s => {
        if (s.submissionId === submission.submissionId) {
          s.status = '已驳回'
        }
        return s;
      })
    } catch (error) {
      console.error('驳回失败:', error)
      ElMessage.error('驳回失败，请重试')
    }
  }

  onMounted(() => {
    document.title = "学生作业情况"
    fetchSubmissions()
  })

  return {
    loading,
    statusFilter,
    searchKeyword,
    currentPage,
    pageSize,
    submissionDetailVisible,
    selectedStudent,
    studentSubmissions,
    totalSize,
    gradeDialogVisible,
    currentGradingSubmission,
    gradeForm,
    gradeFormRules,
    gradeFormRef,
    gradeSubmitting,
    gradeDialogTitle,
    rawSubmissions,
    submissionTree,
    fetchSubmissions,
    handleStatusFilter,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    download,
    downloadAttachment,
    refreshData,
    getSubmissionStatusType,
    getSubmissionStatusText,
    formatDateTime,
    viewStudentSubmissions,
    handleDetailDialogClose,
    openGradeDialog,
    submitGrade,
    rejectSubmission,
    // 导出图标
    Search
  }
}