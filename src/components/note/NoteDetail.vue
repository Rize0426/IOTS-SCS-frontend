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
import { defineProps, defineEmits } from 'vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  noteData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'close']);

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleString();
};
</script>

<style scoped>
.note-detail {
  padding: 10px;
}

.note-info {
  margin-bottom: 20px;
}

.note-content {
  margin: 20px 0;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>