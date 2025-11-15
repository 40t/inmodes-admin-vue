# Inmodes 后台管理系统

基于 Vue 3 + TypeScript + Element Plus 的现代化后台管理系统

## ✨ 功能特性

- 🎨 **现代化 UI**：基于 Element Plus 组件库
- 📦 **物料资产管理**：支持音频、视频、图片的上传、编辑、删除
- 🔐 **权限管理**：登录认证、路由守卫
- 📱 **响应式设计**：适配不同屏幕尺寸
- 🚀 **高性能**：Vite 构建，快速热更新

## 🛠️ 技术栈

- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router
- **HTTP 客户端**：Axios

## 📦 项目结构

```
src/
├── api/              # API 接口
│   ├── request.ts    # Axios 配置
│   ├── auth.ts       # 认证接口
│   └── assets.ts     # 物料资产接口
├── stores/           # Pinia 状态管理
│   └── user.ts       # 用户状态
├── router/           # 路由配置
│   └── index.ts
├── views/            # 页面组件
│   ├── login/        # 登录页
│   ├── layout/       # 布局组件
│   └── assets/       # 物料资产管理
├── types/            # TypeScript 类型定义
│   └── index.ts
└── main.ts           # 入口文件
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8881

### 默认后台账号

前后端约定了一个内置管理员账号，便于在未接入真实用户系统时直接登录：

- 账号：`admin`
- 密码：`qweqwe123123`

> ⚠️ 仅用于开发和演示环境，正式上线前请接入真实的用户体系。

### 构建生产版本

```bash
npm run build
```

## 🔧 配置

### 环境变量

`.env.development` 文件：

```env
VITE_API_URL=http://localhost:8882/api/v1
```

### API 代理

在 `vite.config.ts` 中已配置代理到后端 API

## 📝 功能说明

### 物料资产管理

- ✅ 列表展示（支持分页）
- ✅ 搜索过滤（类型、分类、关键词）
- ✅ 上传文件（支持音频、视频、图片）
- ✅ 编辑信息（标题、分类、描述）
- ✅ 删除资产
- ✅ 预览功能

### 用户认证

- ✅ 登录/登出
- ✅ Token 管理
- ✅ 路由守卫

## 🎯 待开发功能

- [ ] 用户管理
- [ ] 角色权限
- [ ] 数据统计
- [ ] 批量操作
- [ ] 文件分类管理

## 📄 License

MIT
