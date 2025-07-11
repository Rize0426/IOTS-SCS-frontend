<template>
  <div class="evaluation-container">
    <!-- 未选择课程时显示课程列表（仅在首次进入时） -->
    <div v-if="courseId === null" class="select-course-prompt">
      <el-empty description="请先选择一门课程进行评价">
        <el-button type="primary" @click="showCourseList">选择课程</el-button>
      </el-empty>
    </div>

    <!-- 选择课程后显示评价表单 -->
    <template v-else>
      <div class="course-header">
        <h2>{{ courseInfo.courseName }} - 课程评价</h2>
        <el-button @click="backToList" plain size="small">返回课程列表</el-button>
      </div>

      <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="120px"
          status-icon
      >
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
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { submitEvaluation } from '@/api/courseEvaluation';
import { ElMessage } from 'element-plus';
import { studentCourseApi } from '@/api/course';

// 路由相关
const router = useRouter();
const route = useRoute();
const courseId = ref(route.params.courseId); // 从路由参数中获取的课程 ID
const userId = ref(1); // 从路由参数中获取的课程 ID


// 表单相关
const formRef = ref(null);
const form = reactive({
  courseId: courseId.value,
  userId: userId.value,
  contentEvaluation: 5,
  serviceEvaluation: 5,
  attitudeEvaluation: 5,
  effectEvaluation: 5,
  evaluationContent: ''
});

// 表单校验规则
const rules = {
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

// 课程信息
const courseInfo = ref({ courseName: '', teacher: '' }); // 初始化课程信息

// 显示课程列表
const showCourseList = async () => {
  try {
    const res = await studentCourseApi.getMyCourses('completed');
    if (res.data && res.data.length > 0) {
      await router.push('/courses'); // 跳转到课程列表页选择课程
    } else {
      ElMessage.warning('您还没有完成任何课程，无法进行评价');
    }
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + error.message);
  }
};

// 返回课程列表
const backToList = () => {
  router.push('/courses-list'); // 直接跳转到课程列表页
};

// 获取课程详情
const fetchCourseInfo = async () => {
  try {
    if (!courseId.value) return;
    const res = await studentCourseApi.getCourseDetail(courseId.value); // 调用真实接口
    if (res.code === 200) {
      courseInfo.value = {
        courseName: res.data.courseName,
        teacher: res.data.teacher // 确保接口返回字段名与代码一致
      };
    } else {
      throw new Error(res.message || '获取课程信息失败');
    }
  } catch (error) {
    ElMessage.error('获取课程信息失败：' + error.message);
  }
};

// 提交表单
const submitForm = async () => {
  if (!courseId.value) {
    ElMessage.error('课程ID无效，请重新选择课程');
    return;
  }

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const submitData = {
          courseId: courseId.value, // 关键：传递有效的courseId
          userId: userId.value, // 关键：传递有效的userId
          contentEvaluation: form.contentEvaluation,
          serviceEvaluation: form.serviceEvaluation,
          attitudeEvaluation: form.attitudeEvaluation,
          effectEvaluation: form.effectEvaluation,
          evaluationContent: form.evaluationContent
        };
        await submitEvaluation(submitData);
        ElMessage.success('评价提交成功！');
        resetForm(); // 提交后重置表单
        await showCourseList(); // 返回课程列表
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
  form.contentEvaluation = 5;
  form.serviceEvaluation = 5;
  form.attitudeEvaluation = 5;
  form.effectEvaluation = 5;
  form.evaluationContent = '';
};

onMounted(() => {
  const idParam = route.params.courseId; // 根据路由参数名调整
  if (idParam) {
    const id = Number(idParam);
    // 校验：必须是数字、大于 0
    if (!isNaN(id) && id > 0) {
      courseId.value = id;
      fetchCourseInfo(); // 获取课程详情
    } else {
      ElMessage.error('无效的课程 ID');
      router.push('/courses-list'); // 跳转回课程列表
    }
  } else {
    ElMessage.error('未获取到课程 ID');
    router.push('/courses-list');
  }
});
</script>

<style scoped>
.evaluation-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.select-course-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.course-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>