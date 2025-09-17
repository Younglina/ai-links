import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref('')
  const isLoggedIn = ref(false)
  const loginTime = ref(null)

  // 计算属性
  const userInfo = computed(() => user.value)
  const isAuthenticated = computed(() => isLoggedIn.value && !!token.value)
  const userName = computed(() => user.value?.name || user.value?.email || '用户')
  const userAvatar = computed(() => user.value?.avatar || '')

  // 登录方法
  const login = async (credentials) => {
    try {
      // 模拟API调用
      const response = await mockLogin(credentials)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    }
  }

  // 注册方法
  const register = async (userData) => {
    try {
      // 模拟API调用
      const response = await mockRegister(userData)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: '注册成功' }
      } else {
        return { success: false, message: response.message || '注册失败' }
      }
    } catch (error) {
      console.error('注册错误:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    }
  }

  // GitHub登录方法
  const loginWithGitHub = async () => {
    try {
      // 模拟GitHub OAuth流程
      const response = await mockGitHubLogin()
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: 'GitHub登录成功' }
      } else {
        return { success: false, message: response.message || 'GitHub登录失败' }
      }
    } catch (error) {
      console.error('GitHub登录错误:', error)
      return { success: false, message: 'GitHub登录失败，请稍后重试' }
    }
  }

  // 退出登录方法
  const logout = () => {
    user.value = null
    token.value = ''
    isLoggedIn.value = false
    loginTime.value = null
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    if (user.value) {
      user.value = { ...user.value, ...newUserInfo }
    }
  }

  // 检查token是否有效
  const checkTokenValidity = () => {
    if (!token.value || !loginTime.value) {
      logout()
      return false
    }
    
    // 检查token是否过期（7天）
    const loginDate = new Date(loginTime.value)
    const now = new Date()
    const diffDays = (now - loginDate) / (1000 * 60 * 60 * 24)
    
    if (diffDays > 7) {
      logout()
      return false
    }
    
    return true
  }

  return {
    // 状态
    user,
    token,
    isLoggedIn,
    loginTime,
    
    // 计算属性
    userInfo,
    isAuthenticated,
    userName,
    userAvatar,
    
    // 方法
    login,
    register,
    loginWithGitHub,
    logout,
    updateUserInfo,
    checkTokenValidity
  }
}, {
  persist: {
    key: 'ai-links-user',
    storage: localStorage,
    paths: ['user', 'token', 'isLoggedIn', 'loginTime']
  }
})

// 模拟API函数
async function mockLogin(credentials) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟登录验证
  if (credentials.email === 'test@example.com' && credentials.password === '123456') {
    return {
      success: true,
      user: {
        id: 1,
        name: '测试用户',
        email: credentials.email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  } else {
    return {
      success: false,
      message: '邮箱或密码错误'
    }
  }
}

async function mockRegister(userData) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // 模拟注册
  return {
    success: true,
    user: {
      id: Date.now(),
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
    },
    token: 'mock-jwt-token-' + Date.now()
  }
}

async function mockGitHubLogin() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 模拟GitHub登录
  return {
    success: true,
    user: {
      id: Date.now(),
      name: 'GitHub用户',
      email: 'github@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github',
      provider: 'github'
    },
    token: 'mock-github-token-' + Date.now()
  }
}