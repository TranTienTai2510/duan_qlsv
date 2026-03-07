from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import List

app = FastAPI()

# Cho phép React gọi API [cite: 37]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo Database [cite: 42]
def init_db():
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            birth_year INTEGER,
            major TEXT,
            gpa REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Schema dữ liệu [cite: 16]
class Student(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float

@app.get("/students", response_model=List[Student])
def get_students():
    conn = sqlite3.connect("students.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/students")
def add_student(s: Student):
    try:
        conn = sqlite3.connect("students.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO students VALUES (?, ?, ?, ?, ?)", 
                       (s.student_id, s.name, s.birth_year, s.major, s.gpa))
        conn.commit()
        conn.close()
        return {"message": "Student added successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Student ID already exists")

@app.put("/students/{student_id}")
def update_student(student_id: str, s: Student):
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE students SET name=?, birth_year=?, major=?, gpa=? WHERE student_id=?",
                   (s.name, s.birth_year, s.major, s.gpa, student_id))
    conn.commit()
    conn.close()
    return {"message": "Updated"}

@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    conn = sqlite3.connect("students.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE student_id=?", (student_id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}