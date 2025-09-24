#!/usr/bin/env node

/**
 * AI Links Node.js 后端服务器启动脚本
 */

const app = require('./app');

// 启动服务器
const startServer = async () => {
  try {
    // 导入数据库连接
    const { testConnection, syncDatabase } = require('./config/database-connection');
    const logger = require('./utils/logger');

    // 测试数据库连接
    logger.info('🔍 正在测试数据库连接...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('❌ 数据库连接失败，请检查配置');
      process.exit(1);
    }

    // 同步数据库模型
    logger.info('🔄 正在同步数据库模型...');
    await syncDatabase(false); // false = 不强制重建表

    // 运行种子数据（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      try {
        const { execSync } = require('child_process');
        logger.info('🌱 正在运行数据库种子...');
        execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
      } catch (error) {
        logger.warn('⚠️  种子数据运行失败（可能已存在）:', error.message);
      }
    }

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    app.listen(PORT, HOST, () => {
      logger.info('🚀 AI Links API 服务器启动成功！');
      logger.info(`📍 本地访问: http://localhost:${PORT}`);
      logger.info(`🌐 网络访问: http://${HOST}:${PORT}`);
      logger.info(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📚 API文档: http://localhost:${PORT}/api`);
      logger.info('');
      logger.info('🎯 可用的API端点:');
      logger.info(`   认证: http://localhost:${PORT}/api/auth`);
      logger.info(`   工具: http://localhost:${PORT}/api/tools`);
      logger.info(`   管理: http://localhost:${PORT}/api/admin`);
      logger.info(`   健康检查: http://localhost:${PORT}/api/health`);
      logger.info('');
      logger.info('👤 默认账户:');
      logger.info('   管理员: admin@example.com / admin123456');
      logger.info('   测试用户: test@example.com / 123456');
    });

  } catch (error) {
    const logger = require('./utils/logger');
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();