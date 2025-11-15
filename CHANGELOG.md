# 更新日志

## 2024-11-15 - 后端 API 适配和 R2 功能

### 🔄 API 适配

#### 类型定义更新 (`src/types/index.ts`)
- ✅ 更新 `MediaAsset` 接口
  - `url` → `file_path` (匹配后端字段名)
  - `extra_data` → `extra_metadata` (匹配后端字段名)
  - 新增 `is_active` 字段
  - 新增 `sort_order` 字段

- ✅ 新增批量操作类型
  - `BatchUpdateParams` - 批量更新参数
  - `BatchDeleteParams` - 批量删除参数

- ✅ 新增统计类型
  - `MediaStats` - 物料统计信息

- ✅ 新增 R2 相关类型
  - `R2Object` - R2 对象信息
  - `R2ListResponse` - R2 列表响应
  - `R2UploadResponse` - R2 上传响应
  - `R2Stats` - R2 统计信息

#### API 接口更新 (`src/api/assets.ts`)
- ✅ 更新 `getAssets` 支持新参数
  - `is_active` - 筛选激活状态
  - `order_by` - 排序字段
  - `order_dir` - 排序方向

- ✅ 新增批量操作 API
  - `batchUpdateAssets` - 批量更新
  - `batchDeleteAssets` - 批量删除

- ✅ 新增状态管理 API
  - `toggleAssetActive` - 切换激活状态
  - `updateAssetSortOrder` - 更新排序

- ✅ 新增辅助 API
  - `getCategories` - 获取分类列表
  - `getMediaStats` - 获取统计信息

#### 新增 R2 API (`src/api/r2.ts`)
- ✅ `listR2Objects` - 列出 R2 对象
- ✅ `getR2ObjectInfo` - 获取对象信息
- ✅ `uploadToR2` - 上传文件到 R2
- ✅ `deleteR2Object` - 删除对象
- ✅ `batchDeleteR2Objects` - 批量删除
- ✅ `getR2Stats` - 获取统计信息
- ✅ `getR2Categories` - 获取分类列表

### 🎨 视图更新

#### 物料资产页面 (`src/views/assets/index.vue`)
- ✅ 修复字段名适配
  - 使用 `file_path` 替代 `url`
  - 添加 `getFileUrl` 函数处理文件路径

#### R2 存储管理页面 (`src/views/r2/index.vue`) - 新增
- ✅ 统计卡片展示
  - 总对象数
  - 总大小 (GB/MB)
  - 存储桶名称

- ✅ 对象列表管理
  - 前缀筛选
  - 分类筛选
  - 文件预览
  - 复制链接
  - 删除操作

- ✅ 批量操作
  - 多选支持
  - 批量删除

- ✅ 文件上传
  - 拖拽上传
  - 分类管理
  - 进度提示

- ✅ 分页加载
  - 加载更多
  - 游标分页

#### 布局页面 (`src/views/layout/index.vue`)
- ✅ 新增 R2 存储菜单项
- ✅ 导入 CloudUpload 图标

### 🛣️ 路由更新 (`src/router/index.ts`)
- ✅ 新增 `/r2` 路由
  - 路由名称: `R2`
  - 页面标题: `R2 存储管理`

### 📝 配置说明

#### API 基础地址
默认配置: `http://localhost:8882/api/v1`

可通过环境变量 `VITE_API_URL` 自定义

#### 文件访问
- 本地上传文件: `http://localhost:8882/uploads{file_path}`
- R2 文件: 直接使用返回的 `url` 字段

### 🚀 使用指南

#### 启动开发服务器
```bash
npm install
npm run dev
```

#### 构建生产版本
```bash
npm run build
```

#### 访问地址
- 前端: http://localhost:5173
- 后端 API: http://localhost:8882

#### 默认登录凭据
- 邮箱: `admin`
- 密码: `qweqwe123123`

### 📋 功能清单

#### 物料资产管理
- ✅ 列表查看（分页、筛选、排序）
- ✅ 上传物料
- ✅ 编辑物料
- ✅ 删除物料
- ✅ 预览物料
- ✅ 文件大小显示
- ✅ 创建时间显示

#### R2 存储管理
- ✅ 对象列表
- ✅ 统计信息
- ✅ 文件上传
- ✅ 文件删除
- ✅ 批量删除
- ✅ 复制链接
- ✅ 文件预览
- ✅ 分类筛选
- ✅ 前缀搜索

### 🔧 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库
- **Axios** - HTTP 客户端

### 📌 注意事项

1. **TypeScript 类型错误**
   - 路由文件中的 Vue 组件导入可能显示类型错误
   - 这是正常现象，不影响运行
   - 可通过配置 `vite-plugin-vue` 解决

2. **文件路径处理**
   - 后端返回的 `file_path` 是相对路径
   - 前端需要拼接完整 URL
   - R2 文件直接使用返回的完整 URL

3. **R2 配置**
   - 需要在后端配置 R2 凭证
   - 参考后端 `R2_SETUP.md` 文档

### 🐛 已知问题

无

### 📅 下一步计划

- [ ] 添加物料标签功能
- [ ] 优化文件上传进度显示
- [ ] 添加图片裁剪功能
- [ ] 添加视频预览播放器
- [ ] 添加音频播放器
- [ ] 优化移动端适配
- [ ] 添加暗色主题
- [ ] 添加国际化支持
