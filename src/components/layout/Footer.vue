<!-- components/layout/Footer.vue -->
<template>
  <footer class="footer">
    <p>© 2024 智能化在线教学支持服务平台学生中心系统 版权所有</p> <!-- 底部文字（可替换为动态内容） -->
  </footer>
</template>

<style scoped>
.footer {
  position: fixed; /* 固定定位 */
  bottom: 0;       /* 贴紧视口底部 */
  left: 0;         /* 贴紧视口左侧 */
  right: 0;        /* 贴紧视口右侧 */
  background-color: #7d7b7b;
  padding: 1rem;
  text-align: center;
  z-index: 1000;   /* 确保页脚在最上层（避免被内容覆盖） */
}

.footer p {
  margin: 0;
  font-size: 0.9rem; /* 较小字体 */
  color: #ffffff;
}
</style>