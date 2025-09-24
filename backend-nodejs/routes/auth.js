const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  refreshToken,
  logout
} = require('../controllers/authController');

// 公开路由（不需要认证）
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.use(authenticateToken);

router.get('/me', getCurrentUser);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;