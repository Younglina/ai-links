const { Sequelize } = require('sequelize');
const config = require('./database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// 创建Sequelize实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging === false ? false : (msg) => logger.debug(msg),
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    return true;
  } catch (error) {
    logger.error('数据库连接失败:', error);
    return false;
  }
};

// 同步数据库模型
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(`数据库同步完成 ${force ? '(强制重建)' : ''}`);
  } catch (error) {
    logger.error('数据库同步失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};