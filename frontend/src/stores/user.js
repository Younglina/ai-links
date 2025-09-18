import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api/api.js'

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
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: response.message || '登录成功' }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, message: error.message || '网络错误，请稍后重试' }
    }
  }

  // 注册方法
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: response.message || '注册成功' }
      } else {
        return { success: false, message: response.message || '注册失败' }
      }
    } catch (error) {
      console.error('注册错误:', error)
      return { success: false, message: error.message || '网络错误，请稍后重试' }
    }
  }

  // GitHub登录方法
  const loginWithGitHub = async (code) => {
    try {
      const response = await authAPI.loginWithGitHub(code)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        isLoggedIn.value = true
        loginTime.value = new Date().toISOString()
        
        return { success: true, message: response.message || 'GitHub登录成功' }
      } else {
        return { success: false, message: response.message || 'GitHub登录失败' }
      }
    } catch (error) {
      console.error('GitHub登录错误:', error)
      return { success: false, message: error.message || 'GitHub登录失败，请稍后重试' }
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
  const updateUserInfo = async (newUserInfo) => {
    try {
      if (!user.value) {
        return { success: false, message: '用户未登录' }
      }

      const response = await authAPI.updateUser(newUserInfo)
      
      if (response.success) {
        user.value = { ...user.value, ...response.user }
        return { success: true, message: response.message || '更新成功' }
      } else {
        return { success: false, message: response.message || '更新失败' }
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      return { success: false, message: error.message || '网络错误，请稍后重试' }
    }
  }

  // 检查token是否有效
  const checkTokenValidity = async () => {
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