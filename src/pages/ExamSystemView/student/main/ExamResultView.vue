<template>
    <div class="exam-system">
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
        </div>
        <!-- 主内容区域 -->
        <main class="main-content">
            <!-- 考试结束得分展示区域 -->
            <div v-loading="aiScoreLoading" element-loading-text="AI正在评分..." v-if="submitted">
                <div v-if="!aiScoreLoading && !aiScoreSuccess">
                    <el-empty description="AI评分失败,请稍后重试或退出" />
                    <div class="action-buttons">
                        <el-button type="primary" @click="aiScore" :icon="TopLeft">重新获取AI评分</el-button>
                        <el-button type="danger" @click="exitExam" :icon="Right">退出考试</el-button>
                    </div>
                </div>
                <div v-else-if="!hasScored">
                    <el-empty description="暂无该试卷成绩，请点击下方AI评分按钮获取AI评分" />
                    <div class="action-buttons">
                        <el-button type="primary" @click="aiScore" :icon="TopLeft">AI评分</el-button>
                        <el-button type="danger" @click="exitExam" :icon="Right">返回</el-button>
                    </div>
                </div>
                <div class="result-content" v-else-if="aiScoreSuccess && hasScored">
                    <el-button type="primary" @click="exitExam" class="exit-button">
                        <el-icon>
                            <Right />
                        </el-icon>
                        退出考试
                    </el-button>
                    <!-- 总分展示卡片 -->
                    <el-card class="score-summary-card" shadow="always">
                        <div class="score-header">
                            <div class="score-icon">
                                <el-icon size="60" :color="getScoreColor(totalScore)">
                                    <Trophy v-if="Math.round(totalScore / (examPaper.totalScore / 100)) >= 90" />
                                    <Medal v-else-if="Math.round(totalScore / (examPaper.totalScore / 100)) >= 80" />
                                    <Star v-else-if="Math.round(totalScore / (examPaper.totalScore / 100)) >= 60" />
                                    <Warning v-else />
                                </el-icon>
                            </div>

                            <div class="score-info">
                                <h1 class="exam-title">{{ examTitle }}</h1>
                                <div class="score-display">
                                    <div class="final-score">
                                        <span class="score-number" :style="{ color: getScoreColor(totalScore) }">
                                            {{ totalScore }}
                                        </span>
                                        <span class="score-label">分</span>
                                    </div>
                                    <div class="score-details">
                                        <div class="score-item">
                                            <span class="label">总题数：</span>
                                            <span class="value">{{ totalQuestions }}题</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 成绩等级和评语 -->
                        <div class="score-evaluation">
                            <el-tag :type="getGradeType(totalScore)" size="large" class="grade-tag">
                                {{ getGradeText(totalScore) }}
                            </el-tag>
                            <p class="evaluation-text">{{ getEvaluationText(totalScore) }}</p>
                        </div>

                        <!-- 考试统计信息 -->
                        <div class="exam-stats">
                            <div class="stat-item">
                                <el-icon>
                                    <Clock />
                                </el-icon>
                                <div class="stat-content">
                                    <span class="stat-label">用时</span>
                                    <span class="stat-value">{{ formatTime(usedTime) }}</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <el-icon>
                                    <Calendar />
                                </el-icon>
                                <div class="stat-content">
                                    <span class="stat-label">完成时间</span>
                                    <span class="stat-value">{{ formatDateTime(submitTime) }}</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <el-icon>
                                    <User />
                                </el-icon>
                                <div class="stat-content">
                                    <span class="stat-label">考生</span>
                                    <!--TODO 考生姓名填充-->
                                    <span class="stat-value">xxx</span>
                                </div>
                            </div>
                        </div>
                    </el-card>

                    <!-- 题目详情列表 -->
                    <div class="questions-section">
                        <div class="section-header">
                            <h2>
                                <el-icon>
                                    <Document />
                                </el-icon>
                                题目详情分析
                            </h2>
                        </div>

                        <div class="questions-list">
                            <el-card v-for="question in questions" :key="question.questionId" class="question-card"
                                :class="{ 'correct-answer': question.answer == answers[question.questionId], 'incorrect-answer': question.answer != answers[question.questionId] }"
                                shadow="hover">
                                <div id="question-{{ question.questionId }}">
                                    <!-- 题目头部 -->
                                    <div class="question-header">
                                        <div class="question-number">
                                            <span class="number">{{ question.questionId }}</span>
                                            <el-icon
                                                :color="question.answer == answers[question.questionId] ? '#67C23A' : '#F56C6C'"
                                                size="20">
                                                <Check v-if="question.answer == answers[question.questionId]" />
                                                <Close v-else />
                                            </el-icon>
                                        </div>

                                        <div class="question-meta">
                                            <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                                                {{ question.type }}
                                            </el-tag>
                                            <el-tag :type="getDifficultyColor(question.difficulty)" size="small">
                                                {{ question.difficulty }}
                                            </el-tag>
                                            <span class="question-score">
                                                {{exam?.answers.find((answer) => answer.questionId ==
                                                    question.questionId)?.score}} / {{
                                                    question.score }}
                                                分
                                            </span>
                                        </div>
                                    </div>

                                    <!-- 题目内容 -->
                                    <div class="question-content">
                                        <div style="display: flex;gap: 2rem;align-items: center;">
                                            <h4 class="question-title">{{ question.questionId }}</h4>
                                            <el-button type="primary" @click="handleAIAnalysis(question.questionId)"
                                                class="analysis-button" v-loading="aiAnalysising"
                                                :disabled="aiAnalysising">AI解析</el-button>
                                        </div>
                                        <div class="question-text" v-html="question.content"></div>

                                        <!-- 选项（如果是选择题或判断题） -->
                                        <div v-if="question.options && question.options.length > 0"
                                            class="question-options">
                                            <div v-for="option in question.options" :key="option.optionId"
                                                class="option-item" :class="{
                                                    'user-selected': isUserSelected(question, option.optionId),
                                                    'correct-option': isCorrectOption(question, option.optionId),
                                                    'incorrect-selected': isUserSelected(question, option.optionId) && !isCorrectOption(question, option.optionId)
                                                }">
                                                <span class="option-key">{{ option.optionId }}.</span>
                                                <span class="option-text">{{ option.content }}</span>
                                                <div class="option-indicators">
                                                    <el-tag v-if="isCorrectOption(question, option.optionId)"
                                                        type="success" size="small">
                                                        正确答案
                                                    </el-tag>
                                                    <el-tag v-if="isUserSelected(question, option.optionId)" type="info"
                                                        size="small">
                                                        您的选择
                                                    </el-tag>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 填空题或解答题答案 -->
                                        <div v-if="question.type === '填空题' || question.type == '解答题'"
                                            class="fill-answers">
                                            <div class="answer-comparison">
                                                <div class="user-answer">
                                                    <span class="answer-label">您的答案：</span>
                                                    <span class="answer-content"
                                                        :class="{ 'incorrect': question.answer !== answers[question.questionId] }">
                                                        {{ answers[question.questionId] || '未作答' }}
                                                    </span>
                                                </div>
                                                <div class="correct-answer">
                                                    <span class="answer-label">正确答案：</span>
                                                    <span class="answer-content correct">{{ question.answer }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 题目解析 -->
                                    <div class="question-analysis">
                                        <div class="analysis-header">
                                            <el-icon>
                                                <Reading />
                                            </el-icon>
                                            <span>题目解析</span>
                                        </div>
                                        <div class="analysis-content">
                                            <div v-html="question.analysis"></div>
                                            <!-- 知识点标签 -->
                                            <div v-if="question.tags && question.tags.length > 0"
                                                class="knowledge-points">
                                                <span class="kp-label">相关知识点：</span>
                                                <el-tag v-for="point in question.tags" :key="point" size="small"
                                                    class="kp-tag">
                                                    {{ point }}
                                                </el-tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ai-analysis" v-if="aiAnalysises[question.questionId]">
                                    <p style="color: blue;">AI解析：</p>
                                    <div v-html="aiAnalysises[question.questionId]"></div>
                                </div>
                            </el-card>

                        </div>

                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import './styles.css'
import {
    questions,
    answers,
    aiScoreLoading,
    examTitle,
    totalScore,
    submitted,
    totalQuestions,
    formatDateTime,
    Check,
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
    Right,
    examPaper,
    getScoreColor,
    getGradeType,
    getGradeText,
    getEvaluationText,
    getQuestionTypeColor,
    submitTime,
    usedTime,
    formatTime,
    exam,
    isCorrectOption,
    isUserSelected,
    exitExam,
    getDifficultyColor,
    aiScoreSuccess,
    aiScore,
    hasScored,
    TopLeft,
    init,
    isInit,
    handleAIAnalysis,
    aiAnalysises,
    aiAnalysising
} from './index'

import { useRoute } from 'vue-router'
onMounted(() => {
    document.title = "考试结果"
    if (!isInit.value) {
        init(useRoute())
    }

})
</script>