# AI Links Node.js 后端

这是 AI Links 项目的 Node.js 后端实现，使用 Express.js + Sequelize + MySQL 技术栈。

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7 或 MariaDB >= 10.3
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库连接和其他设置：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_links
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 数据库设置

1. 创建数据库：
```sql
CREATE DATABASE ai_links CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行数据库迁移和种子数据：
```bash
npm run migrate
npm run seed
```

### 启动服务器

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:5000` 启动。

## 📚 API 文档

### 认证端点 (`/api/auth`)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/change-password` - 修改密码
- `POST /api/auth/refresh` - 刷新token
- `POST /api/auth/logout` - 用户注销

### 工具端点 (`/api/tools`)

- `GET /api/tools` - 获取公开工具列表
- `GET /api/tools/:id` - 获取单个工具详情
- `POST /api/tools` - 创建新工具 (需要认证)
- `GET /api/tools/user/my-tools` - 获取用户的工具列表 (需要认证)
- `GET /api/tools/user/stats` - 获取用户工具统计 (需要认证)
- `PUT /api/tools/:id` - 更新工具信息 (需要认证)
- `DELETE /api/tools/:id` - 删除工具 (需要认证)

### 管理员端点 (`/api/admin`)

- `GET /api/admin/tools/pending` - 获取待审核工具列表
- `GET /api/admin/tools` - 获取所有工具列表
- `PUT /api/admin/tools/:id/review` - 审核工具
- `PUT /api/admin/tools/batch-review` - 批量审核工具
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/status` - 更新用户状态
- `GET /api/admin/stats` - 获取系统统计信息

### 其他端点

- `GET /api/health` - 健康检查
- `GET /api` - API信息

## 🔐 默认账户

系统会自动创建以下默认账户：

- **管理员账户**
  - 邮箱: `admin@example.com`
  - 密码: `admin123456`

- **测试用户**
  - 邮箱: `test@example.com`
  - 密码: `123456`

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 生产模式启动
npm start

# 运行数据库迁移
npm run migrate

# 运行种子数据
npm run seed

# 重置数据库
npm run db:reset

# 运行测试
npm test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 📁 项目结构

```
backend-nodejs/
├── config/                 # 配置文件
│   ├── database.js         # 数据库配置
│   └── database-connection.js # 数据库连接
├── controllers/            # 控制器
│   ├── authController.js   # 认证控制器
│   ├── toolsController.js  # 工具控制器
│   └── adminController.js  # 管理员控制器
├── middleware/             # 中间件
│   ├── auth.js            # JWT认证中间件
│   └── errorHandler.js    # 错误处理中间件
├── models/                # 数据模型
│   ├── User.js           # 用户模型
│   ├── Tool.js           # 工具模型
│   └── index.js          # 模型关联
├── routes/                # 路由
│   ├── auth.js           # 认证路由
│   ├── tools.js          # 工具路由
│   └── admin.js          # 管理员路由
├── utils/                 # 工具函数
│   └── logger.js         # 日志工具
├── migrations/            # 数据库迁移
├── seeders/              # 种子数据
├── logs/                 # 日志文件
├── app.js                # Express应用
├── server.js             # 服务器启动脚本
├── package.json          # 项目配置
└── .env                  # 环境变量
```

## 🔧 技术栈

- **框架**: Express.js
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (jsonwebtoken)
- **安全**: Helmet, CORS, Rate Limiting
- **日志**: Winston
- **开发工具**: Nodemon, ESLint, Prettier

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-links-backend .

# 运行容器
docker run -p 5000:5000 --env-file .env ai-links-backend
```

### PM2 部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "ai-links-backend"

# 查看状态
pm2 status

# 查看日志
pm2 logs ai-links-backend
```

## 📝 注意事项

1. **安全配置**: 生产环境中请务必修改 `JWT_SECRET` 为强密码
2. **数据库权限**: 确保数据库用户有足够的权限创建表和索引
3. **CORS设置**: 根据前端域名配置 CORS 允许的源
4. **日志管理**: 生产环境建议配置日志轮转
5. **性能优化**: 可以配置 Redis 作为缓存和会话存储

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License