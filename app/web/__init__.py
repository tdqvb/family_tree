from flask import Flask
from app.controllers.person_controller import person_bp
from app.controllers.relationship_controller import relationship_bp
from app.controllers.web_controller import web_bp
import os

def create_web_app():
    # 获取项目根目录的绝对路径
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    template_path = os.path.join(base_dir, 'templates')
    static_path = os.path.join(base_dir, 'static')  # 静态文件路径

    print(f"📁 模板路径: {template_path}")
    print(f"📁 静态文件路径: {static_path}")  # 调试信息

    # 检查路径是否存在
    if not os.path.exists(template_path):
        print(f"❌ 警告: 模板路径不存在: {template_path}")
    if not os.path.exists(static_path):
        print(f"❌ 警告: 静态文件路径不存在: {static_path}")
    else:
        # 列出静态文件目录内容
        print(f"📂 静态文件目录内容: {os.listdir(static_path)}")
        js_path = os.path.join(static_path, 'js')
        if os.path.exists(js_path):
            print(f"📂 JS文件: {os.listdir(js_path)}")

    app = Flask(__name__,
                template_folder=template_path,
                static_folder=static_path)  # 设置静态文件目录

    # 注册蓝图
    app.register_blueprint(web_bp)
    app.register_blueprint(person_bp)
    app.register_blueprint(relationship_bp)

    return app