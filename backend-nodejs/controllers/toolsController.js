const { Tool, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// 获取工具列表（支持公开工具和用户工具）
const getPublicTools = asyncHandler(async (req, res) => {
  const { 
    category, 
    page = 1, 
    limit = 20, 
    search,
    my_tools,
    is_public
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let whereClause = {};

  // 如果是查询用户自己的工具
  if (my_tools === 'true') {
    // 需要用户认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要登录才能查看个人工具'
      });
    }
    whereClause.user_id = req.user.id;
    
    // 如果指定了公开状态
    if (is_public !== undefined && is_public !== '') {
      whereClause.is_public = is_public === 'true';
    }
  } else {
    // 查询公开工具（默认行为）
    whereClause.is_public = true;
    whereClause.status = 'approved';
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

// 获取单个工具详情
const getToolById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tool = await Tool.findOne({
    where: { 
      id,
      is_public: true,
      status: 'approved'
    },
    include: [{
      model: User,
      as: 'User',
      attributes: ['id', 'name', 'email', 'avatar']
    }]
  });

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: '工具不存在或未公开'
    });
  }

  res.json({
    success: true,
    tool: tool.toDict(true)
  });
});

// 创建新工具
const createTool = asyncHandler(async (req, res) => {
  const { name, description, category, url, icon } = req.body;
  const userId = req.user.id;

  // 验证必填字段
  if (!name || !category || !url) {
    return res.status(400).json({
      success: false,
      message: '工具名称、分类和URL都是必填项'
    });
  }

  // 创建工具
  const tool = await Tool.create({
    name,
    description,
    category,
    url,
    icon,
    user_id: userId,
    status: 'pending',
    is_public: false
  });

  logger.info(`用户 ${req.user.email} 创建了新工具: ${name}`);

  res.status(201).json({
    success: true,
    message: '工具创建成功，等待审核',
    tool: tool.toDict()
  });
});

// 获取用户的工具列表
const getUserTools = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const result = await Tool.findAndCountAll({
    where: { user_id: userId },
    limit: parseInt(limit),
    offset: offset,
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'ApprovedBy',
      attributes: ['id', 'name', 'email'],
      required: false
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

// 更新工具信息
const updateTool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category, url, icon } = req.body;
  const userId = req.user.id;

  const tool = await Tool.findOne({
    where: { 
      id,
      user_id: userId
    }
  });

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: '工具不存在或无权限修改'
    });
  }

  // 如果工具已被审核通过，修改后需要重新审核
  const needReview = tool.status === 'approved' && (
    (name && name !== tool.name) ||
    (description && description !== tool.description) ||
    (category && category !== tool.category) ||
    (url && url !== tool.url) ||
    (icon && icon !== tool.icon)
  );

  // 更新工具信息
  if (name !== undefined) tool.name = name;
  if (description !== undefined) tool.description = description;
  if (category !== undefined) tool.category = category;
  if (url !== undefined) tool.url = url;
  if (icon !== undefined) tool.icon = icon;

  if (needReview) {
    tool.status = 'pending';
    tool.approved_by = null;
    tool.approved_at = null;
    tool.is_public = false;
  }

  await tool.save();

  logger.info(`用户 ${req.user.email} 更新了工具: ${tool.name}${needReview ? ' (需要重新审核)' : ''}`);

  res.json({
    success: true,
    message: needReview ? '工具更新成功，需要重新审核' : '工具更新成功',
    tool: tool.toDict()
  });
});

// 删除工具
const deleteTool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const tool = await Tool.findOne({
    where: { 
      id,
      user_id: userId
    }
  });

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: '工具不存在或无权限删除'
    });
  }

  await tool.destroy();

  logger.info(`用户 ${req.user.email} 删除了工具: ${tool.name}`);

  res.json({
    success: true,
    message: '工具删除成功'
  });
});

// 获取工具统计信息
const getToolStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await Tool.findAll({
    attributes: [
      'status',
      [Tool.sequelize.fn('COUNT', Tool.sequelize.col('status')), 'count']
    ],
    where: { user_id: userId },
    group: ['status'],
    raw: true
  });

  const result = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    result[stat.status] = parseInt(stat.count);
    result.total += parseInt(stat.count);
  });

  res.json({
    success: true,
    stats: result
  });
});

module.exports = {
  getPublicTools,
  getToolById,
  createTool,
  getUserTools,
  updateTool,
  deleteTool,
  getToolStats
};