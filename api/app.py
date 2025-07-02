from flask import Flask
from config import create_app
from routes.user_routes import user_bp
from routes.email_routes import email_bp

app = create_app()

app.register_blueprint(user_bp)
app.register_blueprint(email_bp)

if __name__ == "__main__":
    app.run(debug=True)
