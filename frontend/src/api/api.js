import request from '../utils/request.js'

// 用户认证相关API
export const authAPI = {
  // 用户登录
  login: (credentials) => {
    return request.post('/auth/login', credentials)
  },

  // 用户注册
  register: (userData) => {
    return request.post('/auth/register', userData)
  },

  // GitHub OAuth登录
  loginWithGitHub: (code) => {
    return request.post('/auth/github', { code })
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return request.get('/auth/me')
  },

  // 更新用户信息
  updateUser: (userData) => {
    return request.put('/auth/update', userData)
  }
}

// 健康检查API
export const healthAPI = {
  // 检查后端服务状态
  check: () => {
    return request.get('/health')
  }
}

// 导出所有API
export default {
  auth: authAPI,
  health: healthAPI
}