<template>
  <!-- 登录注册页面 - 无布局 -->
  <router-view v-if="$route.meta.hideLayout" />
  
  <!-- 主应用布局 -->
  <a-layout v-else class="min-h-screen p-1">
    <!-- 左侧菜单栏 -->
    <a-layout-sider 
      v-model:collapsed="collapsed" 
      :trigger="null" 
      collapsible
      width="220"
      class="bg-white"
    >
      <!-- Logo区域 -->
      <div class="p-4 border-b w-[220px]">
        <div class="flex items-center">
          <img class="w-8 h-8" src="/ai-links.png">
          <span v-show="!collapsed" class="text-xl font-bold text-gray-800 whitespace-nowrap ml-2">AI Links</span>
        </div>
      </div>
      
      <!-- 菜单 -->
      <a-menu 
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        class="border-none"
      >
        <a-menu-item key="home" @click="$router.push('/')">
          <template #icon>
            <i class="i-carbon-home text-lg"></i>
          </template>
          首页
        </a-menu-item>
        <a-menu-item key="about" @click="$router.push('/about')">
          <template #icon>
            <i class="i-carbon-information text-lg"></i>
          </template>
          关于
        </a-menu-item>
        <a-menu-item key="dashboard" @click="$router.push('/dashboard')">
          <template #icon>
            <i class="i-carbon-dashboard text-lg"></i>
          </template>
          仪表板
        </a-menu-item>
        <a-menu-item key="tools" @click="$router.push('/tools')" v-if="userStore.isAuthenticated">
          <template #icon>
            <i class="i-carbon-tool-kit text-lg"></i>
          </template>
          工具管理
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <!-- 右侧内容区域 -->
    <a-layout class="relative important-bg-white border-rounded-2">
      <!-- <div class="grid-wrapper"></div> -->
      <!-- 顶部用户区 -->
      <a-layout-header class="important-bg-transparent px-6 flex items-center justify-between">
        <!-- 折叠按钮 -->
        <a-button 
          type="text" 
          @click="collapsed = !collapsed"
          class="text-lg"
        >
          <i :class="collapsed ? 'i-carbon-menu' : 'i-carbon-close'"></i>
        </a-button>
        
        <!-- 用户信息区 -->
        <div class="flex items-center space-x-4">
          <a-button type="text" size="small">
            <i class="i-carbon-notification text-lg"></i>
          </a-button>
          
          <!-- 未登录状态 -->
          <a-button v-if="!userStore.isAuthenticated" type="primary" @click="router.push('/auth')">
            登录
          </a-button>
          
          <!-- 已登录状态 -->
          <a-dropdown v-else>
            <a-button type="text" class="flex items-center space-x-2">
              <a-avatar size="small" :src="userStore.userAvatar" class="bg-blue-500">
                <i v-if="!userStore.userAvatar" class="i-carbon-user text-white"></i>
              </a-avatar>
              <span>{{ userStore.userName }}</span>
              <i class="i-carbon-chevron-down"></i>
            </a-button>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="profile">
                  <i class="i-carbon-user mr-2"></i>
                  个人资料
                </a-menu-item>
                <a-menu-item key="settings">
                  <i class="i-carbon-settings mr-2"></i>
                  设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <i class="i-carbon-logout mr-2"></i>
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <!-- 主要内容区域 -->
      <a-layout-content class="overflow-y-auto" style="height: calc(100vh - 112px);">
        <div class="m-[16px] mb-0 rounded-lg">
          <RouterView />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collapsed = ref(false)
const selectedKeys = ref(['home'])

// 根据当前路由设置选中的菜单项
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    selectedKeys.value = ['home']
  } else if (newPath === '/about') {
    selectedKeys.value = ['about']
  } else if (newPath === '/dashboard') {
    selectedKeys.value = ['dashboard']
  }
}, { immediate: true })

// 处理用户菜单点击
const handleMenuClick = ({ key }) => {
  if (key === 'logout') {
    userStore.logout()
    router.push('/auth')
  } else if (key === 'profile') {
    // 跳转到个人资料页面
    console.log('跳转到个人资料')
  } else if (key === 'settings') {
    // 跳转到设置页面
    console.log('跳转到设置')
  }
}

// 组件挂载时检查token有效性
onMounted(() => {
  userStore.checkTokenValidity()
})
</script>
<style scoped>
/* Ant Design Vue Layout 样式覆盖 */
.ant-layout-sider {
  background: #f5f5f5 !important;
}

.ant-layout-header {
  height: 64px;
  line-height: 64px;
  padding: 0 24px;
}

.ant-menu {
  background: transparent;
}

.ant-menu-item {
  margin: 4px 0;
  border-radius: 6px;
}

.ant-menu-item:hover {
  background-color: #f0f9ff;
  color: #1890ff;
}

.ant-menu-item-selected {
  background-color: #e6f7ff;
  color: #1890ff;
}

.grid-wrapper {
  position: absolute;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    #ffe8f3,
    #d9f3ff
  );
}
</style>
