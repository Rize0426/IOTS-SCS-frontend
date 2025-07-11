<!-- components/course/CourseDetail.vue -->
<template>
  <div class="course-detail" v-loading="loading">
    <!-- 使用拆分后的组件 -->
    <CourseHeader :courseName="courseDetail.course_name" :status="courseDetail.status"
      :teacherName="courseDetail.teacher_name" :startDate="courseDetail.start_date" :endDate="courseDetail.end_date"
      :totalLessons="courseDetail.total_lessons" :credit="courseDetail.credit"
      :totalCourseLessons="courseDetail.total_lessons" :completedLessons="totalLessonsCompleted" />

    <div class="course-main-content">
      <el-row :gutter="20">
        <!-- 左侧区域 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="17" class="main-content-left">
          <CourseTabs :chapters="chapters" :assignments="assignments" :exams="exams" :discussions="discussions"
            :loading="loading" :course-id="courseId" @download-resource="handleDownloadResource"
            @preview-video="handlePreviewVideo" @play-video="handlePlayVideo"
            @submit-assignment="handleSubmitAssignment" @view-submission="handleViewSubmission"
            @download-attachments="handleDownloadAttachments" @reserve-exam="handleReserveExam"
            @start-exam="handleStartExam" @view-result="handleViewResult" @view-discussion="handleViewDiscussion"
            @new-discussion="showNewDiscussionDialog = true" />
        </el-col>

        <!-- 右侧区域 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="7" class="main-content-right">
          <CourseStats :totalLessons="courseDetail.total_lessons" :totalLessonsCompleted="totalLessonsCompleted"
            :totalAssignments="assignments.length" :totalAssignmentsSubmitted="totalAssignmentsSubmitted"
            :totalExams="exams.length" :totalExamsTaken="totalExamsTaken" :courseProgress="courseProgress"
            :recentActivities="recentActivities" />

          <RecommendedCourses :recommendedCourses="recommendedCourses" />
        </el-col>
      </el-row>

      <!-- 视频播放弹窗 -->
      <VideoPlayerModal v-model:visible="showVideoPlayer" :videoUrl="currentVideoUrl" :videoInfo="currentVideoInfo" />
    </div>

    <!-- 新建讨论对话框 -->
    <el-dialog v-model="showNewDiscussionDialog" title="发布新话题" width="50%">
      <el-form :model="newDiscussionForm" label-width="80px">
        <el-form-item label="话题标题">
          <el-input v-model="newDiscussionForm.title" placeholder="请输入话题标题"></el-input>
        </el-form-item>

        <el-form-item label="话题内容">
          <el-input v-model="newDiscussionForm.content" type="textarea" :rows="5" placeholder="请输入话题内容"></el-input>
        </el-form-item>

        <el-form-item label="话题标签">
          <el-select v-model="newDiscussionForm.tags" multiple filterable placeholder="请选择话题标签" style="width: 100%">
            <el-option v-for="tag in discussionTags" :key="tag.value" :label="tag.label" :value="tag.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="上传附件">
          <el-upload action="#" :http-request="handleFileUpload" :limit="3" multiple list-type="picture-card">
            <template #default="scope">
              <el-icon>
                <Plus />
              </el-icon>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewDiscussionDialog = false">取消</el-button>
          <el-button type="primary" @click="submitNewDiscussion">发布</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 作业提交对话框 -->
    <el-dialog v-model="showSubmitAssignmentDialog" title="提交作业" width="50%">
      <el-form :model="submitAssignmentForm" label-width="80px">
        <el-form-item label="作业附件">
          <el-upload action="#" :http-request="handleSubmitAttachmentUpload" :limit="5" multiple
            list-type="picture-card">
            <template #default="scope">
              <el-icon>
                <Plus />
              </el-icon>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="主观题答案">
          <el-input v-model="submitAssignmentForm.answer_content" type="textarea" :rows="6"
            placeholder="请输入主观题答案"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSubmitAssignmentDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmitAssignment">确认提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import {
  Document, User, Calendar, Clock, VideoPlay, Paperclip,
  Edit, View, ChatLineRound, Star, Plus, Timer
} from '@element-plus/icons-vue';

