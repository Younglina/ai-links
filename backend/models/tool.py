from app import db
from datetime import datetime
import uuid

class Tool(db.Model):
    __tablename__ = 'tools'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # 工具分类
    url = db.Column(db.String(255), nullable=True)  # 工具链接
    icon = db.Column(db.String(255), nullable=True)  # 工具图标
    
    # 状态管理
    is_public = db.Column(db.Boolean, default=False)  # 是否公开
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    
    # 关联用户
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('tools', lazy=True))
    
    # 审核信息
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    review_comment = db.Column(db.Text, nullable=True)
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def approve(self, admin_user_id, comment=None):
        """审核通过"""
        self.status = 'approved'
        self.reviewed_by = admin_user_id
        self.reviewed_at = datetime.utcnow()
        self.review_comment = comment
        self.updated_at = datetime.utcnow()
    
    def reject(self, admin_user_id, comment=None):
        """审核拒绝"""
        self.status = 'rejected'
        self.reviewed_by = admin_user_id
        self.reviewed_at = datetime.utcnow()
        self.review_comment = comment
        self.updated_at = datetime.utcnow()
    
    def set_public(self, is_public):
        """设置公开状态"""
        self.is_public = is_public
        if is_public:
            self.status = 'pending'  # 设为公开时需要重新审核
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_review_info=False):
        """转换为字典格式"""
        result = {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'url': self.url,
            'icon': self.icon,
            'is_public': self.is_public,
            'status': self.status,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_review_info:
            result.update({
                'reviewed_by': self.reviewed_by,
                'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
                'review_comment': self.review_comment
            })
        
        return result
    
    def __repr__(self):
        return f'<Tool {self.name}>'