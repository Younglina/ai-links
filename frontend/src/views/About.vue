<template>
  <div class="about-container">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">关于 AI Links</h1>
      <p class="text-xl text-gray-600">了解我们的技术栈和项目特色</p>
    </div>

    <!-- 技术栈介绍 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <a-card title="前端技术栈" class="h-full">
        <div class="space-y-4">
          <div class="flex items-center">
            <a-tag color="green">Vue 3</a-tag>
            <span class="ml-2">渐进式JavaScript框架</span>
          </div>
          <div class="flex items-center">
            <a-tag color="blue">Vite</a-tag>
            <span class="ml-2">下一代前端构建工具</span>
          </div>
          <div class="flex items-center">
            <a-tag color="purple">Vue Router</a-tag>
            <span class="ml-2">官方路由管理器</span>
          </div>
          <div class="flex items-center">
            <a-tag color="orange">Ant Design Vue</a-tag>
            <span class="ml-2">企业级UI组件库</span>
          </div>
          <div class="flex items-center">
            <a-tag color="cyan">UnoCSS</a-tag>
            <span class="ml-2">原子化CSS引擎</span>
          </div>
          <div class="flex items-center">
            <a-tag color="red">Axios</a-tag>
            <span class="ml-2">HTTP客户端库</span>
          </div>
        </div>
      </a-card>

      <a-card title="项目特色" class="h-full">
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <h4 class="font-semibold">按需引入</h4>
              <p class="text-gray-600 text-sm">所有组件和工具库都支持按需引入，优化打包体积</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <h4 class="font-semibold">现代化开发</h4>
              <p class="text-gray-600 text-sm">使用最新的Vue 3 Composition API和TypeScript支持</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <h4 class="font-semibold">响应式设计</h4>
              <p class="text-gray-600 text-sm">完全响应式布局，适配各种设备屏幕</p>
            </div>
          </div>
          <div class="flex items-start">
            <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <h4 class="font-semibold">开发体验</h4>
              <p class="text-gray-600 text-sm">热重载、快速构建、丰富的开发工具</p>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 统计信息 -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-lg mb-8">
      <h2 class="text-2xl font-bold mb-6 text-center">项目统计</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold mb-2">{{ stats.components }}</div>
          <div class="text-sm opacity-90">组件数量</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold mb-2">{{ stats.routes }}</div>
          <div class="text-sm opacity-90">路由页面</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold mb-2">{{ stats.features }}</div>
          <div class="text-sm opacity-90">核心功能</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold mb-2">{{ stats.dependencies }}</div>
          <div class="text-sm opacity-90">依赖包</div>
        </div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="text-center">
      <router-link to="/">
        <a-button type="primary" size="large">
          返回首页
        </a-button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  components: 0,
  routes: 0,
  features: 0,
  dependencies: 0
})

// 模拟数据加载动画
onMounted(() => {
  const targetStats = {
    components: 25,
    routes: 4,
    features: 8,
    dependencies: 12
  }
  
  Object.keys(targetStats).forEach(key => {
    let current = 0
    const target = targetStats[key]
    const increment = Math.ceil(target / 20)
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      stats.value[key] = current
    }, 50)
  })
})
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>