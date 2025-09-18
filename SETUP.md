# AI Links 项目启动指南

## 项目结构

```
ai-links/
├── backend/          # Flask后端
├── frontend/         # Vue.js前端
└── docker-compose.yml
```

## 快速启动

### 1. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息

# 初始化数据库
python init_db.py

# 启动后端服务
python run.py
```

后端将在 `http://localhost:5000` 启动

### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动

## 数据库配置

### MySQL 设置

1. 确保MySQL服务运行
2. 创建数据库：
   ```sql
   CREATE DATABASE ai_links CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 在 `backend/.env` 中配置数据库连接

## 测试账户

初始化数据库后会自动创建测试账户：
- 邮箱: `test@example.com`
- 密码: `123456`

## API 接口

后端提供以下API接口：

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/github` - GitHub OAuth登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/update` - 更新用户信息

## 技术栈

### 后端
- Flask 2.3.3
- SQLAlchemy (ORM)
- MySQL 数据库
- JWT 认证
- Flask-CORS

### 前端
- Vue.js 3
- Pinia (状态管理)
- Axios (HTTP客户端)
- UnoCSS (样式框架)

## 开发说明

1. 前端已配置代理，开发环境下会自动转发API请求到后端
2. 后端支持CORS，允许前端跨域访问
3. JWT token会自动添加到请求头中
4. 用户信息会持久化到localStorage中