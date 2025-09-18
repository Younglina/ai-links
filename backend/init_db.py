#!/usr/bin/env python3
"""
数据库初始化脚本
运行此脚本来创建数据库表
"""

from app import app, db
from models.user import User

def init_database():
    """初始化数据库"""
    with app.app_context():
        # 创建所有表
        db.create_all()
        print("数据库表创建成功！")
        
        # 创建测试用户（可选）
        test_user = User.query.filter_by(email='test@example.com').first()
        if not test_user:
            test_user = User(
                name='测试用户',
                email='test@example.com',
                avatar='https://api.dicebear.com/7.x/avataaars/svg?seed=test'
            )
            test_user.set_password('123456')
            db.session.add(test_user)
            db.session.commit()
            print("测试用户创建成功！")
            print("邮箱: test@example.com")
            print("密码: 123456")
        else:
            print("测试用户已存在")

if __name__ == '__main__':
    init_database()