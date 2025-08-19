#!/bin/bash

# Cloudflare Pages 部署脚本
echo "🚀 开始部署到 Cloudflare Pages..."

# 1. 构建项目
echo "📦 构建 Next.js 项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！请检查错误信息。"
    exit 1
fi

# 2. 检查 functions 目录
if [ ! -d "functions" ]; then
    echo "❌ functions 目录不存在！请确保已创建 Cloudflare Pages Functions。"
    exit 1
fi

# 3. 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
npx wrangler pages deploy out --project-name=fl-6rj

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🔗 您的网站应该可以在以下地址访问："
    echo "   - https://fl-6rj.pages.dev/"
    echo "   - API 端点: https://fl-6rj.pages.dev/api/deepseek"
    echo ""
    echo "📝 注意事项："
    echo "   1. 如果这是首次部署，可能需要几分钟才能生效"
    echo "   2. 确保在 Cloudflare Dashboard 中设置了环境变量 DEEPSEEK_API_KEY"
    echo "   3. 如果遇到问题，请检查 Cloudflare Pages 的构建日志"
else
    echo "❌ 部署失败！请检查错误信息。"
    echo "💡 可能的解决方案："
    echo "   1. 确保已安装并登录 wrangler CLI"
    echo "   2. 检查项目名称是否正确"
    echo "   3. 确保有足够的权限部署到该项目"
    exit 1
fi