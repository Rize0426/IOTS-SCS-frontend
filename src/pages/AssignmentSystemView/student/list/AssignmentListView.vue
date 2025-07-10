<template>
  <div class="assignment-list-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="assignment-list-content">
      <!-- 筛选和搜索 -->
      <el-card class="filter-card" shadow="hover">
        <div class="filter-section">
          <div class="filter-left">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane label="全部作业" name="all">
                <template #label>
                  <span class="tab-label">
                    <el-icon>
                      <List />
                    </el-icon>
                    全部作业 ({{ totalAssignments }})
                  </span>
                </template>
              </el-tab-pane>
              <el-tab-pane label="未完成" name="未完成">
                <template #label>
                  <span class="tab-label">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    未完成
                  </span>
                </template>
              </el-tab-pane>
              <el-tab-pane label="已提交" name="已提交">
                <template #label>
                  <span class="tab-label">
                    <el-icon>
                      <Upload />
                    </el-icon>
                    已提交
                  </span>
                </template>
              </el-tab-pane>
              <el-tab-pane label="已评分" name="已评分">
                <template #label>
                  <span class="tab-label">
                    <el-icon>
                      <Check />
                    </el-icon>
                    已评分
                  </span>
                </template>
              </el-tab-pane>
              <el-tab-pane label="已驳回" name="已驳回">
                <template #label>
                  <span class="tab-label">
                    <el-icon>
                      <Warning />
                    </el-icon>
                    已驳回
                  </span>
                </template>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="filter-right">
            <el-input v-model="searchKeyword" placeholder="搜索作业标题" :prefix-icon="Search" clearable style="width: 300px;"
              @input="handleSearch" />
            <!--<el-select v-model="selectedCourse" placeholder="选择课程" clearable style="width: 150px;"
              @change="handleCourseFilter">
              <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
            </el-select>-->
            <el-select v-model="sortBy" placeholder="排序方式" style="width: 120px;" @change="handleSort">
              <el-option label="截止时间" value="endDate" />
              <!--<el-option label="课程名称" value="course" />-->
            </el-select>
          </div>
        </div>
      </el-card>

      <!-- 作业列表 -->
      <div class="assignment-list" v-loading="loading">
        <div v-if="assignmentList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无作业数据">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
          </el-empty>
        </div>

        <div v-else-if="!loading" class="assignment-table-container-212">
          <el-table :data="assignmentList" class="assignment-table-212" @row-click="handleRowClick"
            row-class-name="assignment-row" header-row-class-name="assignment-header-212" :show-header="true">
            <!-- 状态指示器 -->
            <el-table-column width="8" class-name="status-indicator">
              <template #default="{ row }">
                <div class="status-bar" :class="`status-${row.status}`"></div>
              </template>
            </el-table-column>

            <!-- 作业标题和课程 -->
            <el-table-column label="作业信息" min-width="150">
              <template #default="{ row }">
                <div class="assignment-info">
                  <div class="assignment-title-row">
                    <h4 class="assignment-title">{{ row.title }}
                      <!--<el-tag :type="getCourseTagType()" size="small">
                        {{ row.course || '未知课程' }}
                      </el-tag></div>-->
                    </h4>

                    <!--<p class="assignment-desc">{{ row.description }}</p>-->
                    <!--<div class="assignment-teacher">
                    <el-icon>
                      <User />
                    </el-icon>
                    <span>{{ row.teacher || '未知教师' }}</span></div>-->
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column label="状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="default">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 时间信息 -->
            <el-table-column label="时间信息" width="200">
              <template #default="{ row }">
                <div class="time-info">
                  <div class="time-item">
                    <el-icon>
                      <Timer />
                    </el-icon>
                    <span class="time-label">截止：</span>
                    <span class="time-value" :class="{ 'urgent': isUrgent(row.endDate) }">
                      {{ formatDate(row.endDate) }}
                    </span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 进度/成绩信息 -->
            <el-table-column label="进度/成绩" width="180" align="center">
              <template #default="{ row }">
                <!-- 待完成 - 显示倒计时 -->
                <div v-if="row.status === '未完成'" class="countdown-compact">
                  <div class="countdown-text" :class="{ 'urgent': isUrgent(row.endDate) }">
                    剩余时间：{{ getCompactCountdown(row.endDate) }}
                  </div>
                </div>

                <!-- 已提交 - 显示提交时间 -->
                <div v-else-if="row.status === '已提交'" class="submit-info">
                  <div class="submit-time">{{ formatDate(row.submitTime) }}</div>
                  <el-tag :type="row.submitTime <= row.endDate ? 'success' : 'danger'" size="small">
                    {{ row.submitTime <= row.endDate ? '按时' : '逾期' }} </el-tag>
                </div>

                <!-- 已批改 - 显示成绩 -->
                <div v-else-if="row.status === '已评分'" class="grade-compact">
                  <div class="score-display">
                    <span class="score" :style="{ color: getScoreColor(row.score, 100) }">
                      {{ row.score }}
                    </span>
                    <span class="total-score">/ {{ 100 }}</span>
                  </div>
                  <el-tag :type="getGradeTagType(row.score, 100)" size="small">
                    {{ getGradeText(row.score, 100) }}
                  </el-tag>
                </div>
                <!-- 已逾期 - 显示逾期天数 -->
                <div v-else-if="row.status === '已驳回'" class="overdue-info">
                  <div class="overdue-text">
                    作业已驳回，请重新提交
                  </div>
                </div>
                <!-- 已逾期 - 显示逾期天数 -->
                <div v-else class="overdue-info">
                  <div class="overdue-text">
                    逾期 {{ getOverdueDays(row.endDate) }} 天
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <div class="table-actions" @click.stop>
                  <el-button type="primary" size="small" @click="startAssignment(row)">
                    前往提交作业
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section" v-if="assignmentList.length > 0">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[6, 12, 24, 48]"
          :total="totalAssignments" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import {defineProps} from 'vue';
import useAssignmentList from './index'
import './styles.css'
const props=defineProps({
  courseId:Number,
})
// 使用组合式API
const {
  activeTab,
  searchKeyword,
  sortBy,
  loading,
  currentPage,
  pageSize,
  assignmentList,
  totalAssignments,
  handleTabChange,
  handleSearch,
  handleSort,
  handleSizeChange,
  handleCurrentChange,
  refreshData,
  getStatusTagType,
  handleRowClick,
  getScoreColor,
  getGradeTagType,
  getGradeText,
  isUrgent,
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
  Timer
} = useAssignmentList(props.courseId)
</script>
