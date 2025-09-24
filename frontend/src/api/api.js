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

// 工具管理相关API
export const toolsAPI = {
  // 创建工具
  create: (toolData) => {
    return request.post('/tools', toolData)
  },

  // 获取工具列表
  getList: (params = {}) => {
    return request.get('/tools', { params })
  },

  // 获取工具详情
  getDetail: (uuid) => {
    return request.get(`/tools/${uuid}`)
  },

  // 更新工具
  update: (uuid, toolData) => {
    return request.put(`/tools/${uuid}`, toolData)
  },

  // 删除工具
  delete: (uuid) => {
    return request.delete(`/tools/${uuid}`)
  },
}

// 管理员相关API
export const adminAPI = {
  // 审核工具
  reviewTool: (id, action, reason = '') => {
    return request.put(`/admin/tools/${id}/review`, { action, reason })
  },

  // 获取待审核工具列表
  getPendingTools: (params = {}) => {
    return request.get('/admin/tools/pending', { params })
  },

  // 获取所有工具列表（管理员视图）
  getAllTools: (params = {}) => {
    return request.get('/admin/tools', { params })
  },

  // 批量审核工具
  batchReviewTools: (toolIds, action, reason = '') => {
    return request.put('/admin/tools/batch-review', { tool_ids: toolIds, action, reason })
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
  tools: toolsAPI,
  admin: adminAPI,
  health: healthAPI
}