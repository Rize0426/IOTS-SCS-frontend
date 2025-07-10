<template>
  <div class="page-container">
    <div class="left-sidebar">
      <UserCenter />
      <FunctionButtons />
    </div>
    <div class="middle-column">
      <Notifications class="notification-col" />
    </div>
    <div class="right-column">
      <Courses class="course-col" />
      <Todos class="todo-col" />
    </div>
  </div>
</template>

<script>
import UserCenter from '@/components/user/UserCenter.vue'
import FunctionButtons from '@/components/tools/FunctionButtons.vue'
import Notifications from '@/components/Notifications/Notifications.vue'
import Courses from '@/components/Courses/Courses.vue'
import Todos from '../components/tools/Todos.vue'

export default {
  components: {
    UserCenter,
    FunctionButtons,
    Notifications,
    Courses,
    Todos
  }
}
</script>

<style scoped>
/* 页面父容器 */
.page-container {
  display: grid;
  grid-template-rows: auto 1fr auto; /* 行轨道：头部、内容区、底部 */
  grid-template-columns: 250px 600px 300px; /* 显式设置三列宽度（左-中-右） */
  grid-gap: 16px; /* 三栏之间的水平间距（关键：调整此值控制紧凑度） */
  min-height: 70vh;
  margin: 0 auto; /* 关键：父容器水平居中 */
  max-width: 1200px; /* 限制最大宽度（可选，根据需求调整） */
  width: 100%; /* 占满父级宽度 */
  padding: 0 20px; /* 与页面边缘的距离（关键：调整此值控制离墙距离） */
  box-sizing: border-box; /* 确保padding包含在宽度内 */
}

/* 左侧栏 */
.left-sidebar {
  grid-column: 1; /* 第1列 */
  width: 250px; /* 与grid-template-columns一致 */
  background: #f0f2f5;
  padding: 16px; /* 内边距（与父容器padding呼应） */
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  box-sizing: border-box; /* 关键：padding包含在宽度内 */
}

/* 中间栏 */
.middle-column {
  grid-column: 2; /* 第2列 */
  width: 600px; /* 与grid-template-columns一致 */
  background: white;
  padding: 16px; /* 内边距 */
  border-right: 1px solid #e4e7ed;
  display: grid;
  justify-items: start;
  overflow-y: auto;
  box-sizing: border-box; /* 关键：padding包含在宽度内 */
}

/* 右侧栏 */
.right-column {
  grid-column: 3; /* 第3列 */
  width: 500px; /* 与grid-template-columns一致 */
  padding: 16px; /* 内边距 */
  box-sizing: border-box; /* 关键：padding包含在宽度内 */
  display: grid;
  gap: 12px; /* 内部子元素间距（更紧凑） */
  overflow-y: auto;
}

/* 右侧栏内部子栏（如课程列） */
.course-col {
  display: grid;
  gap: 8px; /* 子元素间距进一步缩小 */
}

.todo-col {
  min-height: 0; /* 防止 Grid 项溢出 */
}
</style>
