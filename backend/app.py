# -*- coding: utf-8 -*-
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime

# Load environment variables
load_dotenv()

# Create Flask application
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/ai_links')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token managed by frontend

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:5173'])  # Allow frontend cross-origin access

# Configure logging
if not app.debug:
    # Production logging
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/ai_links.log', maxBytes=10240000, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('AI Links Backend startup')
else:
    # Development logging - output to console
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.StreamHandler()
        ]
    )
    logging.info('AI Links Backend startup in debug mode')

# Import models
from models.user import User

# Import routes
from routes.auth import auth_bp
from routes.tools import tools_bp
from routes.admin import admin_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tools_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'AI Links Backend API', 'status': 'running'}

@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'Backend is running'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)