// 导入模拟API方法，这里暂时保留用于没有真实API的请求
import {
  mockApiRequest,
  // getCourseResources, // 替换为真实API
  // getChapters, // 替换为真实API
  getAssignments as mockGetAssignments,
  getExams as mockGetExams,
  getDiscussions as mockGetDiscussions,
  createDiscussion as mockCreateDiscussion,
  downloadFile,
  previewVideo,
  submitAssignment as mockSubmitAssignment,
  uploadFile as mockUploadFile,
  reserveExam as mockReserveExam,
  startExam as mockStartExam,
  viewExamResult as mockViewExamResult,
  getRecommendedCourses as mockGetRecommendedCourses
} from './mockApi'; // 需要创建这个mockApi.js文件

// 导入子组件
import CourseHeader from './CourseHeader.vue';
import CourseTabs from './CourseTabs.vue';
import CourseStats from './CourseStats.vue';
import RecommendedCourses from './RecommendedCourses.vue';
import VideoPlayerModal from './VideoPlayerModal.vue';
import {studentCourseApi} from "@/api/course.js";

// 默认占位图
const defaultVideoThumbnail = 'https://via.placeholder.com/300x180?text=视频缩略图';
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

export default {
  name: 'CourseDetail',
  components: {
    CourseHeader,
    CourseTabs,
    CourseStats,
    RecommendedCourses,
    VideoPlayerModal,
    Document, User, Calendar, Clock, VideoPlay, Paperclip,
    Edit, View, ChatLineRound, Star, Plus, Timer
  },

  setup() {
    const router = useRouter();
    const route = useRoute();

    // 从路由参数获取课程ID
    const courseId = computed(() => route.params.id);

    // 加载状态
    const loading = ref(true);

    // 当前选中的标签页
    const activeTab = ref('resources');

    // 课程详情数据
    const courseDetail = ref({});

    // 章节数据（包含资源和视频）
    const chapters = ref([]);

    const chaptersVideos = ref([]);

    // 作业列表
    const assignments = ref([]);

    // 考试列表
    const exams = ref([]);

    // 讨论列表
    const discussions = ref([]);

    // 推荐课程列表
    const recommendedCourses = ref([]);

    // 最近学习活动
    const recentActivities = ref([]);

    // 讨论标签选项
    const discussionTags = ref([
      { value: 'question', label: '问题求助' },
      { value: 'discussion', label: '讨论交流' },
      { value: 'resource', label: '资源共享' },
      { value: 'assignment', label: '作业相关' },
      { value: 'exam', label: '考试经验' }
    ]);

    // 新建讨论表单数据
    const showNewDiscussionDialog = ref(false);
    const newDiscussionForm = reactive({
      title: '',
      content: '',
      tags: []
    });

    // 作业提交表单数据
    const showSubmitAssignmentDialog = ref(false);
    const submitAssignmentForm = reactive({
      answer_content: '',
      attachments: []
    });

    // 视频播放器相关状态
    const showVideoPlayer = ref(false);
    const currentVideoUrl = ref('');
    const currentVideoInfo = reactive({
      title: '',
      description: '',
      video_id: ''
    });
    const videoPlayerRef = ref(null);

    // 统计数据
    const totalLessonsCompleted = ref(0); // 从API获取
    const totalAssignmentsSubmitted = computed(() => {
      return assignments.value.filter(assignment =>
          assignment.status === 'submitted' || assignment.status === 'completed'
      ).length;
    });

    const totalExamsTaken = computed(() => {
      return exams.value.filter(exam =>
          ['completed', 'graded'].includes(exam.status)
      ).length;
    });

    // 课程进度
    const courseProgress = ref(0); // 从API获取

    // 进度条颜色
    const progressColor = computed(() => {
      const progress = courseProgress.value;
      if (progress >= 90) return '#67C23A'; // 绿色，优秀
      if (progress >= 70) return '#409EFF'; // 蓝色，良好
      if (progress >= 60) return '#E6A23C'; // 黄色，中等
      return '#F56C6C'; // 红色，较差
    });

    // 格式化进度条显示文本
    const progressFormat = (percentage) => {
      return `学习进度 ${percentage}%`;
    };

    // 格式化视频进度显示文本
    const videoProgressFormat = (percentage) => {
      return `${percentage}%`;
    };

    // 获取课程状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'in_progress': '进行中',
        'completed': '已完成',
        'not_started': '未开始'
      };
      return statusMap[status] || '未知';
    };

    // 获取课程状态对应的标签类型
    const getStatusType = (status) => {
      const typeMap = {
        'in_progress': 'warning',
        'completed': 'success',
        'not_started': 'info'
      };
      return typeMap[status] || 'info';
    };

    // 获取作业状态文本
    const getAssignmentStatusText = (status) => {
      const statusMap = {
        'pending': '未开始',
        'submitted': '已提交',
        'graded': '已批改',
        'completed': '已完成'
      };
      return statusMap[status] || '未知';
    };

    // 获取作业状态对应的标签类型
    const getAssignmentStatusType = (status) => {
      const typeMap = {
        'pending': 'info',
        'submitted': 'warning',
        'graded': 'success',
        'completed': 'success'
      };
      return typeMap[status] || 'info';
    };

    // 获取考试状态文本
    const getExamStatusText = (status) => {
      const statusMap = {
        'upcoming': '未开始',
        'ongoing': '进行中',
        'completed': '已结束',
        'graded': '已批改'
      };
      return statusMap[status] || '未知';
    };

    // 获取考试状态对应的标签类型
    const getExamStatusType = (status) => {
      const typeMap = {
        'upcoming': 'info',
        'ongoing': 'warning',
        'completed': 'success',
        'graded': 'success'
      };
      return typeMap[status] || 'info';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '无日期';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    // 格式化时长（转换为小时:分钟格式）
    const formatDuration = (durationInSeconds) => {
      if (!durationInSeconds) return '00:00';
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 计算剩余时间
    const calculateRemainingTime = (deadline) => {
      if (!deadline) return '无截止时间';

      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate - now;

      if (diffMs <= 0) return '已截止';

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let remainingTime = '';
      if (diffDays > 0) remainingTime += `${diffDays}天 `;
      remainingTime += `${diffHours}小时 ${diffMinutes}分钟`;

      return remainingTime;
    };

    // 处理资源操作（下载或预览）
    const handleResourceAction = (resource) => {
      if (resource.type === 'video') {
        // 预览视频
        currentVideoUrl.value = resource.url;
        currentVideoInfo.title = resource.name;
        currentVideoInfo.description = resource.description || '';
        currentVideoInfo.video_id = resource.resource_id;
        showVideoPlayer.value = true;
      } else {
        // 下载文件
        downloadFile(resource.resource_id);
      }
    };

    // 播放视频
    const playVideo = (video) => {
      currentVideoUrl.value = video.url;
      currentVideoInfo.title = video.title;
      currentVideoInfo.description = video.description || '';
      currentVideoInfo.video_id = video.video_id;
      showVideoPlayer.value = true;
    };

    // 下载文件
    const downloadFile = async (fileId) => {
      try {
        // 调用模拟API下载文件
        const response = await downloadFile(fileId); // 这里仍然使用mockApi的downloadFile
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'download');
        document.body.appendChild(link);
        link.click();
        link.remove();
        ElMessage.success('文件下载成功');
      } catch (error) {
        ElMessage.error('下载失败，请重试');
        console.error('下载文件失败:', error);
      }
    };

    // 提交作业
    const submitAssignment = async (assignmentId) => {
      try {
        // 打开提交作业对话框
        showSubmitAssignmentDialog.value = true;
        submitAssignmentForm.answer_content = '';
        submitAssignmentForm.attachments = [];

        // 设置当前作业ID
        submitAssignmentForm.assignment_id = assignmentId;
      } catch (error) {
        ElMessage.error('打开提交作业表单失败');
        console.error('打开提交作业表单失败:', error);
      }
    };

    // 确认提交作业
    const confirmSubmitAssignment = async () => {
      if (!submitAssignmentForm.answer_content && submitAssignmentForm.attachments.length === 0) {
        ElMessage.warning('请至少提交作业内容或附件');
        return;
      }

      try {
        const formData = {
          answer_content: submitAssignmentForm.answer_content,
          attachments: submitAssignmentForm.attachments.map(item => ({
            file_id: item.file_id,
            file_name: item.name
          }))
        };

        // 调用模拟API提交作业
        await mockSubmitAssignment(
            courseId.value,
            submitAssignmentForm.assignment_id,
            formData
        );

        showSubmitAssignmentDialog.value = false;
        ElNotification({
          title: '提交成功',
          message: '作业已成功提交',
          type: 'success'
        });

        // 重新加载作业列表
        await loadAssignments();
      } catch (error) {
        ElMessage.error('提交作业失败，请重试');
        console.error('提交作业失败:', error);
      }
    };

    // 处理文件上传（作业附件）
    const handleSubmitAttachmentUpload = async (options) => {
      const { file } = options;

      try {
        // 上传文件到服务器
        const response = await mockUploadFile(file, 'homework_attachment');

        // 将上传的文件添加到附件列表
        submitAssignmentForm.attachments.push({
          file_id: response.fileId,
          name: file.name
        });

        ElMessage.success(`${file.name} 上传成功`);
      } catch (error) {
        ElMessage.error(`${file.name} 上传失败`);
        console.error('文件上传失败:', error);
      }
    };

    // 处理文件上传（讨论区附件）
    const handleFileUpload = async (options) => {
      const { file } = options;

      try {
        // 上传文件到服务器
        const response = await mockUploadFile(file, 'discussion_attachment');

        // 将上传的文件添加到附件列表
        newDiscussionForm.attachments = [
          ...newDiscussionForm.attachments,
          {
            file_id: response.fileId,
            name: file.name,
            url: '#'
          }
        ];

        ElMessage.success(`${file.name} 上传成功`);
      } catch (error) {
        ElMessage.error(`${file.name} 上传失败`);
        console.error('文件上传失败:', error);
      }
    };

    // 查看讨论详情
    const viewDiscussionDetail = async (postId) => {
      try {
        const discussion = discussions.value.find(item => item.post_id === postId);
        if (!discussion) return;

        // 打开讨论详情页面或弹窗
        // 这里假设点击后会跳转到讨论详情页面
        router.push(`/course/${courseId.value}/discussion/${postId}`);
      } catch (error) {
        ElMessage.error('查看讨论详情失败');
        console.error('查看讨论详情失败:', error);
      }
    };

    // 提交新讨论
    const submitNewDiscussion = async () => {
      if (!newDiscussionForm.title.trim()) {
        ElMessage.warning('请输入话题标题');
        return;
      }

      if (!newDiscussionForm.content.trim()) {
        ElMessage.warning('请输入话题内容');
        return;
      }

      try {
        const discussionData = {
          course_id: courseId.value,
          title: newDiscussionForm.title,
          content: newDiscussionForm.content,
          attachments: newDiscussionForm.attachments,
          tags: newDiscussionForm.tags
        };

        // 调用模拟API创建讨论
        await mockCreateDiscussion(discussionData);

        showNewDiscussionDialog.value = false;
        newDiscussionForm.title = '';
        newDiscussionForm.content = '';
        newDiscussionForm.tags = [];

        ElNotification({
          title: '发布成功',
          message: '话题已成功发布',
          type: 'success'
        });

        // 重新加载讨论列表
        await loadDiscussions();
      } catch (error) {
        ElMessage.error('发布话题失败，请重试');
        console.error('发布话题失败:', error);
      }
    };

    // 预约考试
    const handleReserveExam = async (examId) => {
      try {
        // 调用模拟API预约考试
        await mockReserveExam(courseId.value, examId);

        ElNotification({
          title: '预约成功',
          message: '考试预约成功，请按时参加',
          type: 'success'
        });

        // 重新加载考试列表
        await loadExams();
      } catch (error) {
        ElMessage.error('预约考试失败，请重试');
        console.error('预约考试失败:', error);
      }
    };

    // 开始考试
    const handleStartExam = async (examId) => {
      try {
        // 调用模拟API开始考试
        await mockStartExam(courseId.value, examId);
      } catch (error) {
        ElMessage.error('开始考试失败');
        console.error('开始考试失败:', error);
      }
    };

    // 查看考试成绩
    const handleViewResult = async (examId) => {
      try {
        // 调用模拟API查看考试结果
        const response = await mockViewExamResult(courseId.value, examId);

        // 这里可以展示考试结果
        ElNotification({
          title: '考试结果',
          message: `您的考试成绩: ${response.score}分`,
          type: 'info'
        });
      } catch (error) {
        ElMessage.error('查看考试结果失败');
        console.error('查看考试结果失败:', error);
      }
    };

    // 下载作业附件
    const downloadAssignmentAttachments = (assignment) => {
      if (!assignment.attachments || assignment.attachments.length === 0) {
        ElMessage.warning('该作业没有附件');
        return;
      }

      // 下载所有附件
      assignment.attachments.forEach(attachment => {
        downloadFile(attachment.file_id);
      });
    };

    // 查看作业提交详情
    const handleViewSubmission = async (assignmentId) => {
      try {
        // 调用模拟API获取提交详情
        const response = await mockApiRequest(`${API_BASE_URL}/assignments/${courseId.value}/${assignmentId}/submission`);

        if (response.data) {
          ElNotification({
            title: '提交详情',
            message: `查看作业提交: ID ${assignmentId}`,
            type: 'info'
          });

          // 在实际应用中可能会导航到详情页
          // router.push(`/course/${courseId.value}/assignment/${assignmentId}/submission`);
        }
      } catch (error) {
        ElMessage.error('获取提交详情失败');
        console.error('获取提交详情失败:', error);
      }
    };

    // 加载课程详情
    const loadCourseDetail = async () => {
      try {
        loading.value = true;
        // 获取课程详情
        const detailRes = await studentCourseApi.getCourseDetail(courseId.value);
        if (detailRes.code === 200 && detailRes.data) {
          courseDetail.value = {
            course_name: detailRes.data.course_name,
            status: detailRes.data.status,
            teacher_name: detailRes.data.teacher_name,
            start_date: detailRes.data.start_date,
            end_date: detailRes.data.end_date,
            total_lessons: detailRes.data.total_lessons,
            credit: detailRes.data.credit,
            description: detailRes.data.description,
            cover_image_url: detailRes.data.cover_image_url
          };
        } else {
          ElMessage.error('获取课程详情失败: ' + detailRes.msg);
        }

        // 加载进度信息
        const progressRes = await studentCourseApi.getCoursesProgress(courseId.value);
        if (progressRes.code === 200 && progressRes.data) {
          console.log(progressRes.data[0]);
          totalLessonsCompleted.value = progressRes.data[0].completed_lessons;
          courseProgress.value = progressRes.data[0].progress;
        } else {
          ElMessage.warning('获取课程进度失败: ' + progressRes.msg);
          totalLessonsCompleted.value = 0;
          courseProgress.value = 0;
        }
      } catch (error) {
        ElMessage.error('获取课程详情或进度失败');
        console.error('获取课程详情或进度失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadChapters = async () => {
      try {
        // 获取课程课时（lessons）数据
        const chaptersRes = await studentCourseApi.getLessonsRes(courseId.value);

        if (chaptersRes.code === 200 && chaptersRes.data) {
          const lessons = chaptersRes.data.records || [];
          chapters.value = [{
            chapter_title: "课程",
            resources: lessons.map(lesson => ({
              resource_id: lesson.lesson_id,
              name: lesson.lesson_title,
              type: lesson.resource_type,
              fileId: lesson.file_id,
              allow: lesson.allow_download
            }))
          }];
        } else {
          ElMessage.error('获取章节数据失败: ' + chaptersRes.message);
          chapters.value = [];
        }
      } catch (error) {
        console.error('获取章节数据失败:', error);
        chapters.value = [];
      }
    };

    const loadChaptersVideo = async () => {
      try {
        // 获取课程课时（lessons）数据
        const videoRes = await studentCourseApi.getLessonsVideo(courseId.value);

        if (videoRes.code === 200 && videoRes.data) {
          const videos = videoRes.data.records;

          chapters.value.videos = videos.map(video => ({
            video_url: video.video_file_url,
          }))

          console.log(videos);

        } else {
          ElMessage.error('获取章节数据失败: ' + chaptersRes.message);
          chapters.value = [];
        }
      } catch (error) {
        console.error('获取章节数据失败:', error);
        chapters.value = [];
      }
    };

    // 加载作业数据 (仍使用mockApi，因为没有提供真实API)
    const loadAssignments = async () => {
      try {
        const assignmentsResponse = await mockGetAssignments(courseId.value);
        assignments.value = assignmentsResponse || [];

        totalAssignmentsSubmitted.value = assignments.value.filter(
            assignment => assignment.status === 'submitted' || assignment.status === 'completed'
        ).length;
      } catch (error) {
        console.error('获取作业数据失败:', error);
        assignments.value = [];
      }
    };

    // 加载考试数据 (仍使用mockApi，因为没有提供真实API)
    const loadExams = async () => {
      try {
        const examsResponse = await mockGetExams(courseId.value);
        exams.value = examsResponse || [];

        totalExamsTaken.value = exams.value.filter(
            exam => exam.status === 'completed' || exam.status === 'graded'
        ).length;
      } catch (error) {
        console.error('获取考试数据失败:', error);
        exams.value = [];
      }
    };

    // 加载讨论数据 (仍使用mockApi，因为没有提供真实API)
    const loadDiscussions = async () => {
      try {
        const discussionsResponse = await mockGetDiscussions(courseId.value);
        discussions.value = discussionsResponse.list || [];
      } catch (error) {
        console.error('获取讨论数据失败:', error);
        discussions.value = [];
      }
    };

    // 加载推荐课程数据 (仍使用mockApi，因为没有提供真实API)
    const loadRecommendedCourses = async () => {
      try {
        const recommendedCoursesResponse = await mockGetRecommendedCourses(courseId.value);
        recommendedCourses.value = recommendedCoursesResponse || [];
      } catch (error) {
        console.error('获取推荐课程数据失败:', error);
        recommendedCourses.value = [];
      }
    };

    const loadAllData = async () => {
      loading.value = true; // 开始加载时设置为 true
      try {
        await Promise.all([
          loadCourseDetail(),
          loadChapters(),
          loadChaptersVideo(), // 即使VideosTab不直接使用，也确保数据被加载
          loadAssignments(),
          loadExams(),
          loadDiscussions(),
          loadRecommendedCourses()
        ]);
        console.log("所有数据加载完成！");
      } catch (error) {
        ElMessage.error('加载课程数据失败，请重试');
        console.error('加载数据失败:', error);
      } finally {
        loading.value = false; // 所有数据加载完成后设置为 false
      }
    };

    // 监听课程ID变化，重新加载数据
    watch(() => route.params.courseId, (newCourseId) => {
      if(newCourseId && newCourseId !== courseId.value) {
        courseId.value = newCourseId;
        loadAllData()
      }
    },
        {immediate: true}
    );

    // 组件挂载时加载数据
    onMounted(() => {
      if(courseId.value) {
        loadAllData();
      }
    });

    return {
      // 数据
      courseDetail,
      chapters,
      chaptersVideos,
      assignments,
      exams,
      discussions,
      recommendedCourses,
      recentActivities,
      discussionTags,
      loading,
      activeTab,
      showNewDiscussionDialog,
      newDiscussionForm,
      showSubmitAssignmentDialog,
      submitAssignmentForm,
      showVideoPlayer,
      currentVideoUrl,
      currentVideoInfo,
      videoPlayerRef,
      courseId,
      // 计算属性
      courseProgress,
      progressColor,
      totalLessonsCompleted,
      totalAssignmentsSubmitted,
      totalExamsTaken,

      // 方法
      getStatusText,
      getStatusType,
      getAssignmentStatusText,
      getAssignmentStatusType,
      getExamStatusText,
      getExamStatusType,
      formatDate,
      formatDuration,
      formatFileSize,
      calculateRemainingTime,
      handleResourceAction,
      playVideo,
      downloadFile,
      submitAssignment,
      confirmSubmitAssignment,
      handleSubmitAttachmentUpload,
      handleFileUpload,
      viewDiscussionDetail,
      submitNewDiscussion,
      handleReserveExam,
      handleStartExam,
      handleViewResult,
      downloadAssignmentAttachments,
      handleViewSubmission,
    };
  }
};
</script>

<style scoped>
.course-detail {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.course-main-content {
  margin-top: 20px;
}

.main-content-left {
  min-height: 600px;
}

.detail-tabs {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.chapter-block {
  margin-bottom: 30px;
}

.chapter-title {
  margin-bottom: 15px;
}

.chapter-title .el-divider {
  margin: 10px 0;
}

.resource-list, .video-list, .assignment-list, .exam-list, .discussion-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item, .video-item, .assignment-item, .exam-item, .discussion-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.resource-item:hover, .video-item:hover, .assignment-item:hover, .exam-item:hover, .discussion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.resource-icon {
  font-size: 24px;
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.resource-info {
  flex-grow: 1;
}

.resource-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
  word-break: break-all;
}

.resource-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 0.85rem;
}

.resource-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.video-list .video-item {
  display: flex;
  flex-direction: column;
}

.video-card {
  display: flex;
  flex-direction: column;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-thumbnail:hover .video-play-icon {
  opacity: 1;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.video-meta {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.video-description {
  color: #606266;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.video-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-item, .exam-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.assignment-item:hover, .exam-item:hover {
  border-color: #409EFF;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.assignment-title {
  font-weight: bold;
  color: #303133;
}

.assignment-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 0.9rem;
}

.assignment-description {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.5;
}

.assignment-actions {
  display: flex;
  gap: 10px;
}

.resources-section, .videos-section, .assignments-section, .exams-section, .discussions-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stats-card, .recommendations-card {
  margin-top: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 5px;
}

.completion-chart {
  margin-bottom: 20px;
}

.chart-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.chart-bar-container {
  height: 20px;
  background-color: #ebeef5;
  border-radius: 10px;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 10px;
  transition: width 1s ease;
}

.chart-bar-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-right: 5px;
  box-sizing: border-box;
  color: white;
  font-size: 0.8rem;
}

.recent-activities {
  margin-top: 20px;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.no-discussions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.recommendation-item {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.recommendation-image {
  width: 80px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-info {
  flex-grow: 1;
}

.recommendation-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.recommendation-desc {
  color: #606266;
  font-size: 0.85rem;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recommendation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #909399;
}

/* 视频播放器弹窗样式 */
.video-player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.video-player {
  width: 100%;
  max-height: 70vh;
}

.video-info-panel {
  margin-top: 20px;
  width: 100%;
}

.video-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.video-description {
  color: #606266;
  line-height: 1.5;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .course-main-content {
    flex-direction: column;
  }

  .main-content-left, .main-content-right {
    width: 100%;
  }

  .recommendations-list {
    display: grid;
    grid-template-columns: 1fr;
  }

  .recommendation-item {
    flex-direction: column;
  }

  .recommendation-image {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
    margin-right: 0;
  }
}
</style>