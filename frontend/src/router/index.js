import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user.js'

// 导入页面组件
const Home = () => import('../views/Home.vue')
const About = () => import('../views/About.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Auth = () => import('../views/Auth.vue')
const Detail = () => import('../views/Detail.vue')
const NotFound = () => import('../views/NotFound.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表板',
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: {
      title: '登录注册',
      hideLayout: true // 隐藏主布局
    }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    meta: {
      title: '工具详情'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 处理GitHub OAuth回调
  if (to.path === '/' && to.query.code) {
    const userStore = useUserStore()
    
    try {
      const result = await userStore.loginWithGitHub(to.query.code)
      
      if (result.success) {
        // 登录成功，清除URL中的code参数并跳转到仪表板
        console.log('GitHub登录成功:', result.message)
        next({ path: '/dashboard', replace: true })
        return
      } else {
        // 登录失败，清除URL中的code参数并显示错误
        console.error('GitHub登录失败:', result.message)
        next({ path: '/', query: {}, replace: true })
        return
      }
    } catch (error) {
      console.error('GitHub登录处理错误:', error)
      next({ path: '/', query: {}, replace: true })
      return
    }
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI Links`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 这里可以添加认证逻辑
    // const isAuthenticated = checkAuth()
    // if (!isAuthenticated) {
    //   next('/login')
    //   return
    // }
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等逻辑
  console.log(`导航到: ${to.path}`)
})

export default router