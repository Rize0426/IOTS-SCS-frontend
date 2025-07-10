<template>
  <div class="teacher-assignment-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="teacher-assignment-content">

      <!-- 筛选和搜索 -->
      <el-card class="filter-card" shadow="hover">
        <div class="filter-section">
          <div class="filter-left">

            <el-select v-model="statusFilter" placeholder="提交状态" style="width: 120px;" @change="handleStatusFilter">
              <el-option label="全部" value="" />
              <el-option label="未评分" value="已提交" />
              <el-option label="已评分" value="已评分" />
              <el-option label="已驳回" value="已驳回" />
            </el-select>
          </div>

          <div class="filter-right">
            <el-input v-model="searchKeyword" placeholder="搜索学生姓名或学号" :prefix-icon="Search" clearable
              style="width: 250px;" @input="handleSearch" />
          </div>
        </div>
      </el-card>

      <!-- 作业提交列表 -->
      <div class="submissions-list" v-loading="loading">
        <div v-if="rawSubmissions.length === 0" class="empty-state">
          <el-empty description="暂无作业提交记录">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </el-empty>
        </div>

        <div v-else class="submissions-table-container">
          <el-table :data="submissionTree" row-key="studentId" :tree-props="{ children: 'children' }" default-expand-all
            class="submissions-table">
            <!-- 学生信息（父节点） -->
            <el-table-column label="ID" min-width="100">
              <template #default="{ row }">
                <template v-if="row.studentId">
                  <el-avatar :size="40" :src="row.studentAvatar" class="student-avatar" />
                  <span class="student-id">({{ row.studentId || '未知' }})</span>
                </template>
                <template v-else>
                  <span>第{{ row.submissionNumber }}次提交</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="姓名" min-width="100" align="center">
              <template #default="{ row }">
                <template v-if="row.studentId">
                  <span class="student-name" style="color: #888; margin-left: 8px;">{{ row.studentName || '未知' }}</span>
                </template>
              </template>
            </el-table-column>
            <!--<el-table-column label="班级" min-width="100" align="center">
              <template #default="{ row }">
                <template v-if="row.studentId">
                  <span class="student-class" style="color: #888; margin-left: 8px;">{{ row.studentClass || '未知'
                  }}</span>
                </template>
              </template>
            </el-table-column>-->
            <!-- 提交时间 -->
            <el-table-column label="提交时间" min-width="160" align="center">
              <template #default="{ row }">
                <template v-if="!row.studentId">
                  <div>{{ formatDateTime(row.submittedAt) }}</div>
                </template>
              </template>
            </el-table-column>
            <!-- 附件 -->
            <el-table-column label="附件" min-width="200" align="center">
              <template #default="{ row }">
                <template v-if="!row.studentId && row.attachmentsJson">
                  <div class="download-buttons-111">
                    <el-button v-for="(file, idx) in row.attachmentsJson" :key="idx"
                      class="download-button-111222" @click="downloadAttachment(row, file)">{{ file.split('\\').pop()
                      }}</el-button>
                  </div>
                </template>
              </template>
            </el-table-column>
            <!-- 得分 -->
            <el-table-column label="得分" width="80" align="center">
              <template #default="{ row }">
                <template v-if="!row.studentId">
                  <span style="color: red;">{{ row.score === -1 ? '-' : row.score }}</span>
                </template>
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <template v-if="!row.studentId">
                  <el-tag :type="getSubmissionStatusType(row.status)">
                    {{ getSubmissionStatusText(row.status) }}
                  </el-tag>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150" align="center">
              <template #default="{ row }">
                <template v-if="!row.studentId">
                  <el-button type="warning" size="small" @click="openGradeDialog(row)" v-if="row.status !== '已驳回'">{{
                    row.status === '已评分' ?
                      '修改评分' : '评分' }}</el-button>
                  <el-button type="danger" size="small" @click="rejectSubmission(row)"
                    v-if="row.status === '已提交'">驳回</el-button>
                </template>
                <template v-else>
                  <el-button type="primary" size="small" @click="viewStudentSubmissions(row)">查看详情</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section" v-if="rawSubmissions.length > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="totalSize" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 查看提交详情对话框 -->
    <el-dialog v-model="submissionDetailVisible" :title="`${selectedStudent?.studentName || '未知学生'} - 提交详情`"
      width="1000px" :before-close="handleDetailDialogClose" class="submission-detail-dialog" top="1vh">
      <div v-if="selectedStudent" class="submission-detail-content">
        <!-- 学生基本信息 -->
        <div class="detail-section">
          <h4>学生信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">学生姓名：</span>
              <span class="info-value">{{ selectedStudent.studentName || "未知" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span class="info-value">{{ selectedStudent.studentId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">班级：</span>
              <span class="info-value">{{ selectedStudent.studentClass || "未知" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交次数：</span>
              <span class="info-value">{{ studentSubmissions.length }}次</span>
            </div>
          </div>
        </div>

        <!-- 所有提交记录 -->
        <div class="detail-section">
          <h4>提交记录</h4>
          <div class="submissions-timeline">
            <div v-for="(submission, index) in studentSubmissions" :key="submission.submissionId"
              class="submission-item">
              <div class="submission-header">
                <div class="submission-number">第{{ submission.submissionNumber }}次提交</div>
                <div class="submission-time">{{ formatDateTime(submission.submittedAt) }}</div>
                <div class="submission-status">
                  <el-tag :type="getSubmissionStatusType(submission.status)">
                    {{ getSubmissionStatusText(submission.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="submission-content-wrapper">
                <div v-if="submission.answerContent" class="submission-answer">
                  <h5>作业内容：</h5>
                  <p>{{ submission.answerContent }}</p>
                </div>

                <div v-if="submission.attachmentsJson && submission.attachmentsJson.length > 0"
                  class="submission-attachments">
                  <h5>附件：</h5>
                  <div class="attachments-list">
                    <el-button v-for="(file, idx) in submission.attachmentsJson" :key="idx" type="primary" size="small"
                      @click="downloadAttachment(submission, file)">
                      {{ file.split('\\').pop() }}
                    </el-button>
                  </div>
                </div>

                <div v-if="submission.status === '已评分'" class="submission-grade">
                  <h5>评分信息：</h5>
                  <div class="grade-info">
                    <span class="grade-score">得分：{{ submission.score }}</span>
                    <span class="grade-feedback">评语：{{ submission.feedback }}</span>
                  </div>
                </div>

                <div class="submission-actions">
                  <el-button type="primary" size="small" @click="openGradeDialog(submission)"
                    v-if="submission.status !== '已驳回'">
                    {{ submission.status === '已评分' ? '修改评分' : '评分' }}
                  </el-button>
                  <el-button type="danger" size="small" @click="rejectSubmission(submission)"
                    v-if="submission.status === '已提交'">驳回</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="submissionDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 评分对话框 -->
    <el-dialog v-model="gradeDialogVisible" :title="gradeDialogTitle" width="600px">
      <el-form :model="gradeForm" :rules="gradeFormRules" ref="gradeFormRef" label-width="80px">
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="gradeForm.score" :min="0" :max="100" :precision="1" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="评语" prop="feedback">
          <el-input v-model="gradeForm.feedback" type="textarea" :rows="4" placeholder="请输入评语..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade" :loading="gradeSubmitting">提交评分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import useStudentSubmissions from './index'
import './styles.css'

const {
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
  gradeForm,
  gradeFormRules,
  gradeFormRef,
  gradeSubmitting,
  gradeDialogTitle,
  rawSubmissions,
  submissionTree,
  handleStatusFilter,
  handleSearch,
  handleSizeChange,
  handleCurrentChange,
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
  // 图标
  Search
} = useStudentSubmissions(useRoute())
</script>
<style scoped>

.download-button-111222 {
  color: #2f6be3;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
}

.download-buttons-111 {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  flex-direction: column;
}

.attachments-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>