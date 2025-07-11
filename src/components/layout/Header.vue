<!-- components/layout/Header.vue -->
<template>
  <header class="app-header">
    <!-- 左侧标题 -->
    <div class="header-left">
      <h1>智能化在线教学支持服务平台学生中心系统</h1>
    </div>

    <!-- 右侧操作按钮（仅登录时显示） -->
    <div class="header-right">
      <!-- 首页按钮（仅登录时显示） -->
      <el-button
          v-if="isLoggedIn"
          type="primary"
          size="small"
          icon="HomeFilled"
          @click="goToHome"
      >
        首页
      </el-button>

      <!-- 登出按钮（仅登录时显示） -->
      <el-button
          v-if="isLoggedIn"
          type="danger"
          size="small"
          icon="UserFilled"
          :loading="logoutLoading"
          :disabled="logoutLoading"
          @click="handleLogout"
      >
        退出登录
      </el-button>
    </div>
  </header>
</template>

<script>
import { HomeFilled, UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from "vue"
import { useUserStore } from '@/stores/auth.js'
import { ElMessage } from 'element-plus'

export default {
  components: { HomeFilled, UserFilled },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const logoutLoading = ref(false)

    // 登录状态（从Pinia获取）
    const isLoggedIn = computed(() => userStore.isLoggedIn)

    // 跳转到首页
    const goToHome = () => {
      router.push('/S-home')
    }

    // 登出方法（关键修复）
    const handleLogout = async () => {
      logoutLoading.value = true
      try {
        // 清除Pinia状态（已同步到localStorage）
        userStore.setLogout()

        // 强制跳转到登录页（等待路由完成）
        await router.push('/login')
      } catch (error) {
        ElMessage.error('退出失败，请稍后重试')
      } finally {
        logoutLoading.value = false
      }
    }

    // 组件挂载时同步Pinia状态与localStorage（确保状态实时）
    onMounted(() => {
      userStore.isLoggedIn = !!userStore.token
    })

    return {
      isLoggedIn,
      logoutLoading,
      handleLogout,
      goToHome
    }
  }
}
</script>

<style scoped>
.app-header {
  background-color: #7d7b7b;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  /* 左侧标题样式 */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem; /* 按钮之间的间距 */
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #ffffff;
}

/* 首页按钮样式 */
:deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover:not(:disabled)) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 登出按钮基础样式 */
:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  transition: all 0.3s ease;
}

/* 登出按钮悬停样式（未加载时） */
:deep(.el-button--danger:not(:disabled):hover) {
  background-color: #f78989;
  border-color: #f78989;
}

/* 登出按钮加载/禁用样式 */
:deep(.el-button--danger:disabled) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  opacity: 0.8;
  cursor: not-allowed;
}
</style>