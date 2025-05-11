import os
import json
import uuid
from flask import Blueprint, request, jsonify, abort

list_bp = Blueprint("lists", __name__)

# Read data directory from environment variable, fallback for local dev
LISTS_DIR = os.environ.get("LIST_MANAGER_DATA_DIR", "/home/ubuntu/list_manager_app/data/lists")

# Ensure the lists directory exists
os.makedirs(LISTS_DIR, exist_ok=True)

# --- Helper Functions ---

def get_list_filepath(list_id):
    """Constructs the full path for a list file."""
    # Basic validation to prevent directory traversal
    if not list_id or ".." in list_id or "/" in list_id:
        return None
    return os.path.join(LISTS_DIR, f"{list_id}.json")

def read_list_data(list_id):
    """Reads list data from its JSON file."""
    filepath = get_list_filepath(list_id)
    if not filepath or not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return None # Or raise an internal server error

def write_list_data(list_id, data):
    """Writes list data to its JSON file."""
    filepath = get_list_filepath(list_id)
    if not filepath:
        return False # Invalid ID
    try:
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        return True
    except IOError:
        return False

def delete_list_file(list_id):
    """Deletes a list"s JSON file."""
    filepath = get_list_filepath(list_id)
    if not filepath or not os.path.exists(filepath):
        return False # Not found or invalid ID
    try:
        os.remove(filepath)
        return True
    except OSError:
        return False

# --- API Endpoints ---

# Corrected route: Relative to the /api prefix defined in main.py
@list_bp.route("/lists", methods=["GET"])
def get_all_lists():
    """Lists all available lists (ID and Title)."""
    lists = []
    try:
        for filename in os.listdir(LISTS_DIR):
            if filename.endswith(".json"):
                list_id = filename[:-5] # Remove .json extension
                data = read_list_data(list_id)
                if data and "id" in data and "title" in data:
                    lists.append({"id": data["id"], "title": data["title"]})
                else:
                    # Log potential issue with file format
                    print(f"Warning: Could not read or parse list data for {list_id}")
        return jsonify(lists)
    except OSError as e:
        print(f"Error listing directory {LISTS_DIR}: {e}")
        return jsonify({"error": "Could not retrieve lists"}), 500

# Corrected route: Relative to the /api prefix defined in main.py
@list_bp.route("/lists", methods=["POST"])
def create_list():
    """Creates a new list."""
    if not request.json or "title" not in request.json:
        abort(400, description="Missing 'title' in request body")

    list_title = request.json["title"]
    if not list_title:
        abort(400, description="'title' cannot be empty")

    new_list_id = str(uuid.uuid4())
    new_list_data = {
        "id": new_list_id,
        "title": list_title,
        "items": []
    }

    if write_list_data(new_list_id, new_list_data):
        return jsonify(new_list_data), 201
    else:
        return jsonify({"error": "Could not create list file"}), 500

# Corrected route: Relative to the /api prefix defined in main.py
@list_bp.route("/lists/<list_id>", methods=["GET"])
def get_list(list_id):
    """Gets a specific list by ID."""
    data = read_list_data(list_id)
    if data:
        return jsonify(data)
    else:
        abort(404, description="List not found")

# Corrected route: Relative to the /api prefix defined in main.py
@list_bp.route("/lists/<list_id>", methods=["PUT"])
def update_list(list_id):
    """Updates a specific list (replaces entire list data)."""
    if not request.json:
        abort(400, description="Missing JSON request body")

    # Basic validation of incoming data structure
    updated_data = request.json
    if not isinstance(updated_data, dict) or \
       "id" not in updated_data or \
       "title" not in updated_data or \
       "items" not in updated_data or \
       not isinstance(updated_data.get("items"), list):
        abort(400, description="Invalid list data structure")

    # Ensure the ID in the path matches the ID in the body
    if updated_data.get("id") != list_id:
        abort(400, description="List ID mismatch between URL and body")

    # Check if list exists before attempting to write
    if not get_list_filepath(list_id) or not os.path.exists(get_list_filepath(list_id)):
         abort(404, description="List not found")

    # Validate item structure (optional but recommended)
    for item in updated_data["items"]:
        if not isinstance(item, dict) or \
           "id" not in item or \
           "title" not in item or \
           "details" not in item:
             abort(400, description="Invalid item structure within the list")
        # Ensure item IDs are unique within the list (optional)
        if not isinstance(item.get("id"), str) or not item["id"]:
             abort(400, description="Invalid or missing item ID")

    if write_list_data(list_id, updated_data):
        return jsonify(updated_data)
    else:
        return jsonify({"error": "Could not update list file"}), 500

# Corrected route: Relative to the /api prefix defined in main.py
@list_bp.route("/lists/<list_id>", methods=["DELETE"])
def delete_list(list_id):
    """Deletes a specific list by ID."""
    if delete_list_file(list_id):
        return "", 204 # No Content
    else:
        # Could be not found or delete error
        # Check if it existed first to return 404 vs 500
        if not get_list_filepath(list_id) or not os.path.exists(get_list_filepath(list_id)):
            abort(404, description="List not found")
        else:
            return jsonify({"error": "Could not delete list file"}), 500

