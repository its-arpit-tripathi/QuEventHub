import React, { useEffect, useState } from "react";
import api from "../api";
import { showToast } from "../utils/toast";


const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Save: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Calendar: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  MapPin: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const emptyForm = {
  name: "",
  category: "technical",
  description: "",
  meeting: "",
  time: "",
  venue: "",
  imageUrl: "",
};

const getCategoryColor = (cat) => {
  switch (cat) {
    case "technical": return "bg-blue-100 text-blue-800 border-blue-200";
    case "cultural": return "bg-pink-100 text-pink-800 border-pink-200";
    case "sports": return "bg-orange-100 text-orange-800 border-orange-200";
    case "arts": return "bg-purple-100 text-purple-800 border-purple-200";
    case "music": return "bg-teal-100 text-teal-800 border-teal-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const AdminClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/clubs");
      setClubs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load clubs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (form._id) {
        await api.put(`/clubs/${form._id}`, form);
      } else {
        const res = await api.post("/clubs", form);
        const creds = res.data?.data?.credentials;
        if (creds) {
          showToast(`Club created. ID: ${creds.clubId} | Password: ${creds.password}`, "success");
        }
      }
      resetForm();
      fetchClubs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to save club.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await api.delete(`/clubs/${id}`);
      fetchClubs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete club.");
    }
  };

  const startEdit = (club) =>
    setForm({
      _id: club._id,
      name: club.name || "",
      category: club.category || "technical",
      description: club.description || "",
      meeting: club.meeting || "",
      time: club.time || "",
      venue: club.venue || "",
      imageUrl: club.imageUrl || "",
    });

  const inputClasses =
    "w-full p-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors";

  const labelClasses = "block mb-1 text-xs font-medium text-gray-600 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Clubs</h2>
            <p className="text-gray-500 mt-1">Add, edit, or remove student clubs.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center p-4 text-red-800 border-l-4 border-red-600 bg-red-50 rounded shadow-sm">
            <span className="font-medium mr-2">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                {form._id ? "Edit Club" : "Add New Club"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClasses}>Club Name</label>
                  <input
                    placeholder="e.g. Coding Wizards"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className={inputClasses}
                        >
                            <option value="technical">Technical</option>
                            <option value="cultural">Cultural</option>
                            <option value="sports">Sports</option>
                            <option value="arts">Arts</option>
                            <option value="music">Music</option>
                        </select>
                    </div>
                     <div>
                        <label className={labelClasses}>Image URL</label>
                        <input
                            placeholder="https://..."
                            value={form.imageUrl}
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClasses}>Meeting Day</label>
                    <input
                      placeholder="e.g. Fridays"
                      value={form.meeting}
                      onChange={(e) => setForm({ ...form, meeting: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Time</label>
                    <input
                      placeholder="e.g. 4:00 PM"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Venue</label>
                  <input
                    placeholder="e.g. Room 304, Block B"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Description</label>
                  <textarea
                    placeholder="What is this club about?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputClasses} h-24 resize-none`}
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : <><Icons.Save /> {form._id ? "Update" : "Create"}</>}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <span className="sr-only">Clear</span>
                    <Icons.X />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: LIST */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : clubs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No clubs found.</p>
                    <p className="text-gray-400 text-sm">Create one using the form.</p>
                </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {clubs.map((c) => (
                  <div
                    key={c._id}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
                  >
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      {c.imageUrl ? (
                        <img 
                          src={c.imageUrl} 
                          alt={c.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-4xl">🏆</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryColor(c.category)}`}>
                          {c.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{c.name}</h4>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                        {c.description || "No description provided."}
                      </p>

                      <div className="space-y-2 mb-4">
                         <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2"><Icons.Calendar /></span>
                            {c.meeting || "TBD"} {c.time && `• ${c.time}`}
                         </div>
                         <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2"><Icons.MapPin /></span>
                            {c.venue || "Venue TBD"}
                         </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                        <button
                          onClick={() => startEdit(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                        >
                          <Icons.Edit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="flex items-center justify-center px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClubs;