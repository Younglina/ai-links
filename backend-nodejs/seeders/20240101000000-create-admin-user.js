'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 检查是否已存在管理员用户
    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
      // 创建管理员用户
      const passwordHash = await bcrypt.hash('admin123456', 12);
      
      await queryInterface.bulkInsert('users', [{
        name: '系统管理员',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      }]);

      console.log('✅ 管理员用户创建成功');
      console.log('📧 邮箱: admin@example.com');
      console.log('🔑 密码: admin123456');
    } else {
      console.log('ℹ️  管理员用户已存在，跳过创建');
    }

    // 检查是否已存在测试用户
    const existingTestUser = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTestUser.length === 0) {
      // 创建测试用户
      const testPasswordHash = await bcrypt.hash('123456', 12);
      
      await queryInterface.bulkInsert('users', [{
        name: '测试用户',
        email: 'test@example.com',
        password_hash: testPasswordHash,
        role: 'user',
        is_active: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      }]);

      console.log('✅ 测试用户创建成功');
      console.log('📧 邮箱: test@example.com');
      console.log('🔑 密码: 123456');
    } else {
      console.log('ℹ️  测试用户已存在，跳过创建');
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除种子数据
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@example.com', 'test@example.com']
      }
    });
  }
};