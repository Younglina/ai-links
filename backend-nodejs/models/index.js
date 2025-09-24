const { sequelize } = require('../config/database-connection');
const User = require('./User');
const Tool = require('./Tool');

// 定义模型关联
// User 和 Tool 的关联关系
User.hasMany(Tool, {
  foreignKey: 'user_id',
  as: 'tools'
});

Tool.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'User'
});

// Tool 和 User (审核人) 的关联关系
Tool.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'ApprovedBy'
});

User.hasMany(Tool, {
  foreignKey: 'approved_by',
  as: 'approvedTools'
});

// 导出所有模型和sequelize实例
module.exports = {
  sequelize,
  User,
  Tool
};