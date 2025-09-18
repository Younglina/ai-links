import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 添加JWT token到请求头
    const token = localStorage.getItem('ai-links-user')
    if (token) {
      try {
        const userData = JSON.parse(token)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
      } catch (error) {
        console.error('解析token失败:', error)
      }
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data
  },
  error => {
    // 对响应错误做点什么
    console.error('请求错误:', error)
    
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除本地存储的用户信息
      localStorage.removeItem('ai-links-user')
      // 可以在这里触发登出逻辑或跳转到登录页
      window.location.href = '/login'
    }
    
    return Promise.reject(error.response?.data || error)
  }
)

export default request