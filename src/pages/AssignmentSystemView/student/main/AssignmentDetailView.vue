<template>
  <div class="assignment-detail-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="assignment-detail-content" v-loading="loading">
      <!-- 返回按钮 -->
      <div class="back-section">
        <el-button @click="goBack" :icon="ArrowLeft" type="info" plain>
          返回作业列表
        </el-button>
      </div>
      <div v-if="assignmentDetail">
        <!-- 作业基本信息 -->
        <el-card class="assignment-header-card" shadow="always">
          <div class="assignment-header">
            <div class="assignment-main-info">
              <div class="assignment-title-section">
                <h1 class="assignment-title">{{ assignmentDetail.title }}</h1>
                <div class="assignment-meta-tags">
                  <!--<el-tag :type="getCourseTagType()" size="large">
                    {{ assignmentDetail.courseName || '未知课程' }}
                  </el-tag>-->
                  <el-tag :type="getStatusTagType(assignmentDetail.status)" size="large">
                    {{ assignmentDetail.status }}
                  </el-tag>
                </div>
              </div>

              <!-- 时间和分数信息 -->
              <div class="assignment-time-score">
                <div class="info-grid">
                  <div class="info-item">
                    <el-icon>
                      <Timer />
                    </el-icon>
                    <span class="info-label">截止时间：</span>
                    <span class="info-value" :class="{ 'urgent': isUrgent(assignmentDetail.endDate) }">
                      {{ formatDateTime(assignmentDetail.endDate) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    <span class="info-label">剩余时间：</span>
                    <span class="info-value countdown" :class="{ 'urgent': isUrgent(assignmentDetail.endDate) }">
                      {{ getCountdownText(assignmentDetail.endDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 教师信息 -->
            <!--<div class="teacher-info-card">
              <div class="teacher-avatar">
                <el-avatar :size="80" :src="assignmentDetail.teacher.teacherAvatar"
                  :alt="assignmentDetail.teacher.teacherName">
                  {{ assignmentDetail.teacher.teacherName?.charAt(0) || '' }}
                </el-avatar>
              </div>
              <div class="teacher-details">
                <h3 class="teacher-name">{{ assignmentDetail.teacher.teacherName || '未知教师' }}</h3>
                <div class="teacher-contact">
                  <el-button size="small" type="primary" :icon="Message" @click="contactTeacher">
                    联系老师
                  </el-button>
                </div>
              </div>
            </div>-->
          </div>
        </el-card>

        <!-- 作业内容 -->
        <el-card class="assignment-content-card" shadow="hover" v-if="assignmentDetail.content">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Document />
              </el-icon>
              <span>作业内容</span>
            </div>
          </template>
          <div>
            <p>{{ assignmentDetail.content }}</p>
          </div>
        </el-card>

        <!-- 作业附件 -->
        <el-card
          v-if="JSON.parse(assignmentDetail.attachmentsJson) && JSON.parse(assignmentDetail.attachmentsJson).length > 0"
          class="attachments-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Paperclip />
              </el-icon>
              <span>作业附件 ({{ JSON.parse(assignmentDetail.attachmentsJson).length }})</span>
            </div>
          </template>

          <div class="attachments-grid">
            <div v-for="attachment in JSON.parse(assignmentDetail.attachmentsJson)" :key="attachment"
              class="attachment-item" @click="downloadAttachment(attachment)">
              <div class="attachment-icon">
                <el-icon size="32" :color="getFileTypeColor(getAttachmentType(attachment))">
                  <Document v-if="getAttachmentType(attachment) === '文档'" />
                  <Picture v-else-if="getAttachmentType(attachment) === '图片'" />
                  <VideoPlay v-else-if="getAttachmentType(attachment) === '视频'" />
                  <Headset v-else-if="getAttachmentType(attachment) === '音频'" />
                  <Document v-else />
                </el-icon>
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.split('\\')[attachment.split('\\').length - 1] }}</div>
                <div class="attachment-meta">
                  <span class="attachment-type">{{ getAttachmentType(attachment).toUpperCase() }}</span>
                </div>
              </div>
              <div class="attachment-actions">
                <el-button size="small" type="primary" :icon="Download">
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 提交历史 -->
        <el-card class="submission-history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Upload />
              </el-icon>
              <span>提交历史</span>
              <div class="header-actions">
                <el-button v-if="canSubmit" type="primary" :icon="Plus" @click="showSubmissionDialog">
                  新建提交
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="assignmentDetail.submissions && assignmentDetail.submissions.length > 0"
            class="submissions-timeline">
            <el-timeline>
              <el-timeline-item v-for="(submission, index) in assignmentDetail.submissions"
                :key="submission.submissionId" :timestamp="formatDateTime(submission.submittedAt)"
                :type="getSubmissionTimelineType(index)" :color="getSubmissionColor(index)" size="large">
                <el-card class="submission-card" :class="{ 'latest-submission': index === 0 }">
                  <div class="submission-header">
                    <div class="submission-info">
                      <h4 class="submission-title">
                        第{{ submission.submissionNumber }}次提交
                        <el-tag v-if="index === 0" type="success" size="small">最新</el-tag>
                      </h4>
                      <div class="submission-meta">
                        <span class="submit-time">{{ formatDateTime(submission.submittedAt) }}</span>
                        <el-tag :type="submission.submittedAt <= assignmentDetail.endDate ? 'success' : 'danger'"
                          size="small">
                          {{ submission.submittedAt <= assignmentDetail.endDate ? '按时提交' : '逾期提交' }} </el-tag>
                            <el-tag v-if="submission.status" :type="getSubmissionStatusType(submission.status)"
                              size="small">
                              {{ submission.status }}
                            </el-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 提交内容 -->
                  <div v-if="submission.answerContent || submission.answersObjectiveJson" class="submission-content">
                    <h5>作业内容：</h5>
                    <p>{{ submission.answerContent }}</p>
                    <br>
                    <p>{{ submission.answersObjectiveJson }}</p>
                  </div>

                  <!-- 提交的附件 -->
                  <div
                    v-if="JSON.parse(submission.attachmentsJson) && JSON.parse(submission.attachmentsJson).length > 0"
                    class="submission-files">
                    <h5>提交文件 ({{ JSON.parse(submission.attachmentsJson).length }})：</h5>
                    <div class="files-list">
                      <div v-for="attachment in JSON.parse(submission.attachmentsJson)" :key="attachment"
                        class="file-item" @click="downloadSubmissionFile(attachment, submission.submissionId)">
                        <el-icon size="32" :color="getFileTypeColor(getAttachmentType(attachment))">
                          <Document v-if="getAttachmentType(attachment) === '文档'" />
                          <Picture v-else-if="getAttachmentType(attachment) === '图片'" />
                          <VideoPlay v-else-if="getAttachmentType(attachment) === '视频'" />
                          <Headset v-else-if="getAttachmentType(attachment) === '音频'" />
                          <Document v-else />
                        </el-icon>
                        <div class="file-info">
                          <span class="file-name">{{ attachment.split('\\')[attachment.split('\\').length - 1] }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 批改结果 -->
                  <div v-if="submission.score && submission.score !== -1" class="submission-grade">
                    <div class="grade-header">
                      <el-icon>
                        <Trophy />
                      </el-icon>
                      <span>批改结果</span>
                    </div>
                    <div class="grade-content">
                      <div class="grade-score">
                        <span class="score-label">得分：</span>
                        <span class="score-value" :style="{ color: getScoreColor(submission.score, 100) }">
                          {{ submission.score }}
                        </span>
                        <span class="score-total">/ {{ 100 }}分</span>
                        <el-tag :type="getGradeTagType(submission.score, 100)" size="small">
                          {{ getGradeText(submission.score, 100) }}
                        </el-tag>
                      </div>
                      <div v-if="submission.feedback" class="grade-feedback">
                        <div class="feedback-header">
                          <el-icon>
                            <ChatDotRound />
                          </el-icon>
                          <span>教师评语：</span>
                        </div>
                        <div class="feedback-content">{{ submission.feedback }}</div>
                      </div>
                      <div class="grade-time">
                        批改时间：{{ formatDateTime(submission.gradedAt ?? null) }}
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>

          <div v-else class="no-submissions">
            <el-empty description="暂无提交记录">
              <el-button v-if="canSubmit" type="primary" @click="showSubmissionDialog">
                立即提交作业
              </el-button>
            </el-empty>
          </div>
        </el-card>
      </div>
      <div v-else>
        <ElEmpty description="暂无作业信息，请刷新重试"></ElEmpty>
      </div>
    </div>

    <!-- 提交作业对话框 -->
    <el-dialog v-model="submissionDialogVisible" title="提交作业" width="600px" :before-close="handleSubmissionDialogClose">
      <el-form :model="submissionForm" label-width="100px">
        <el-form-item label="提交说明">
          <el-input v-model="submissionForm.content" type="textarea" :rows="4" placeholder="请输入你的作业内容或在下方上传附件" />
        </el-form-item>

        <el-form-item label="上传文件">
          <el-upload v-model:file-list="submissionForm.files" :auto-upload="false" multiple :limit="10"
            :on-exceed="handleExceed" :before-upload="beforeUpload">
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
        <el-button @click="submissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssignment" :loading="submitting">
          提交作业
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import useAssignmentDetail from './index'
import './styles.css'
// 使用组合式API
const {
  submissionDialogVisible,
  submitting,
  submissionForm,
  assignmentDetail,
  loading,
  canSubmit,
  goBack,
  formatDateTime,
  isUrgent,
  getAttachmentType,
  getCountdownText,
  getStatusTagType,
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
} = useAssignmentDetail()
</script>