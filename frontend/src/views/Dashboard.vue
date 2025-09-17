<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-800">仪表板</h1>
      <a-button type="primary" @click="refreshData">
        <template #icon>
          <span class="i-carbon-refresh" :class="{ 'animate-spin': loading }"></span>
        </template>
        刷新数据
      </a-button>
    </div>

    <!-- 数据卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <a-card class="stat-card">
        <a-statistic
          title="总访问量"
          :value="dashboardData.totalViews"
          :precision="0"
          suffix="次"
          :value-style="{ color: '#3f8600' }"
        >
          <template #prefix>
            <span class="i-carbon-view text-green-500"></span>
          </template>
        </a-statistic>
      </a-card>

      <a-card class="stat-card">
        <a-statistic
          title="活跃用户"
          :value="dashboardData.activeUsers"
          :precision="0"
          suffix="人"
          :value-style="{ color: '#1890ff' }"
        >
          <template #prefix>
            <span class="i-carbon-user text-blue-500"></span>
          </template>
        </a-statistic>
      </a-card>

      <a-card class="stat-card">
        <a-statistic
          title="今日收入"
          :value="dashboardData.todayRevenue"
          :precision="2"
          prefix="¥"
          :value-style="{ color: '#cf1322' }"
        >
          <template #prefix>
            <span class="i-carbon-currency-dollar text-red-500"></span>
          </template>
        </a-statistic>
      </a-card>

      <a-card class="stat-card">
        <a-statistic
          title="转化率"
          :value="dashboardData.conversionRate"
          :precision="1"
          suffix="%"
          :value-style="{ color: '#722ed1' }"
        >
          <template #prefix>
            <span class="i-carbon-chart-line text-purple-500"></span>
          </template>
        </a-statistic>
      </a-card>
    </div>

    <!-- 图表和表格区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 模拟图表 -->
      <a-card title="访问趋势" class="chart-card">
        <div class="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
          <div class="text-center">
            <span class="i-carbon-chart-line text-6xl text-blue-500 mb-4 block"></span>
            <p class="text-gray-600">图表组件位置</p>
            <p class="text-sm text-gray-500">可以集成 ECharts 或 Chart.js</p>
          </div>
        </div>
      </a-card>

      <!-- 最近活动 -->
      <a-card title="最近活动" class="activity-card">
        <div class="space-y-4">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :class="activity.iconBg">
              <span :class="activity.icon"></span>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ activity.title }}</p>
              <p class="text-sm text-gray-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <a-card title="用户数据" class="table-card">
      <a-table 
        :columns="tableColumns" 
        :data-source="tableData" 
        :pagination="{ pageSize: 5 }"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '活跃' ? 'green' : 'orange'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" size="small" danger>删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const loading = ref(false)

const dashboardData = ref({
  totalViews: 12580,
  activeUsers: 1024,
  todayRevenue: 8650.50,
  conversionRate: 3.2
})

const recentActivities = ref([
  {
    id: 1,
    title: '新用户注册',
    time: '2分钟前',
    icon: 'i-carbon-user-plus',
    iconBg: 'bg-green-100 text-green-600'
  },
  {
    id: 2,
    title: '订单完成',
    time: '5分钟前',
    icon: 'i-carbon-shopping-cart',
    iconBg: 'bg-blue-100 text-blue-600'
  },
  {
    id: 3,
    title: '系统更新',
    time: '10分钟前',
    icon: 'i-carbon-update-now',
    iconBg: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    title: '数据备份',
    time: '30分钟前',
    icon: 'i-carbon-cloud-backup',
    iconBg: 'bg-orange-100 text-orange-600'
  }
])

const tableColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '注册时间',
    dataIndex: 'registerTime',
    key: 'registerTime'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const tableData = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    status: '活跃',
    registerTime: '2024-01-15'
  },
  {
    id: 2,
    username: 'user001',
    email: 'user001@example.com',
    status: '活跃',
    registerTime: '2024-01-14'
  },
  {
    id: 3,
    username: 'user002',
    email: 'user002@example.com',
    status: '离线',
    registerTime: '2024-01-13'
  },
  {
    id: 4,
    username: 'user003',
    email: 'user003@example.com',
    status: '活跃',
    registerTime: '2024-01-12'
  },
  {
    id: 5,
    username: 'user004',
    email: 'user004@example.com',
    status: '离线',
    registerTime: '2024-01-11'
  }
])

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新数据
    dashboardData.value = {
      totalViews: Math.floor(Math.random() * 20000) + 10000,
      activeUsers: Math.floor(Math.random() * 2000) + 500,
      todayRevenue: Math.floor(Math.random() * 10000) + 5000,
      conversionRate: (Math.random() * 5 + 1).toFixed(1)
    }
    
    message.success('数据刷新成功！')
  } catch (error) {
    message.error('数据刷新失败！')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 页面加载时的初始化逻辑
  console.log('Dashboard 页面已加载')
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-card,
.activity-card,
.table-card {
  border-radius: 8px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>