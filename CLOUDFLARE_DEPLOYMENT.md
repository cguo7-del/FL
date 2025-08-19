# Cloudflare Pages 部署指南

## 问题分析

您遇到的问题是因为 Cloudflare Pages 默认只支持静态文件托管，而您的 Next.js 应用包含服务端 API 路由（`/api/deepseek`）。解决方案是使用 **Cloudflare Pages Functions** 来处理 API 请求。

## 已完成的配置

### 1. 更新了 `wrangler.toml` 配置
- 添加了 Pages 配置
- 设置了构建输出目录为 `out`
- 配置了环境变量 `DEEPSEEK_API_KEY`

### 2. 创建了 `functions/` 目录
- `functions/api/deepseek.js` - 迁移了原有的 API 逻辑到 Cloudflare Workers 格式
- `functions/_headers` - 配置了 CORS 头部

### 3. 创建了部署脚本
- `deploy-cloudflare.sh` - 自动化部署脚本

## 部署步骤

### 方法一：使用部署脚本（推荐）

```bash
# 运行部署脚本
./deploy-cloudflare.sh
```

### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到 Cloudflare Pages**
   ```bash
   npx wrangler pages deploy out --project-name=fl-6rj
   ```

## 环境变量配置

在 Cloudflare Dashboard 中设置以下环境变量：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 项目 `fl-6rj`
3. 转到 Settings → Environment variables
4. 添加变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-3dd5328db9d44d9cb4e6e7df02ee4b2d`
   - **Environment**: Production

## 验证部署

部署成功后，您的网站应该可以在以下地址访问：

- **主页**: https://fl-6rj.pages.dev/
- **提问页面**: https://fl-6rj.pages.dev/ask
- **API 端点**: https://fl-6rj.pages.dev/api/deepseek

## 故障排除

### 如果页面显示 "Not Found"
1. 确保构建成功生成了 `out/` 目录
2. 检查 `out/` 目录中是否包含 `index.html`
3. 确认部署时使用了正确的输出目录

### 如果 API 不工作
1. 检查 Cloudflare Pages 的 Functions 日志
2. 确认环境变量 `DEEPSEEK_API_KEY` 已正确设置
3. 验证 `functions/api/deepseek.js` 文件存在

### 如果遇到 CORS 错误
1. 确认 `functions/_headers` 文件存在
2. 检查 CORS 配置是否正确

## 技术说明

- **Cloudflare Pages Functions** 基于 Cloudflare Workers 运行时
- API 路由会自动映射到 `functions/` 目录结构
- 静态文件从 `out/` 目录提供服务
- 支持环境变量和边缘计算

## 下一步

1. 运行部署脚本
2. 在 Cloudflare Dashboard 中配置环境变量
3. 测试网站和 API 功能
4. 如有问题，查看 Cloudflare Pages 的构建和函数日志