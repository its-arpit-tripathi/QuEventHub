import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { showToast } from "../utils/toast";
import { 
  Loader2, 
  Users, 
  Tent, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X
} from "lucide-react";

const emptyUserForm = {
  name: "",
  q_id: "",
  email: "",
  phone: "",
  course: "",
  section: "",
  year: "",
  role: "student",
};

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UI State
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'clubs'
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Form State
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [uRes, cRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/clubs"),
        ]);
        setUsers(uRes.data.data || []);
        setClubs(cRes.data.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load admin data. Ensure you have admin privileges.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    if (activeTab === "users") {
      return users.filter(u => 
        u.name?.toLowerCase().includes(lowerQuery) || 
        u.q_id?.toLowerCase().includes(lowerQuery) ||
        u.email?.toLowerCase().includes(lowerQuery)
      );
    } else {
      return clubs.filter(c => 
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.category?.toLowerCase().includes(lowerQuery)
      );
    }
  }, [users, clubs, activeTab, searchQuery]);

  // Handlers
  const openModal = (user = null) => {
    if (user) {
      setEditingUserId(user._id);
      setUserForm({
        name: user.name || "",
        q_id: user.q_id || "",
        email: user.email || "",
        phone: user.phone || "",
        course: user.course || "",
        section: user.section || "",
        year: user.year || "",
        role: user.role || "student",
      });
    } else {
      setEditingUserId(null);
      setUserForm(emptyUserForm);
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (editingUserId) {
        const payload = { ...userForm };
        const res = await api.put(`/admin/users/${editingUserId}`, payload);
        const updated = res.data.data;
        setUsers((prev) => prev.map((u) => (u._id === editingUserId ? updated : u)));
      } else {
        const payload = {
          ...userForm,
          password: "TempPass123!", // Default password logic
        };
        await api.post("/auth/register", payload);
        const resUsers = await api.get("/admin/users");
        setUsers(resUsers.data.data || []);
      }
      setIsUserModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save user", "error");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((x) => x._id !== id));
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await api.delete(`/clubs/${id}`);
      setClubs((prev) => prev.filter((x) => x._id !== id));
    } catch {
      showToast("Failed to delete club", "error");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      const updated = res.data.data;
      setUsers((prev) => prev.map((x) => (x._id === userId ? updated : x)));
    } catch {
      showToast("Failed to update role", "error");
    }
  };

  // Helper Components
  const Badge = ({ children, type }) => {
    const colors = {
        admin: "bg-purple-100 text-purple-800 border-purple-200",
        student: "bg-blue-100 text-blue-800 border-blue-200",
        technical: "bg-indigo-100 text-indigo-800",
        cultural: "bg-pink-100 text-pink-800",
        default: "bg-gray-100 text-gray-800"
    };
    const style = colors[type] || colors.default;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${style} capitalize`}>{children}</span>;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-5 sm:p-6 sm:pt-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Stats */}
        <div className="rounded-3xl bg-gradient-to-br from-[#102a43] via-[#1e3a8a] to-[#2563eb] p-6 text-white shadow-xl sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Admin workspace</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Keep QuEventHub moving.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Review users, manage clubs, and keep the campus calendar healthy.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
                </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Tent size={24} /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Clubs</p>
                    <h3 className="text-2xl font-bold text-gray-900">{clubs.length}</h3>
                </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
               <div>
                 <p className="text-sm text-gray-500 font-medium">Quick Actions</p>
                 <button onClick={() => navigate("/admin/clubs")} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                    Manage Club Settings &rarr;
                 </button>
               </div>
            </div>
        </div>

        {error && (
           <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 text-sm">{error}</div>
        )}

        {/* Main Content */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Platform directory</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Users and clubs</h2>
          </div>
          <span className="hidden text-sm text-slate-500 sm:block">Search, review, and manage records</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 md:flex-row md:items-center sm:p-5">
            <div className="flex self-start rounded-xl bg-slate-100 p-1">
              <button 
                onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Users
              </button>
              <button 
                onClick={() => { setActiveTab("clubs"); setSearchQuery(""); }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'clubs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Clubs
              </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              {activeTab === "users" && (
                <button 
                  onClick={() => openModal()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">Add User</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  {activeTab === "users" ? (
                    <>
                      <th className="px-6 py-3 font-semibold">User Details</th>
                      <th className="px-6 py-3 font-semibold">Academic</th>
                      <th className="px-6 py-3 font-semibold">Role</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 font-semibold">Club Name</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold">Credentials</th>
                      <th className="px-6 py-3 font-semibold text-center">Members</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                            No data found matching your search.
                        </td>
                    </tr>
                ) : activeTab === "users" ? (
                  filteredData.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-col text-xs">
                            <span className="font-medium">{user.q_id}</span>
                            <span>{user.course} • {user.year} • {user.section}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`text-xs border-0 bg-transparent font-medium cursor-pointer focus:ring-0 ${user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(user)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredData.map((club) => (
                    <tr key={club._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{club.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge type={club.category}>{club.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {club.clubId}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                            {club.members?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleDeleteClub(club._id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete Club"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5 sm:px-9">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {editingUserId ? "Edit User Profile" : "Register New Student"}
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close user form">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-7 sm:p-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input required className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input required type="email" className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Q-ID (Roll No) <span className="text-red-500">*</span></label>
                        <input required className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={userForm.q_id} onChange={e => setUserForm({...userForm, q_id: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <input required className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                    </div>
                    
                    <div className="col-span-2 border-t border-gray-100 my-2"></div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                        <input required placeholder="e.g. B.Tech" className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={userForm.course} onChange={e => setUserForm({...userForm, course: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                            <input required placeholder="1" className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                value={userForm.year} onChange={e => setUserForm({...userForm, year: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
                            <input required placeholder="A" className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                value={userForm.section} onChange={e => setUserForm({...userForm, section: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="rounded-xl border border-slate-200 px-6 py-3 text-slate-600 transition hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={savingUser} className="rounded-xl bg-indigo-600 px-7 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50">
                        {savingUser ? "Saving..." : editingUserId ? "Update User" : "Create User"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;