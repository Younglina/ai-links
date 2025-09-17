<template>
  <a-card
    hoverable
    class="ai-card cursor-pointer transition-all duration-300 hover:shadow-lg"
    @click="handleClick"
  >
    <a-tooltip placement="bottom" :title="aiData.description">
      <div class="flex items-start space-x-4">
        <!-- 左侧图片 -->
        <div class="flex-shrink-0">
          <a-avatar
            :size="48"
            :src="aiData.image"
            class="border-2 border-gray-100"
          >
            <template #icon>
              <img class="w-8 h-8" src="/ai-links.png" />
            </template>
          </a-avatar>
        </div>

        <!-- 右侧内容 -->
        <div class="flex-1 min-w-0">
          <!-- 名称 -->
          <span class="font-semibold mb-1">
            {{ aiData.name }}
          </span>

          <!-- 描述 -->
          <p
            class="text-gray-600 text-[12px] text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {{ aiData.description }}
          </p>
        </div>
      </div>
    </a-tooltip>
  </a-card>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 定义props
const props = defineProps({
  aiData: {
    type: Object,
    required: true,
    default: () => ({
      id: "",
      name: "",
      description: "",
      image: "",
    }),
  },
});

// 定义事件
const emit = defineEmits(["click"]);

// 处理卡片点击
const handleClick = () => {
  // 跳转到详情页
  router.push(`/detail/${props.aiData.id}`);
  // 保留原有的事件发射
  emit("click", props.aiData);
};
</script>

<style lang="less" scoped>
.ai-card {
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  :deep(.ant-card-body) {
    padding: 12px;
  }
  :deep(.ant-avatar) {
    box-shadow: none;
    background-color: unset;
  }
}

.ai-card:hover {
  transform: translateY(-2px);
}

/* 头像边框效果 */
.ant-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
