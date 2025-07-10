import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  Timer,
  Clock,
  Message,
  Document,
  Trophy,
  Paperclip,
  Picture,
  VideoPlay,
  Headset,
  Download,
  Upload,
  Plus,
  ChatDotRound
} from '@element-plus/icons-vue'
import { ElEmpty, ElMessage } from 'element-plus'
import router from '../../../../router'
import { customFetch } from '../../../../api/customFetch';
import { useRoute } from 'vue-router'
import type { UploadFile } from 'element-plus'

interface AssignmentDetail {
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
   * 作业所属教师
   */
  teacher: Teacher;

  /**
   * 作业标题
   */
  title: string;

  /**
   * 作业描述/题目内容
   */
  content: string;

  /**
   * 最大提交次数
   */
  maxNumberSubmissions: number;

  /**
   * 截止日期
   */
  endDate: Date;

  /**
   * 附件列表
   */
  attachmentsJson: string;

  /**
   * 提交历史
   */
  submissions: AssignmentSubmissions[];

  /**
   * 作业状态
   */
  status: string

}

interface AssignmentSubmissions {
  /**
   * 作业提交唯一标识符
   */
  submissionId: number;

  /**
   * 所属作业ID
   */
  assignmentId: number;

  /**
   * 提交学生ID
   */
  studentId: number;

  /**
   * 提交次数 (第几次提交)
   */
  submissionNumber: number;

  /**
   * 主观题答案内容
   */
  answerContent: string;

  /**
   * 客观题答案
   */
  answersObjectiveJson: string;

  /**
   * 提交时间
   */
  submittedAt: Date;

  /**
   * 提交文件附件列表
   */
  attachmentsJson: string;

  /**
   * 提交状态
   */
  status: string;

  /**
   * 作业得分
   */
  score?: number; // 使用可选类型，因为可能还未评分

  /**
   * 教师评语
   */
  feedback?: string;

  /**
   * 批改教师ID
   */
  gradedById?: number;

  /**
   * 批改时间
   */
  gradedAt?: Date;
}

/**
 * 教师信息
 */
interface Teacher {
  /**
   * 教师ID
   */
  teacherId: number;

  /**
   * 教师姓名
   */
  teacherName: string;

  /**
   * 教师头像URL
   */
  teacherAvatar: string;

  /**
   * 教师邮箱
   */
  teacherEmail: string;
}

