from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from models.user import User
import requests
import os
import re
import logging
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    start_time = datetime.now()
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    
    logging.info(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] POST /auth/login - 开始处理登录请求 - IP: {client_ip}")
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        logging.info(f"[LOGIN] 尝试登录 - 邮箱: {email} - IP: {client_ip}")
        
        if not email or not password:
            logging.warning(f"[LOGIN] 登录失败 - 邮箱或密码为空 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '邮箱和密码不能为空'
            }), 400
        
        if not validate_email(email):
            logging.warning(f"[LOGIN] 登录失败 - 邮箱格式不正确 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '邮箱格式不正确'
            }), 400
        
        # 查找用户
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user or not user.check_password(password):
            logging.warning(f"[LOGIN] 登录失败 - 邮箱或密码错误 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '邮箱或密码错误'
            }), 401
        
        # 创建访问令牌
        access_token = create_access_token(identity=user.id)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.info(f"[LOGIN] 登录成功 - 用户ID: {user.id} - 邮箱: {email} - IP: {client_ip} - 耗时: {duration:.3f}s")
        
        return jsonify({
            'success': True,
            'message': '登录成功',
            'user': user.to_dict(),
            'token': access_token
        })
        
    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.error(f"[LOGIN] 登录异常 - 邮箱: {email if 'email' in locals() else 'unknown'} - IP: {client_ip} - 错误: {str(e)} - 耗时: {duration:.3f}s")
        return jsonify({
            'success': False,
            'message': '服务器错误，请稍后重试'
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    start_time = datetime.now()
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    
    logging.info(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] POST /auth/register - 开始处理注册请求 - IP: {client_ip}")
    
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        logging.info(f"[REGISTER] 尝试注册 - 邮箱: {email} - 姓名: {name} - IP: {client_ip}")
        
        if not email or not password:
            logging.warning(f"[REGISTER] 注册失败 - 邮箱或密码为空 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '邮箱和密码不能为空'
            }), 400
        
        if not validate_email(email):
            logging.warning(f"[REGISTER] 注册失败 - 邮箱格式不正确 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '邮箱格式不正确'
            }), 400
        
        if len(password) < 6:
            logging.warning(f"[REGISTER] 注册失败 - 密码长度不足 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '密码长度至少6位'
            }), 400
        
        # 检查邮箱是否已存在
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            logging.warning(f"[REGISTER] 注册失败 - 邮箱已存在 - 邮箱: {email} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '该邮箱已被注册'
            }), 409
        
        # 创建新用户
        user = User(
            name=name or email.split('@')[0],
            email=email,
            avatar=f'https://api.dicebear.com/7.x/avataaars/svg?seed={email}'
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # 创建访问令牌
        access_token = create_access_token(identity=user.id)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.info(f"[REGISTER] 注册成功 - 用户ID: {user.id} - 邮箱: {email} - 姓名: {user.name} - IP: {client_ip} - 耗时: {duration:.3f}s")
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'user': user.to_dict(),
            'token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.error(f"[REGISTER] 注册异常 - 邮箱: {email if 'email' in locals() else 'unknown'} - IP: {client_ip} - 错误: {str(e)} - 耗时: {duration:.3f}s")
        return jsonify({
            'success': False,
            'message': '服务器错误，请稍后重试'
        }), 500

@auth_bp.route('/github', methods=['POST'])
def github_login():
    """GitHub OAuth登录"""
    start_time = datetime.now()
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    
    logging.info(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] POST /auth/github - 开始处理GitHub登录请求 - IP: {client_ip}")
    
    try:
        data = request.get_json()
        code = data.get('code')
        
        logging.info(f"[GITHUB] 收到GitHub授权码 - Code: {code[:10] if code else 'None'}... - IP: {client_ip}")
        
        if not code:
            logging.warning(f"[GITHUB] GitHub登录失败 - 授权码为空 - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '授权码不能为空'
            }), 400
        
        # 获取GitHub访问令牌
        logging.info(f"[GITHUB] 开始获取GitHub访问令牌 - IP: {client_ip}")
        token_url = 'https://github.com/login/oauth/access_token'
        token_data = {
            'client_id': os.getenv('GITHUB_CLIENT_ID'),
            'client_secret': os.getenv('GITHUB_CLIENT_SECRET'),
            'code': code,
            'redirect_uri': 'http://localhost:5173'
        }
        token_headers = {'Accept': 'application/json'}
        
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_json = token_response.json()
        logging.info(f"[GITHUB] GitHub令牌响应状态: {token_response.status_code} - IP: {client_ip}")
        
        if 'access_token' not in token_json:
            logging.warning(f"[GITHUB] GitHub授权失败 - 无法获取访问令牌 - 响应: {token_json} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': 'GitHub授权失败'
            }), 400
        
        # 获取GitHub用户信息
        logging.info(f"[GITHUB] 开始获取GitHub用户信息 - IP: {client_ip}")
        user_url = 'https://api.github.com/user'
        user_headers = {'Authorization': f'token {token_json["access_token"]}'}
        
        user_response = requests.get(user_url, headers=user_headers)
        github_user = user_response.json()
        
        logging.info(f"[GITHUB] GitHub用户信息响应状态: {user_response.status_code} - IP: {client_ip}")
        
        if 'id' not in github_user:
            logging.warning(f"[GITHUB] 获取GitHub用户信息失败 - 响应: {github_user} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '获取GitHub用户信息失败'
            }), 400
        
        # 查找或创建用户
        github_id = str(github_user['id'])
        github_login = github_user.get('login', 'unknown')
        logging.info(f"[GITHUB] 查找GitHub用户 - GitHub ID: {github_id} - 用户名: {github_login} - IP: {client_ip}")
        
        user = User.query.filter_by(
            provider='github',
            provider_id=github_id
        ).first()
        
        if not user:
            # 检查邮箱是否已存在
            email = github_user.get('email') or f"{github_user['login']}@github.local"
            logging.info(f"[GITHUB] 用户不存在，准备创建新用户 - 邮箱: {email} - IP: {client_ip}")
            
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                logging.warning(f"[GITHUB] GitHub登录失败 - 邮箱已被其他账户使用 - 邮箱: {email} - IP: {client_ip}")
                return jsonify({
                    'success': False,
                    'message': '该邮箱已被其他账户使用'
                }), 409
            
            # 创建新用户
            user = User(
                name=github_user.get('name') or github_user['login'],
                email=email,
                avatar=github_user.get('avatar_url'),
                provider='github',
                provider_id=github_id
            )
            
            db.session.add(user)
            db.session.commit()
            
            logging.info(f"[GITHUB] 新用户创建成功 - 用户ID: {user.id} - 邮箱: {email} - GitHub用户名: {github_login} - IP: {client_ip}")
        else:
            logging.info(f"[GITHUB] 找到已存在用户 - 用户ID: {user.id} - 邮箱: {user.email} - GitHub用户名: {github_login} - IP: {client_ip}")
        
        # 创建访问令牌
        access_token = create_access_token(identity=user.id)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.info(f"[GITHUB] GitHub登录成功 - 用户ID: {user.id} - 邮箱: {user.email} - GitHub用户名: {github_login} - IP: {client_ip} - 耗时: {duration:.3f}s")
        
        return jsonify({
            'success': True,
            'message': 'GitHub登录成功',
            'user': user.to_dict(),
            'token': access_token
        })
        
    except Exception as e:
        db.session.rollback()
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.error(f"[GITHUB] GitHub登录异常 - IP: {client_ip} - 错误: {str(e)} - 耗时: {duration:.3f}s")
        return jsonify({
            'success': False,
            'message': 'GitHub登录失败，请稍后重试'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    start_time = datetime.now()
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    
    try:
        user_id = get_jwt_identity()
        logging.info(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] GET /auth/me - 获取用户信息 - 用户ID: {user_id} - IP: {client_ip}")
        
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            logging.warning(f"[GET_USER] 用户不存在或已被禁用 - 用户ID: {user_id} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '用户不存在或已被禁用'
            }), 404
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.info(f"[GET_USER] 获取用户信息成功 - 用户ID: {user_id} - 邮箱: {user.email} - IP: {client_ip} - 耗时: {duration:.3f}s")
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.error(f"[GET_USER] 获取用户信息异常 - 用户ID: {user_id if 'user_id' in locals() else 'unknown'} - IP: {client_ip} - 错误: {str(e)} - 耗时: {duration:.3f}s")
        return jsonify({
            'success': False,
            'message': '服务器错误，请稍后重试'
        }), 500

@auth_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_user():
    """更新用户信息"""
    start_time = datetime.now()
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    
    try:
        user_id = get_jwt_identity()
        logging.info(f"[{start_time.strftime('%Y-%m-%d %H:%M:%S')}] PUT /auth/update - 更新用户信息 - 用户ID: {user_id} - IP: {client_ip}")
        
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            logging.warning(f"[UPDATE_USER] 用户不存在或已被禁用 - 用户ID: {user_id} - IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': '用户不存在或已被禁用'
            }), 404
        
        data = request.get_json()
        name = data.get('name', '').strip()
        old_name = user.name
        
        logging.info(f"[UPDATE_USER] 更新请求 - 用户ID: {user_id} - 原姓名: {old_name} - 新姓名: {name} - IP: {client_ip}")
        
        if name:
            user.name = name
            db.session.commit()
            logging.info(f"[UPDATE_USER] 姓名更新成功 - 用户ID: {user_id} - 从 '{old_name}' 更新为 '{name}' - IP: {client_ip}")
        else:
            logging.info(f"[UPDATE_USER] 无需更新 - 用户ID: {user_id} - 姓名为空 - IP: {client_ip}")
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.info(f"[UPDATE_USER] 用户信息更新成功 - 用户ID: {user_id} - 邮箱: {user.email} - IP: {client_ip} - 耗时: {duration:.3f}s")
        
        return jsonify({
            'success': True,
            'message': '用户信息更新成功',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logging.error(f"[UPDATE_USER] 更新用户信息异常 - 用户ID: {user_id if 'user_id' in locals() else 'unknown'} - IP: {client_ip} - 错误: {str(e)} - 耗时: {duration:.3f}s")
        return jsonify({
            'success': False,
            'message': '服务器错误，请稍后重试'
        }), 500