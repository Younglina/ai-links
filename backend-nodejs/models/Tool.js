const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database-connection');

const Tool = sequelize.define('Tool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4()
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      isUrl: true,
      notEmpty: true
    }
  },
  icon: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Icon must be a valid URL'
      }
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tools',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (tool) => {
      tool.updated_at = new Date();
    }
  }
});

// 实例方法：批准工具
Tool.prototype.approve = function(approvedBy) {
  this.status = 'approved';
  this.approved_by = approvedBy;
  this.approved_at = new Date();
  this.is_public = true;
};

// 实例方法：拒绝工具
Tool.prototype.reject = function(approvedBy) {
  this.status = 'rejected';
  this.approved_by = approvedBy;
  this.approved_at = new Date();
  this.is_public = false;
};

// 实例方法：设置公开状态
Tool.prototype.setPublic = function(isPublic) {
  this.is_public = Boolean(isPublic);
};

// 实例方法：转换为字典
Tool.prototype.toDict = function(includeUser = false) {
  const toolDict = {
    id: this.id,
    uuid: this.uuid,
    name: this.name,
    description: this.description,
    category: this.category,
    url: this.url,
    icon: this.icon,
    is_public: this.is_public,
    status: this.status,
    user_id: this.user_id,
    approved_by: this.approved_by,
    approved_at: this.approved_at,
    created_at: this.created_at,
    updated_at: this.updated_at
  };

  if (includeUser && this.User) {
    toolDict.user = this.User.toDict();
  }

  if (includeUser && this.ApprovedBy) {
    toolDict.approved_by_user = this.ApprovedBy.toDict();
  }

  return toolDict;
};

// 类方法：获取公开工具
Tool.getPublicTools = async function(options = {}) {
  const { category, limit, offset } = options;
  const whereClause = { 
    is_public: true, 
    status: 'approved' 
  };

  if (category) {
    whereClause.category = category;
  }

  return await this.findAndCountAll({
    where: whereClause,
    limit: limit || 20,
    offset: offset || 0,
    order: [['created_at', 'DESC']],
    include: [{
      model: require('./User'),
      as: 'User',
      attributes: ['id', 'name', 'email', 'avatar']
    }]
  });
};

// 类方法：获取待审核工具
Tool.getPendingTools = async function(options = {}) {
  const { limit, offset } = options;

  return await this.findAndCountAll({
    where: { status: 'pending' },
    limit: limit || 20,
    offset: offset || 0,
    order: [['created_at', 'ASC']],
    include: [{
      model: require('./User'),
      as: 'User',
      attributes: ['id', 'name', 'email', 'avatar']
    }]
  });
};

module.exports = Tool;