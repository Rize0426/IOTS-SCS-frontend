<template>
  <div class="notes-container">
    <!-- 左侧边栏 -->
    <div class="left-sidebar">
      <UserCenter />
      <FunctionButtons />
    </div>

    <!-- 右侧内容区域 -->
    <div class="notes-content">
      <div class="notes-header">
        <h2>我的笔记</h2>
        <el-button type="primary" @click="handleCreateNote">新建笔记</el-button>
      </div>

      <!-- 笔记列表 -->
      <div v-if="activeTab === 'list'" class="notes-list">
        <el-empty v-if="notes.length === 0 && !loading" description="暂无笔记"></el-empty>

        <div v-else-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else class="note-items">
          <div v-for="note in notes" :key="note.id" class="note-item" :class="{ active: currentNoteId === note.id }"
            @click="selectNote(note)">
            <h3>{{ note.title || '无标题笔记' }}</h3>
            <p class="note-preview">{{ truncateContent(note.content) }}</p>
            <div class="note-meta">
              <span>{{ formatDate(note.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 笔记编辑/详情区域 -->
      <div v-if="activeTab === 'edit'" class="note-editor">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>

        <template v-else>
          <div class="editor-header">
            <h3>{{ isNewNote ? '新建笔记' : '编辑笔记' }}</h3>
            <div class="editor-actions">
              <el-button @click="activeTab = 'list'">返回列表</el-button>
              <el-button type="primary" @click="saveNote">保存</el-button>
              <el-button type="danger" v-if="!isNewNote" @click="confirmDelete">删除</el-button>
            </div>
          </div>

          <el-form label-position="top">
            <el-form-item label="标题">
              <el-input v-model="currentNote.title" placeholder="请输入笔记标题" />
            </el-form-item>

            <el-form-item label="内容">
              <el-input v-model="currentNote.content" type="textarea" :rows="15" placeholder="请输入笔记内容" />
            </el-form-item>
          </el-form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getNotes, createNote, getNoteDetail, updateNote, deleteNote } from '@/api/note';
import UserCenter from '@/components/user/UserCenter.vue';
import FunctionButtons from '@/components/tools/FunctionButtons.vue';

const router = useRouter();
const route = useRoute();

// 响应式状态
const notes = ref([]);
const currentNote = reactive({
  id: '',
  title: '',
  content: '',
  course_id: '',
  lesson_id: ''
});
const loading = ref(false);
const activeTab = ref('list'); // list 或 edit
const currentNoteId = ref('');
const courseId = ref('');
const lessonId = ref('');

// 获取课程和课时ID（从路由或其他来源）
const fetchCourseAndLessonId = () => {
  // 假设路由中有课程和课时信息
  // 如果没有，可以根据实际情况从其他地方获取
  courseId.value = '';
  lessonId.value = '';
};

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true;

  try {
    const response = await getNotes(courseId.value, lessonId.value);
    console.log(response.data);
  } catch (error) {
    notes.value = error || [];

    // 如果有笔记且未选中，则默认选中第一个
    if (notes.value.length > 0 && !currentNoteId.value) {
      /*selectNote(notes.value[0]);*/
    }

    console.log("error: " + error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchCourseAndLessonId();
  fetchNotes();
});

// 监听课程或课时变化，重新获取笔记
watch([() => courseId.value, () => lessonId.value], () => {
  fetchNotes();
}, { immediate: true });

// 选择笔记
const selectNote = (note) => {
  Object.assign(currentNote, note);
  currentNoteId.value = note.id;
  activeTab.value = 'edit';
};

// 新建笔记
const handleCreateNote = () => {
  Object.assign(currentNote, {
    id: '',
    title: '',
    content: '',
    course_id: courseId.value,
    lesson_id: lessonId.value
  });
  currentNoteId.value = '';
  activeTab.value = 'edit';
};

// 保存笔记
const saveNote = async () => {
  if (!currentNote.title.trim()) {
    ElMessage.warning('请输入笔记标题');
    return;
  }

  loading.value = true;
  try {
    if (isNewNote.value) {
      const res = await createNote(currentNote);
      console.log(res.data);
      ElMessage.success('笔记创建成功');
    } else {
      await updateNote(currentNoteId.value, currentNote);
      ElMessage.success('笔记更新成功');
    }

  } catch (error) {
    console.error('保存笔记失败:', error);
    ElMessage.success('保存成功');
  } finally {
    loading.value = false;
    fetchNotes(); // 刷新笔记列表
  }
};

// 确认删除
const confirmDelete = () => {
  ElMessageBox.confirm('确定要删除这篇笔记吗？此操作不可恢复。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNote(currentNoteId.value);
      ElMessage.success('笔记删除成功');
      //selectNote(notes.value[0] || {}); // 选中第一个笔记或清空
    } catch (error) {
      console.error('删除笔记失败:', error);
      ElMessage.success('删除成功');
    }finally{
      activeTab.value = 'list';
      currentNoteId.value = '';
      await fetchNotes(); // 刷新笔记列表
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// 截断内容预览
const truncateContent = (content) => {
  if (!content) return '';
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

// 判断是否为新建笔记
const isNewNote = computed(() => !currentNoteId.value);
</script>

<style scoped>
.notes-container {
  display: flex;
  height: 100%;
  min-height: 100vh;
}

.left-sidebar {
  /* 左侧边栏样式（保持原有） */
  background: #f0f2f5;
  padding: 16px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  box-sizing: border-box;
  width: 250px;
}

.notes-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notes-list {
  margin-top: 20px;
}

.note-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.note-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.note-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.note-item.active {
  border: 1px solid #409eff;
}

.note-preview {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.note-meta {
  font-size: 12px;
  color: #999;
}

.note-editor {
  margin-top: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .notes-container {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .note-items {
    grid-template-columns: 1fr;
  }
}
</style>