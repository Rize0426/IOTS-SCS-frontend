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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '@/api/auth.js';
import { useUserStore } from '@/stores/auth.js';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const loginFormRef = ref(null); // 表单引用
    const loading = ref(false);
    const isTestMode = ref(true); // 测试模式开关

    // 登录表单数据
    const loginForm = reactive({
      username: '',
      password: ''
    });

    // 表单验证规则
    const loginRules = {
      username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    };

    // 测试模式下自动填充表单并验证（关键修复）
    const autoFillTestAccount = () => {
      if (isTestMode.value) {
        loginForm.username = 'test_student'; // 模拟学号
        loginForm.password = '123456';       // 模拟密码

        // 手动触发表单验证（确保输入框显示填充的值）
        loginFormRef.value?.validateField(['username', 'password'], valid => {
          if (valid) {
            // 验证通过后自动触发登录（可选）
            // handleLogin();
          }
        });
      }
    };

    // 登录方法（优化测试模式逻辑）
    const handleLogin = async () => {
      // 测试模式下：如果未填充，自动填充并验证
      if (isTestMode.value && (!loginForm.username || !loginForm.password)) {
        autoFillTestAccount();
        return; // 阻止重复提交
      }

      loginFormRef.value.validate(async (valid) => {
        if (!valid) return;

        loading.value = true;
        try {
          if (isTestMode.value) {
            // 模拟符合后端结构的请求体
            const mockRequest = {
              way: 'password',
              role: 1, // 学生角色（根据后端定义调整）
              username: loginForm.username,
              password: loginForm.password
            };

            // 模拟后端返回数据（完全匹配接口结构）
            const mockResponse = {
              code: 200,
              message: '登录成功',
              data: {
                token: 'mock-token-xxxxx',
                user_info: {
                  uid: 'test_uid',
                  name: loginForm.username,
                  role: 'student',
                  avatar_url: 'https://via.placeholder.com/100'
                }
              }
            };

            // 存储到Pinia和localStorage
            userStore.setLogin(mockResponse.data.token, mockResponse.data.user_info);
            ElMessage.success('登录成功！');

            // 跳转到原目标页面或首页
            const redirectPath = route.query.redirect || '/'; // 使用useRoute获取的route
            router.push(redirectPath);
          } else {
            // 正式模式调用真实API
            const res = await login(loginForm);

            if (res.code === 200) {
              // 存储到Pinia和localStorage
              userStore.setLogin(res.data.token, res.data.user_info);
              ElMessage.success('登录成功！');
              const redirectPath = route.query.redirect || '/'; // 使用useRoute获取的route
              router.push(redirectPath);
            } else {
              ElMessage.error(res.message || '登录失败，请检查账号密码');
            }
          }
        } catch (error) {
          console.error('登录异常:', error);
          ElMessage.error('登录异常，请稍后重试');
        } finally {
          loading.value = false;
        }
      });
    };

    // 组件挂载时自动填充测试账号（关键！）
    onMounted(() => {
      autoFillTestAccount();
    });

    // 返回模板需要的变量和方法（移除handleRegister）
    return {
      loginForm,
      loginRules,
      loginFormRef,
      handleLogin,
      loading,
      isTestMode
    };
  }
};
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