require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// 导入配置和中间件
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database-connection');

// 导入路由
const authRoutes = require('./routes/auth');
const toolsRoutes = require('./routes/tools');
const adminRoutes = require('./routes/admin');

// 创建Express应用
const app = express();

// 信任代理（如果在代理后面运行）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的源
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    // 在开发环境中允许所有源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 检查源是否在允许列表中
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不被CORS策略允许'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 压缩响应
app.use(compression());

// 请求日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 开发环境更宽松
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（如果需要）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Links API 运行正常',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API根路径
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '欢迎使用 AI Links API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tools: '/api/tools',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// 404处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// 启动服务器函数
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('数据库连接失败，服务器启动中止');
      process.exit(1);
    }

    // 同步数据库模型（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      const { syncDatabase } = require('./config/database-connection');
      await syncDatabase(false); // false = 不强制重建表
    }

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    app.listen(PORT, HOST, () => {
      logger.info(`🚀 AI Links API 服务器启动成功`);
      logger.info(`📍 服务器地址: http://${HOST}:${PORT}`);
      logger.info(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 API文档: http://${HOST}:${PORT}/api`);
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在优雅关闭服务器...');
  process.exit(0);
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app;