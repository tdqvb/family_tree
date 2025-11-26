# 已有的导入
from .persons import router as persons_router
from .relationships import router as relationships_router
# 新增的导入
from .apiall import router as apiall_router

# 统一导出，方便主应用注册
__all__ = ["persons_router", "relationships_router", "apiall_router"]