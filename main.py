#!/usr/bin/env python3
"""家族谱系系统主入口（支持 CLI/API/Web 三模式）"""
from app.cli import FamilyTreeCLI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 新增导入
from app.api import api_router
from app.web import create_web_app
from app.models.base import DatabaseManager
from config import Config
import requests
import threading
import time
import psutil

# 初始化 FastAPI 应用
app = FastAPI(
    title="Family Tree API",
    description="家族谱系系统 RESTful API",
    version="1.0.0"
)

# 添加CORS中间件 - 解决跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],  # 允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

app.include_router(api_router)

# 初始化数据库
db_manager = DatabaseManager(Config.SQLALCHEMY_DATABASE_URL)
db_manager.create_tables()


def kill_process_by_port(port):
    """杀死占用指定端口的进程"""
    try:
        for proc in psutil.process_iter(['pid', 'name']):
            try:
                # 修复：使用 net_connections() 替代已弃用的 connections()
                connections = proc.net_connections()  # 修改这一行
                for conn in connections:
                    if hasattr(conn.laddr, 'port') and conn.laddr.port == port:
                        print(f"🔫 杀死占用端口 {port} 的进程: {proc.info['name']} (PID: {proc.info['pid']})")
                        proc.kill()
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return False
    except Exception as e:
        print(f"❌ 清理端口 {port} 时出错: {e}")
        return False


def cleanup_ports():
    """清理可能占用的端口"""
    ports_to_clean = [8000, 5000]  # 需要清理的端口列表

    for port in ports_to_clean:
        if kill_process_by_port(port):
            time.sleep(1)  # 给进程终止一点时间


def check_api_health():
    """检查 API 服务是否可用"""
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        return response.status_code == 200
    except:
        return False


def start_api_server():
    """在后台启动 API 服务器"""

    def run_api():
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()

    # 等待 API 服务启动
    print("⏳ 启动 API 服务中...")
    for i in range(30):  # 最多等待30秒
        if check_api_health():
            print("✅ API 服务启动成功")
            return True
        time.sleep(1)

    print("❌ API 服务启动超时")
    return False


def main():
    """主函数：支持 CLI、API 和 Web 模式切换"""
    print("=" * 50)
    print("🏠 家族谱系管理系统")
    print("=" * 50)

    # 在用户选择模式前先清理端口
    print("🔄 清理可能占用的端口...")
    cleanup_ports()
    time.sleep(2)  # 等待清理完成

    print("请选择运行模式：")
    print("1. cli（命令行模式）")
    print("2. api（接口服务模式）- 仅启动API")
    print("3. web（网页界面模式）- 自动启动API+Web")
    print("=" * 50)

    # 获取用户输入
    while True:
        choice = input("请输入数字（1/2/3，回车默认1）：").strip()
        if not choice:
            mode = "cli"
            break
        if choice in ["1", "2", "3"]:
            mode_map = {"1": "cli", "2": "api", "3": "web"}
            mode = mode_map[choice]
            break
        print("❌ 输入无效，请重新选择（1、2 或 3）")

    host = "0.0.0.0"

    if mode == "cli":
        # 启动 CLI 模式
        try:
            print("🚀 启动命令行模式...")
            cli = FamilyTreeCLI()
            cli.run()
        except KeyboardInterrupt:
            print("\n👋 用户中断，程序退出")
        except Exception as e:
            print(f"\n❌ 程序运行出错: {e}")

    elif mode == "api":
        # 启动 API 模式
        import uvicorn
        print(f"🚀 启动 API 服务：http://{host}:8000")
        print(f"📚 接口文档：http://{host}:8000/docs")
        print("💡 提示：可以同时启动 Web 模式访问界面")
        uvicorn.run("main:app", host=host, port=8000, reload=True)

    elif mode == "web":
        # 启动 Web 模式（自动启动 API）
        print("🌐 启动 Web 模式（自动启动 API 服务）")

        # 先启动 API 服务
        if not start_api_server():
            print("❌ 无法启动 API 服务，Web 模式无法运行")
            return

        # 再启动 Web 服务
        web_app = create_web_app()
        print(f"🌐 启动 Web 服务：http://{host}:5000")
        print("🎯 可用页面：")
        print("   - 首页：http://localhost:5000")
        print("   - 人员管理：http://localhost:5000/persons")  # 修改：members -> persons
        print("   - 家族树：http://localhost:5000/family-tree")
        print("   - API文档：http://localhost:8000/docs")
        print("=" * 50)
        web_app.run(host=host, port=5000, debug=False)  # 关闭 debug 避免冲突


if __name__ == "__main__":
    main()