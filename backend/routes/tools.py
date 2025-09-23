from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.tool import Tool
import uuid

tools_bp = Blueprint('tools', __name__)

@tools_bp.route('/tools', methods=['POST'])
@jwt_required()
def create_tool():
    """创建工具集"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = request.get_json()
        
        # 验证必填字段
        if not data.get('name'):
            return jsonify({'error': '工具名称不能为空'}), 400
        
        # 检查是否提供了uuid，如果没有则生成一个
        tool_uuid = data.get('uuid', str(uuid.uuid4()))
        
        # 检查uuid是否已存在
        existing_tool = Tool.query.filter_by(uuid=tool_uuid).first()
        if existing_tool:
            return jsonify({'error': 'UUID已存在'}), 400
        
        # 创建工具
        tool = Tool(
            uuid=tool_uuid,
            name=data['name'],
            description=data.get('description'),
            category=data.get('category'),
            url=data.get('url'),
            icon=data.get('icon'),
            is_public=data.get('is_public', False),
            user_id=current_user_id
        )
        
        db.session.add(tool)
        db.session.commit()
        
        return jsonify({
            'message': '工具创建成功',
            'tool': tool.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建工具失败: {str(e)}'}), 500

@tools_bp.route('/tools', methods=['GET'])
@jwt_required()
def get_tools():
    """获取工具列表"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        is_public = request.args.get('is_public')
        my_tools = request.args.get('my_tools', 'false').lower() == 'true'
        
        # 构建查询
        query = Tool.query
        
        if my_tools:
            # 只显示当前用户的工具
            query = query.filter_by(user_id=current_user_id)
        else:
            # 显示公开的已审核工具和当前用户的工具
            query = query.filter(
                db.or_(
                    db.and_(Tool.is_public == True, Tool.status == 'approved'),
                    Tool.user_id == current_user_id
                )
            )
        
        if category:
            query = query.filter_by(category=category)
        
        if is_public is not None:
            query = query.filter_by(is_public=is_public.lower() == 'true')
        
        # 分页查询
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        tools = [tool.to_dict() for tool in pagination.items]
        
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

@tools_bp.route('/tools/<tool_uuid>', methods=['GET'])
@jwt_required()
def get_tool(tool_uuid):
    """获取单个工具详情"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        # 检查权限：只有工具所有者或公开已审核的工具可以查看
        if tool.user_id != current_user_id and not (tool.is_public and tool.status == 'approved'):
            return jsonify({'error': '无权限查看此工具'}), 403
        
        return jsonify({
            'tool': tool.to_dict(include_review_info=user.is_admin())
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取工具详情失败: {str(e)}'}), 500

@tools_bp.route('/tools/<tool_uuid>', methods=['PUT'])
@jwt_required()
def update_tool(tool_uuid):
    """更新工具"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        # 检查权限：只有工具所有者可以更新
        if tool.user_id != current_user_id:
            return jsonify({'error': '无权限修改此工具'}), 403
        
        data = request.get_json()
        
        # 更新字段
        if 'name' in data:
            tool.name = data['name']
        if 'description' in data:
            tool.description = data['description']
        if 'category' in data:
            tool.category = data['category']
        if 'url' in data:
            tool.url = data['url']
        if 'icon' in data:
            tool.icon = data['icon']
        if 'is_public' in data:
            tool.set_public(data['is_public'])
        
        db.session.commit()
        
        return jsonify({
            'message': '工具更新成功',
            'tool': tool.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新工具失败: {str(e)}'}), 500

@tools_bp.route('/tools/<tool_uuid>', methods=['DELETE'])
@jwt_required()
def delete_tool(tool_uuid):
    """删除工具"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        tool = Tool.query.filter_by(uuid=tool_uuid).first()
        
        if not tool:
            return jsonify({'error': '工具不存在'}), 404
        
        # 检查权限：只有工具所有者可以删除
        if tool.user_id != current_user_id:
            return jsonify({'error': '无权限删除此工具'}), 403
        
        db.session.delete(tool)
        db.session.commit()
        
        return jsonify({'message': '工具删除成功'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除工具失败: {str(e)}'}), 500

@tools_bp.route('/tools/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """获取工具分类列表"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取所有不为空的分类
        categories = db.session.query(Tool.category).filter(
            Tool.category.isnot(None),
            Tool.category != ''
        ).distinct().all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({'categories': category_list}), 200
        
    except Exception as e:
        return jsonify({'error': f'获取分类列表失败: {str(e)}'}), 500