import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_NAME = "milanote.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                x_pos REAL NOT NULL,
                y_pos REAL NOT NULL
            )
        """)

init_db()

@app.route("/items", methods=["GET"])
def get_items():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM items").fetchall()
    items = [
        {
            "id": row["id"],
            "type": "noteCard",
            "position": {"x": row["x_pos"], "y": row["y_pos"]},
            "data": {"text": row["content"]},
        }
        for row in rows
    ]
    return jsonify(items)

@app.route("/items", methods=["POST"])
def create_item():
    data = request.json
    with get_db() as conn:
        conn.execute(
            "INSERT INTO items (id, content, x_pos, y_pos) VALUES (?, ?, ?, ?)",
            (data["id"], data["content"], data["x"], data["y"]),
        )
    return jsonify({"status": "created"}), 201

@app.route("/items/<item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.json
    with get_db() as conn:
        if "x" in data and "y" in data:
            conn.execute(
                "UPDATE items SET x_pos = ?, y_pos = ? WHERE id = ?",
                (data["x"], data["y"], item_id),
            )
        if "content" in data:
            conn.execute(
                "UPDATE items SET content = ? WHERE id = ?",
                (data["content"], item_id),
            )
    return jsonify({"status": "updated"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
