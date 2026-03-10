import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ total_students: 0, average_gpa: 0, by_major: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async (query = '') => {
    const [stuRes, clsRes, statRes] = await Promise.all([
      fetch(query ? `${API_URL}/students?name=${query}` : `${API_URL}/students`),
      fetch(`${API_URL}/classes`),
      fetch(`${API_URL}/statistics`)
    ]);
    setStudents(await stuRes.json());
    setClasses(await clsRes.json());
    setStats(await statRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/students/${formData.student_id}` : `${API_URL}/students`;

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, birth_year: parseInt(formData.birth_year), gpa: parseFloat(formData.gpa) })
      });
      if (!res.ok) throw new Error("ID đã tồn tại hoặc lỗi dữ liệu!");
      
      showToast(isEditing ? 'Đã cập nhật hồ sơ!' : 'Đã thêm sinh viên mới!');
      fetchData();
      setView('list');
      setIsEditing(false);
      setFormData({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${id}?`)) {
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        showToast(`Đã xóa sinh viên ${id}`, 'success');
        fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-lg border transition-all z-50 animate-bounce ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span className="font-bold mr-2">{toast.type === 'success' ? '✅' : '⚠️'}</span> {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">Quản Lý Sinh Viên</h1>
            <p className="text-slate-500 mt-2 text-sm tracking-wider uppercase font-medium">Hệ thống dữ liệu trung tâm</p>
          </div>
          <div className="space-x-4">
            <a href={`${API_URL}/export`} className="inline-block bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-600 px-5 py-2.5 rounded-xl transition-all shadow-sm">
              ⬇ Xuất CSV
            </a>
            <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-md shadow-blue-500/30 text-white">
              {view === 'list' ? '+ Thêm Mới' : '← Quay Lại'}
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div className="animate-fade-in">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm uppercase mb-2 font-semibold">Tổng Sinh Viên</h3>
                <p className="text-4xl font-black text-slate-800">{stats.total_students}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm uppercase mb-2 font-semibold">GPA Trung Bình</h3>
                <p className="text-4xl font-black text-slate-800">{stats.average_gpa}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500 h-32 overflow-y-auto">
                <h3 className="text-slate-500 text-sm uppercase mb-2 font-semibold">Theo Ngành Học</h3>
                <ul className="text-sm space-y-2 text-slate-600">
                  {Object.entries(stats.by_major).map(([m, c]) => (<li key={m} className="flex justify-between border-b border-slate-100 pb-1"><span>{m}</span> <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{c}</span></li>))}
                </ul>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="mb-6 flex gap-3">
              <input type="text" placeholder="Tìm kiếm sinh viên theo tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-lg bg-white border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400 shadow-sm" />
              <button type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 shadow-sm">🔍 Tìm</button>
              <button type="button" onClick={() => {setSearchQuery(''); fetchData('');}} className="bg-white text-slate-500 hover:text-red-500 px-6 py-3 rounded-xl border border-slate-300 shadow-sm">Xóa</button>
            </form>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4 border-b border-slate-200">ID</th>
                    <th className="p-4 border-b border-slate-200">Họ & Tên</th>
                    <th className="p-4 border-b border-slate-200">Lớp</th>
                    <th className="p-4 border-b border-slate-200">Ngành</th>
                    <th className="p-4 border-b border-slate-200">GPA</th>
                    <th className="p-4 border-b border-slate-200 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500 text-sm">{s.student_id}</td>
                      <td className="p-4 font-medium text-slate-800">{s.name}</td>
                      <td className="p-4 text-blue-600 font-semibold">{s.class_id}</td>
                      <td className="p-4 text-slate-600">{s.major}</td>
                      <td className="p-4 font-medium text-slate-800">{s.gpa}</td>
                      <td className="p-4 text-center space-x-3 text-sm">
                        <button onClick={() => { setFormData(s); setIsEditing(true); setView('form'); }} className="text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Sửa</button>
                        <button onClick={() => handleDelete(s.student_id)} className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Xóa</button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-500 italic">Không có dữ liệu sinh viên.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Add/Edit */}
        {view === 'form' && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">{isEditing ? 'Cập Nhật Hồ Sơ' : 'Thêm Sinh Viên Mới'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Mã Sinh Viên</label>
                <input required disabled={isEditing} value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 text-slate-800" placeholder="VD: SV001" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Họ & Tên</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Năm Sinh</label>
                <input type="number" required value={formData.birth_year} onChange={e => setFormData({...formData, birth_year: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Ngành Học</label>
                <input required value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" placeholder="VD: Khoa học máy tính" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Điểm Trung Bình (GPA)</label>
                <input type="number" step="0.1" max="4.0" min="0" required value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
              </div>
              <div>
                <label className="block text-blue-600 font-bold text-sm mb-2">Phân Lớp</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800">
                  <option value="" disabled>-- Chọn lớp học --</option>
                  {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} ({c.class_id})</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end pt-6 border-t border-slate-100 mt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform text-white shadow-md shadow-blue-500/20">
                  {isEditing ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;