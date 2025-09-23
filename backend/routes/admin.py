from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.tool import Tool
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin():
            return jsonify({'error': '需要管理员权限'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    """获取用户列表"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        role = request.args.get('role')
        provider = request.args.get('provider')
        search = request.args.get('search')
        
        # 构建查询
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if provider:
            query = query.filter_by(provider=provider)
        
        if search:
            query = query.filter(
                db.or_(
                    User.name.contains(search),
                    User.email.contains(search)
                )
            )
        
        # 按创建时间倒序排列
        query = query.order_by(User.created_at.desc())
        
        # 分页查询
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        users = [user.to_dict() for user in pagination.items]
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户列表失败: {str(e)}'}), 500

@admin_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """获取用户详情"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取用户的工具统计
        tool_stats = {
            'total': Tool.query.filter_by(user_id=user_id).count(),
            'public': Tool.query.filter_by(user_id=user_id, is_public=True).count(),
            'approved': Tool.query.filter_by(user_id=user_id, status='approved').count(),
            'pending': Tool.query.filter_by(user_id=user_id, status='pending').count(),
            'rejected': Tool.query.filter_by(user_id=user_id, status='rejected').count()
        }
        
        user_data = user.to_dict()
        user_data['tool_stats'] = tool_stats
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户详情失败: {str(e)}'}), 500

@admin_bp.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    """修改用户角色"""
    try:
        current_user_id = get_jwt_identity()
        
        # 不能修改自己的角色
        if current_user_id == user_id:
            return jsonify({'error': '不能修改自己的角色'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role or new_role not in ['user', 'admin']:
            return jsonify({'error': '无效的角色类型'}), 400
        
        old_role = user.role
        user.set_role(new_role)
        
        db.session.commit()
        
        return jsonify({
            'message': f'用户角色已从 {old_role} 修改为 {new_role}',
            'user': user.to_dict()
        }), 200
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'修改用户角色失败: {str(e)}'}), 500

@admin_bp.route('/admin/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    """修改用户状态（激活/禁用）"""
    try:
        current_user_id = get_jwt_identity()
        
        # 不能修改自己的状态
        if current_user_id == user_id:
            return jsonify({'error': '不能修改自己的状态'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        is_active = data.get('is_active')
        
        if is_active is None:
            return jsonify({'error': '缺少is_active参数'}), 400
        
        user.is_active = bool(is_active)
        user.updated_at = db.func.now()
        
        db.session.commit()
        
        status_text = '激活' if is_active else '禁用'
        
        return jsonify({
            'message': f'用户已{status_text}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'修改用户状态失败: {str(e)}'}), 500

@admin_bp.route('/admin/users/<int:user_id>/tools', methods=['GET'])
@admin_required
def get_user_tools(user_id):
    """获取用户的工具列表"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        is_public = request.args.get('is_public')
        
        # 构建查询
        query = Tool.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if is_public is not None:
            query = query.filter_by(is_public=is_public.lower() == 'true')
        
        # 按创建时间倒序排列
        query = query.order_by(Tool.created_at.desc())
        
        # 分页查询
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        tools = [tool.to_dict(include_review_info=True) for tool in pagination.items]
        
        return jsonify({
            'tools': tools,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户工具列表失败: {str(e)}'}), 500

@admin_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """获取管理员统计信息"""
    try:
        # 用户统计
        user_stats = {
            'total': User.query.count(),
            'active': User.query.filter_by(is_active=True).count(),
            'inactive': User.query.filter_by(is_active=False).count(),
            'admin': User.query.filter_by(role='admin').count(),
            'user': User.query.filter_by(role='user').count(),
            'github': User.query.filter_by(provider='github').count(),
            'local': User.query.filter_by(provider='local').count()
        }
        
        # 工具统计
        tool_stats = {
            'total': Tool.query.count(),
            'public': Tool.query.filter_by(is_public=True).count(),
            'private': Tool.query.filter_by(is_public=False).count(),
            'approved': Tool.query.filter_by(status='approved').count(),
            'pending': Tool.query.filter_by(status='pending').count(),
            'rejected': Tool.query.filter_by(status='rejected').count()
        }
        
        return jsonify({
            'user_stats': user_stats,
            'tool_stats': tool_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计信息失败: {str(e)}'}), 500

@admin_bp.route('/admin/tools/pending', methods=['GET'])
@admin_required
def get_pending_tools():
    """获取待审核的工具列表"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        
        # 构建查询 - 只显示公开且待审核的工具
        query = Tool.query.filter_by(is_public=True, status='pending')
        
        if category:
            query = query.filter_by(category=category)
        
        # 按创建时间倒序排列
        query = query.order_by(Tool.created_at.desc())
        
        # 分页查询
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        tools = [tool.to_dict(include_review_info=True) for tool in pagination.items]
        
        return jsonify({
            'tools': tools,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取待审核工具列表失败: {str(e)}'}), 500

@admin_bp.route('/admin/tools/<tool_uuid>/approve', methods=['POST'])
@admin_required
def approve_tool(tool_uuid):
    """审核通过工具"""
    try:
        current_user_id = get_jwt_identity()
        
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        if tool.status != 'pending':
            return jsonify({'error': '只能审核待审核状态的工具'}), 400
        
        data = request.get_json()
        comment = data.get('comment', '')
        
        tool.approve(current_user_id, comment)
        
        db.session.commit()
        
        return jsonify({
            'message': '工具审核通过',
            'tool': tool.to_dict(include_review_info=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'审核工具失败: {str(e)}'}), 500

@admin_bp.route('/admin/tools/<tool_uuid>/reject', methods=['POST'])
@admin_required
def reject_tool(tool_uuid):
    """审核拒绝工具"""
    try:
        current_user_id = get_jwt_identity()
        
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        if tool.status != 'pending':
            return jsonify({'error': '只能审核待审核状态的工具'}), 400
        
        data = request.get_json()
        comment = data.get('comment', '')
        
        if not comment:
            return jsonify({'error': '拒绝审核时必须提供原因'}), 400
        
        tool.reject(current_user_id, comment)
        
        db.session.commit()
        
        return jsonify({
            'message': '工具审核拒绝',
            'tool': tool.to_dict(include_review_info=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'审核工具失败: {str(e)}'}), 500

@admin_bp.route('/admin/tools', methods=['GET'])
@admin_required
def get_all_tools():
    """获取所有工具列表（管理员视图）"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        is_public = request.args.get('is_public')
        category = request.args.get('category')
        user_id = request.args.get('user_id', type=int)
        search = request.args.get('search')
        
        # 构建查询
        query = Tool.query
        
        if status:
            query = query.filter_by(status=status)
        
        if is_public is not None:
            query = query.filter_by(is_public=is_public.lower() == 'true')
        
        if category:
            query = query.filter_by(category=category)
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        if search:
            query = query.filter(
                db.or_(
                    Tool.name.contains(search),
                    Tool.description.contains(search)
                )
            )
        
        # 按创建时间倒序排列
        query = query.order_by(Tool.created_at.desc())
        
        # 分页查询
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        tools = [tool.to_dict(include_review_info=True) for tool in pagination.items]
        
        return jsonify({
            'tools': tools,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取工具列表失败: {str(e)}'}), 500

@admin_bp.route('/admin/tools/<tool_uuid>', methods=['DELETE'])
@admin_required
def admin_delete_tool(tool_uuid):
    """管理员删除工具"""
    try:
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        db.session.delete(tool)
        db.session.commit()
        
        return jsonify({'message': '工具删除成功'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除工具失败: {str(e)}'}), 500