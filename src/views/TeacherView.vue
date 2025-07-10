<template>
  <div class="teacher-layout">
    <!-- 教师端侧边栏 -->
    <div class="teacher-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">
          <el-icon><User /></el-icon>
          教师工作台
        </h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="teacher-menu"
        router
        unique-opened
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/teacher/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        
        <el-sub-menu index="course">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </template>
          <el-menu-item index="/teacher/course/list">课程列表</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/knowledge-base">
          <el-icon><Document /></el-icon>
          <span>知识库</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 教师端主内容区 -->
    <div class="teacher-main">
      <!-- 顶部导航栏 -->
      <div class="teacher-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/teacher/dashboard' }">教师工作台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumbItems.length > 0" v-for="item in breadcrumbItems" :key="item.path" :to="{ path: item.path }">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar" />
              <span class="username">{{ userInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 路由视图 -->
      <div class="teacher-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/auth.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Odometer,
  Reading,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 用户信息
const userInfo = ref({
  name: '张老师',
  avatar: '/src/assets/images/个人信息头像.png'
})

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 面包屑导航
const breadcrumbItems = computed(() => {
  const items = []
  const path = route.path
  
  if (path.includes('/course')) {
    items.push({ title: '课程管理', path: '/teacher/course/list' })
  }
  
  return items
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/userMessage')
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    //userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.teacher-layout {
  display: flex;
  background: #f0f2f5;
}

.teacher-sidebar {
  width: 250px;
  background: #001529;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #1f1f1f;
}

.sidebar-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.teacher-menu {
  border: none;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.teacher-menu:not(.el-menu--collapse) {
  width: 250px;
}

.teacher-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.teacher-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.teacher-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f0f2f5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .teacher-sidebar {
    width: 200px;
  }
  
  .teacher-content {
    padding: 16px;
  }
  
  .sidebar-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .teacher-layout {
    flex-direction: column;
  }
  
  .teacher-sidebar {
    width: 100%;
    height: auto;
  }
  
  .teacher-menu {
    height: auto;
  }
  
  .teacher-header {
    padding: 0 16px;
  }
  
  .teacher-content {
    padding: 12px;
  }
}
</style>
