import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
# Remove or comment out unused imports if needed
# from src.models.user import db 
# from src.routes.user import user_bp
from src.routes.lists import list_bp # Import the new list blueprint

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT' # Keep or change the secret key as needed

# Register the list blueprint
app.register_blueprint(list_bp, url_prefix='/api')

# Database setup is commented out as it's not needed for file-based storage
# app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USERNAME', 'root')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'mydb')}"
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)
# with app.app_context():
#     db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        # Serve specific file if it exists (e.g., styles.css, script.js)
        return send_from_directory(static_folder_path, path)
    else:
        # Serve index.html for the root path or any other path not matching a file
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            # Fallback if index.html doesn't exist
            return "index.html not found", 404


if __name__ == '__main__':
    # Make sure to run on 0.0.0.0 to be accessible within the sandbox/network
    app.run(host='0.0.0.0', port=5000, debug=True) # debug=True is helpful for development

