const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('JWT认证失败 - 缺少token');
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，需要认证token'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      logger.warn(`JWT认证失败 - 用户不存在: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: '无效的认证token'
      });
    }

    if (!user.is_active) {
      logger.warn(`JWT认证失败 - 用户已被禁用: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: '用户账户已被禁用'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn(`JWT认证失败 - 无效token: ${error.message}`);
      return res.status(422).json({
        success: false,
        message: '无效的认证token'
      });
    } else if (error.name === 'TokenExpiredError') {
      logger.warn(`JWT认证失败 - token已过期: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: '认证token已过期'
      });
    } else {
      logger.error(`JWT认证错误: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
};

// 管理员权限中间件
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要先进行身份认证'
      });
    }

    if (!req.user.isAdmin()) {
      logger.warn(`管理员权限检查失败 - 用户: ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    next();
  } catch (error) {
    logger.error(`管理员权限检查错误: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 可选的JWT认证中间件（不强制要求token）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    logger.debug(`可选JWT认证失败: ${error.message}`);
    next();
  }
};

// 生成JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'ai-links'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// 验证token（不通过中间件）
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  generateToken,
  verifyToken
};