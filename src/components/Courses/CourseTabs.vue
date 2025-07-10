<!-- components/course/CourseTabs.vue -->
<template>
  <el-tabs v-model="activeTabName" class="detail-tabs" @tab-click="handleTabClick">
    <el-tab-pane label="课程资源" name="resources">
      <ResourcesTab
          :chapters="chapters"
          :loading="loading"
          @download-resource="handleDownloadResource"
          @preview-video="handlePreviewVideo"
          @play-video="handlePlayVideo"
      />
    </el-tab-pane>

    <el-tab-pane label="视频学习" name="videos">
      <VideosTab
          :chapters="chapters"
          :loading="loading"
          @play-video="handlePlayVideo"
      />
    </el-tab-pane>

    <el-tab-pane label="作业列表" name="assignments">
      <!--<AssignmentsTab
          :assignments="assignments"
          :loading="loading"
          @submit-assignment="handleSubmitAssignment"
          @view-submission="handleViewSubmission"
          @download-attachments="handleDownloadAttachments"
      />-->
      <!--TODO 更改课程id-->
      <AssignmentListView :course-id="123456" />
    </el-tab-pane>

    <el-tab-pane label="考试" name="exams">
      <!--<ExamsTab
          :exams="exams"
          :loading="loading"
          @reserve-exam="handleReserveExam"
          @start-exam="handleStartExam"
          @view-result="handleViewResult"
      />-->
      <!--TODO 更改课程id-->
      <ExamListView :course-id="123456" />
    </el-tab-pane>

    <el-tab-pane label="讨论区" name="discussions">
      <DiscussionsTab
          :discussions="discussions"
          :loading="loading"
          @view-discussion="handleViewDiscussion"
          @new-discussion="showNewDiscussionDialog = true"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref, defineProps} from 'vue';
import ResourcesTab from './tabs/ResourcesTab.vue';
import VideosTab from './tabs/VideosTab.vue';
import AssignmentsTab from './tabs/AssignmentsTab.vue';
import ExamsTab from './tabs/ExamsTab.vue';
import DiscussionsTab from './tabs/DiscussionsTab.vue';
import AssignmentListView from '@/pages/AssignmentSystemView/student/list/AssignmentListView.vue';
import ExamListView from '@/pages/ExamSystemView/student/list/ExamListView.vue';

const props = defineProps({
  chapters: Array,
  assignments: Array,
  exams: Array,
  discussions: Array,
  loading: Boolean,
  courseId:Number
});

const emit = defineEmits([
  'download-resource', 'preview-video', 'play-video',
  'submit-assignment', 'view-submission', 'download-attachments',
  'reserve-exam', 'start-exam', 'view-result',
  'view-discussion', 'new-discussion'
]);



const activeTabName = ref('resources');

const handleTabClick = (tab) => {
  // 可以在这里处理标签页切换逻辑
  console.log('切换到标签:', tab.props.name);
};

// 事件处理函数
const handleDownloadResource = (resource) => {
  emit('download-resource', resource);
};

const handlePreviewVideo = (video) => {
  emit('preview-video', video);
};

const handlePlayVideo = (video) => {
  emit('play-video', video);
};

const handleSubmitAssignment = (assignmentId) => {
  emit('submit-assignment', assignmentId);
};

const handleViewSubmission = (assignmentId) => {
  emit('view-submission', assignmentId);
};

const handleDownloadAttachments = (assignment) => {
  emit('download-attachments', assignment);
};

const handleReserveExam = (examId) => {
  emit('reserve-exam', examId);
};

const handleStartExam = (examId) => {
  emit('start-exam', examId);
};

const handleViewResult = (examId) => {
  emit('view-result', examId);
};

const showNewDiscussionDialog = ref(false);

const handleViewDiscussion = (postId) => {
  emit('view-discussion', postId);
};

defineExpose({
  showNewDiscussionDialog
});
</script>

<style scoped>
.detail-tabs {
  margin-bottom: 20px;
}
</style>