# Vercel 部署故障排除指南

## 问题：routes-manifest.json 错误

### 错误信息
```
The file "/vercel/path0/out/routes-manifest.json" couldn't be found. 
This is often caused by a misconfiguration in your project.
```

### 根本原因
这个错误是因为 Vercel 将项目识别为 Next.js 应用，但我们的项目使用了静态导出（`output: 'export'`），导致配置冲突。

### 解决方案

#### 方案 1：重新配置现有项目（推荐）
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目，点击进入
3. 点击 "Settings" 标签
4. 在左侧菜单选择 "General"
5. 滚动到 "Build & Development Settings" 部分
6. 修改以下设置：
   - **Framework Preset**: 选择 "Other"（不要选择 Next.js）
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
   - **Install Command**: `npm install`
7. 点击 "Save" 保存设置
8. 回到 "Deployments" 标签，点击 "Redeploy" 重新部署

#### 方案 2：删除并重新创建项目
1. 在 Vercel Dashboard 中删除当前项目
2. 重新导入 GitHub 仓库
3. 在导入时：
   - **Framework Preset**: 选择 "Other"
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
   - **Install Command**: `npm install`
4. 点击 "Deploy"

#### 方案 3：使用 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录中运行
vercel --prod
```

#### 方案 4：手动上传静态文件
1. 运行 `npm run build` 构建项目
2. 将 `out` 文件夹中的所有文件上传到 Vercel
3. 或者使用 Vercel 的拖拽上传功能

### 验证部署成功
部署成功后，你应该能够：
1. 访问你的网站 URL
2. 看到 Bamboo Clock 应用正常加载
3. 能够添加时钟和生成分享链接

### 如果问题仍然存在
1. 检查 `next.config.js` 文件是否正确配置了 `output: 'export'`
2. 确保 `package.json` 中的构建脚本是 `"build": "next build"`
3. 检查是否有其他 Vercel 配置文件冲突
4. 尝试清除 Vercel 项目的缓存

### 联系支持
如果以上方案都无法解决问题，可以：
1. 查看 Vercel 的构建日志获取详细错误信息
2. 在 Vercel 社区论坛寻求帮助
3. 联系 Vercel 技术支持
