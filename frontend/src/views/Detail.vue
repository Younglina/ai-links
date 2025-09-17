<template>
  <div class="detail-page">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <a-button @click="goBack" type="text" class="flex items-center gap-2">
        <i class="i-carbon-arrow-left text-lg"></i>
        返回
      </a-button>
    </div>

    <!-- 基本信息区域 -->
    <div class="basic-info p-6 mb-6">
      <div class="flex gap-6">
        <!-- 左侧图片 -->
        <div class="flex-shrink-0">
          <img
            :src="toolInfo.image"
            :alt="toolInfo.name"
            class="w-32 h-32 rounded-lg object-cover border border-gray-200"
            @error="handleImageError"
          />
        </div>

        <!-- 右侧信息 -->
        <div class="flex-1">
          <!-- 名称 -->
          <p class="text-3xl font-bold text-gray-900 mb-3">
            {{ toolInfo.name }}
          </p>

          <!-- 描述 -->
          <p class="text-gray-600 mb-4 leading-relaxed">
            {{ toolInfo.description }}
          </p>

          <!-- 标签 -->
          <div class="mb-4">
            <div class="flex flex-wrap gap-2">
              <a-tag
                v-for="tag in toolInfo.tags"
                :key="tag"
                :color="getTagColor(tag)"
                class="px-3 py-1 text-sm"
              >
                {{ tag }}
              </a-tag>
            </div>
          </div>

          <!-- 访问官网按钮 -->
          <div class="flex gap-3">
            <aiButton text="访问官网" type="primary">
              <i class="i-carbon-launch"></i>
            </aiButton>
            <aiButton text="复制链接">
              <i class="i-carbon-copy"></i>
            </aiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Markdown渲染区域 -->
    <div class="markdown-content p-6 ">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">详细介绍</h2>
        <a-button
          v-if="!markdownContent"
          @click="loadMarkdown"
          :loading="markdownLoading"
          type="primary"
          ghost
        >
          加载详细介绍
        </a-button>
      </div>

      <!-- Markdown内容 -->
      <div v-if="markdownContent" class="prose prose-lg max-w-none">
        <div v-html="renderedMarkdown" class="markdown-body"></div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!markdownLoading" class="text-center py-12 text-gray-500">
        <i class="i-carbon-document text-4xl mb-4 block"></i>
        <p>暂无详细介绍</p>
        <p class="text-sm">点击上方按钮加载内容</p>
      </div>

      <!-- 加载状态 -->
      <div v-else class="text-center py-12">
        <a-spin size="large" />
        <p class="mt-4 text-gray-500">正在加载详细介绍...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { marked } from "marked";
import aiButton from "@/components/ai-button.vue";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const route = useRoute();
const router = useRouter();

// 响应式数据
const toolInfo = ref({
  id: "",
  name: "",
  description: "",
  image: "",
  url: "",
  tags: [],
});
const markdownContent = ref("");
const markdownLoading = ref(false);

// 配置marked
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
  breaks: true,
  gfm: true,
});

// 计算属性
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return "";
  return marked(markdownContent.value);
});

// 方法
const goBack = () => {
  router.back();
};

const handleImageError = (event) => {
  event.target.src = "/ai-links.png"; // 使用默认图片
};

const getTagColor = (tag) => {
  const colors = [
    "blue",
    "green",
    "orange",
    "purple",
    "red",
    "cyan",
    "magenta",
  ];
  const index = tag.length % colors.length;
  return colors[index];
};

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(toolInfo.value.url);
    message.success("链接已复制到剪贴板");
  } catch (error) {
    message.error("复制失败，请手动复制");
  }
};

