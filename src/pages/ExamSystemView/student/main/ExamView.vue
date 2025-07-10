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
      <!--等待考试开始区域-->
      <div class="waiting-content" v-if="!started">
        <!-- 主要内容卡片 -->
        <el-card class="main-card" shadow="always">
          <div class="exam-intro">
            <!-- 考试标题区域 -->
            <div class="exam-header">
              <div class="exam-icon">
                <el-icon size="48" color="#409EFF">
                  <Document />
                </el-icon>
              </div>
              <h1 class="exam-title">{{ examTitle }}</h1>
              <p class="exam-description">{{ examDescription }}</p>

              <!-- 考试基本信息 -->
              <div class="exam-meta">
                <div class="meta-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  <span>考试时长：{{ examDuration }}分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon>
                    <User />
                  </el-icon>
                  <!--考生姓名填充-->
                  <span>考生：xxx</span>
                </div>
              </div>
            </div>

            <!-- 倒计时区域 -->
            <div class="countdown-section">
              <div class="countdown-title">
                <el-icon size="20">
                  <Timer />
                </el-icon>
                <span>考试将在以下时间开始</span>
              </div>

              <div class="countdown-display">
                <div class="time-block">
                  <div class="time-number">{{ timeLeft.days }}</div>
                  <div class="time-label">天</div>
                </div>
                <div class="time-separator">:</div>
                <div class="time-block">
                  <div class="time-number">{{ timeLeft.hours }}</div>
                  <div class="time-label">时</div>
                </div>
                <div class="time-separator">:</div>
                <div class="time-block">
                  <div class="time-number">{{ timeLeft.minutes }}</div>
                  <div class="time-label">分</div>
                </div>
                <div class="time-separator">:</div>
                <div class="time-block">
                  <div class="time-number">{{ timeLeft.seconds }}</div>
                  <div class="time-label">秒</div>
                </div>
              </div>

              <div class="exam-time-info">
                <p><strong>开始时间：</strong>{{ formatDateTime(startTime) }}</p>
                <p><strong>结束时间：</strong>{{ formatDateTime(endTime) }}</p>
              </div>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-section">
              <el-button type="primary" size="large" class="enter-exam-btn" :disabled="!canEnterExam"
                :loading="enteringExam" @click="enterExam">
                <el-icon>
                  <Right />
                </el-icon>
                {{ canEnterExam ? '进入考试' : `还需等待 ${Math.ceil(totalSecondsLeft / 60)} 分钟` }}
              </el-button>
            </div>
          </div>
          <!-- 考试注意事项 -->
          <div class="notice-section">
            <h3 class="notice-title">
              <el-icon>
                <Warning />
              </el-icon>
              考试注意事项
            </h3>

            <el-alert title="重要提醒" type="warning" :closable="false" show-icon class="important-alert">
              <p>请仔细阅读以下注意事项，确保考试顺利进行</p>
            </el-alert>

            <div class="notice-list">
              <div class="notice-category">
                <h4><el-icon>
                    <Monitor />
                  </el-icon>技术要求</h4>
                <ul>
                  <li>确保网络连接稳定，建议使用有线网络</li>
                  <li>建议使用Chrome、Firefox或Edge浏览器</li>
                  <li>关闭其他不必要的网页和应用程序</li>
                  <li>确保设备电量充足或连接电源</li>
                </ul>
              </div>

              <div class="notice-category">
                <h4><el-icon>
                    <Lock />
                  </el-icon>考试规则</h4>
                <ul>
                  <li>考试开始后不得离开考试页面</li>
                  <li>严禁使用任何作弊工具或查阅资料</li>
                  <li>每题答案提交后不可修改</li>
                  <li>考试时间结束后系统将自动提交答案</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <!--考试试题区域-->
      <div id="exam" class="page" v-if="started && !submitted" v-loading="loading">
        <div class="exam-content">
          <div class="exam-main">
            <!-- 考试头部 -->
            <el-card class="exam-header" shadow="hover">
              <div class="exam-info">
                <div class="exam-title-section">
                  <h1>
                    <el-icon>
                      <Promotion />
                    </el-icon>
                    {{ examTitle }}
                  </h1>
                  <p style="text-align: left;">总分：{{ examPaper?.totalScore }} 分</p>
                  <div class="exam-meta">
                    <span class="question-counter">
                      <el-icon>
                        <List />
                      </el-icon>
                      第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ totalQuestions }} 题
                    </span>
                    <div class="progress-container">
                      <el-progress :percentage="progressPercentage" :format="(format: any) => `${format}%`"
                        :stroke-width="8" :color="progressColor" />
                    </div>
                  </div>

                  <!-- 切屏次数展示 -->
                  <div class="switch-count-info" v-if="started && !submitted">
                    <el-tag type="danger" effect="plain">切屏次数：{{ switchCount }}</el-tag>
                  </div>
                </div>
              </div>
              <div class="exam-timer">
                <div class="timer-container">
                  <el-icon>
                    <Timer />
                  </el-icon>
                  <span :class="{ 'time-critical': isTimeCritical }">{{ formattedTime }}</span>
                </div>
                <el-alert v-if="isTimeCritical" title="时间不足！" type="warning" :closable="false" show-icon />
              </div>
            </el-card>

            <!-- 题目内容区域 -->
            <el-card class="question-container" shadow="hover">
              <template #header>
                <div class="question-header">
                  <el-tag :type="questionTypeTag" effect="light">
                    {{ currentQuestion?.type }}
                  </el-tag>
                  <span>第 {{ currentQuestionIndex + 1 }} 题</span>
                </div>
              </template>

              <div class="question-content">
                <p>{{ `(${currentQuestion?.score}分)` + currentQuestion?.content }}</p>

                <!-- 单选题 -->
                <el-radio-group v-if="currentQuestion?.type === '单选题'" v-model="answers[currentQuestion.questionId]"
                  class="question-options" @change="handleAnswerChange">
                  <el-radio v-for="option in currentQuestion.options" :key="(option as Option).optionId"
                    :label="(option as Option).optionId">
                    {{ (option as Option).optionId + "、" + (option as Option).content }}
                  </el-radio>
                </el-radio-group>

                <!-- 多选题 -->
                <el-checkbox-group v-if="currentQuestion?.type === '多选题'" v-model="answers[currentQuestion.questionId]"
                  class="question-options" @change="handleAnswerChange">
                  <el-checkbox v-for="option in currentQuestion.options" :key="(option as Option).optionId"
                    :label="(option as Option).optionId">
                    {{ (option as Option).optionId + "、" + (option as Option).content }}
                  </el-checkbox>
                </el-checkbox-group>

                <!-- 判断题 -->
                <el-radio-group v-if="currentQuestion?.type === '判断题'" v-model="answers[currentQuestion.questionId]"
                  class="question-options" @change="handleAnswerChange">
                  <el-radio v-for="option in currentQuestion.options" :key="(option as Option).optionId"
                    :label="(option as Option).optionId">
                    {{ (option as Option).optionId + "、" + (option as Option).content }}
                  </el-radio>
                </el-radio-group>

                <!-- 填空题 -->
                <div v-if="currentQuestion?.type === '填空题'">
                  <el-input v-model="answers[currentQuestion.questionId]" type="text" placeholder="请在此输入答案..."
                    @change="handleAnswerChange" size="large" />
                </div>

                <!-- 解答题 -->
                <div v-if="currentQuestion?.type === '解答题'">
                  <el-input v-model="answers[currentQuestion.questionId]" type="textarea" :rows="20"
                    placeholder="请在此输入答案..." @change="handleAnswerChange" size="large" />
                </div>
              </div>
            </el-card>

            <!-- 控制按钮 -->
            <div class="exam-controls">
              <el-button :icon="ArrowLeft" type="primary" :disabled="currentQuestionIndex === 0"
                @click="previousQuestion">
                上一题
              </el-button>

              <el-button type="success" :icon="Check" @click="saveCurrentAnswer">
                保存答案
              </el-button>

              <template v-if="currentQuestionIndex < totalQuestions - 1">
                <el-button :icon="ArrowRight" type="primary" @click="nextQuestion">
                  下一题
                </el-button>
              </template>
              <template v-else>
                <el-button type="danger" :icon="Position" @click="showSubmitConfirm">
                  提交考试
                </el-button>
              </template>
            </div>
          </div>

          <!-- 题目导航 -->
          <el-card class="question-nav-container" shadow="hover">
            <template #header>
              <div class="nav-header">
                <h3>
                  <el-icon>
                    <Menu />
                  </el-icon>
                  题目导航
                </h3>
                <div class="nav-legend">
                  <div class="legend-item">
                    <el-tag type="primary" effect="plain" size="small">当前</el-tag>
                  </div>
                  <div class="legend-item">
                    <el-tag type="success" effect="plain" size="small">已答</el-tag>
                  </div>
                  <div class="legend-item">
                    <el-tag type="info" effect="plain" size="small">未答</el-tag>
                  </div>
                </div>
              </div>
            </template>

            <div class="question-nav">
              <el-button v-for="(question, index) in questions" :key="question.questionId"
                :type="getNavButtonType(index)" :class="{ 'nav-btn': true, 'current': index === currentQuestionIndex }"
                @click="goToQuestion(index)">
                {{ index + 1 }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </main>

    <!-- 提交确认对话框 -->
    <el-dialog v-model="showSubmitDialog" title="确认提交" width="30%" :show-close="false" :close-on-click-modal="false">
      <div class="submit-dialog-content">
        <el-alert title="提交后将无法修改答案！" type="warning" :closable="false" show-icon style="margin-bottom: 20px;" />

        <div class="submit-stats">
          <div class="stat-item">
            <div class="stat-number">{{ answeredCount }}</div>
            <div class="stat-label">已答题</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ unansweredCount }}</div>
            <div class="stat-label">未答题</div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSubmitDialog = false">取消</el-button>
          <el-button type="danger" @click="finalSubmit">确认提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import './styles.css'
