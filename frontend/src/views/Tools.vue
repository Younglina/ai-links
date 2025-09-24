<template>
  <div class="tools-page">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">工具管理</h1>
        <p class="text-gray-600 mt-1">管理和分享你的AI工具集合</p>
      </div>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <i class="i-carbon-add"></i>
        </template>
        添加工具
      </a-button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-select
            v-model:value="filters.category"
            placeholder="选择分类"
            allow-clear
            @change="loadTools"
          >
            <a-select-option value="">全部分类</a-select-option>
            <a-select-option 
              v-for="category in categories" 
              :key="category" 
              :value="category"
            >
              {{ category }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="filters.is_public"
            placeholder="公开状态"
            allow-clear
            @change="loadTools"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="true">公开</a-select-option>
            <a-select-option value="false">私有</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-switch
            v-model:checked="filters.my_tools"
            checked-children="我的工具"
            un-checked-children="全部工具"
            @change="loadTools"
          />
        </a-col>
        <a-col :span="6">
          <a-button @click="resetFilters">重置筛选</a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 工具列表 -->
    <div class="bg-white rounded-lg shadow-sm">
      <a-table
        :columns="columns"
        :data-source="tools"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="uuid"
      >
        <!-- 工具名称列 -->
        <template #name="{ record }">
          <div class="flex items-center">
            <a-avatar 
              :src="record.icon" 
              :size="32" 
              class="mr-3"
              style="background-color: #f0f9ff"
            >
              <i v-if="!record.icon" class="i-carbon-tool-kit text-blue-500"></i>
            </a-avatar>
            <div>
              <div class="font-medium text-gray-900">{{ record.name }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">
                {{ record.description }}
              </div>
            </div>
          </div>
        </template>

        <!-- 分类列 -->
        <template #category="{ record }">
          <a-tag v-if="record.category" color="blue">
            {{ record.category }}
          </a-tag>
          <span v-else class="text-gray-400">未分类</span>
        </template>

        <!-- 状态列 -->
        <template #status="{ record }">
          <a-tag 
            :color="getStatusColor(record.status)"
            class="capitalize"
          >
            {{ getStatusText(record.status) }}
          </a-tag>
          <a-tag v-if="record.is_public" color="green" class="ml-1">
            公开
          </a-tag>
        </template>

        <!-- 创建时间列 -->
        <template #created_at="{ record }">
          {{ formatDate(record.created_at) }}
        </template>

        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a-button 
              type="text" 
              size="small" 
              @click="viewTool(record)"
            >
              查看
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click="editTool(record)"
              v-if="record.user_id === userStore.user.id"
            >
              编辑
            </a-button>
            <!-- 审核按钮 - 仅管理员可见且仅对pending状态的工具显示 -->
            <a-dropdown v-if="userStore.isAdmin && record.status === 'pending'">
              <a-button type="text" size="small" class="text-blue-600">
                审核
                <i class="i-carbon-chevron-down ml-1"></i>
              </a-button>
              <template #overlay>
                <a-menu @click="({ key }) => handleReview(record, key)">
                  <a-menu-item key="approve">
                    <i class="i-carbon-checkmark text-green-600 mr-2"></i>
                    批准
                  </a-menu-item>
                  <a-menu-item key="reject">
                    <i class="i-carbon-close text-red-600 mr-2"></i>
                    拒绝
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <a-popconfirm
              title="确定要删除这个工具吗？"
              @confirm="deleteTool(record.uuid)"
              v-if="record.user_id === userStore.user.id"
            >
              <a-button type="text" size="small" danger>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 创建/编辑工具模态框 -->
    <ToolForm
      v-model:open="showCreateModal"
      :categories="categories"
      :tool="editingTool"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { toolsAPI, adminAPI } from '@/api/api'
import ToolForm from '@/components/ToolForm.vue'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const tools = ref([])
const categories = ref(['聊天助手', '图像工具', '视频工具','音频工具'])
const showCreateModal = ref(false)
const editingTool = ref(null)

// 筛选条件
const filters = reactive({
  category: '',
  is_public: '',
  my_tools: false
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表格列配置
const columns = [
  {
    title: '工具名称',
    dataIndex: 'name',
    key: 'name',
    slots: { customRender: 'name' },
    width: 300
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    slots: { customRender: 'category' },
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    slots: { customRender: 'created_at' },
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
    width: 200,
    fixed: 'right'
  }
]

// 加载工具列表
const loadTools = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      ...filters
    }
    
    const response = await toolsAPI.getList(params)
    tools.value = response.tools
    pagination.total = response.pagination.total
  } catch (error) {
    message.error('加载工具列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadTools()
}

// 重置筛选
const resetFilters = () => {
  filters.category = ''
  filters.is_public = ''
  filters.my_tools = false
  pagination.current = 1
  loadTools()
}

// 查看工具详情
const viewTool = (tool) => {
  // 跳转到工具详情页面
  console.log('查看工具：', tool)
}

// 编辑工具
const editTool = (tool) => {
  editingTool.value = tool
  showCreateModal.value = true
}

// 删除工具
const deleteTool = async (uuid) => {
  try {
    await toolsAPI.delete(uuid)
    message.success('删除成功')
    loadTools()
  } catch (error) {
    message.error('删除失败：' + error.message)
  }
}

// 审核工具
const handleReview = async (tool, action) => {
  try {
    const actionText = action === 'approve' ? '批准' : '拒绝'
    await adminAPI.reviewTool(tool.id, action)
    message.success(`${actionText}成功`)
    loadTools()
  } catch (error) {
    message.error(`审核失败：${error.message}`)
  }
}

// 表单提交成功处理
const handleFormSuccess = () => {
  showCreateModal.value = false
  editingTool.value = null
  loadTools()
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 组件挂载时加载数据
onMounted(() => {
  loadTools()
})
</script>

<style scoped>
.tools-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.ant-table {
  background: white;
}

.ant-tag {
  margin: 0;
}
</style>