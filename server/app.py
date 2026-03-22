from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )

@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("q", "").strip()
    if not keyword:
        return jsonify({"results": []})

    query = """
    SELECT
        TRIM(c.subject) AS subject,
        TRIM(c.course_number) AS course_number,
        TRIM(c.title) AS title,
        cs.crn,
        cs.term,
        cs.year,
        TRIM(cs.days) AS days,
        TIME_FORMAT(cs.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(cs.end_time, '%H:%i') AS end_time,
        TRIM(cs.instructor) AS instructor,
        cs.seats_available
    FROM courses c
    JOIN course_sections cs
        ON c.course_id = cs.course_id
    WHERE
        LOWER(TRIM(c.subject)) LIKE LOWER(%s)
        OR LOWER(TRIM(c.course_number)) LIKE LOWER(%s)
        OR LOWER(TRIM(c.title)) LIKE LOWER(%s)
        OR LOWER(TRIM(cs.instructor)) LIKE LOWER(%s)
        OR LOWER(CONCAT(TRIM(c.subject), ' ', TRIM(c.course_number))) LIKE LOWER(%s)
    ORDER BY c.subject, c.course_number, cs.crn;
    """

    like_value = f"%{keyword}%"

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            query,
            (like_value, like_value, like_value, like_value, like_value)
        )
        results = cursor.fetchall()
        return jsonify({"results": results})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "cursor" in locals():
            cursor.close()
        if "connection" in locals() and connection.is_connected():
            connection.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)