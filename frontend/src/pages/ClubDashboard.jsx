import React, { useEffect, useState } from "react";
import api from "../api";
import { showToast } from "../utils/toast";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  CheckCircle,
  Image as ImageIcon,
  DollarSign
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  registrationDeadline: "",
  category: "Technical",
  isPaid: false,
  price: 0,
  capacity: 0,
  imageUrl: "",
};

const ClubDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null); // Triggers Modal
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/events/club");
      setEvents(res.data.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load club events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/events/club/${editingId}`, form);
      } else {
        await api.post("/events/club", form);
      }
      resetForm();
      loadEvents();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev._id);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      date: ev.date ? ev.date.substring(0, 10) : "",
      time: ev.time || "",
      venue: ev.venue || "",
      registrationDeadline: ev.registrationDeadline
        ? ev.registrationDeadline.substring(0, 10)
        : "",
      category: ev.category || "Technical",
      isPaid: !!ev.isPaid,
      price: ev.price || 0,
      capacity: ev.capacity || 0,
      imageUrl: ev.imageUrl || "",
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await api.delete(`/events/club/${id}`);
      loadEvents();
    } catch (e) {
      console.error(e);
      setError("Failed to delete event");
    }
  };

  const loadRegistrations = async (eventId) => {
    setSelectedEventId(eventId);
    setRegistrations([]);
    try {
      const res = await api.get(`/events/club/${eventId}/registrations`);
      setRegistrations(res.data.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load registrations");
    }
  };

  const markAttendance = async (eventId, regId) => {
    try {
      await api.post(`/events/club/${eventId}/attendance/${regId}`);
      // Optimistic update
      setRegistrations(prev => prev.map(r => r._id === regId ? { ...r, attended: true } : r));
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || "Could not mark attendance", "error");
    }
  };

  // Helper for category colors
  const getCategoryColor = (cat) => {
    switch(cat) {
      case "Technical": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cultural": return "bg-pink-100 text-pink-700 border-pink-200";
      case "Sports": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const inputClasses = "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const labelClasses = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Club Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your events and track student attendance.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm ${isFormOpen ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isFormOpen ? <><X size={18}/> Cancel</> : <><Plus size={18}/> Create Event</>}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}><X size={16}/></button>
          </div>
        )}

        {/* Event Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-2">
              {editingId ? "Edit Event Details" : "Create New Event"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                <div className="col-span-1 md:col-span-2">
                  <label className={labelClasses}>Event Title</label>
                  <input
                    placeholder="e.g. Hackathon 2024"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClasses}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Venue</label>
                  <input
                    placeholder="e.g. Auditorium"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className={inputClasses}
                  />
                </div>

                <div>
                   <label className={labelClasses}>Registration Deadline</label>
                   <input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Capacity (0 for unlimited)</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className={inputClasses}
                    min={0}
                  />
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

                <div className="col-span-1 md:col-span-3">
                  <label className={labelClasses}>Description</label>
                  <textarea
                    placeholder="Describe your event..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputClasses} h-24 resize-none`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? "Saving..." : editingId ? "Update Event" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Event List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-3 text-indigo-600" size={40} />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Calendar className="text-gray-400" size={32} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No events found</h3>
             <p className="text-gray-500 mt-1 mb-6">Get started by creating your first event.</p>
             <button onClick={() => setIsFormOpen(true)} className="text-indigo-600 font-medium hover:underline">
               Create an event
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                {/* Card Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryColor(ev.category)}`}>
                        {ev.category}
                     </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{ev.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2 text-indigo-500" />
                      {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "Date TBD"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-2 text-indigo-500" />
                      {ev.time || "Time TBD"}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-2 text-indigo-500" />
                      {ev.venue || "Venue TBD"}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => loadRegistrations(ev._id)}
                      className="col-span-2 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Users size={16} /> Manage Registrations
                    </button>
                    <button
                      onClick={() => startEdit(ev)}
                      className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(ev._id)}
                      className="flex items-center justify-center gap-1.5 py-2 border border-red-100 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registrations Modal (Slide-over or Popup) */}
      {selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                   <h3 className="text-lg font-bold text-gray-900">Registration List</h3>
                   <p className="text-sm text-gray-500">Total Registered: {registrations.length}</p>
                </div>
                <button onClick={() => setSelectedEventId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                   <X size={20} className="text-gray-500" />
                </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              {registrations.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Users size={48} className="mb-3 opacity-20" />
                    <p>No students have registered yet.</p>
                 </div>
              ) : (
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="px-6 py-3 border-b">Student</th>
                        <th className="px-6 py-3 border-b text-center">Status</th>
                        <th className="px-6 py-3 border-b text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {registrations.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50/50">
                           <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{r.user?.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500">{r.user?.q_id}</div>
                              <div className="text-xs text-gray-400">{r.user?.email}</div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              {r.attended ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                   Present
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                   Pending
                                </span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              {!r.attended && (
                                <button
                                   onClick={() => markAttendance(selectedEventId, r._id)}
                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                   <CheckCircle size={14} /> Mark Present
                                </button>
                              )}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClubDashboard;