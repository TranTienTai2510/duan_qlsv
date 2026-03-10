import random
from main import engine, DBClass, DBStudent
from sqlalchemy.orm import Session

CLASSES = [
    {"class_id": "C01", "class_name": "Khoa học Máy tính", "advisor": "Ts. Nguyễn Văn A"},
    {"class_id": "C02", "class_name": "Trí tuệ Nhân tạo", "advisor": "Ts. Trần Thị B"},
    {"class_id": "C03", "class_name": "Kỹ thuật Dữ liệu", "advisor": "Ths. Lê C"}
]

MAJORS = ["CS", "AI", "DS", "SE", "IT"]
HO_LIST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng"]
TEN_LIST = ["Tuyền", "Ngân", "Hải", "Phong", "Linh", "Trang", "Minh", "Đức", "Huy", "Anh"]

def generate_students(num=30):
    students = []
    for i in range(1, num + 1):
        students.append({
            "student_id": f"SV{str(i).zfill(3)}",
            "name": f"{random.choice(HO_LIST)} {random.choice(TEN_LIST)}",
            "birth_year": random.randint(2003, 2006),
            "major": random.choice(MAJORS),
            "gpa": round(random.uniform(2.5, 4.0), 2),
            "class_id": random.choice(CLASSES)["class_id"]
        })
    return students

def seed():
    with Session(engine) as session:
        session.query(DBStudent).delete()
        session.query(DBClass).delete()
        
        for c in CLASSES: session.add(DBClass(**c))
        for s in generate_students(30): session.add(DBStudent(**s))
        
        session.commit()
        print("✅ Đã khởi tạo 3 Lớp học và 30 Sinh viên mẫu thành công!")

if __name__ == "__main__":
    seed()