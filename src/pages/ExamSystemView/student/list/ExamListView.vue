<template>
    <div class="exam-list-container">
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
        </div>
        <div class="exam-list-content">
            <!-- 筛选和搜索 -->
            <el-card class="filter-card" shadow="hover">
                <div class="filter-section">
                    <div class="filter-left">
                        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                            <el-tab-pane label="全部考试" name="all">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <List />
                                        </el-icon>
                                        全部考试 ({{ totalExams }})
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="待开始" name="pending">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        待开始
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="进行中" name="ongoing">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <VideoPlay />
                                        </el-icon>
                                        进行中
                                    </span>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane label="已完成" name="completed">
                                <template #label>
                                    <span class="tab-label">
                                        <el-icon>
                                            <Check />
                                        </el-icon>
                                        已完成
                                    </span>
                                </template>
                            </el-tab-pane>
                        </el-tabs>
                    </div>

                    <div class="filter-right">
                        <el-input v-model="searchKeyword" placeholder="搜索考试名称" :prefix-icon="Search" clearable
                            style="width: 300px;" @input="handleSearch" />
                        <!--<el-select v-model="selectedCourse" placeholder="选择课程" clearable style="width: 150px;"
                            @change="handleCourseFilter">
                            <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
                        </el-select>-->
                    </div>
                </div>
            </el-card>

            <!-- 考试列表 -->
            <div class="exam-list" v-loading="loading">
                <div v-if="examList.length === 0 && !loading" class="empty-state">
                    <el-empty description="暂无考试数据">
                        <el-button type="primary" @click="refreshData">刷新数据</el-button>
                    </el-empty>
                </div>

                <div v-else-if="!loading" class="exam-cards">
                    <el-card v-for="exam in examList" :key="exam.id" class="exam-card" :class="`exam-${exam.status}`"
                        shadow="hover">
                        <!-- 考试卡片头部 -->
                        <div class="exam-card-header">
                            <div class="exam-title-section">
                                <h3 class="exam-title">{{ exam.title }}</h3>
                                <div class="exam-meta">
                                    <!--<el-tag :type="getCourseTagType()" size="small">
                                        {{ exam.courseName||"未知课程" }}
                                    </el-tag>-->
                                    <el-tag :type="getStatusTagType(exam.status)" size="small">
                                        {{ getStatusText(exam.status) }}
                                    </el-tag>
                                </div>
                            </div>

                            <div class="exam-status-icon">
                                <el-icon :size="32" :color="getStatusColor(exam.status)">
                                    <Clock v-if="exam.status === 'pending'" />
                                    <VideoPlay v-else-if="exam.status === 'ongoing'" />
                                    <Check v-else-if="exam.status === 'completed'" />
                                </el-icon>
                            </div>
                        </div>

                        <!-- 考试详细信息 -->
                        <div class="exam-details">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    <span class="detail-label">开始时间：</span>
                                    <span class="detail-value">{{ formatDateTime(exam.startTime) }}</span>
                                </div>
                                <div class="detail-item">
                                    <el-icon>
                                        <Timer />
                                    </el-icon>
                                    <span class="detail-label">考试时长：</span>
                                    <span class="detail-value">{{ exam.duration }}分钟</span>
                                </div>
                            </div>

                            <div class="detail-row">
                                <div class="detail-item">
                                    <el-icon>
                                        <Document />
                                    </el-icon>
                                    <span class="detail-label">题目数量：</span>
                                    <span class="detail-value">{{ exam.questionNum }}题</span>
                                </div>
                                <div class="detail-item">
                                    <el-icon>
                                        <Star />
                                    </el-icon>
                                    <span class="detail-label">总分：</span>
                                    <span class="detail-value">{{ exam.totalScore }}分</span>
                                </div>
                            </div>

                            <!-- 进度信息（仅进行中的考试显示） -->
                            <div v-if="exam.status === 'ongoing'" class="exam-progress">
                                <div class="progress-info">
                                    <span class="progress-label">答题进度：</span>
                                    <span class="progress-text">{{ exam.answerNum }}/{{ exam.questionNum }}</span>
                                </div>
                                <el-progress :percentage="Math.round((exam.answerNum / exam.questionNum) * 100)"
                                    :stroke-width="8" :show-text="false" />
                                <div class="time-remaining">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>剩余时间：{{ formatTimeRemaining(remainTimes[exam.id]) }}</span>
                                </div>
                            </div>

                            <!-- 成绩信息（仅已完成的考试显示） -->
                            <div v-if="exam.status === 'completed'" class="exam-result">
                                <div class="result-score">
                                    <span class="score-label">得分：</span>
                                    <span class="score-value"
                                        :style="{ color: getScoreColor(exam.score, exam.totalScore) }">
                                        {{ exam.score }}分
                                    </span>
                                    <span class="score-total">/ {{ exam.totalScore }}分</span>
                                </div>
                                <div class="result-details">
                                    <span class="result-item">
                                        正确：<span class="correct-count">{{ exam.correctNum }}</span>题
                                    </span>
                                    <span class="result-item">
                                        错误：<span class="incorrect-count">{{ exam.questionNum - exam.correctNum
                                        }}</span>题
                                    </span>
                                    <span class="result-item">
                                        正确率：<span class="accuracy">{{ Math.floor((exam.correctNum / exam.questionNum) *
                                            100)
                                            }}%</span>
                                    </span>
                                </div>
                            </div>

                            <!-- 倒计时（仅待开始的考试显示） -->
                            <div v-if="exam.status === 'pending'" class="exam-countdown">
                                <div class="countdown-label">
                                    <el-icon>
                                        <Timer />
                                    </el-icon>
                                    <span>距离开始还有：</span>
                                </div>
                                <div class="countdown-display">
                                    <div class="countdown-item">
                                        <span class="countdown-number">{{ getCountdown(exam.startTime).days }}</span>
                                        <span class="countdown-unit">天</span>
                                    </div>
                                    <div class="countdown-item">
                                        <span class="countdown-number">{{ getCountdown(exam.startTime).hours }}</span>
                                        <span class="countdown-unit">时</span>
                                    </div>
                                    <div class="countdown-item">
                                        <span class="countdown-number">{{ getCountdown(exam.startTime).minutes }}</span>
                                        <span class="countdown-unit">分</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="exam-actions">
                            <template v-if="exam.status === 'pending'">
                                <el-button type="primary" size="small" :disabled="!canEnterExam(exam)"
                                    @click="enterExam(exam)" :icon="Right">
                                    {{ canEnterExam(exam) ? '进入考试' : '未到时间' }}
                                </el-button>
                            </template>

                            <template v-else-if="exam.status === 'ongoing'">
                                <el-button type="warning" size="small" @click="continueExam(exam)" :icon="VideoPlay">
                                    继续考试
                                </el-button>
                            </template>

                            <template v-else-if="exam.status === 'completed'">
                                <el-button size="small" @click="viewExamResult(exam)" :icon="Document">
                                    查看成绩
                                </el-button>
                            </template>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-section" v-if="examList.length > 0">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[6, 12, 24, 48]" :total="totalExams" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Search, Document, List, Clock, VideoPlay, Check, Calendar, Timer, Star, Right } from '@element-plus/icons-vue'
import useExamList from './index'
import { useRoute } from 'vue-router'
import { defineProps } from 'vue'
const props = defineProps({
    courseId: Number
})
// 使用组合式API
const {
    activeTab,
    searchKeyword,
    loading,
    currentPage,
    pageSize,
    remainTimes,
    totalExams,
    examList,
    handleTabChange,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    getStatusTagType,
    getStatusText,
    getStatusColor,
    getScoreColor,
    formatDateTime,
    formatTimeRemaining,
    getCountdown,
    canEnterExam,
    enterExam,
    continueExam,
    viewExamResult
} = useExamList(props.courseId)
</script>

<style>
@import './styles.css';
</style>