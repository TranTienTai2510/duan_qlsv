import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Đảm bảo Backend FastAPI đang chạy tại port 8000 
const API_URL = "http://localhost:8000/students";

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ 
    student_id: '', 
    name: '', 
    birth_year: '', 
    major: '', 
    gpa: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  // Lấy danh sách sinh viên khi load trang [cite: 12]
  useEffect(() => { 
    fetchStudents(); 
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      alert("Không thể kết nối với Backend. Hãy kiểm tra FastAPI!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Nghiệp vụ Sửa thông tin [cite: 13]
        await axios.put(`${API_URL}/${formData.student_id}`, formData);
      } else {
        // Nghiệp vụ Thêm sinh viên [cite: 11]
        await axios.post(API_URL, formData);
      }
      setFormData({ student_id: '', name: '', birth_year: '', major: '', gpa: '' });
      setIsEditing(false);
      fetchStudents();
    } catch (error) {
      alert("Lỗi khi xử lý dữ liệu: " + (error.response?.data?.detail || error.message));
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sinh viên này?")) {
      await axios.delete(`${API_URL}/${id}`); // Nghiệp vụ Xóa [cite: 14]
      fetchStudents();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-800 uppercase tracking-wider">
          Hệ thống Quản lý Sinh viên
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2️⃣ TRANG THÊM SINH VIÊN (Dưới dạng Form bên trái) [cite: 25, 26] */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">
                {isEditing ? "📝 Chỉnh sửa thông tin" : "➕ Thêm sinh viên mới"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Student ID [cite: 27]</label>
                  <input className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} 
                    disabled={isEditing} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name [cite: 28]</label>
                  <input className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Birth Year [cite: 29]</label>
                    <input className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                      type="number" value={formData.birth_year} onChange={e => setFormData({...formData, birth_year: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">GPA [cite: 31]</label>
                    <input className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                      type="number" step="0.1" min="0" max="4" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Major [cite: 30]</label>
                  <input className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} required />
                </div>
                <button className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 shadow-md ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isEditing ? "Cập nhật" : "Add Student"} [cite: 33]
                </button>
                {isEditing && (
                  <button type="button" onClick={() => {setIsEditing(false); setFormData({student_id:'', name:'', birth_year:'', major:'', gpa:''})}} 
                    className="w-full mt-2 text-gray-500 hover:underline">Hủy bỏ</button>
                )}
              </form>
            </div>
          </div>

          {/* 1️⃣ TRANG DANH SÁCH SINH VIÊN (Bên phải) [cite: 19] */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <h2 className="text-2xl font-bold p-6 bg-gray-50 text-gray-700 border-b">
                📋 Danh sách sinh viên [cite: 12]
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900 uppercase text-sm">
                      <th className="p-4 border-b font-bold">ID [cite: 21]</th>
                      <th className="p-4 border-b font-bold">Name [cite: 21]</th>
                      <th className="p-4 border-b font-bold">Major [cite: 21]</th>
                      <th className="p-4 border-b font-bold">GPA [cite: 21]</th>
                      <th className="p-4 border-b font-bold text-center">Action [cite: 21]</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? students.map(s => (
                      <tr key={s.student_id} className="hover:bg-gray-50 transition">
                        <td className="p-4 border-b font-medium">{s.student_id}</td>
                        <td className="p-4 border-b">{s.name}</td>
                        <td className="p-4 border-b">{s.major}</td>
                        <td className="p-4 border-b">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${s.gpa >= 3.2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {s.gpa}
                          </span>
                        </td>
                        <td className="p-4 border-b text-center space-x-2">
                          <button onClick={() => {setFormData(s); setIsEditing(true);}} 
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow-sm text-sm">
                            Edit [cite: 23]
                          </button>
                          <button onClick={() => deleteStudent(s.student_id)} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm">
                            Delete [cite: 24]
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-400 italic">Chưa có dữ liệu sinh viên.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;