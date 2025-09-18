#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask application startup script
"""

from app import app, db

if __name__ == '__main__':
    # 确保数据库表存在
    with app.app_context():
        db.create_all()
    
    # 启动应用
    app.run(debug=True, host='0.0.0.0', port=5000)