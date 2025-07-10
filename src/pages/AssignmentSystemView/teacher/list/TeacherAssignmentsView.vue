<template>
    <div class="teacher-my-assignments-container">
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
        </div>

        <div class="teacher-my-assignments-content">
            <!-- 筛选和搜索 -->
            <el-card class="filter-card" shadow="hover">
                <div class="filter-section">
                    <div class="filter-left">
                        <el-select v-model="selectedCourse" placeholder="选择课程" clearable style="width: 150px;"
                            @change="handleCourseFilter">
                            <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
                        </el-select>

                        <el-select v-model="statusFilter" placeholder="作业状态" clearable style="width: 120px;"
                            @change="handleStatusFilter">
                            <el-option label="全部" value="" />
                            <el-option label="进行中" value="active" />
                            <el-option label="已结束" value="completed" />
                        </el-select>
                    </div>

                    <div class="filter-right">
                        <el-input v-model="searchKeyword" placeholder="搜索作业标题" :prefix-icon="Search" clearable
                            style="width: 250px;" @input="handleSearch" />
                        <el-button type="primary" size="large" :icon="Plus" @click="createNewAssignment">
                            创建新作业
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- 作业列表 -->
            <div class="assignments-list" v-loading="loading">
                <div v-if="assignments.length === 0" class="empty-state">
                    <el-empty description="暂无作业数据">
                        <el-button type="primary" @click="createNewAssignment">创建第一个作业</el-button>
                    </el-empty>
                </div>

                <div v-else class="assignments-table-container-233">
                    <el-table :data="assignments" class="assignments-table-233" row-class-name="assignment-row"
                        header-row-class-name="assignment-header-233" @row-click="goToSubmissions">
                        <!-- 作业标题和状态 -->
                        <el-table-column label="作业信息" max-width="300">
                            <template #default="{ row }">
                                <div class="assignment-info">
                                    <div class="assignment-title-row">
                                        <h4 class="assignment-title">
                                            {{ row.title }}
                                            <el-tag :type="getStatusTagType(row.status)" size="default">
                                                {{ getStatusText(row.status) }}
                                            </el-tag>
                                        </h4>
                                    </div>
                                    <div class="assignment-meta">
                                        <span class="assignment-id">ID: {{ row.assignmentId }}</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="作业内容" max-width="300" align="center">
                            <template #default="{ row }">
                                <div class="assignment-content">
                                    {{ row.content || '无' }}
                                </div>
                            </template>
                        </el-table-column>
                        <!-- 所属课程 -->
                        <!--<el-table-column label="所属课程" width="150" align="center">
                            <template #default="{ row }">
                                <div class="course-info">
                                    <el-tag :type="getCourseTagType()" size="default">
                                        {{ row.course || '未知课程' }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>-->

                        <!-- 截止日期 -->
                        <el-table-column label="截止日期" max-width="180">
                            <template #default="{ row }">
                                <div class="deadline-info">
                                    <div class="deadline-date">
                                        <el-icon>
                                            <Calendar />
                                        </el-icon>
                                        {{ formatDateTime(row.endDate) }}
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 提交设置 -->
                        <el-table-column label="提交设置" max-width="120" align="center">
                            <template #default="{ row }">
                                <div class="submission-settings">
                                    <div class="max-submissions">
                                        <el-icon>
                                            <Refresh />
                                        </el-icon>
                                        最多{{ row.maxNumberSubmissions }}次
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 附件信息 -->
                        <el-table-column label="附件" max-width="120" align="center">
                            <template #default="{ row }">
                                <div class="attachments-info">
                                    <div v-if="row.attachmentsJson && row.attachmentsJson.length > 0"
                                        class="has-attachments">
                                        <el-icon>
                                            <Paperclip />
                                        </el-icon>
                                        <span class="attachment-count">{{ row.attachmentsJson.length }}个文件</span>
                                        <el-button size="small" type="primary" link @click.stop="viewAttachments(row)">
                                            查看
                                        </el-button>
                                    </div>
                                    <div v-else class="no-attachments">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <span>无附件</span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 提交统计 -->
                        <el-table-column label="提交统计" max-width="120" align="center">
                            <template #default="{ row }">
                                <div class="submission-stats">
                                    <div class="stats-numbers">
                                        <span class="submitted-count">{{ row.submissionStats.submitted }}</span>
                                        <span class="total-students">/ {{ row.submissionStats.total }}</span>
                                    </div>
                                    <div class="stats-progress">
                                        <el-progress :percentage="getSubmissionPercentage(row.submissionStats)"
                                            :stroke-width="6" :show-text="false"
                                            :color="getProgressColor(row.submissionStats)" />
                                    </div>
                                    <div class="stats-label">
                                        {{ getSubmissionPercentage(row.submissionStats) }}% 已提交
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <!-- 操作 -->
                        <el-table-column label="操作" width="200" align="center" fixed="right">
                            <template #default="{ row }">
                                <div class="table-actions" @click.stop>
                                    <el-button size="small" type="primary" :icon="View" @click="goToSubmissions(row)">
                                        查看
                                    </el-button>
                                    <el-button size="small" type="warning" :icon="Edit" @click="editAssignment(row)">
                                        编辑
                                    </el-button>
                                    <el-button size="small" type="danger" :icon="Delete" @click="deleteAssignment(row)">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-section" v-if="assignments.length > 0">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="totalSize" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 附件查看对话框 -->
        <el-dialog v-model="attachmentsDialogVisible" :title="`${selectedAssignment?.title} - 附件列表`" width="600px"
            :before-close="handleAttachmentsDialogClose">
            <div v-if="selectedAssignment?.attachmentsJson" class="attachments-dialog-content">
                <div class="attachments-grid">
                    <div v-for="attachment in selectedAssignment.attachmentsJson" :key="attachment"
                        class="attachment-item" @click="downloadAttachment(attachment)">
                        <div class="attachment-icon">
                            <el-icon size="32" :color="getFileTypeColor(attachment)">
                                <Document v-if="getAttachmentType(attachment) === '文档'" />
                                <Picture v-else-if="getAttachmentType(attachment) === '图片'" />
                                <VideoPlay v-else-if="getAttachmentType(attachment) === '视频'" />
                                <Headset v-else-if="getAttachmentType(attachment) === '音频'" />
                                <Document v-else />
                            </el-icon>
                        </div>
                        <div class="attachment-info">
                            <div class="attachment-name">{{ attachment.split('\\')[attachment.split('\\').length - 1] }}
                            </div>
                            <div class="attachment-meta">
                                <span class="attachment-type">{{ getAttachmentType(attachment) }}</span>
                            </div>
                        </div>
                        <div class="attachment-actions">
                            <el-button size="small" type="primary" :icon="Download">
                                下载
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="attachmentsDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <!-- 创建/编辑作业表单弹窗 -->
        <el-dialog v-model="assignmentFormDialogVisible" :title="isEditMode ? '编辑作业' : '创建新作业'" width="650px"
            :before-close="handleAssignmentFormDialogClose">
            <el-form :model="assignmentForm" :rules="assignmentFormRules" ref="assignmentFormRef" label-width="120px"
                status-icon>
                <!--<el-form-item label="课程" prop="courseName">
                    <el-select v-model="assignmentForm.courseName" placeholder="请选择课程">
                        <el-option v-for="course in courses.filter(item => item !== '全部')" :key="course" :label="course" :value="course" />
                    </el-select>
                </el-form-item>-->
                <el-form-item label="标题" prop="title">
                    <el-input v-model="assignmentForm.title" placeholder="请输入作业标题" />
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input v-model="assignmentForm.content" type="textarea" placeholder="请输入作业内容" />
                </el-form-item>
                <el-form-item label="截止日期" prop="endDate">
                    <el-date-picker v-model="assignmentForm.endDate" type="datetime" placeholder="选择截止日期"
                        style="width: 100%;" />
                </el-form-item>
                <el-form-item label="最大提交次数" prop="maxNumberSubmissions">
                    <el-input-number v-model="assignmentForm.maxNumberSubmissions" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="上传文件">
                    <el-upload v-model:file-list="assignmentForm.attachmentsJson" :auto-upload="false" multiple
                        :limit="10" :on-exceed="handleExceed" :before-upload="beforeUpload">
                        <el-button type="primary" :icon="Upload">选择文件</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                支持上传多个文件，单个文件不超过50MB
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="assignmentFormDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAssignmentForm">{{ isEditMode ? '保存修改' : '创建' }}</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import useTeacherAssignments from './index'
import './styles.css'
import { defineProps } from 'vue'
const props = defineProps({
    courseId: {
        type: Number,
        required: false
    }
})
const {
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
    handleCourseFilter,
    handleStatusFilter,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    getStatusTagType,
    getStatusText,
    getSubmissionPercentage,
    getProgressColor,
    getFileTypeColor,
    formatDateTime,
    getAttachmentType,
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
    // 图标
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
} = useTeacherAssignments(props.courseId)
</script>