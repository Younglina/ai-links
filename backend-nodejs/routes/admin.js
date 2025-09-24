const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getPendingTools,
  getAllTools,
  reviewTool,
  batchReviewTools,
  getUsers,
  updateUserStatus,
  getSystemStats
} = require('../controllers/adminController');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

// 工具管理
router.get('/tools/pending', getPendingTools);
router.get('/tools', getAllTools);
router.put('/tools/:id/review', reviewTool);
router.put('/tools/batch-review', batchReviewTools);

// 用户管理
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// 系统统计
router.get('/stats', getSystemStats);

module.exports = router;