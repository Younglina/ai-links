const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// 用户注册
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 验证必填字段
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: '姓名、邮箱和密码都是必填项'
    });
  }

  // 检查邮箱是否已存在
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: '该邮箱已被注册'
    });
  }

  // 创建新用户
  const user = await User.createUser({
    name,
    email,
    password
  });

  // 生成JWT token
  const token = generateToken(user);

  logger.info(`新用户注册成功: ${email}`);

  res.status(201).json({
    success: true,
    message: '注册成功',
    token,
    user: user.toDict()
  });
});

// 用户登录
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 验证必填字段
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: '邮箱和密码都是必填项'
    });
  }

  // 查找用户
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '邮箱或密码错误'
    });
  }

  // 检查用户是否激活
  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: '账户已被禁用，请联系管理员'
    });
  }

  // 验证密码
  const isPasswordValid = await user.checkPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: '邮箱或密码错误'
    });
  }

  // 生成JWT token
  const token = generateToken(user);

  logger.info(`用户登录成功: ${email}`);

  res.json({
    success: true,
    message: '登录成功',
    token,
    user: user.toDict()
  });
});

// 获取当前用户信息
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    user: user.toDict()
  });
});

// 更新用户信息
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = req.user;

  // 更新用户信息
  if (name !== undefined) {
    user.name = name;
  }
  
  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await user.save();

  logger.info(`用户更新资料: ${user.email}`);

  res.json({
    success: true,
    message: '资料更新成功',
    user: user.toDict()
  });
});

// 修改密码
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  // 验证必填字段
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '当前密码和新密码都是必填项'
    });
  }

  // 验证当前密码
  const isCurrentPasswordValid = await user.checkPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: '当前密码错误'
    });
  }

  // 设置新密码
  await user.setPassword(newPassword);
  await user.save();

  logger.info(`用户修改密码: ${user.email}`);

  res.json({
    success: true,
    message: '密码修改成功'
  });
});

// 刷新token
const refreshToken = asyncHandler(async (req, res) => {
  const user = req.user;

  // 生成新的JWT token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Token刷新成功',
    token
  });
});

// 用户注销（客户端处理，服务端记录日志）
const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  logger.info(`用户注销: ${user.email}`);

  res.json({
    success: true,
    message: '注销成功'
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};