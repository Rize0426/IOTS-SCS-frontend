<template>
  <div class="course-list-container">
    <h2>我的课程</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="courseList.length === 0" class="empty-data">
      暂无已修课程，请先完成课程学习
    </div>
    <div v-else>
      <el-card class="course-card">
        <template #header>
          <div class="course-header">
            <span>请选择一门课程进行评价</span>
          </div>
        </template>
        <!-- 添加“查看评价”按钮 -->

        <el-table :data="courseList" stripe style="width: 100%">
          <!-- 关键修改：prop改为course_name和teacher_name -->
          <el-table-column prop="course_name" label="课程名称" />
          <el-table-column prop="teacher_name" label="授课教师" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <div class="action-buttons">
              <el-button
                  type="primary"
                  @click="viewEvaluationList(scope.row.course_id)"
              >
                查看评价
              </el-button>
            </div>

              <el-button
                  type="primary"
                  size="small"
                  @click="selectCourse(scope.row.course_id)"
              >
              去评价
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentCourseApi } from '@/api/course';
import { ElMessage } from 'element-plus';

const router = useRouter();
const courseList = ref([]);
const loading = ref(false);

// 获取已修课程列表
const fetchCourseList = async () => {
  loading.value = true;
  try {
    const res = await studentCourseApi.getMyCourses('completed'); // 获取已完成的课程
    courseList.value = res.data || [];
  } catch (error) {
    ElMessage.error('获取课程列表失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 选择课程并跳转到评价页面
const selectCourse = (courseId) => {
  router.push(`/course-evaluation/${courseId}`);
};

// 跳转到评价列表页
const viewEvaluationList = (courseId) => {
  router.push(`/courseEvaluation/${courseId}`); // 传递当前课程ID
};

// 组件挂载时获取课程列表
onMounted(fetchCourseList);
</script>

<style scoped>
.course-list-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-card {
  margin-top: 20px;
}

.loading, .empty-data {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 16px;
}
</style>