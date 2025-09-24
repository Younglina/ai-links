const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database-connection');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'local'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (user) => {
      user.updated_at = new Date();
    }
  }
});

// 实例方法：设置密码
User.prototype.setPassword = async function(password) {
  const saltRounds = 12;
  this.password_hash = await bcrypt.hash(password, saltRounds);
};

// 实例方法：检查密码
User.prototype.checkPassword = async function(password) {
  if (!this.password_hash) {
    return false;
  }
  return await bcrypt.compare(password, this.password_hash);
};

// 实例方法：检查是否为管理员
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// 实例方法：设置角色
User.prototype.setRole = function(role) {
  if (['user', 'admin'].includes(role)) {
    this.role = role;
  }
};

// 实例方法：转换为字典（排除敏感信息）
User.prototype.toDict = function(includeSensitive = false) {
  const userDict = {
    id: this.id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    provider: this.provider,
    role: this.role,
    is_active: this.is_active,
    created_at: this.created_at,
    updated_at: this.updated_at
  };

  if (includeSensitive) {
    userDict.password_hash = this.password_hash;
  }

  return userDict;
};

// 类方法：根据邮箱查找用户
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

// 类方法：创建新用户
User.createUser = async function(userData) {
  const user = this.build(userData);
  if (userData.password) {
    await user.setPassword(userData.password);
  }
  return await user.save();
};

module.exports = User;