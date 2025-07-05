<template>
  <div class="function-menu">
    <!-- 使用 el-button 组件循环渲染 -->
    <el-button
        v-for="(btn, index) in functionList"
        :key="index"
        :type="btn.type"
        class="menu-btn"
        @click="handleMenuClick(btn)"
    >
      <!-- 按钮文字 -->
      <span >{{ btn.label }}</span>
    </el-button>
  </div>
</template>

<script setup>
// 功能按钮数据（后续可替换为API返回）
import router from "@/router/index.js";

const functionList = [
  {
    label: '首页',
    type: 'primary',
    path: '/'
  },
  {
    label: '个人信息',
    type: 'default',
    path: '/userMessage'
  },
  {
    label: '我的课程',
    type: 'success',
    path: '/courseCenter'
  },
  {
    label: '学习中心',
    type: 'warning',
    path: '/evaluation'
  },
  {
    label: '知识库',
    type: 'info',
    path: '/knowledge'
  },
  {
    label: '我的笔记',
    type: 'danger',
    path: '/note'
  }
]

// 点击事件（后续可对接路由或API）
const handleMenuClick = (btn) => {
  console.log('点击了：', btn.label)
  // 实际使用时替换为路由跳转或API调用
  router.push(btn.path);
}
</script>

<style scoped>
.function-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;  /* 按钮间距 */
  width: 200px; /* 固定宽度保持整齐 */
  padding: 15px;
  background: #f8f9fa; /* 浅背景区分页面 */
  border-radius: 8px;
}

.menu-btn {
  width: 100%; /* 按钮占满容器宽度 */
  height: 48px; /* 统一高度 */
  display: flex;
  align-items: center; /* 图标文字垂直居中 */
  gap: 8px; /* 图标文字间距 */
  padding: 0; /* 覆盖Element默认padding */
  border-radius: 6px; /* 更圆润的边角 */
  font-size: 14px;
  transition: all 0.2s ease;
  margin-left: 4px;
}

/* 悬停效果增强 */
.menu-btn:hover {
  transform: translateY(-1px); /* 轻微上移 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>