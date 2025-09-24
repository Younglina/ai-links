<template>
  <a-modal
    :open="open"
    :title="isEdit ? '编辑工具' : '添加工具'"
    :width="600"
    @cancel="handleCancel"
    @ok="handleSubmit"
    :confirm-loading="loading"
    :destroy-on-close="true"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      @finish="handleSubmit"
    >
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="工具名称" name="name">
            <a-input
              v-model:value="formData.name"
              placeholder="请输入工具名称"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="分类" name="category">
            <a-select
              v-model:value="formData.category"
              placeholder="选择或输入分类"
              :options="categoryOptions"
              show-search
              allow-clear
              :filter-option="filterOption"
              @search="handleCategorySearch"
            >
              <template #notFoundContent>
                <div class="p-2 text-center">
                  <div class="text-gray-500 mb-2">未找到匹配的分类</div>
                  <a-button 
                    type="link" 
                    size="small"
                    @click="addNewCategory"
                    v-if="categorySearchValue"
                  >
                    添加 "{{ categorySearchValue }}"
                  </a-button>
                </div>
              </template>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工具链接" name="url">
            <a-input
              v-model:value="formData.url"
              placeholder="https://example.com"
              :maxlength="255"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="工具图标" name="icon">
            <a-input
              v-model:value="formData.icon"
              placeholder="图标URL或留空使用默认图标"
              :maxlength="255"
            />
            <div class="mt-2 flex items-center" v-if="formData.icon">
              <span class="text-sm text-gray-500 mr-2">预览：</span>
              <a-avatar :src="formData.icon" :size="32">
                <i class="i-carbon-tool-kit"></i>
              </a-avatar>
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="工具描述" name="description">
            <a-textarea
              v-model:value="formData.description"
              placeholder="请描述这个工具的功能和用途"
              :rows="4"
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="公开设置" name="is_public">
            <a-switch
              v-model:checked="formData.is_public"
              checked-children="公开"
              un-checked-children="私有"
            />
            <div class="text-sm text-gray-500 mt-1">
              公开的工具需要管理员审核后才能被其他用户看到
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { toolsAPI } from '@/api/api'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  tool: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:open', 'success'])

// 响应式数据
const formRef = ref()
const loading = ref(false)
const categorySearchValue = ref('')

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  category: '',
  url: '',
  icon: '',
  is_public: false
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入工具名称', trigger: 'blur' },
    { min: 1, max: 100, message: '工具名称长度应在1-100个字符之间', trigger: 'blur' }
  ],
  url: [
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入有效的URL地址', 
      trigger: 'blur' 
    }
  ],
  icon: [
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入有效的图标URL', 
      trigger: 'blur' 
    }
  ]
}

// 计算属性
const isEdit = computed(() => !!props.tool)

const categoryOptions = computed(() => {
  return props.categories.map(cat => ({
    label: cat,
    value: cat
  }))
})

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    description: '',
    category: '',
    url: '',
    icon: '',
    is_public: false
  })
  formRef.value?.resetFields()
}


// 监听工具数据变化
watch(() => props.tool, (newTool) => {
  if (newTool) {
    // 编辑模式，填充表单数据
    Object.assign(formData, {
      name: newTool.name || '',
      description: newTool.description || '',
      category: newTool.category || '',
      url: newTool.url || '',
      icon: newTool.icon || '',
      is_public: newTool.is_public || false
    })
  } else {
    // 新建模式，重置表单
    resetForm()
  }
}, { immediate: true })

// 监听模态框显示状态
watch(() => props.open, (open) => {
  if (!open) {
    resetForm()
  }
})

// 分类搜索过滤
const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// 处理分类搜索
const handleCategorySearch = (value) => {
  categorySearchValue.value = value
}

// 添加新分类
const addNewCategory = () => {
  if (categorySearchValue.value && !props.categories.includes(categorySearchValue.value)) {
    props.categories.push(categorySearchValue.value)
    formData.category = categorySearchValue.value
  }
}
// 处理取消
const handleCancel = () => {
  emit('update:open', false)
}

// 处理提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const submitData = { ...formData }
    
    // 清理空字符串
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = null
      }
    })

    if (isEdit.value) {
      // 更新工具
      await toolsAPI.update(props.tool.uuid, submitData)
      message.success('工具更新成功')
    } else {
      // 创建工具
      await toolsAPI.create(submitData)
      message.success('工具创建成功')
    }

    emit('success')
    emit('update:open', false)
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return
    }
    message.error(isEdit.value ? '更新失败：' + error.message : '创建失败：' + error.message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}

.ant-modal-body {
  padding: 24px;
}
</style>