const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  getPublicTools,
  getToolById,
  createTool,
  getUserTools,
  updateTool,
  deleteTool,
  getToolStats
} = require('../controllers/toolsController');

// 公开路由（不需要认证或可选认证）
router.get('/', optionalAuth, getPublicTools);
router.get('/:id', getToolById);

// 需要认证的路由
router.use(authenticateToken);

// 用户工具管理
router.post('/', createTool);
router.get('/user/my-tools', getUserTools);
router.get('/user/stats', getToolStats);
router.put('/:id', updateTool);
router.delete('/:id', deleteTool);

module.exports = router;