<template>
    <div class="course-detail">
        <!-- 课程头部信息 -->
        <el-card class="course-header-card" shadow="hover">
            <div class="course-header">
                <div class="course-cover">
                    <img :src="courseInfo.cover || '/placeholder.svg?height=200&width=300'" :alt="courseInfo.name" />
                </div>
                <div class="course-info">
                    <h1 class="course-title">{{ courseInfo.name }}</h1>
                    <p class="course-description">{{ courseInfo.description }}</p>
                    <div class="course-meta">
                        <el-tag :type="getStatusType(courseInfo.status)" size="large">
                            {{ getStatusText(courseInfo.status) }}
                        </el-tag>
                        <span class="meta-item">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            {{ courseInfo.semester }}
                        </span>
                        <span class="meta-item">
                            <el-icon>
                                <User />
                            </el-icon>
                            {{ courseInfo.studentCount }}名学生
                        </span>
                    </div>
                </div>
                <div class="course-actions">
                    <el-button type="primary" @click="editCourse">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        编辑课程
                    </el-button>
                    <el-button type="success" @click="manageStudents">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        学生管理
                    </el-button>
                </div>
            </div>
        </el-card>
        <el-main>
            <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
                <el-menu-item index="0">公告</el-menu-item>
                <el-menu-item index="1">课时</el-menu-item>
                <el-menu-item index="2">学生</el-menu-item>
                <el-menu-item index="3">作业</el-menu-item>
                <el-menu-item index="4">考试</el-menu-item>
            </el-menu>

            <!-- 课程公告 -->
            <el-card v-if="activeIndex==='0'" class="announcements-card" shadow="hover" style="margin-top: 24px;">
                <template #header>
                    <div class="card-header">
                        <span class="card-title">
                            <el-icon>
                                <Bell />
                            </el-icon>
                            课程公告
                        </span>
                        <el-button type="primary" size="small" @click="createAnnouncement">
                            发布公告
                        </el-button>
                    </div>
                </template>

                <div class="announcement-list">
                    <div v-if="announcements.length === 0" class="empty-state">
                        <el-empty description="暂无公告" />
                    </div>
                    <div v-else>
                        <div v-for="announcement in announcements" :key="announcement.id" class="announcement-item">
                            <div class="announcement-title">{{ announcement.title }}</div>
                            <div class="announcement-content">{{ announcement.content }}</div>
                            <div class="announcement-time">{{ formatDateTime(announcement.createTime) }}</div>
                        </div>
                    </div>
                </div>
            </el-card>
            <!--TODO 传入课程ID-->
            <TeacherAssignmentsView v-if="activeIndex==='3'" :course-id="Number(courseId)/*123456*/" />
            <!--TODO 传入课程ID-->
            <TeacherExamListView v-if="activeIndex==='4'" :course-id="Number(courseId)/*123456*/" />
            
            <StudentManagerView v-if="activeIndex==='2'" :course-id="Number(courseId)/*123456*/" />
   
        </el-main>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    Calendar,
    User,
    Edit,
    UserFilled,
    Bell
} from '@element-plus/icons-vue'
import TeacherAssignmentsView from '../AssignmentSystemView/teacher/list/TeacherAssignmentsView.vue'
import TeacherExamListView from '../ExamSystemView/teacher/TeacherExamListView.vue'
import StudentManagerView from './StudentManagerView.vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.id
const activeIndex = ref('0')

// 课程信息
const courseInfo = ref({
    id: courseId,
    name: '数据结构与算法',
    description: '深入学习数据结构的基本概念和算法设计，包括线性表、栈、队列、树、图等数据结构，以及排序、查找等基本算法。',
    cover: '/placeholder.svg?height=200&width=300',
    status: 'active',
    semester: '2024秋季',
    studentCount: 45
})
const handleSelect=(index)=>{
    activeIndex.value = index
}

// 课程公告
const announcements = ref([
    {
        id: 1,
        title: '期中考试安排',
        content: '期中考试将于下周三进行，请同学们做好准备。',
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 2,
        title: '作业提交提醒',
        content: '第三章作业截止时间为本周五，请及时提交。',
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
])

// 方法
const getStatusType = (status: string) => {
    const types: Record<string, string> = {
        active: 'success',
        completed: 'info',
        draft: 'warning'
    }
    return types[status] || 'info'
}

const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
        active: '进行中',
        completed: '已结束',
        draft: '草稿'
    }
    return texts[status] || '未知'
}

const getAssignmentStatusType = (status: string) => {
    const types: Record<string, string> = {
        '进行中': 'primary',
        '已结束': 'success',
        '草稿': 'warning'
    }
    return types[status] || 'info'
}

const getExamStatusType = (status: string) => {
    const types: Record<string, string> = {
        '待开始': 'warning',
        '进行中': 'primary',
        '已结束': 'success'
    }
    return types[status] || 'info'
}

const formatDateTime = (date: Date) => {
    return date.toLocaleString('zh-CN')
}

const editCourse = () => {
    router.push('/teacher/course/list')
    ElMessage.info('跳转到课程编辑页面')
}

const manageStudents = () => {
    router.push('/teacher/student/list')
}

const manageAssignments = () => {
    router.push(`/teacher/assignment/list/${courseId}`)
}

const manageExams = () => {
    router.push(`/teacher/exam/list/${courseId}`)
}

const createAnnouncement = () => {
    ElMessage.info('发布公告功能开发中...')
}

onMounted(() => {
    document.title = `${courseInfo.value.name} - 课程详情`
})
</script>

<style scoped>
.course-detail {
    min-height: 100vh;
}

.course-header-card {
    margin-bottom: 24px;
    border-radius: 12px;
}

.course-header {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

.course-cover {
    flex-shrink: 0;
    width: 200px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
}

.course-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.course-info {
    flex: 1;
}

.course-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
}

.course-description {
    font-size: 16px;
    color: #606266;
    line-height: 1.6;
    margin: 0 0 16px 0;
}

.course-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 14px;
}

.course-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.main-content {
    margin-top: 24px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}

.recent-assignments-card,
.recent-exams-card,
.student-activity-card,
.announcements-card {
    border-radius: 12px;
}

.assignment-list,
.exam-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.assignment-item,
.exam-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.assignment-info,
.exam-info {
    flex: 1;
}

.assignment-title,
.exam-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
}

.assignment-meta,
.exam-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #909399;
}

.assignment-stats {
    text-align: right;
    min-width: 120px;
}

.submitted {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
    display: block;
}

.exam-stats {
    display: flex;
    gap: 24px;
}

.stat-item {
    text-align: center;
}

.stat-item .stat-number {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    line-height: 1;
    margin-bottom: 4px;
}

.stat-item .stat-label {
    font-size: 12px;
    color: #909399;
}

.chart-placeholder {
    text-align: center;
    padding: 60px 20px;
    color: #909399;
}

.chart-placeholder p {
    margin: 12px 0 0 0;
    font-size: 14px;
}

.announcement-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.announcement-item {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}

.announcement-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
}

.announcement-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 8px;
}

.announcement-time {
    font-size: 12px;
    color: #909399;
}

.empty-state {
    padding: 40px 20px;
    text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .course-header {
        flex-direction: column;
    }

    .course-cover {
        width: 100%;
        height: 200px;
    }

    .course-actions {
        flex-direction: row;
        width: 100%;
    }

    .assignment-item,
    .exam-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .assignment-stats,
    .exam-stats {
        width: 100%;
    }
}
</style>
