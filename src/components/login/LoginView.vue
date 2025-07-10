<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password>
          </el-input>
        </el-form-item>

        <div class="button-container">
          <!-- 仅保留登录按钮 -->
          <el-button
              type="primary"
              @click="handleLogin"
              class="login-button"
              :loading="loading">
            登录
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth.js'
import { useUserStore } from '@/stores/auth.js'
export default {
  setup () {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const loginFormRef = ref(null)
    const loading = ref(false)

    // 登录表单数据
    const loginForm = reactive({
      way: '',        // 登录方式，按后端需要保留
      role: 1,        // 1 = 学生，可根据业务调整
      username: '',
      password: ''
    })

    // 表单校验规则
    const loginRules = {
      username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }

    // 登录方法
    const handleLogin = () => {
      loginFormRef.value.validate(async valid => {
        if (!valid) return

        loading.value = true
        try {
          const res = await login(loginForm)

          if (res.code === 200) {
            // 写入 Pinia + localStorage
            console.log("返回数据：\n" + JSON.stringify(res.data.user_info));

            userStore.setLogin(res.data.tokens, res.data.user_info)
            ElMessage.success('登录成功！')

            console.log("本地缓存：\n" + JSON.stringify(userStore.userInfo));
            // 跳转到目标路由或首页
            const redirectPath = userStore.userInfo.role==="student"?'/S-home':'/teacher/dashboard'
            router.push(redirectPath)
          } else {
            ElMessage.error(res.message || '登录失败，请检查账号密码')
          }
        } catch (err) {
          console.error('登录异常:', err)
        } finally {
          loading.value = false
        }
      })
    }

    return {
      loginForm,
      loginRules,
      loginFormRef,
      handleLogin,
      loading
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center; /* 水平居中保持不变 */
  align-items: flex-start; /* 关键调整：垂直方向改为顶部对齐 */
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 10vh; /* 顶部添加内边距，避免紧贴浏览器顶部 */
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 25px; /* 减小内边距，让登录框更紧凑 */
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-top: -30px; /* 关键调整：向上偏移（根据实际效果调整数值） */
}

.login-title {
  text-align: center;
  margin-bottom: 20px; /* 减小标题底部间距 */
  color: #303133;
}

.button-container {
  display: flex;
  justify-content: center; /* 单按钮居中显示 */
  margin-top: 25px; /* 调整按钮区域间距 */
}

.login-button {
  width: 100%; /* 单按钮占满容器宽度 */
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
  .login-box {
    padding: 20px;
  }
  .login-box {
    margin-top: -20px; /* 手机端调整偏移量 */
  }
}
</style>