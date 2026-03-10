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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // Custom Toast State

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
      
      showToast(isEditing ? 'Đã cập nhật hồ sơ!' : 'Đã khởi tạo thực thể mới!');
      fetchData();
      setView('list');
      setIsEditing(false);
      setFormData({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
    showToast(`Đã xóa thực thể ${id}`, 'error');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative">
      
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all z-50 animate-bounce ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200' : 'bg-red-900/80 border-red-500 text-red-200'}`}>
          <span className="font-bold mr-2">{toast.type === 'success' ? '✅' : '⚠️'}</span> {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800/60">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-lg">Nexus Dashboard</h1>
            <p className="text-slate-400 mt-2 text-sm tracking-wider uppercase">Pro Edition System</p>
          </div>
          <div className="space-x-4">
            <a href={`${API_URL}/export`} className="inline-block bg-slate-800 border border-slate-700 hover:border-fuchsia-500 hover:text-fuchsia-400 px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-fuchsia-500/20">
              ⬇ Export CSV
            </a>
            <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 px-6 py-2.5 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg shadow-cyan-500/30 text-white">
              {view === 'list' ? '✦ Thêm Mới' : '← Quay Lại'}
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div className="animate-fade-in">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl border-l-4 border-l-cyan-500">
                <h3 className="text-slate-400 text-sm uppercase mb-2">Tổng Thực Thể</h3>
                <p className="text-4xl font-black text-cyan-400">{stats.total_students}</p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl border-l-4 border-l-fuchsia-500">
                <h3 className="text-slate-400 text-sm uppercase mb-2">GPA Trung Bình</h3>
                <p className="text-4xl font-black text-fuchsia-400">{stats.average_gpa}</p>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl border-l-4 border-l-blue-500 h-32 overflow-y-auto">
                <h3 className="text-slate-400 text-sm uppercase mb-2">Ngành Học</h3>
                <ul className="text-sm space-y-1 text-slate-300">
                  {Object.entries(stats.by_major).map(([m, c]) => (<li key={m} className="flex justify-between border-b border-slate-800/50 pb-1"><span>{m}</span> <span className="text-blue-400 font-bold">{c}</span></li>))}
                </ul>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); fetchData(searchQuery); }} className="mb-6 flex gap-3">
              <input type="text" placeholder="Truy vấn dữ liệu theo tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-lg bg-slate-900 border border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" />
              <button type="submit" className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-700">🔍 Tìm</button>
              <button type="button" onClick={() => {setSearchQuery(''); fetchData('');}} className="bg-slate-900 text-slate-400 hover:text-red-400 px-6 py-3 rounded-xl border border-slate-800">Xóa</button>
            </form>

            {/* Table */}
            <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider">
                  <tr><th className="p-4 border-b border-slate-800">ID</th><th className="p-4 border-b border-slate-800">Tên</th><th className="p-4 border-b border-slate-800">Lớp</th><th className="p-4 border-b border-slate-800">Ngành</th><th className="p-4 border-b border-slate-800">GPA</th><th className="p-4 border-b border-slate-800 text-center">Hành Động</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-300">{s.student_id}</td>
                      <td className="p-4 font-medium text-slate-100">{s.name}</td>
                      <td className="p-4 text-cyan-400 font-semibold">{s.class_id}</td>
                      <td className="p-4 text-slate-300">{s.major}</td>
                      <td className="p-4 text-fuchsia-400 font-mono">{s.gpa}</td>
                      <td className="p-4 text-center space-x-3">
                        <button onClick={() => { setFormData(s); setIsEditing(true); setView('form'); }} className="text-yellow-500 hover:text-yellow-400 font-medium">Sửa</button>
                        <button onClick={() => handleDelete(s.student_id)} className="text-red-500 hover:text-red-400 font-medium">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form */}
        {view === 'form' && (
          <div className="max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400 border-b border-slate-800 pb-4">{isEditing ? 'Cập Nhật Dữ Liệu' : 'Khởi Tạo Thực Thể'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div><label className="block text-slate-400 text-sm mb-2">Mã SV</label><input required disabled={isEditing} value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none disabled:opacity-50" /></div>
              <div><label className="block text-slate-400 text-sm mb-2">Họ & Tên</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div><label className="block text-slate-400 text-sm mb-2">Năm Sinh</label><input type="number" required value={formData.birth_year} onChange={e => setFormData({...formData, birth_year: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div><label className="block text-slate-400 text-sm mb-2">Ngành Học</label><input required value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div><label className="block text-slate-400 text-sm mb-2">GPA</label><input type="number" step="0.1" max="4.0" min="0" required value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div>
                <label className="block text-cyan-400 font-bold text-sm mb-2">Chọn Lớp</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="" disabled>-- Chọn --</option>
                  {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex justify-end pt-4 border-t border-slate-800">
                <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform text-white shadow-lg shadow-emerald-500/20">{isEditing ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;