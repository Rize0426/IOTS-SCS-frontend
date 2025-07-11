<!-- src/views/NoteView.vue -->
<template>
  <div class="note-container">
    <h2>学习笔记管理</h2>

    <!-- 筛选区域 -->
    <div class="filter-container">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="课程">
          <el-select v-model="filterParams.courseId" placeholder="请选择课程" clearable>
            <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="课时">
          <el-select v-model="filterParams.lessonId" placeholder="请选择课时" clearable>
            <el-option
                v-for="item in lessonOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="handleAdd">新建笔记</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 笔记列表 -->
    <el-table
        v-loading="loading"
        :data="noteList"
        border
        style="width: 100%"
    >
      <el-table-column prop="title" label="标题" width="250"></el-table-column>
      <el-table-column prop="courseName" label="课程" width="180"></el-table-column>
      <el-table-column prop="lessonName" label="课时" width="180"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleView(scope.row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 笔记表单对话框 -->
    <el-dialog
        :title="dialogType === 'add' ? '新建笔记' : '编辑笔记'"
        v-model="dialogVisible"
        width="70%"
    >
      <note-form
          :form-data="formData"
          :course-options="courseOptions"
          :lesson-options="filteredLessonOptions"
          :loading="formLoading"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
      ></note-form>
    </el-dialog>

    <!-- 笔记详情对话框 -->
    <el-dialog
        title="笔记详情"
        v-model="detailVisible"
        width="70%"
    >
      <note-detail
          :note-data="noteDetail"
          @edit="handleEdit(noteDetail)"
          @delete="handleDelete(noteDetail)"
          @close="detailVisible = false"
      ></note-detail>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getNotes, createNote, getNoteDetail, updateNote, deleteNote } from '@/api/note';
import NoteForm from '@/components/note/NoteForm.vue';
import NoteDetail from '@/components/note/NoteDetail.vue';
import {studentCourseApi} from "@/api/course.js";
import { watch } from 'vue';

// 状态定义
const loading = ref(false);
const formLoading = ref(false);
const noteList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const detailVisible = ref(false);
const dialogType = ref('add'); // add 或 edit
const noteDetail = ref({});
const courseOptions = ref([]);
const lessonOptions = ref([]);

// 筛选参数
const filterParams = reactive({
  courseId: '',
  lessonId: ''
});

// 表单数据
const formData = reactive({
  courseId: '',
  lessonId: '',
  title: '',
  content: ''
});

// 计算属性 - 根据课程过滤课时
const filteredLessonOptions = computed(() => {
  if (!filterParams.courseId) return [];

  const selectedCourse = courseOptions.value.find(course => course.id === filterParams.courseId);
  return selectedCourse ? selectedCourse.lessons || [] : [];
});

// 获取笔记列表
const fetchNotes = async (courseId, lessonId) => {
  loading.value = true;
  try {
    // 修改为API调用，添加分页参数
    const response = await getNotes({
      courseId: filterParams.courseId,
      lessonId: filterParams.lessonId,
      page: currentPage.value,
      pageSize: pageSize.value
    }, lessonId);

    // 根据API返回格式可能需要调整
    noteList.value = response.data.list || response.data || [];
    total.value = response.data.total || noteList.value.length; // 使用API返回的总数
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    ElMessage.error('获取笔记列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};


// 获取课程列表
const fetchCourseOptions = async () => {
  try {
    loading.value = true;
    // 调用API获取课程列表
    const response = await studentCourseApi.getMyCourses('all');
    // 假设API返回的数据格式为 {code: 200, data: [{id: 'course1', name: '课程1', lessons: [...]}]}
    courseOptions.value = response.data || [];
  } catch (error) {
    console.error('获取课程列表失败:', error);
    ElMessage.error('获取课程列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 监听课程ID变化，获取对应课时列表
watch(() => filterParams.courseId, async (newCourseId) => {
  if (newCourseId) {
    try {
      loading.value = true;
      // 调用API获取课程的课时列表
      const response = await studentCourseApi.getLessons(newCourseId);
      // 假设API返回的数据格式为 {code: 200, data: [{id: 'lesson1', name: '课时1'}, ...]}
      lessonOptions.value = response.data || [];
    } catch (error) {
      console.error('获取课时列表失败:', error);
      ElMessage.error('获取课时列表失败，请稍后重试');
      lessonOptions.value = [];
    } finally {
      loading.value = false;
    }
  } else {
    lessonOptions.value = [];
  }
});

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchNotes();
};

// 重置筛选条件
const resetFilter = () => {
  filterParams.courseId = '';
  filterParams.lessonId = '';
  handleSearch();
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchNotes();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchNotes();
};

// 新建笔记
const handleAdd = () => {
  dialogType.value = 'add';
  Object.keys(formData).forEach(key => {
    formData[key] = '';
  });
  dialogVisible.value = true;
};

// 查看笔记详情
const handleView = async (row) => {
  try {
    loading.value = true;
    // 调用API获取笔记详情
    const response = await getNoteDetail(row.id);
    noteDetail.value = response.data || {};
    detailVisible.value = true;
  } catch (error) {
    console.error('获取笔记详情失败:', error);
    ElMessage.error('获取笔记详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 编辑笔记
const handleEdit = (row) => {
  dialogType.value = 'edit';
  Object.keys(formData).forEach(key => {
    formData[key] = row[key] || '';
  });
  dialogVisible.value = true;
};

// 删除笔记
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这篇笔记吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNote(row.id);
      ElMessage.success('删除成功');
      await fetchNotes();
    } catch (error) {
      console.error('删除笔记失败:', error);
      ElMessage.error('删除笔记失败，请稍后重试');
    }
  }).catch(() => {});
};

// 提交表单
const handleSubmit = async (formValues) => {
  formLoading.value = true;

  try {
    if (dialogType.value === 'add') {
      await createNote(formValues);
      ElMessage.success('创建成功');
    } else {
      await updateNote(formData.id, formValues);
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    await fetchNotes();
  } catch (error) {
    console.error(`${dialogType.value === 'add' ? '创建' : '更新'}笔记失败:`, error);
    ElMessage.error(`${dialogType.value === 'add' ? '创建' : '更新'}笔记失败，请稍后重试`);
  } finally {
    formLoading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleString();
};

// 生命周期钩子
onMounted(() => {
  fetchCourseOptions();
  fetchNotes();
});
</script>

<style scoped>
.note-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>