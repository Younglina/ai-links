<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
    <div class="max-w-md w-full">
      <!-- Logo区域 -->
      <div class="text-center mb-8">
        <img src="/ai-links.png" alt="AI工具集" class="w-auto h-16 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-800">{{ isLogin ? '登录' : '注册' }} AI工具集</h1>
        <p class="text-gray-600 mt-2">{{ isLogin ? '欢迎回来！' : '开始您的AI工具之旅' }}</p>
      </div>

      <!-- 登录注册表单 -->
      <a-card class="shadow-lg">
        <a-tabs v-model:activeKey="activeTab" centered @change="handleTabChange">
          <a-tab-pane key="login" tab="登录">
            <a-form
              :model="loginForm"
              :rules="loginRules"
              @finish="handleLogin"
              layout="vertical"
            >
              <a-form-item label="邮箱" name="email">
                <a-input
                  v-model:value="loginForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-email text-gray-400"></i>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item label="密码" name="password">
                <a-input-password
                  v-model:value="loginForm.password"
                  placeholder="请输入密码"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-password text-gray-400"></i>
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item>
                <div class="flex justify-between items-center">
                  <a-checkbox v-model:checked="loginForm.remember">记住我</a-checkbox>
                  <a href="#" class="text-blue-600 hover:text-blue-800">忘记密码？</a>
                </div>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  block
                  :loading="loading"
                  class="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                >
                  登录
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="register" tab="注册">
            <a-form
              :model="registerForm"
              :rules="registerRules"
              @finish="handleRegister"
              layout="vertical"
            >
              <a-form-item label="用户名" name="username">
                <a-input
                  v-model:value="registerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-user text-gray-400"></i>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item label="邮箱" name="email">
                <a-input
                  v-model:value="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-email text-gray-400"></i>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item label="密码" name="password">
                <a-input-password
                  v-model:value="registerForm.password"
                  placeholder="请输入密码"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-password text-gray-400"></i>
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item label="确认密码" name="confirmPassword">
                <a-input-password
                  v-model:value="registerForm.confirmPassword"
                  placeholder="请再次输入密码"
                  size="large"
                >
                  <template #prefix>
                    <i class="i-carbon-password text-gray-400"></i>
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item name="agreement">
                <a-checkbox v-model:checked="registerForm.agreement">
                  我已阅读并同意 <a href="#" class="text-blue-600">用户协议</a> 和 <a href="#" class="text-blue-600">隐私政策</a>
                </a-checkbox>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  block
                  :loading="loading"
                  class="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
                >
                  注册
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>

        <!-- 分割线 -->
        <a-divider>或</a-divider>

        <!-- GitHub登录 -->
        <a-button
          size="large"
          block
          @click="handleGitHubLogin"
          class="flex items-center justify-center gap-2 border-gray-300 hover:border-gray-400"
        >
          <i class="i-carbon-logo-github text-xl"></i>
          使用 GitHub 登录
        </a-button>
      </a-card>

      <!-- 底部链接 -->
      <div class="text-center mt-6 text-gray-600">
        <p>
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <a
            href="#"
            @click.prevent="toggleMode"
            class="text-blue-600 hover:text-blue-800 font-medium"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const activeTab = ref('login')
const loading = ref(false)

// 计算属性
const isLogin = computed(() => activeTab.value === 'login')

// 登录表单
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

// 注册表单
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== registerForm.value.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  agreement: [
    {
      validator: (rule, value) => {
        if (!value) {
          return Promise.reject('请同意用户协议和隐私政策')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ]
}

// 事件处理
const handleTabChange = (key) => {
  activeTab.value = key
}

const toggleMode = () => {
  activeTab.value = activeTab.value === 'login' ? 'register' : 'login'
}

const handleLogin = async (values) => {
  loading.value = true
  try {
    // 调用store登录方法
    const result = await userStore.login({
      email: values.email,
      password: values.password
    })
    
    if (result.success) {
      message.success(result.message)
      router.push('/')
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleRegister = async (values) => {
  loading.value = true
  try {
    // 调用store注册方法
    const result = await userStore.register({
      email: values.email,
      password: values.password,
      username: values.username
    })
    
    if (result.success) {
      message.success(result.message)
      router.push('/')
    } else {
      message.error(result.message)
    }
  } catch (error) {
    message.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleGitHubLogin = async () => {
  window.location.href = 'https://github.com/login/oauth/authorize?client_id=Ov23lipVOcXkiYvfCxOZ&scope=user:email&redirect_uri=http://localhost:5173'
  // try {
  //   loading.value = true
    
  //   // 调用store GitHub登录方法
  //   const result = await userStore.loginWithGitHub()
    
  //   if (result.success) {
  //     message.success(result.message)
  //     router.push('/')
  //   } else {
  //     message.error(result.message)
  //   }
  // } catch (error) {
  //   message.error('GitHub登录失败，请重试')
  // } finally {
  //   loading.value = false
  // }
}
</script>

<style scoped>
/* 自定义样式 */
.ant-card {
  border-radius: 12px;
}

.ant-tabs .ant-tabs-tab {
  font-weight: 500;
}

.ant-btn-primary {
  height: 44px;
  font-weight: 500;
}

/* 渐变按钮悬停效果 */
.ant-btn-primary:hover {
  background: linear-gradient(to right, #3b82f6, #8b5cf6) !important;
  border-color: transparent !important;
}
</style>