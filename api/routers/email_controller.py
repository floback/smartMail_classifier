from flask import Blueprint, request, jsonify
from models.email import Email
from config import db

email_bp = Blueprint('email_bp', __name__)

@email_bp.route('/emails', methods=['POST'])
def create_email():
    data = request.get_json()
    email = Email(**data)
    db.session.add(email)
    db.session.commit()
    return jsonify({"message": "Email cadastrado", "id": email.id}), 201

@email_bp.route('/emails', methods=['GET'])
def list_emails():
    emails = Email.query.all()
    return jsonify([{
        "id": e.id,
        "user_id": e.user_id,
        "subject": e.subject,
        "category": e.category,
        "reply": e.reply
    } for e in emails])

@email_bp.route('/emails/<int:id>', methods=['PUT'])
def update_email(id):
    email = Email.query.get_or_404(id)
    data = request.get_json()
    email.subject = data.get('subject', email.subject)
    email.content = data.get('content', email.content)
    email.category = data.get('category', email.category)
    email.reply = data.get('reply', email.reply)
    db.session.commit()
    return jsonify({"message": "Email atualizado"})

@email_bp.route('/emails/<int:id>', methods=['DELETE'])
def delete_email(id):
    email = Email.query.get_or_404(id)
    db.session.delete(email)
    db.session.commit()
    return jsonify({"message": "Email deletado"})
