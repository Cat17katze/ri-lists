# List Manager Web App

This is a simple web application built with Flask that allows users to create, view, edit, and delete lists (like ToDo lists or link lists). Each list is stored as a separate JSON file on the server.

## Features

- Create new lists with a title.
- View a list of all available lists.
- View the items within a specific list.
- Add new items (with title and details) to a list.
- Edit existing items (title and details).
- Delete items from a list.
- Delete entire lists.
- No login required (designed for intranet use).
- Data persistence via JSON files.

## Project Structure

```
list_manager_app/
├── data/
│   └── lists/      # Directory where list JSON files are stored
├── src/
│   ├── models/     # (Not used in this version, from template)
│   ├── routes/
│   │   └── lists.py  # API endpoints for list management
│   ├── static/
│   │   ├── index.html # Main HTML file for the frontend
│   │   └── script.js  # JavaScript logic for the frontend
│   └── main.py     # Main Flask application entry point
├── venv/           # Python virtual environment
└── requirements.txt # Python dependencies
```

## Setup and Running

1.  **Prerequisites**:
    *   Python 3.11 or later
    *   `pip` (Python package installer)

2.  **Clone/Download**: Obtain the project files (e.g., from the provided zip archive).

3.  **Navigate to Project Directory**: Open a terminal or command prompt and change to the `list_manager_app` directory.
    ```bash
    cd path/to/list_manager_app
    ```

4.  **Create/Activate Virtual Environment** (Recommended):
    ```bash
    # If venv directory doesn't exist or you prefer a new one
    python3.11 -m venv venv 
    # Activate the virtual environment
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate    # On Windows
    ```

5.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

6.  **Run the Application**:
    ```bash
    python3.11 src/main.py
    ```
    The application will start, typically listening on `http://0.0.0.0:5000` or `http://127.0.0.1:5000`. The exact URLs will be shown in the terminal output.

7.  **Access the App**: Open a web browser and navigate to the URL provided in the terminal (e.g., `http://localhost:5000`).

## Data Storage

- Lists are stored as individual JSON files in the `list_manager_app/data/lists/` directory.
- The filename corresponds to the list's unique ID.
- **Important**: Ensure the application has write permissions to this directory.

## Deployment (Production)

- The built-in Flask development server (`python src/main.py`) is **not suitable for production**. 
- For production deployment, use a production-ready WSGI server like Gunicorn or uWSGI behind a reverse proxy like Nginx or Apache.

**Example using Gunicorn:**

1.  Install Gunicorn:
    ```bash
    pip install gunicorn
    ```
2.  Run the app with Gunicorn (adjust workers as needed):
    ```bash
    # Make sure you are in the list_manager_app directory and venv is active
    gunicorn --workers 4 --bind 0.0.0.0:5000 "src.main:app"
    ```
    You would typically run this as a service managed by systemd or similar.

Alternatively, you can use the `deploy_apply_deployment` tool if you prefer a managed deployment solution.

