<template>
  <div class="evaluation-form-container">
    <h2>课程评价</h2>
    <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        status-icon
    >
      <!-- 课程选择 -->
      <el-form-item label="选择课程" prop="courseId">
        <el-select
            v-model="form.courseId"
            placeholder="请选择已修课程"
            clearable
            style="width: 100%"
        >
          <el-option
              v-for="course in courseList"
              :key="course.courseId"
              :label="`${course.courseName}（授课教师：${course.teacher}）`"
              :value="course.courseId"
          />
        </el-select>
      </el-form-item>

      <!-- 评分项 -->
      <el-form-item label="内容评分" prop="contentEvaluation">
        <el-rate
            v-model="form.contentEvaluation"
            :max="5"
            show-score
            text-color="#ff9900"
        />
      </el-form-item>

      <el-form-item label="服务评分" prop="serviceEvaluation">
        <el-rate
            v-model="form.serviceEvaluation"
            :max="5"
            show-score
            text-color="#ff9900"
        />
      </el-form-item>

      <el-form-item label="态度评分" prop="attitudeEvaluation">
        <el-rate
            v-model="form.attitudeEvaluation"
            :max="5"
            show-score
            text-color="#ff9900"
        />
      </el-form-item>

      <el-form-item label="效果评分" prop="effectEvaluation">
        <el-rate
            v-model="form.effectEvaluation"
            :max="5"
            show-score
            text-color="#ff9900"
        />
      </el-form-item>

      <!-- 评价内容 -->
      <el-form-item label="评价内容" prop="evaluationContent">
        <el-input
            v-model="form.evaluationContent"
            type="textarea"
            :rows="4"
            placeholder="请输入您的真实评价（不少于50字）"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            @click="submitForm"
            :loading="loading"
        >
          提交评价
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { submitEvaluation } from '@/api/courseEvaluation';
import { ElMessage } from 'element-plus';
import { studentCourseApi } from '@/api/course';
const { getMyCourses } = studentCourseApi;

// 表单数据
const form = reactive({
  courseId: '',
  contentEvaluation: 5,
  serviceEvaluation: 5,
  attitudeEvaluation: 5,
  effectEvaluation: 5,
  evaluationContent: ''
});

// 表单校验规则
const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  contentEvaluation: [{ required: true, message: '请选择内容评分', trigger: 'blur' }],
  serviceEvaluation: [{ required: true, message: '请选择服务评分', trigger: 'blur' }],
  attitudeEvaluation: [{ required: true, message: '请选择态度评分', trigger: 'blur' }],
  effectEvaluation: [{ required: true, message: '请选择效果评分', trigger: 'blur' }],
  evaluationContent: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 50, message: '评价内容至少50字', trigger: 'blur' }
  ]
};

// 加载状态
const loading = ref(false);
const formRef = ref(null);

// 课程列表
const courseList = ref([]);

// 获取课程列表（用于下拉框）
const fetchCourseList = async () => {
  try {
    const res = await getMyCourses(); // 假设接口返回 { code:200, data: [课程列表] }
    courseList.value = res.data;
  } catch (error) {
    ElMessage.error('获取课程列表失败');
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await submitEvaluation(form);
        ElMessage.success('评价提交成功！');
        resetForm(); // 提交后重置表单
      } catch (error) {
        ElMessage.error('评价提交失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  form.courseId = '';
  form.contentEvaluation = 5;
  form.serviceEvaluation = 5;
  form.attitudeEvaluation = 5;
  form.effectEvaluation = 5;
  form.evaluationContent = '';
};

// 组件挂载时获取课程列表
onMounted(() => {
  fetchCourseList();
});
</script>

<style scoped>
.evaluation-form-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>