const loadMarkdown = async () => {
  markdownLoading.value = true;
  try {
    // 模拟加载Markdown内容
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟Markdown内容
    markdownContent.value = `# ${toolInfo.value.name}

## 简介

${toolInfo.value.description}

## 主要功能

- **智能化处理**: 提供先进的AI算法支持
- **用户友好**: 简洁直观的用户界面
- **高效性能**: 快速响应，稳定可靠
- **多平台支持**: 支持多种操作系统和设备

## 使用方法

### 快速开始

1. 访问官方网站
2. 注册账户
3. 开始使用

### 高级功能

\`\`\`javascript
// 示例代码
const tool = new AITool({
  apiKey: 'your-api-key',
  model: 'latest'
});

tool.process(data).then(result => {
  console.log('处理结果:', result);
});
\`\`\`

## 技术特点

| 特性 | 描述 |
|------|------|
| AI驱动 | 基于最新的人工智能技术 |
| 云端部署 | 无需本地安装，随时随地使用 |
| 数据安全 | 企业级安全保障 |
| 实时更新 | 持续优化和功能更新 |

## 应用场景

> 适用于各种业务场景，提升工作效率

- 内容创作
- 数据分析  
- 自动化处理
- 智能客服

## 联系我们

如有任何问题，请访问官方网站获取更多信息。`;
  } catch (error) {
    message.error("加载失败，请稍后重试");
  } finally {
    markdownLoading.value = false;
  }
};

// 初始化数据
const initToolInfo = () => {
  const id = route.params.id;

  // 模拟从API获取工具信息
  const mockTools = [
    {
      id: "1",
      name: "ChatGPT",
      description:
        "OpenAI开发的大型语言模型，能够进行自然语言对话、文本生成、代码编写等多种任务。",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg",
      url: "https://chat.openai.com",
      tags: ["AI对话", "文本生成", "代码助手", "创意写作"],
    },
    {
      id: "2",
      name: "Midjourney",
      description:
        "基于AI的图像生成工具，能够根据文本描述创造出高质量的艺术作品和图像。",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
      url: "https://midjourney.com",
      tags: ["AI绘画", "图像生成", "艺术创作", "设计工具"],
    },
    {
      id: "3",
      name: "GitHub Copilot",
      description:
        "GitHub和OpenAI合作开发的AI编程助手，能够根据注释和代码上下文自动生成代码。",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
      url: "https://github.com/features/copilot",
      tags: ["代码生成", "编程助手", "开发工具", "AI编程"],
    },
  ];

  const tool = mockTools.find((t) => t.id === id);
  if (tool) {
    toolInfo.value = tool;
  } else {
    // 如果没找到，使用默认数据
    toolInfo.value = {
      id: id,
      name: "AI工具",
      description: "这是一个强大的AI工具，能够帮助您提升工作效率。",
      image: "/ai-links.png",
      url: "https://example.com",
      tags: ["AI工具", "效率提升"],
    };
  }
};

// 组件挂载时初始化
onMounted(() => {
  initToolInfo();
});
</script>

<style scoped>
.detail-page {
  margin: 0 auto;
}

/* Markdown样式 */
:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
    Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #24292f;
}

:deep(.markdown-body h1) {
  font-size: 2em;
  font-weight: 600;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d0d7de;
  margin-bottom: 16px;
}

:deep(.markdown-body h2) {
  font-size: 1.5em;
  font-weight: 600;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #d0d7de;
  margin-top: 24px;
  margin-bottom: 16px;
}

:deep(.markdown-body h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
}

:deep(.markdown-body p) {
  margin-bottom: 16px;
}

:deep(.markdown-body ul, .markdown-body ol) {
  margin-bottom: 16px;
  padding-left: 2em;
}

:deep(.markdown-body li) {
  margin-bottom: 0.25em;
}

:deep(.markdown-body blockquote) {
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
  margin-bottom: 16px;
}

:deep(.markdown-body table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

:deep(.markdown-body table th, .markdown-body table td) {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}

:deep(.markdown-body table th) {
  font-weight: 600;
  background-color: #f6f8fa;
}

:deep(.markdown-body pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

:deep(.markdown-body pre code) {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border-radius: 0;
}

</style>
