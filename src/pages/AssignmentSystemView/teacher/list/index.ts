import { ref, onMounted } from 'vue'
import router from '../../../../router'
import {
    Document,
    Search,
    Plus,
    Calendar,
    Refresh,
    Paperclip,
    View,
    Edit,
    Download,
    Delete,
    Picture,
    VideoPlay,
    Headset,
    Upload
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { customFetch } from '../../../../api/customFetch'
import { useRoute } from 'vue-router'

interface Assignment {
    assignmentId: number;
    /**
     * 所属课程ID
     */
    courseId: number;
    /**
     * 课程名称
     */
    courseName: string;
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
     * 附件列表 (JSON数组)
     */
    attachmentsJson: Array<string>;
    /**
     * 状态
     */
    status: string
    /**
     * 提交统计
     */
    submissionStats: SubmissionStats
}

interface SubmissionStats {
    submitted: number;
    total: number
}

export default function useTeacherAssignments(courseId:number) {
    //const courseId = useRoute().params.courseId || 123456
    // 响应式数据
    const loading = ref(false)
    const selectedCourse = ref('全部')
    const statusFilter = ref('')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const attachmentsDialogVisible = ref(false)
    const selectedAssignment = ref<Assignment | null>()
    const totalSize = ref(0)
    // 课程列表
    const courses = ref(['全部'])

    // 作业数据
    const assignments = ref<Assignment[]>([])

    const fetchAssignments = async () => {
        loading.value = true
        try {
            const response = await customFetch(`/api/assignments/teacher?page=${currentPage.value}&size=${pageSize.value}&courseId=${courseId}&title=${searchKeyword.value}&courseName=${selectedCourse.value}&status=${statusFilter.value}`)
            const data = await response.json()
            if (!data || data.code !== 200) {
                ElMessage.error("获取作业列表失败")
                return
            }
            assignments.value = data.data.list.map((a: any) => {
                const base = Math.floor((Math.random() + 1) * 60)
                return {
                    ...a,
                    endDate: new Date(a.endDate),
                    attachmentsJson: JSON.parse(a.attachmentsJson),
                    submissionStats: {
                        submitted: Math.floor(Math.random() * base),
                        total: base
                    }
                }
            })
            totalSize.value = data.data.total
            courses.value = ['全部', ...Array.from(new Set(assignments.value.map(item => item.courseName)))]
        } catch (error) {
            console.error(error)
            ElMessage.error('获取作业列表失败')
        } finally {
            loading.value = false
        }
    }

    // 方法定义
    const handleCourseFilter = async () => {
        currentPage.value = 1
        await fetchAssignments()
    }

    const handleStatusFilter = async () => {
        currentPage.value = 1
        await fetchAssignments()
    }

    const handleSearch = async () => {
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

    // 获取状态相关样式
    const getStatusTagType = (status: string) => {
        const types: Record<string, string> = {
            active: 'success',
            completed: 'info',
        }
        return types[status] || 'info'
    }

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            active: '进行中',
            completed: '已结束',
        }
        return texts[status] || '未知'
    }

    const getCourseTagType = () => {
        const types = ['primary', 'success', 'warning', 'danger', 'info']
        return types[Math.floor(Math.random() * types.length)]
    }

    const getSubmissionPercentage = (stats: SubmissionStats) => {
        if (stats.total === 0) return 0
        return Math.round((stats.submitted / stats.total) * 100)
    }

    const getProgressColor = (stats: SubmissionStats) => {
        const percentage = getSubmissionPercentage(stats)
        if (percentage >= 80) return '#67C23A'
        if (percentage >= 60) return '#E6A23C'
        if (percentage >= 40) return '#409EFF'
        return '#F56C6C'
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

    // 时间格式化
    const formatDateTime = (date: Date) => {
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

    const download = async (attachment: string, tag: string, submissionId: number = 0) => {
        ElMessage.success(`开始下载：${attachment}`)
        try {
            attachment = encodeURIComponent(attachment)
            const response = await customFetch(`/api/assignments/${selectedAssignment.value?.assignmentId}/download/${tag}?attachment=${attachment}&submissionId=${submissionId}`);

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
    
    // 表单相关
    const assignmentFormDialogVisible = ref(false)
    const isEditMode = ref(false)
    const assignmentForm = ref<{
        assignmentId: number | undefined,
        courseName: string,
        title: string,
        content: string,
        endDate: string | Date,
        maxNumberSubmissions: number,
        attachmentsJson: Array<string | { name: string; url: string; status: string; uid: string; raw?: File }>
    }>({
        assignmentId: undefined,
        courseName: '',
        title: '',
        content: '',
        endDate: '',
        maxNumberSubmissions: 1,
        attachmentsJson: [],
    })
    
    const assignmentFormRef = ref()
    const assignmentFormRules = {
        courseName: [{ required: true, message: '请选择课程', trigger: 'change' }],
        title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入作业内容', trigger: 'blur' }],
        endDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
        maxNumberSubmissions: [{ required: true, type: 'number', message: '请输入最大提交次数', trigger: 'change' }],
    }

    // 上传前校验
    const beforeUpload = (file: File) => {
        // 可根据需要限制类型/大小
        return true
    }
    
    const handleExceed = (files: File[], _fileList: File[]) => {
        ElMessage.warning('最多只能上传10个文件')
    }
    
    // 打开创建作业弹窗
    const createNewAssignment = () => {
        isEditMode.value = false
        Object.assign(assignmentForm.value, {
            assignmentId: undefined,
            courseName: '',
            title: '',
            content: '',
            endDate: '',
            maxNumberSubmissions: 1,
            attachmentsJson: []
        })
        assignmentFormDialogVisible.value = true
    }
    
    // 打开编辑作业弹窗
    const editAssignment = (assignment: Assignment) => {
        isEditMode.value = true
        assignmentForm.value = {
            assignmentId: assignment.assignmentId,
            courseName: assignment.courseName,
            title: assignment.title,
            content: assignment.content,
            endDate: assignment.endDate,
            maxNumberSubmissions: assignment.maxNumberSubmissions,
            attachmentsJson: Array.isArray(assignment.attachmentsJson)
                ? assignment.attachmentsJson.map((url: string, idx: number) => ({
                    name: url.split('\\').pop() || url.split('/').pop() || `附件${idx + 1}`,
                    url,
                    status: 'success',
                    uid: `${Date.now()}_${idx}`
                }))
                : [],
        }
        assignmentFormDialogVisible.value = true
    }
    
    // 关闭弹窗时重置表单
    const handleAssignmentFormDialogClose = () => {
        assignmentFormDialogVisible.value = false
        if (assignmentFormRef.value) assignmentFormRef.value.resetFields()
        Object.assign(assignmentForm.value, {
            assignmentId: undefined,
            courseName: '',
            title: '',
            content: '',
            endDate: '',
            maxNumberSubmissions: 1,
            attachmentsJson: []
        })
    }
    
    // 提交表单
    const submitAssignmentForm = () => {
        assignmentFormRef.value.validate(async (valid: boolean) => {
            if (!valid) return
            try {
                // 构造FormData
                const formData = new FormData()
                const dto: Record<string, string | number | Array<string>> = {}
                dto.courseId = courseId
                dto.title = assignmentForm.value.title
                dto.content = assignmentForm.value.content
                dto.endDate = assignmentForm.value.endDate instanceof Date
                    ? assignmentForm.value.endDate.toISOString()
                    : assignmentForm.value.endDate
                dto.maxNumberSubmissions = assignmentForm.value.maxNumberSubmissions
                const attachmentsJson: string[] = []
                
                // 附件处理
                assignmentForm.value.attachmentsJson.forEach((file: any) => {
                    if (file.raw) {
                        // 新文件
                        formData.append('files', file.raw, file.name)
                    } else if (file.url) {
                        // 已有文件
                        attachmentsJson.push(file.url)
                    }
                })
                dto.attachmentsJson = JSON.stringify(attachmentsJson)
                formData.append('dto', new Blob([JSON.stringify(dto)], {
                    type: 'application/json'
                }));
                let res, data
                if (isEditMode.value) {
                    res = await customFetch(`/api/assignments/teacher/${assignmentForm.value.assignmentId}`, {
                        method: 'PUT',
                        body: formData
                    })
                    data = await res.json()
                    if (!data || data.code !== 200) throw new Error('编辑失败')
                    ElMessage.success('作业修改成功')
                } else {
                    res = await customFetch('/api/assignments/teacher', {
                        method: 'POST',
                        body: formData
                    })
                    data = await res.json()
                    if (!data || data.code !== 200) throw new Error('创建失败')
                    ElMessage.success('作业创建成功')
                }
                assignmentFormDialogVisible.value = false
                await fetchAssignments()
            } catch (e) {
                ElMessage.error(isEditMode.value ? '作业修改失败' : '作业创建失败')
            }
        })
    }

    const viewAttachments = (assignment: Assignment) => {
        selectedAssignment.value = assignment
        attachmentsDialogVisible.value = true
    }

    const handleAttachmentsDialogClose = () => {
        attachmentsDialogVisible.value = false
        selectedAssignment.value = null
    }

    const downloadAttachment = (attachment: string) => {
        download(attachment, "publish")
    }

    const goToSubmissions = (row: Assignment) => {
        router.push(`/assignment/teacher/view/submissions/${row.assignmentId}/${courseId}`)
    }

    const deleteAssignment = (assignment: Assignment) => {
        ElMessageBox.confirm(
            `确认删除作业"${assignment.title}"？此操作不可恢复。`,
            '确认删除',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error'
            }
        ).then(async () => {
            try {
                const res = await customFetch(`/api/assignments/teacher/${assignment.assignmentId}`, {
                    method: 'DELETE'
                })
                const data = await res.json()
                if (!data || data.code !== 200) {
                    ElMessage.error("删除失败，请稍后重试")
                }
                // 从列表中移除
                const index = assignments.value.findIndex(item => item.assignmentId === assignment.assignmentId)
                if (index > -1) {
                    assignments.value.splice(index, 1)
                    ElMessage.success('作业删除成功')
                }
            } catch (error) {
                console.log("删除失败，请稍后重试:", error)
                ElMessage.error("删除失败，请稍后重试")
            }

        }).catch(() => {
            // 用户取消
        })
    }

    onMounted(async () => {
        document.title="作业列表（教师端）"
        await fetchAssignments()
    })

    return {
        loading,
        selectedCourse,
        statusFilter,
        searchKeyword,
        currentPage,
        pageSize,
        attachmentsDialogVisible,
        selectedAssignment,
        totalSize,
        courses,
        assignments,
        assignmentFormDialogVisible,
        isEditMode,
        assignmentForm,
        assignmentFormRef,
        assignmentFormRules,
        fetchAssignments,
        handleCourseFilter,
        handleStatusFilter,
        handleSearch,
        handleSizeChange,
        handleCurrentChange,
        getStatusTagType,
        getStatusText,
        getCourseTagType,
        getSubmissionPercentage,
        getProgressColor,
        getFileTypeColor,
        formatDateTime,
        getAttachmentType,
        download,
        beforeUpload,
        handleExceed,
        createNewAssignment,
        editAssignment,
        handleAssignmentFormDialogClose,
        submitAssignmentForm,
        viewAttachments,
        handleAttachmentsDialogClose,
        downloadAttachment,
        goToSubmissions,
        deleteAssignment,
        // 导出图标
        Document,
        Search,
        Plus,
        Calendar,
        Refresh,
        Paperclip,
        View,
        Edit,
        Download,
        Delete,
        Picture,
        VideoPlay,
        Headset,
        Upload
    }
}