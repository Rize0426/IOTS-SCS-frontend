<!-- src/components/NoteDetail.vue -->
<template>
  <div class="note-detail">
    <el-descriptions
        title="笔记信息"
        :column="1"
        border
        class="note-info"
    >
      <el-descriptions-item label="标题">{{ noteData.title }}</el-descriptions-item>
      <el-descriptions-item label="课程">{{ noteData.courseName }}</el-descriptions-item>
      <el-descriptions-item label="课时">{{ noteData.lessonName }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDateTime(noteData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatDateTime(noteData.updateTime) }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="note-content">
      <h3>笔记内容</h3>
      <div class="content-text">{{ noteData.content }}</div>
    </div>

    <div class="action-buttons">
      <el-button type="primary" @click="$emit('edit')">编辑</el-button>
      <el-button type="danger" @click="$emit('delete')">删除</el-button>
      <el-button @click="$emit('close')">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import { getNoteDetail } from '@/api/note';

const props = defineProps({
  noteId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'close']);
const noteData = ref({});

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleString();
};

// 获取笔记详情
const fetchNoteDetail = async () => {
  try {
    const response = await getNoteDetail(props.noteId);
    noteData.value = response.data || {};
  } catch (error) {
    console.error('获取笔记详情失败:', error);
    ElMessage.error('获取笔记详情失败，请稍后重试');
  }
};

// 组件挂载时获取笔记详情
onMounted(() => {
  fetchNoteDetail();
});

defineExpose({
  refresh: fetchNoteDetail
});
</script>