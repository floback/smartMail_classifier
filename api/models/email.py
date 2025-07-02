from config import db
from datetime import datetime

class Email(db.Model):
    __tablename__ = 'emails'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    subject = db.Column(db.String(255))
    content = db.Column(db.Text)
    category = db.Column(db.Enum('PRODUTIVO', 'IMPRODUTIVO'))
    reply = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
