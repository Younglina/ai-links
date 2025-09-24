<template>
  <div class="tool-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 工具详情内容 -->
    <div v-else-if="tool" class="tool-content">
      <!-- 返回按钮 -->
      <div class="mb-4">
        <a-button @click="goBack" icon="arrow-left">
          返回工具列表
        </a-button>
      </div>

      <!-- 工具头部信息 -->
      <a-card class="tool-header-card mb-4">
        <div class="tool-header">
          <div class="tool-icon">
            <a-avatar :src="tool.icon" :size="64">
              <i class="i-carbon-tool-kit text-2xl"></i>
            </a-avatar>
          </div>
          <div class="tool-info">
            <h1 class="tool-title">{{ tool.name }}</h1>
            <div class="tool-meta">
              <a-tag :color="getCategoryColor(tool.category)" v-if="tool.category">
                {{ tool.category }}
              </a-tag>
              <a-tag :color="tool.is_public ? 'green' : 'orange'">
                {{ tool.is_public ? '公开' : '私有' }}
              </a-tag>
              <a-tag :color="getStatusColor(tool.status)" v-if="tool.status">
                {{ getStatusText(tool.status) }}
              </a-tag>
            </div>
            <div class="tool-stats">
              <span class="stat-item">
                <i class="i-carbon-view"></i>
                浏览 {{ tool.view_count || 0 }} 次
              </span>
              <span class="stat-item">
                <i class="i-carbon-time"></i>
                创建于 {{ formatDate(tool.created_at) }}
              </span>
              <span class="stat-item" v-if="tool.updated_at !== tool.created_at">
                <i class="i-carbon-edit"></i>
                更新于 {{ formatDate(tool.updated_at) }}
              </span>
            </div>
          </div>
          <div class="tool-actions">
            <a-space>
              <a-button 
                type="primary" 
                :href="tool.url" 
                target="_blank"
                v-if="tool.url"
              >
                <i class="i-carbon-launch mr-1"></i>
                访问工具
              </a-button>
              <a-dropdown v-if="canEdit">
                <a-button>
                  <i class="i-carbon-overflow-menu-horizontal"></i>
                </a-button>
                <template #overlay>
                  <a-menu @click="handleMenuClick">
                    <a-menu-item key="edit">
                      <i class="i-carbon-edit mr-2"></i>
                      编辑工具
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" class="text-red-500">
                      <i class="i-carbon-trash-can mr-2"></i>
                      删除工具
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </div>
        </div>
      </a-card>

      <!-- 工具描述 -->
      <a-card title="工具描述" class="mb-4" v-if="tool.description">
        <div class="tool-description">
          {{ tool.description }}
        </div>
      </a-card>

      <!-- 工具信息 -->
      <a-card title="详细信息" class="mb-4">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="工具名称">
            {{ tool.name }}
          </a-descriptions-item>
          <a-descriptions-item label="分类">
            <a-tag :color="getCategoryColor(tool.category)" v-if="tool.category">
              {{ tool.category }}
            </a-tag>
            <span v-else class="text-gray-400">未分类</span>
          </a-descriptions-item>
          <a-descriptions-item label="工具链接">
            <a :href="tool.url" target="_blank" v-if="tool.url" class="text-blue-500">
              {{ tool.url }}
              <i class="i-carbon-launch ml-1"></i>
            </a>
            <span v-else class="text-gray-400">未设置</span>
          </a-descriptions-item>
          <a-descriptions-item label="公开状态">
            <a-tag :color="tool.is_public ? 'green' : 'orange'">
              {{ tool.is_public ? '公开' : '私有' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="审核状态" v-if="tool.is_public">
            <a-tag :color="getStatusColor(tool.status)">
              {{ getStatusText(tool.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建者">
            {{ tool.user?.username || '未知' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDate(tool.created_at) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDate(tool.updated_at) }}
          </a-descriptions-item>
          <a-descriptions-item label="浏览次数">
            {{ tool.view_count || 0 }} 次
          </a-descriptions-item>
          <a-descriptions-item label="审核者" v-if="tool.reviewer">
            {{ tool.reviewer.username }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 审核历史 -->
      <a-card title="审核历史" v-if="tool.is_public && tool.status !== 'pending'">
        <a-timeline>
          <a-timeline-item color="blue">
            <div class="timeline-content">
              <div class="timeline-title">工具创建</div>
              <div class="timeline-time">{{ formatDate(tool.created_at) }}</div>
              <div class="timeline-desc">由 {{ tool.user?.username }} 创建</div>
            </div>
          </a-timeline-item>
          <a-timeline-item 
            :color="tool.status === 'approved' ? 'green' : 'red'"
            v-if="tool.status !== 'pending'"
          >
            <div class="timeline-content">
              <div class="timeline-title">
                {{ tool.status === 'approved' ? '审核通过' : '审核拒绝' }}
              </div>
              <div class="timeline-time">{{ formatDate(tool.updated_at) }}</div>
              <div class="timeline-desc" v-if="tool.reviewer">
                由 {{ tool.reviewer.username }} 审核
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>

    <!-- 工具不存在 -->
    <div v-else class="not-found">
      <a-result
        status="404"
        title="工具不存在"
        sub-title="抱歉，您访问的工具不存在或已被删除。"
      >
        <template #extra>
          <a-button type="primary" @click="goBack">
            返回工具列表
          </a-button>
        </template>
      </a-result>
    </div>

    <!-- 编辑工具模态框 -->
    <ToolForm
      v-model:visible="editModalVisible"
      :tool="tool"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { toolsAPI } from '@/api/api'
import ToolForm from '@/components/ToolForm.vue'

// 路由和状态
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const tool = ref(null)
const editModalVisible = ref(false)

// 计算属性
const canEdit = computed(() => {
  if (!tool.value || !userStore.user) return false
  return tool.value.user_id === userStore.user.id || userStore.user.is_admin
})

// 获取工具详情
const fetchTool = async () => {
  try {
    loading.value = true
    const uuid = route.params.uuid
    const response = await toolsAPI.getDetail(uuid)
    tool.value = response.data
  } catch (error) {
    message.error('获取工具详情失败：' + error.message)
    tool.value = null
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/tools')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取分类颜色
const getCategoryColor = (category) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
  const hash = category?.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0) || 0
  return colors[Math.abs(hash) % colors.length]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const statusColors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return statusColors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusTexts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusTexts[status] || '未知'
}

// 处理菜单点击
const handleMenuClick = ({ key }) => {
  switch (key) {
    case 'edit':
      editModalVisible.value = true
      break
    case 'delete':
      handleDelete()
      break
  }
}

// 处理删除
const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除工具 "${tool.value.name}" 吗？此操作不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await toolsAPI.delete(tool.value.uuid)
        message.success('工具删除成功')
        router.push('/tools')
      } catch (error) {
        message.error('删除失败：' + error.message)
      }
    }
  })
}

// 处理编辑成功
const handleEditSuccess = () => {
  fetchTool() // 重新加载工具详情
}

// 组件挂载时获取工具详情
onMounted(() => {
  fetchTool()
})
</script>

<style scoped>
.tool-detail {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.tool-icon {
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.tool-meta {
  margin-bottom: 12px;
}

.tool-meta .ant-tag {
  margin-right: 8px;
}

.tool-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-actions {
  flex-shrink: 0;
}

.tool-description {
  line-height: 1.6;
  white-space: pre-wrap;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.timeline-time {
  color: #666;
  font-size: 12px;
  margin-bottom: 2px;
}

.timeline-desc {
  color: #999;
  font-size: 12px;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .tool-detail {
    padding: 16px;
  }
  
  .tool-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tool-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>