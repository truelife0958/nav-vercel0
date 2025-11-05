#!/bin/bash

# 数据库初始化诊断脚本

echo "🔍 开始诊断数据库状态..."
echo ""

# 检查是否提供了 URL 参数
if [ -z "$1" ]; then
    echo "❌ 请提供 Vercel 部署 URL"
    echo "用法: ./diagnose.sh https://your-site.vercel.app"
    exit 1
fi

SITE_URL=$1

# 移除末尾的斜杠
SITE_URL=${SITE_URL%/}

echo "🌐 站点地址: $SITE_URL"
echo ""

# 1. 检查数据库状态
echo "📊 检查数据库状态..."
echo "GET $SITE_URL/api/debug/status"
echo ""
curl -s "$SITE_URL/api/debug/status" | python -m json.tool || echo "❌ 无法获取数据库状态"
echo ""
echo "---"
echo ""

# 2. 检查菜单数据
echo "📋 检查菜单数据..."
echo "GET $SITE_URL/api/menus"
echo ""
MENU_RESPONSE=$(curl -s "$SITE_URL/api/menus")
MENU_COUNT=$(echo $MENU_RESPONSE | python -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "菜单数量: $MENU_COUNT"
echo ""
echo $MENU_RESPONSE | python -m json.tool || echo "❌ 无法解析菜单数据"
echo ""
echo "---"
echo ""

# 3. 判断是否需要初始化
if [ "$MENU_COUNT" = "0" ]; then
    echo "⚠️  检测到菜单为空，尝试手动初始化..."
    echo "POST $SITE_URL/api/init/database"
    echo ""
    curl -s -X POST "$SITE_URL/api/init/database" | python -m json.tool
    echo ""
    echo "---"
    echo ""
    
    # 4. 再次检查菜单
    echo "🔄 重新检查菜单数据..."
    echo "GET $SITE_URL/api/menus"
    echo ""
    MENU_RESPONSE=$(curl -s "$SITE_URL/api/menus")
    MENU_COUNT=$(echo $MENU_RESPONSE | python -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    echo "菜单数量: $MENU_COUNT"
    echo ""
    echo $MENU_RESPONSE | python -m json.tool
    echo ""
fi

# 5. 最终结果
echo "---"
echo ""
if [ "$MENU_COUNT" -ge 6 ]; then
    echo "✅ 数据库初始化成功！发现 $MENU_COUNT 个菜单"
else
    echo "❌ 数据库初始化失败，只有 $MENU_COUNT 个菜单"
    echo ""
    echo "🔧 故障排除步骤:"
    echo "1. 检查 Vercel 日志: https://vercel.com/dashboard"
    echo "2. 确认环境变量 POSTGRES_URL 已设置"
    echo "3. 检查数据库连接是否正常"
    echo "4. 查看详细文档: TROUBLESHOOTING.md"
fi

echo ""