import {
  currentQuestionIndex,
  questions,
  answers,
  showSubmitDialog,
  loading,
  examTitle,
  examDescription,
  started,
  submitted,
  totalQuestions,
  currentQuestion,
  formatDateTime,
  startTime,
  endTime,
  timeLeft,
  canEnterExam,
  enterExam,
  enteringExam,
  totalSecondsLeft,
  progressPercentage,
  progressColor,
  formattedTime,
  isTimeCritical,
  answeredCount,
  unansweredCount,
  questionTypeTag,
  init,
  goToQuestion,
  previousQuestion,
  nextQuestion,
  handleAnswerChange,
  saveCurrentAnswer,
  showSubmitConfirm,
  finalSubmit,
  getNavButtonType,
  ArrowLeft,
  ArrowRight,
  Check,
  Position,
  Timer,
  List,
  Menu,
  Warning,
  Clock,
  User,
  Document,
  Right,
  Monitor,
  Lock,
  Promotion,
  examPaper,
  examDuration,
  switchCount
} from './index'
import type { Option } from './index'
import { useRoute } from 'vue-router'
import { onBeforeRouteUpdate } from 'vue-router'
import { onBeforeRouteLeave } from 'vue-router'
// 初始化
onMounted(() => {
  init(useRoute())
  const mainHeader = document.getElementById('main-head');
  if (mainHeader) {
    mainHeader.style.display = 'none';
  }
  const mainFooter = document.getElementById('main-foot');
  if (mainFooter) {
    mainFooter.style.display = 'none';
  }
  // 添加键盘快捷键支持
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) return // 避免与浏览器快捷键冲突

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        previousQuestion()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextQuestion()
        break
      case 'Enter':
        if (e.target instanceof HTMLElement &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          nextQuestion()
        }
        break
    }
  })
})
</script>