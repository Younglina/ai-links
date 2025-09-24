'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 重命名 reviewed_by 字段为 approved_by
    await queryInterface.renameColumn('tools', 'reviewed_by', 'approved_by');
    
    // 重命名 reviewed_at 字段为 approved_at
    await queryInterface.renameColumn('tools', 'reviewed_at', 'approved_at');
    
    // 重命名 review_comment 字段为 approval_comment（如果需要的话）
    // await queryInterface.renameColumn('tools', 'review_comment', 'approval_comment');
  },

  async down (queryInterface, Sequelize) {
    // 回滚操作：将字段名改回原来的名称
    await queryInterface.renameColumn('tools', 'approved_by', 'reviewed_by');
    await queryInterface.renameColumn('tools', 'approved_at', 'reviewed_at');
    
    // 如果重命名了 review_comment，这里也要回滚
    // await queryInterface.renameColumn('tools', 'approval_comment', 'review_comment');
  }
};
