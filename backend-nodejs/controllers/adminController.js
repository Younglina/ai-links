const { Tool, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// 获取待审核工具列表
const getPendingTools = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const result = await Tool.findAndCountAll({
    where: { status: 'pending' },
    limit: parseInt(limit),
    offset: offset,
    order: [['created_at', 'ASC']],
    include: [{
      model: User,
      as: 'User',
      attributes: ['id', 'name', 'email', 'avatar']
    }]
  });

  res.json({
    success: true,
    tools: result.rows.map(tool => tool.toDict(true)),
    pagination: {
      total: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / parseInt(limit))
    }
  });
});

// 获取所有工具列表（管理员视图）
const getAllTools = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    category, 
    search 
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let whereClause = {};

  // 状态筛选
  if (status) {
    whereClause.status = status;
  }

  // 分类筛选
  if (category) {
    whereClause.category = category;
  }

  // 搜索功能
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  const result = await Tool.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'avatar']
      },
      {
        model: User,
        as: 'ApprovedBy',
        attributes: ['id', 'name', 'email'],
        required: false
      }
    ]
  });

  res.json({
    success: true,
    tools: result.rows.map(tool => tool.toDict(true)),
    pagination: {
      total: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / parseInt(limit))
    }
  });
});

// 审核工具（批准或拒绝）
const reviewTool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: 'approve' 或 'reject'
  const adminId = req.user.id;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: '无效的审核操作'
    });
  }

  const tool = await Tool.findByPk(id, {
    include: [{
      model: User,
      as: 'User',
      attributes: ['id', 'name', 'email']
    }]
  });

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: '工具不存在'
    });
  }

  if (tool.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: '该工具已被审核'
    });
  }

  // 执行审核操作
  if (action === 'approve') {
    tool.approve(adminId);
  } else {
    tool.reject(adminId);
  }

  await tool.save();

  logger.info(`管理员 ${req.user.email} ${action === 'approve' ? '批准' : '拒绝'}了工具: ${tool.name} (用户: ${tool.User.email})`);

  res.json({
    success: true,
    message: `工具${action === 'approve' ? '批准' : '拒绝'}成功`,
    tool: tool.toDict(true)
  });
});

// 批量审核工具
const batchReviewTools = asyncHandler(async (req, res) => {
  const { toolIds, action } = req.body;
  const adminId = req.user.id;

  if (!Array.isArray(toolIds) || toolIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: '请选择要审核的工具'
    });
  }

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: '无效的审核操作'
    });
  }

  const tools = await Tool.findAll({
    where: {
      id: { [Op.in]: toolIds },
      status: 'pending'
    }
  });

  if (tools.length === 0) {
    return res.status(400).json({
      success: false,
      message: '没有找到可审核的工具'
    });
  }

  // 批量更新
  for (const tool of tools) {
    if (action === 'approve') {
      tool.approve(adminId);
    } else {
      tool.reject(adminId);
    }
    await tool.save();
  }

  logger.info(`管理员 ${req.user.email} 批量${action === 'approve' ? '批准' : '拒绝'}了 ${tools.length} 个工具`);

  res.json({
    success: true,
    message: `成功${action === 'approve' ? '批准' : '拒绝'}了 ${tools.length} 个工具`
  });
});

// 获取用户列表
const getUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    role, 
    is_active, 
    search 
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let whereClause = {};

  // 角色筛选
  if (role) {
    whereClause.role = role;
  }

  // 激活状态筛选
  if (is_active !== undefined) {
    whereClause.is_active = is_active === 'true';
  }

  // 搜索功能
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const result = await User.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['password_hash'] }
  });

  res.json({
    success: true,
    users: result.rows.map(user => user.toDict()),
    pagination: {
      total: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / parseInt(limit))
    }
  });
});

// 更新用户状态
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active, role } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 防止管理员禁用自己
  if (req.user.id === user.id && is_active === false) {
    return res.status(400).json({
      success: false,
      message: '不能禁用自己的账户'
    });
  }

  // 更新用户状态
  if (is_active !== undefined) {
    user.is_active = Boolean(is_active);
  }

  if (role !== undefined) {
    user.setRole(role);
  }

  await user.save();

  logger.info(`管理员 ${req.user.email} 更新了用户 ${user.email} 的状态`);

  res.json({
    success: true,
    message: '用户状态更新成功',
    user: user.toDict()
  });
});

// 获取系统统计信息
const getSystemStats = asyncHandler(async (req, res) => {
  // 用户统计
  const userStats = await User.findAll({
    attributes: [
      'role',
      [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']
    ],
    group: ['role'],
    raw: true
  });

  // 工具统计
  const toolStats = await Tool.findAll({
    attributes: [
      'status',
      [Tool.sequelize.fn('COUNT', Tool.sequelize.col('status')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  // 分类统计
  const categoryStats = await Tool.findAll({
    attributes: [
      'category',
      [Tool.sequelize.fn('COUNT', Tool.sequelize.col('category')), 'count']
    ],
    where: {
      is_public: true,
      status: 'approved'
    },
    group: ['category'],
    order: [[Tool.sequelize.fn('COUNT', Tool.sequelize.col('category')), 'DESC']],
    limit: 10,
    raw: true
  });

  // 处理统计数据
  const users = { total: 0, admin: 0, user: 0 };
  userStats.forEach(stat => {
    users[stat.role] = parseInt(stat.count);
    users.total += parseInt(stat.count);
  });

  const tools = { total: 0, pending: 0, approved: 0, rejected: 0 };
  toolStats.forEach(stat => {
    tools[stat.status] = parseInt(stat.count);
    tools.total += parseInt(stat.count);
  });

  const categories = categoryStats.map(stat => ({
    category: stat.category,
    count: parseInt(stat.count)
  }));

  res.json({
    success: true,
    stats: {
      users,
      tools,
      categories
    }
  });
});

module.exports = {
  getPendingTools,
  getAllTools,
  reviewTool,
  batchReviewTools,
  getUsers,
  updateUserStatus,
  getSystemStats
};