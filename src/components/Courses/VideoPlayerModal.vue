<!-- components/course/VideoPlayerModal.vue -->
<template>
  <el-dialog
      v-model="isDialogVisible"
      title="视频播放"
      width="80%"
      :destroy-on-close="false"
      fullscreen
  >
    <div class="video-player-container">
      <video
          ref="videoPlayerRef"
          class="video-player"
          controls
          autoplay
          :src="currentVideoUrl"
      ></video>
    </div>

    <div class="video-info-panel">
      <div class="video-title">{{ currentVideoInfo.title }}</div>
      <div class="video-description">{{ currentVideoInfo.description }}</div>
    </div>
  </el-dialog>
</template>

<script setup>
import {ref, watch, defineProps, defineEmits, reactive, onMounted} from 'vue';

const props = defineProps({
  visible: Boolean,
  videoUrl: String,
  videoInfo: Object
});

const emit = defineEmits(['update:visible']);

const isDialogVisible = ref(false);
const videoPlayerRef = ref(null);
const currentVideoUrl = ref('');
const currentVideoInfo = reactive({
  title: '',
  description: '',
  video_id: ''
});

// 监听外部visible变化
watch(() => props.visible, (newVal) => {
  isDialogVisible.value = newVal;
});

// 监听dialog可见性变化
watch(isDialogVisible, (newVal) => {
  emit('update:visible', newVal);

  // 当对话框关闭时重置视频
  if (!newVal && videoPlayerRef.value) {
    videoPlayerRef.value.pause();
    videoPlayerRef.value.currentTime = 0;
  }
});

// 监听视频URL变化
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && isDialogVisible.value) {
    currentVideoUrl.value = newUrl;

    // 使用nextTick确保DOM已更新
    setTimeout(() => {
      if (videoPlayerRef.value) {
        videoPlayerRef.value.play();
      }
    }, 100);
  }
});

watch(() => props.videoInfo, (newInfo) => {
  if (newInfo) {
    Object.assign(currentVideoInfo, newInfo);
  }
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  isDialogVisible.value = props.visible;
  if (props.visible && props.videoUrl) {
    currentVideoUrl.value = props.videoUrl;
  }
});
</script>

<style scoped>
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
</style>