import io, csv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

# --- DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./nexus.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBClass(Base):
    __tablename__ = "classes"
    class_id = Column(String, primary_key=True, index=True)
    class_name = Column(String)
    advisor = Column(String)
    students = relationship("DBStudent", back_populates="student_class")

class DBStudent(Base):
    __tablename__ = "students"
    student_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    birth_year = Column(Integer)
    major = Column(String)
    gpa = Column(Float)
    class_id = Column(String, ForeignKey("classes.class_id"))
    student_class = relationship("DBClass", back_populates="students")

Base.metadata.create_all(bind=engine)

# --- APP SETUP ---
app = FastAPI(title="Nexus Student Hub API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC SCHEMAS (Có Validation) ---
class StudentCreate(BaseModel):
    student_id: str
    name: str = Field(..., min_length=2)
    birth_year: int = Field(..., ge=1990, le=2010)
    major: str
    gpa: float = Field(..., ge=0.0, le=4.0) # Ép GPA từ 0-4
    class_id: str

class ClassResponse(BaseModel):
    class_id: str
    class_name: str
    advisor: str

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- API ENDPOINTS ---
@app.get("/classes", response_model=list[ClassResponse])
def get_classes(db: Session = Depends(get_db)):
    return db.query(DBClass).all()

@app.get("/students", response_model=list[StudentCreate])
def get_students(name: str = None, db: Session = Depends(get_db)):
    query = db.query(DBStudent)
    if name: query = query.filter(DBStudent.name.ilike(f"%{name}%"))
    return query.all()

@app.post("/students", response_model=StudentCreate)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    if db.query(DBStudent).filter(DBStudent.student_id == student.student_id).first():
        raise HTTPException(status_code=400, detail="Student ID đã tồn tại!")
    new_student = DBStudent(**student.model_dump())
    db.add(new_student)
    db.commit()
    return new_student

@app.put("/students/{student_id}", response_model=StudentCreate)
def update_student(student_id: str, student: StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(DBStudent).filter(DBStudent.student_id == student_id).first()
    if not db_student: raise HTTPException(status_code=404, detail="Không tìm thấy!")
    for key, value in student.model_dump().items():
        setattr(db_student, key, value)
    db.commit()
    return db_student

@app.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    db_student = db.query(DBStudent).filter(DBStudent.student_id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
    return {"message": "Đã xóa"}

@app.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    total = db.query(DBStudent).count()
    avg_gpa = db.query(func.avg(DBStudent.gpa)).scalar() or 0.0
    majors = db.query(DBStudent.major, func.count(DBStudent.student_id)).group_by(DBStudent.major).all()
    return {"total_students": total, "average_gpa": round(avg_gpa, 2), "by_major": {m: c for m, c in majors}}

@app.get("/export")
def export_csv(db: Session = Depends(get_db)):
    students = db.query(DBStudent).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student ID", "Name", "Birth Year", "Major", "GPA", "Class ID"])
    for s in students: writer.writerow([s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=nexus_students.csv"})