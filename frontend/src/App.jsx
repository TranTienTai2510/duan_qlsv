import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000/students";

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ student_id: '', name: '', birth_year: '', major: '', gpa: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const res = await axios.get(API_URL);
    setStudents(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await axios.put(`${API_URL}/${formData.student_id}`, formData);
    } else {
      await axios.post(API_URL, formData);
    }
    setFormData({ student_id: '', name: '', birth_year: '', major: '', gpa: '' });
    setIsEditing(false);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchStudents();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Student Management MVP</h1>
      
      {/* Form Section [cite: 26] */}
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl mb-4">{isEditing ? "Edit Student" : "Add Student"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input className="border p-2" placeholder="Student ID" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} disabled={isEditing} required />
          <input className="border p-2" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input className="border p-2" type="number" placeholder="Birth Year" value={formData.birth_year} onChange={e => setFormData({...formData, birth_year: e.target.value})} required />
          <input className="border p-2" placeholder="Major" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} required />
          <input className="border p-2" type="number" step="0.1" placeholder="GPA" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} required />
          <button className="bg-blue-600 text-white p-2 rounded">{isEditing ? "Update" : "Add Student"}</button>
        </form>
      </div>

      {/* List Section [cite: 20] */}
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Major</th>
            <th className="p-3 text-left">GPA</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.student_id} className="border-b">
              <td className="p-3">{s.student_id}</td>
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.major}</td>
              <td className="p-3">{s.gpa}</td>
              <td className="p-3 text-center">
                <button onClick={() => {setFormData(s); setIsEditing(true);}} className="text-blue-500 mr-4">Edit</button>
                <button onClick={() => deleteStudent(s.student_id)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;