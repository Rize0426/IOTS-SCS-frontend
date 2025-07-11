<!-- src/components/NoteForm.vue -->
<template>
  <el-form
      ref="noteFormRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
      :disabled="loading"
  >
    <el-form-item label="课程" prop="courseId">
      <el-select v-model="form.courseId" placeholder="请选择课程" @change="handleCourseChange" style="width: 100%">
        <el-option
            v-for="item in courseOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="课时" prop="lessonId">
      <el-select v-model="form.lessonId" placeholder="请选择课时" style="width: 100%">
        <el-option
            v-for="item in lessonOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="标题" prop="title">
      <el-input v-model="form.title" placeholder="请输入笔记标题"></el-input>
    </el-form-item>

    <el-form-item label="内容" prop="content">
      <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="请输入笔记内容"
      ></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { createNote, updateNote } from '@/api/note';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  courseOptions: {
    type: Array,
    default: () => []
  },
  lessonOptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const noteFormRef = ref(null);

const form = reactive({
  courseId: '',
  lessonId: '',
  title: '',
  content: ''
});

// 表单验证规则
const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  title: [{ required: true, message: '请输入笔记标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入笔记内容', trigger: 'blur' }]
};

// 当课程变更时，清空课时
const handleCourseChange = () => {
  form.lessonId = '';
};

// 监听props变化，更新表单数据
watch(
    () => props.formData,
    (newVal) => {
      Object.keys(form).forEach(key => {
        if (newVal[key] !== undefined) {
          form[key] = newVal[key];
        }
      });
    },
    { immediate: true, deep: true }
);

// 提交表单
const submitForm = () => {
  noteFormRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form });
    } else {
      ElMessage.warning('请完善表单信息');
      return false;
    }
  });
};
</script>