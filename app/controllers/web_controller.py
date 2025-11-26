"""
网页控制器 - 页面渲染
"""
from flask import Blueprint, render_template

# 创建网页相关的蓝图
web_bp = Blueprint('web', __name__)

@web_bp.route('/')
def index():
    """家族成员管理主页"""
    return render_template('index.html')

@web_bp.route('/members')
def members_page():
    """成员管理页面"""
    return render_template('index.html')

@web_bp.route('/family-tree')
def family_tree_page():
    """家族树页面"""
    return render_template('index.html')