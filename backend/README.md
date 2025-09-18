# AI Links Backend

基于Flask的后端API服务，提供用户认证和管理功能。

## 技术栈

- Flask 2.3.3
- SQLAlchemy (ORM)
- MySQL 数据库
- JWT 认证
- GitHub OAuth

## 安装和运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置相应的值：

```bash
cp .env.example .env
```

### 3. 配置数据库

确保MySQL服务运行，并创建数据库：

```sql
CREATE DATABASE ai_links CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 初始化数据库

```bash
python init_db.py
```

### 5. 启动服务

```bash
python run.py
```

服务将在 `http://localhost:5000` 启动。

## API 接口

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/github` - GitHub OAuth登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/update` - 更新用户信息

### 健康检查

- `GET /` - 基本信息
- `GET /api/health` - 健康检查

## 测试用户

初始化数据库后会创建一个测试用户：

- 邮箱: `test@example.com`
- 密码: `123456`

## GitHub OAuth 配置

1. 在GitHub创建OAuth应用
2. 设置回调URL为前端地址
3. 在 `.env` 文件中配置 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`