<template>
  <div class="not-found-container">
    <div class="text-center">
      <!-- 404 图标和数字 -->
      <div class="mb-8">
        <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
        <div class="text-6xl mb-6">
          <span class="i-carbon-warning text-yellow-500"></span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">页面未找到</h1>
        <p class="text-xl text-gray-600 mb-2">抱歉，您访问的页面不存在</p>
        <p class="text-gray-500">请检查URL是否正确，或者返回首页继续浏览</p>
      </div>

      <!-- 可能的原因 -->
      <div class="bg-gray-50 p-6 rounded-lg mb-8 max-w-md mx-auto">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">可能的原因：</h3>
        <ul class="text-left text-gray-600 space-y-2">
          <li class="flex items-center">
            <span class="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            页面链接已过期或被删除
          </li>
          <li class="flex items-center">
            <span class="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            URL地址输入错误
          </li>
          <li class="flex items-center">
            <span class="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            您没有访问此页面的权限
          </li>
          <li class="flex items-center">
            <span class="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
            服务器临时维护中
          </li>
        </ul>
      </div>

      <!-- 操作按钮 -->
      <div class="space-x-4">
        <router-link to="/">
          <a-button type="primary" size="large">
            <template #icon>
              <span class="i-carbon-home"></span>
            </template>
            返回首页
          </a-button>
        </router-link>
        
        <a-button size="large" @click="goBack">
          <template #icon>
            <span class="i-carbon-arrow-left"></span>
          </template>
          返回上页
        </a-button>
        
        <a-button size="large" @click="refresh">
          <template #icon>
            <span class="i-carbon-refresh"></span>
          </template>
          刷新页面
        </a-button>
      </div>

      <!-- 搜索建议 -->
      <div class="mt-12">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">或者尝试搜索：</h3>
        <div class="max-w-md mx-auto">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索您需要的内容"
            size="large"
            @search="handleSearch"
          >
            <template #enterButton>
              <a-button type="primary">
                <span class="i-carbon-search"></span>
              </a-button>
            </template>
          </a-input-search>
        </div>
      </div>

      <!-- 快速链接 -->
      <div class="mt-12">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">快速链接：</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/about">
            <a-tag color="blue" class="cursor-pointer px-4 py-2 text-base">
              关于我们
            </a-tag>
          </router-link>
          <router-link to="/dashboard">
            <a-tag color="green" class="cursor-pointer px-4 py-2 text-base">
              仪表板
            </a-tag>
          </router-link>
          <a-tag color="orange" class="cursor-pointer px-4 py-2 text-base" @click="contactSupport">
            联系支持
          </a-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const searchKeyword = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const refresh = () => {
  window.location.reload()
}

const handleSearch = (value) => {
  if (value.trim()) {
    message.info(`搜索功能开发中，搜索关键词：${value}`)
    // 这里可以实现实际的搜索逻辑
    // router.push(`/search?q=${encodeURIComponent(value)}`)
  } else {
    message.warning('请输入搜索关键词')
  }
}

const contactSupport = () => {
  message.info('联系支持功能开发中')
  // 这里可以打开客服聊天窗口或跳转到联系页面
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.not-found-container .text-9xl {
  font-size: 8rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .not-found-container .text-9xl {
    font-size: 6rem;
  }
  
  .not-found-container .text-6xl {
    font-size: 3rem;
  }
  
  .not-found-container .text-4xl {
    font-size: 2rem;
  }
}
</style>