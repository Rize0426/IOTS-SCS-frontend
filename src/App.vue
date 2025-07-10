<!-- App.vue -->
<template>
  <div class="app-container">

    <!-- 头部组件 -->
    <Header id="main-head"/>

    <!-- 主内容区（路由视图） -->
    <main class="main-content">
      <RouterView /> <!-- 所有页面在此渲染 -->
    </main>

    <!-- 底部组件 -->
    <Footer id="main-foot"/>
  </div>
</template>

<script setup>
// 引入头部和底部组件
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%; /* 确保视口高度占满 */
}

.app-container {
  min-height: 100vh; /* 最小高度占满视口 */
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
}

.main-content {
  flex: 1; /* 主内容区占满剩余空间 */
  padding: 2rem; /* 内容区边距 */
}

</style>
