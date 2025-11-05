@echo off
REM 数据库初始化诊断脚本 (Windows)

echo 🔍 开始诊断数据库状态...
echo.

REM 检查是否提供了 URL 参数
if "%~1"=="" (
    echo ❌ 请提供 Vercel 部署 URL
    echo 用法: diagnose.bat https://your-site.vercel.app
    exit /b 1
)

set SITE_URL=%~1

REM 移除末尾的斜杠
if "%SITE_URL:~-1%"=="/" set SITE_URL=%SITE_URL:~0,-1%

echo 🌐 站点地址: %SITE_URL%
echo.

REM 1. 检查数据库状态
echo 📊 检查数据库状态...
echo GET %SITE_URL%/api/debug/status
echo.
curl -s "%SITE_URL%/api/debug/status"
echo.
echo ---
echo.

REM 2. 检查菜单数据
echo 📋 检查菜单数据...
echo GET %SITE_URL%/api/menus
echo.
curl -s "%SITE_URL%/api/menus" > temp_menu.json
type temp_menu.json
echo.

REM 简单检查菜单是否为空数组
findstr /C:"[]" temp_menu.json >nul
if %errorlevel%==0 (
    echo ⚠️  检测到菜单为空，尝试手动初始化...
    echo POST %SITE_URL%/api/init/database
    echo.
    curl -s -X POST "%SITE_URL%/api/init/database"
    echo.
    echo ---
    echo.
    
    REM 再次检查菜单
    echo 🔄 重新检查菜单数据...
    echo GET %SITE_URL%/api/menus
    echo.
    curl -s "%SITE_URL%/api/menus"
    echo.
)

del temp_menu.json

echo ---
echo.
echo 🔧 如果问题仍然存在，请查看 TROUBLESHOOTING.md 文档
echo.