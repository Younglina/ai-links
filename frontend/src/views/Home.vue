<template>
  <div class="container">
    <!-- 欢迎区域 -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">
        欢迎使用 AI工具集
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        发现和使用最优秀的AI工具，提升您的工作效率
      </p>
    </div>

    <!-- AI卡片展示区域 -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">AI工具推荐</h2>
      <div class="grid-wrap">
        <ai-card 
          v-for="ai in aiList" 
          :key="ai.id"
          :ai-data="ai"
          @click="handleAiClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import AiCard from '../components/ai-card.vue'

const router = useRouter()

// 模拟AI数据
const aiList = ref([
  {
    id: '1',
    name: 'ChatGPT',
    description: '由OpenAI开发的大型语言模型，能够进行自然语言对话、文本生成、代码编写等多种任务。具有强大的理解和生成能力，是目前最受欢迎的AI助手之一。',
    image: 'https://cdn.openai.com/API/logo-openai.svg'
  },
  {
    id: '2',
    name: 'Midjourney',
    description: '专业的AI图像生成工具，能够根据文本描述创建高质量的艺术作品和图像。广泛应用于设计和创意领域，深受艺术家和设计师喜爱。',
    image: 'https://cdn.midjourney.com/logo.png'
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    description: '由GitHub和OpenAI联合开发的AI编程助手，能够实时提供代码建议和自动补全，大幅提升开发效率。支持多种编程语言和开发环境。',
    image: 'https://github.githubassets.com/images/modules/site/copilot/copilot.png'
  },
  {
    id: '4',
    name: 'Claude',
    description: 'Anthropic开发的AI助手，专注于安全性和有用性。擅长分析、写作、数学、编程等多个领域的任务，提供可靠和准确的回答。',
    image: 'https://claude.ai/images/claude_logo.svg'
  },
  {
    id: '5',
    name: 'Stable Diffusion',
    description: '开源的AI图像生成模型，支持文本到图像的转换。具有高度的可定制性和灵活性，完全免费使用，社区活跃。',
    image: 'https://stability.ai/logo.png'
  },
  {
    id: '6',
    name: 'Notion AI',
    description: '集成在Notion中的AI写作助手，能够帮助用户生成内容、总结文档、翻译文本等。与Notion完美集成，提升办公效率。',
    image: 'https://notion.so/images/logo-ios.png'
  }
])

const showMessage = () => {
  message.success('这是一个测试消息！')
}

// 处理AI卡片点击
const handleAiClick = (aiData) => {
  message.info(`点击了 ${aiData.name}，即将跳转到详情页...`)
  // 这里可以跳转到详情页
  // router.push(`/ai-detail/${aiData.id}`)
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  border-color: #1890ff;
}
.grid-wrap{
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
</style>