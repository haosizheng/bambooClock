#!/bin/bash

# 构建项目
echo "Building project..."
npm run build

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "You can now deploy the 'out' folder to Vercel"
    echo ""
    echo "To deploy:"
    echo "1. Push this code to GitHub"
    echo "2. Import the repository in Vercel"
    echo "3. Set Framework Preset to 'Other'"
    echo "4. Set Build Command to 'npm run build'"
    echo "5. Set Output Directory to 'out'"
else
    echo "Build failed!"
    exit 1
fi