export default function useAssignmentDetail() {
  // 响应式数据
  const submissionDialogVisible = ref(false)
  const submitting = ref(false)
  const submissionForm = ref<{
    content: string
    files: UploadFile[]
  }>({
    content: '',
    files: []
  })
  const id = useRoute().params.id
  // 作业详情数据
  const assignmentDetail = ref<AssignmentDetail>()
  const loading = ref(false)

  // 计算属性
  const canSubmit = computed(() => {
    return assignmentDetail.value &&
      assignmentDetail.value.endDate &&
      assignmentDetail.value.submissions &&
      new Date() <= new Date(assignmentDetail.value.endDate) &&
      assignmentDetail.value.submissions.length < assignmentDetail.value.maxNumberSubmissions
  })

  const fetchAssignmentDetail = async () => {
    try {
      loading.value = true
      const response = await customFetch(`/api/assignments/${id}`)
      const data = await response.json()
      if (!data || data.code !== 200) {
        ElMessage.error("获取作业详细信息失败，请稍后重试")
        return
      }
      assignmentDetail.value = data.data
      let attachments = assignmentDetail.value?.attachmentsJson
      if (attachments) {
        attachments = JSON.parse(attachments)
        if (Array.isArray(attachments)) {
          attachments.forEach((a: any) => {
            const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff']
            const exclusion = a.substring(a.lastIndexOf('.') + 1)
            if (images.includes(exclusion)) {
              renderImage(a)
            }
          })
        }
      }
    } catch (error) {
      console.log("获取作业详细信息失败:", error)
      ElMessage.error("获取作业详细信息失败，请稍后重试")
    } finally {
      loading.value = false
    }
  }

  const loadImage = async (attachment: string) => {
    attachment = encodeURIComponent(attachment)
    try {
      const response = await customFetch(`/api/assignments/${id}/download/publish?attachment=${attachment}`);

      // 将响应转换为 Blob（二进制流）
      const imageBlob = await response.blob();
      return imageBlob;
    } catch (error) {
      console.error('加载图片失败：', error);
      return null;
    }
  }

  const renderImage = async (attachment: string) => {
    const imageBlob = await loadImage(attachment);
    if (!imageBlob) return;

    // 创建 Object URL（临时 URL，指向内存中的 Blob）
    const imageUrl = URL.createObjectURL(imageBlob);

    // 渲染到网页
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '后端返回的图片';
    img.style.maxWidth = '500px'; // 可选：设置样式

    // 图片加载完成后释放 Object URL（避免内存泄漏）
    img.onload = () => {
      URL.revokeObjectURL(imageUrl); // 释放资源
    };
    document.querySelector('.assignment-content-card')?.appendChild(img)
  }

  // 方法定义
  const goBack = () => {
    router.go(-1)
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) {
      return null
    }
    if (typeof (date) === 'string') {
      date = new Date(date)
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isUrgent = (dueDate: Date) => {
    if (!dueDate) {
      return false
    }
    if (typeof (dueDate) === 'string') {
      dueDate = new Date(dueDate)
    }
    const now = new Date().getTime()
    const due = dueDate.getTime()
    const timeDiff = due - now
    return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0
  }

  const getAttachmentType = (attachment: string) => {
    if (!attachment || typeof attachment !== 'string') {
      return '未知类型';
    }

    // 获取扩展名（小写处理）
    const extension = attachment
      .substring(attachment.lastIndexOf('.') + 1)
      .toLowerCase()
      .trim();

    // 没有扩展名时
    if (!extension) {
      return '未知类型';
    }

    // 分类判断
    const fileTypeGroups: Record<string, string[]> = {
      '文档': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'md'],
      '图片': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'],
      '视频': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
      '音频': ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']
    };

    // 查找匹配的类型组
    for (const [type, extensions] of Object.entries(fileTypeGroups)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }

    return '其他文件';
  }

  const getCountdownText = (dueDate: Date) => {
    if (!dueDate) {
      return '未知'
    }
    if (typeof (dueDate) === 'string') {
      dueDate = new Date(dueDate)
    }
    const now = new Date().getTime()
    const due = dueDate.getTime()
    const difference = due - now

    if (difference <= 0) {
      return '已截止'
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}天${hours}小时`
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else {
      return `${minutes}分钟`
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '未完成': '#E6A23C',
      '已提交': '#409EFF',
      '已评分': '#67C23A',
      '已驳回': '#F56C6C'
    }
    return colors[status] || '#909399'
  }

  const getCourseTagType = () => {
    const types = ['primary', 'success', 'warning', 'danger', 'info']
    return types[Math.floor(Math.random() * types.length)]
  }

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '文档': '#F56C6C',
      '图片': '#67C23A',
      '音频': '#409EFF',
      '视频': '#E6A23C'
    }
    return colors[type] || '#909399'
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

  const getSubmissionTimelineType = (index: number) => {
    if (index === 0) return 'primary'
    return 'info'
  }

  const getSubmissionColor = (index: number) => {
    if (index === 0) return '#409EFF'
    return '#C0C4CC'
  }

  const getSubmissionStatusType = (status: string) => {
    return getStatusTagType(status)
  }

  // 操作方法
  const contactTeacher = () => {
    ElMessage.info('邮箱：' + assignmentDetail.value?.teacher.teacherEmail || '')
  }

  const downloadAttachment = async (attachment: string) => {
    await download(attachment, 'publish')
  }

  const downloadSubmissionFile = async (attachment: string, submissionId: number) => {
    await download(attachment, 'submission', submissionId)
  }

  const download = async (attachment: string, tag: string, submissionId: number = 0) => {
    ElMessage.success(`开始下载：${attachment}`)
    try {
      attachment = encodeURIComponent(attachment)
      const response = await customFetch(`/api/assignments/${id}/download/${tag}?attachment=${attachment}&submissionId=${submissionId}`);

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

  const showSubmissionDialog = () => {
    submissionDialogVisible.value = true
  }

  const handleSubmissionDialogClose = () => {
    submissionDialogVisible.value = false
    submissionForm.value = {
      content: '',
      files: []
    }
  }

  const handleExceed = (files: File[], _fileList: File[]) => {
    ElMessage.warning('最多只能上传10个文件')
  }

  /**
   * Validates if the file size is under 50MB before upload.
   * @param {File} file - The file to be validated
   * @returns {boolean} - Returns true if file size is valid (under 50MB), false otherwise
   */
  const beforeUpload = (file: File) => {
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      ElMessage.error('文件大小不能超过50MB')
    }
    return isLt50M
  }

  const submitAssignment = async () => {
    try {
      submitting.value = true
      const formData = new FormData()
      formData.append('content', submissionForm.value.content)

      // 检查是否有文件需要上传
      if (submissionForm.value.files && submissionForm.value.files.length > 0) {
        // 对于Element Plus的上传组件，需要从file-list中获取原始文件对象
        for (const fileItem of submissionForm.value.files) {
          // 确保使用原始文件对象而不是文件元数据
          if (fileItem.raw) {
            formData.append('files', fileItem.raw)
          }
        }
      } else {
        // 如果没有文件，添加一个空文件以满足后端要求
        const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
        const emptyFile = new File([emptyBlob], 'empty.txt', { type: 'application/octet-stream' });
        formData.append('files', emptyFile);
      }

      const response = await customFetch(`/api/assignments/${id}`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (!data || data.code !== 200) {
        ElMessage.error('提交失败，请重试')
        return
      }
      ElMessage.success('提交成功')
      handleSubmissionDialogClose()
      await fetchAssignmentDetail()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    } finally {
      submitting.value = false
    }
  }

  onMounted(async () => {
    document.title = "作业详情"
    await fetchAssignmentDetail()
  })

  return {
    submissionDialogVisible,
    submitting,
    submissionForm,
    assignmentDetail,
    loading,
    canSubmit,
    fetchAssignmentDetail,
    goBack,
    formatDateTime,
    formatFileSize,
    isUrgent,
    getAttachmentType,
    getCountdownText,
    getStatusTagType,
    getStatusColor,
    getCourseTagType,
    getFileTypeColor,
    getScoreColor,
    getGradeTagType,
    getGradeText,
    getSubmissionTimelineType,
    getSubmissionColor,
    getSubmissionStatusType,
    contactTeacher,
    downloadAttachment,
    downloadSubmissionFile,
    showSubmissionDialog,
    handleSubmissionDialogClose,
    handleExceed,
    beforeUpload,
    submitAssignment,
    ArrowLeft,
    Timer,
    Clock,
    Message,
    Document,
    Trophy,
    Paperclip,
    Picture,
    VideoPlay,
    Headset,
    Download,
    Upload,
    Plus,
    ChatDotRound
  }
}