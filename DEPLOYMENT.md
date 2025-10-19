# 部署到 Vercel 指南

## 方法一：通过 Vercel 网站部署

1. **准备代码**
   - 将代码推送到 GitHub 仓库
   - 确保所有文件都已提交

2. **在 Vercel 中部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 选择 "Import" 导入项目

3. **配置设置**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install`

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成
   - 获得你的网站链接

## 方法二：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /path/to/bambooClock
   vercel
   ```

4. **跟随提示**
   - 选择项目设置
   - 确认部署配置
   - 等待部署完成

## 环境变量（如果需要）

目前项目不需要任何环境变量，所有功能都基于客户端实现。

## 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. 等待 SSL 证书自动配置

## 注意事项

- 项目使用静态导出，适合 Vercel 的静态托管
- 所有数据保存在浏览器本地存储中
- 无需服务器端配置
- 支持全球 CDN 加速
