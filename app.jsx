/*
ERP-based Integrated Student Management - Frontend Mock (Single-file React)

This is a self-contained React component (default export) that demonstrates
an attractive, responsive ERP UI with:
 - Topbar + Sidebar
 - Role-based views (Admin / Staff / Student)
 - Admission form (adds students to central in-memory DB)
 - Fee receipt generator (creates a downloadable receipt preview)
 - Hostel occupancy tracker
 - Simple SVG charts for dashboard metrics
 - Responsive cards and tables

Notes:
 - This uses Tailwind-style utility class names for concise styling. If you
   don't have Tailwind set up, you can either install Tailwind or replace
   classes with your own CSS. Below the component there is a small CSS block
   that mimics key visual styles so the component still looks good without
   Tailwind.
 - Save this file as `ERPApp.jsx` and import into a React app.
*/

import React, { useState, useMemo } from 'react';

// ---------- Helper utilities ----------
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const today = () => new Date().toISOString().slice(0, 10);

// Small SVG mini-chart (sparkline) used in cards
function Sparkbar({ values = [] }) {
  const max = Math.max(...values, 1);
  const width = 100;
  const height = 28;
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => `${i * step},${height - (v / max) * height}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        points={points}
        style={{ opacity: 0.9 }}
      />
    </svg>
  );
}

// ---------- Mock initial data ----------
const initialStudents = [
  { id: uid(), name: 'Aisha Verma', branch: 'Computer Engg', year: 1, hostel: 'A', feesPaid: 15000, admissionDate: '2025-06-15' },
  { id: uid(), name: 'Rohit Sharma', branch: 'Electronics', year: 2, hostel: 'B', feesPaid: 20000, admissionDate: '2024-08-21' },
  { id: uid(), name: 'Maya Nair', branch: 'Mechanical', year: 3, hostel: null, feesPaid: 0, admissionDate: '2023-07-01' },
];

// ---------- Main App component ----------
export default function ERPApp() {
  const [role, setRole] = useState('Admin'); // Admin | Staff | Student
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // admission form state
  const [form, setForm] = useState({ name: '', branch: '', year: 1, hostel: '', feesPaid: 0 });

  // Selection for fee receipt
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);

  // Derived metrics
  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const totalFees = students.reduce((s, x) => s + Number(x.feesPaid || 0), 0);
    const hostelOccupancy = students.filter(s => s.hostel).length;
    const occupancyByHostel = students.reduce((acc, s) => {
      if (s.hostel) acc[s.hostel] = (acc[s.hostel] || 0) + 1;
      return acc;
    }, {});
    return { totalStudents, totalFees, hostelOccupancy, occupancyByHostel };
  }, [students]);

  // Simple add student (Admission flow)
  function handleAdmit(e) {
    e.preventDefault();
    if (!form.name || !form.branch) return alert('Name and branch required');
    const newStudent = { id: uid(), ...form, admissionDate: today() };
    setStudents(prev => [newStudent, ...prev]);
    setForm({ name: '', branch: '', year: 1, hostel: '', feesPaid: 0 });
    setActiveTab('students');
  }

  // Pay fees (updates student's feesPaid)
  function handlePayFees(studentId, amount) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, feesPaid: Number(s.feesPaid || 0) + Number(amount) } : s));
  }

  // Simple hostel allocation toggle
  function toggleHostel(studentId, hostelName = 'A') {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hostel: s.hostel === hostelName ? null : hostelName } : s));
  }

  // Filtered list
  const filtered = students.filter(s => [s.name, s.branch, s.id].join(' ').toLowerCase().includes(query.toLowerCase()));

  // Receipt generation: build a small printable HTML blob
  function generateReceipt(student) {
    return `Receipt\nID: ${student.id}\nName: ${student.name}\nAmount Paid: ₹${student.feesPaid}\nDate: ${today()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 p-6 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white" style={{ minHeight: '100vh' }}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold">CampusERP</h1>
            <p className="text-sm opacity-90">Integrated Student Management</p>
          </div>

          <nav className="space-y-2">
            {['dashboard','students','admissions','hostel','finance'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left py-2 px-3 rounded-md ${activeTab===tab ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-white border-opacity-20">
            <div className="text-xs opacity-90 mb-2">Role</div>
            <div className="space-x-2">
              {['Admin','Staff','Student'].map(r => (
                <button key={r} onClick={() => setRole(r)} className={`py-1 px-3 rounded-full text-sm ${role===r ? 'bg-white text-indigo-700' : 'bg-white bg-opacity-20'}`}>
                  {r}
                </button>
              ))}
            </div>

            <div className="mt-6 text-sm opacity-90">
              <div>Users: <strong>{students.length}</strong></div>
              <div>Hostel: <strong>{metrics.hostelOccupancy}</strong></div>
              <div>Fees Collected: <strong>₹{metrics.totalFees}</strong></div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Topbar */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students, branches, IDs..." className="p-2 rounded-md border border-gray-200 shadow-sm w-80" />
              <div className="text-sm text-gray-500">Welcome back, <strong>{role}</strong></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">Today: {today()}</div>
              <div className="bg-white p-2 rounded-full shadow-md">🟢</div>
            </div>
          </header>

          {/* Main panels */}
          {activeTab === 'dashboard' && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Total Students</div>
                      <div className="text-2xl font-bold">{metrics.totalStudents}</div>
                    </div>
                    <div className="text-indigo-600">
                      <Sparkbar values={[3,5,8,6,9,11]} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Fees Collected</div>
                      <div className="text-2xl font-bold">₹{metrics.totalFees}</div>
                    </div>
                    <div className="text-indigo-600">
                      <Sparkbar values={[1000,2000,1500,4000,3500]} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Hostel Occupancy</div>
                      <div className="text-2xl font-bold">{metrics.hostelOccupancy}</div>
                    </div>
                    <div className="text-indigo-600">
                      <Sparkbar values={[1,2,2,3,2]} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-2">Recent Admissions</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr><th>Name</th><th>Branch</th><th>Year</th><th>Hostel</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {students.slice(0,6).map(s => (
                        <tr key={s.id} className="border-t"><td className="py-2">{s.name}</td><td>{s.branch}</td><td>{s.year}</td><td>{s.hostel || '-'}</td><td>{s.admissionDate}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-2">Hostel Summary</h3>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(metrics.occupancyByHostel).length ? Object.entries(metrics.occupancyByHostel).map(([h,c]) => (
                      <li key={h} className="flex justify-between"><span>Hostel {h}</span><strong>{c}</strong></li>
                    )) : <li className="text-gray-500">No allocations yet</li>}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'students' && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Students</h2>
              <div className="bg-white rounded-xl shadow-sm p-4">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-500"><tr><th>Name</th><th>Branch</th><th>Year</th><th>Hostel</th><th>Fees Paid</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-t">
                        <td className="py-2">{s.name}<div className="text-xs text-gray-400">ID: {s.id}</div></td>
                        <td>{s.branch}</td>
                        <td>{s.year}</td>
                        <td>{s.hostel || '—'}</td>
                        <td>₹{s.feesPaid}</td>
                        <td>
                          <div className="flex gap-2">
                            {role !== 'Student' && <button onClick={() => toggleHostel(s.id, 'A')} className="py-1 px-2 text-xs rounded bg-indigo-600 text-white">Toggle Hostel A</button>}
                            <button onClick={() => { setSelectedStudentId(s.id); setActiveTab('finance'); }} className="py-1 px-2 text-xs rounded bg-white border">Receipt</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'admissions' && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Admissions</h2>
              <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl">
                <form onSubmit={handleAdmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600">Full name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full p-2 border rounded-md" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600">Branch</label>
                      <input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Year</label>
                      <input type="number" value={form.year} min={1} max={5} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Hostel (optional)</label>
                      <input value={form.hostel} onChange={e => setForm(f => ({ ...f, hostel: e.target.value }))} className="w-full p-2 border rounded-md" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Admit</button>
                    <button type="button" onClick={() => setForm({ name: '', branch: '', year: 1, hostel: '', feesPaid: 0 })} className="px-4 py-2 border rounded-md">Reset</button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {activeTab === 'hostel' && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Hostel Management</h2>
              <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Allocations</h3>
                  <ul className="space-y-2 text-sm">
                    {students.filter(s => s.hostel).map(s => (
                      <li key={s.id} className="flex justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">Hostel {s.hostel} • {s.branch}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleHostel(s.id, s.hostel)} className="text-xs py-1 px-2 border rounded">Release</button>
                        </div>
                      </li>
                    ))}
                    {students.filter(s => s.hostel).length===0 && <li className="text-gray-500">No allocations yet</li>}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Manual Allocate</h3>
                  <div className="space-y-2">
                    <select onChange={e => setSelectedStudentId(e.target.value)} value={selectedStudentId || ''} className="w-full p-2 border rounded-md">
                      <option value="">Select student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => selectedStudentId && toggleHostel(selectedStudentId, 'A')} className="flex-1 py-2 rounded bg-indigo-600 text-white">Assign to A</button>
                      <button onClick={() => selectedStudentId && toggleHostel(selectedStudentId, 'B')} className="flex-1 py-2 rounded border">Assign to B</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'finance' && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Finance & Receipts</h2>
              <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl">
                <div className="mb-4">
                  <label className="text-sm text-gray-600">Student</label>
                  <select value={selectedStudentId || ''} onChange={e => setSelectedStudentId(e.target.value)} className="w-full p-2 border rounded-md">
                    <option value="">Choose student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} — ₹{s.feesPaid}</option>)}
                  </select>
                </div>

                {selectedStudentId ? (
                  <div className="space-y-3">
                    {(() => {
                      const student = students.find(s => s.id === selectedStudentId);
                      return (
                        <>
                          <div className="text-sm">Selected: <strong>{student.name}</strong> (ID: {student.id})</div>
                          <div className="flex gap-2">
                            <input id="pay" placeholder="Amount" type="number" className="p-2 border rounded-md" />
                            <button onClick={() => {
                              const amt = document.getElementById('pay').value || 0;
                              if (!amt) return alert('Enter amount');
                              handlePayFees(student.id, amt);
                            }} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Pay</button>
                            <button onClick={() => { const r = generateReceipt(student); alert(r); }} className="px-4 py-2 border rounded-md">Preview Receipt</button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : <div className="text-gray-500">Select a student to generate receipt or record payment.</div>}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Minimal styles to make this look pretty even without Tailwind */}
      <style jsx>{`
        :root{--bg:#f7f9fc}
        .font-sans{font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial}
        .bg-gray-50{background:var(--bg)}
        .rounded-xl{border-radius:14px}
        .shadow-sm{box-shadow:0 6px 18px rgba(12,20,40,0.06)}
        input, select, button{outline:none}
        /* responsive grid fallback */
        @media (max-width: 768px){
          aside{display:none}
        }
      `}</style>
    </div>
  );
}
