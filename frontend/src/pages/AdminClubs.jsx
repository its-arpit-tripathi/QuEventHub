import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { showToast } from "../utils/toast";

const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

const emptyForm = {
  name: "",
  category: "technical",
  description: "",
  meeting: "",
  time: "",
  venue: "",
  imageUrl: "",
  imageFile: null,
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const getCategoryBadge = (cat) => {
  const styles = {
    technical: "bg-blue-50 text-blue-700 border-blue-200/60",
    cultural: "bg-rose-50 text-rose-700 border-rose-200/60",
    sports: "bg-amber-50 text-amber-700 border-amber-200/60",
    arts: "bg-purple-50 text-purple-700 border-purple-200/60",
    music: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };
  return styles[cat] || "bg-slate-50 text-slate-700 border-slate-200/60";
};

const AdminClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = useRef(null);

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

  const resetForm = () => {
    setForm(emptyForm);
    setPreviewUrl(null);
    setIsFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
    window.setTimeout(() => {
      document.getElementById("club-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be 2 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, imageFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePaste = (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageChange({ target: { files: [file] } });
        }
        event.preventDefault();
        break;
      }
    }
  };

  const handlePasteClick = async (e) => {
    e.stopPropagation();
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const typeStr of clipboardItem.types) {
          if (typeStr.startsWith("image/")) {
            const blob = await clipboardItem.getType(typeStr);
            const file = new File([blob], "pasted-image.png", { type: typeStr });
            handleImageChange({ target: { files: [file] } });
            return;
          }
        }
      }
      showToast("No image found in clipboard.", "info");
    } catch (err) {
      console.error("Paste error:", err);
      showToast("Unable to read clipboard. Please grant permission or use Ctrl+V.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "_id" && key !== "imageFile" && value !== undefined && value !== null) {
          payload.append(key, value);
        }
      });
      if (form.imageFile) payload.append("image", form.imageFile);

      if (form._id) {
        await api.put(`/clubs/${form._id}`, payload);
        showToast("Club updated successfully", "success");
      } else {
        const res = await api.post("/clubs", payload);
        const creds = res.data?.data?.credentials;
        if (creds) {
          showToast(`Club created! ID: ${creds.clubId} | Pass: ${creds.password}`, "success");
        } else {
          showToast("Club created successfully", "success");
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
      showToast("Club removed", "info");
      fetchClubs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete club.");
    }
  };

  const startEdit = (club) => {
    setForm({
      _id: club._id,
      name: club.name || "",
      category: club.category || "technical",
      description: club.description || "",
      meeting: club.meeting || "",
      time: club.time || "",
      venue: club.venue || "",
      imageUrl: club.imageUrl || "",
      imageFile: null,
    });
    setPreviewUrl(club.imageUrl || null);
    setIsFormOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.setTimeout(() => {
      document.getElementById("club-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const inputClasses =
    "w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 text-slate-900 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";

  const labelClasses = "block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* WORKSPACE HEADER */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#102a43] via-[#164e63] to-[#0e7490] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Club management workspace</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Build the campus community.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">Create clubs, keep their details current, and make every community easy to discover.</p>
            </div>
            <button
              type="button"
              onClick={isFormOpen ? resetForm : openCreateForm}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold shadow-lg transition ${isFormOpen ? "bg-white/15 text-white hover:bg-white/25" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"}`}
            >
              {isFormOpen ? <><Icons.X /> Close Form</> : <><Icons.Plus /> Create Club</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Published clubs</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{clubs.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active members</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{clubs.reduce((sum, c) => sum + (c.members?.length || 0), 0)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Directory status</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">Ready to discover</p>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <div className="flex gap-2">
              <span className="font-semibold shrink-0">Action Failed:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-800 transition-colors"
            >
              <Icons.X />
            </button>
          </div>
        )}

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 gap-8">
          {/* FORM PANEL */}
          {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={resetForm}>
            <div id="club-form" className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-violet-100 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-9">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Club builder</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {form._id ? "Edit Club Details" : "Create New Club"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {form._id ? "Modifying existing record" : "Fill in basic information"}
                  </p>
                </div>
                <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close club form"
                  >
                    <Icons.X />
                  </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:p-9 md:grid-cols-2 lg:grid-cols-3">
                {/* NAME */}
                <div className="lg:col-span-2">
                  <label className={labelClasses}>Club Name <span className="text-red-500">*</span></label>
                  <input
                    placeholder="e.g. Robotics & AI Club"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>

                {/* CATEGORY & IMAGE UPLOAD */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-2">
                  <div>
                    <label className={labelClasses}>Category <span className="text-red-500">*</span></label>
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
                    <label className={labelClasses}>Cover Banner</label>
                    <div className="relative group">
                      <div
                        tabIndex={0}
                        onPaste={handlePaste}
                        className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-slate-50/50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all overflow-hidden relative"
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-28 rounded-lg overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                              <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">Change Image</button>
                              <button type="button" onClick={handlePasteClick} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">Paste Clipboard</button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 flex flex-col items-center text-slate-400 w-full">
                            <Icons.Upload />
                            <div className="mt-3 flex gap-2">
                               <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer">Select File</button>
                               <button type="button" onClick={handlePasteClick} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer">Paste Image</button>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2">PNG, JPG up to 2MB</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SCHEDULE: DAY & TIME */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>Meeting Day</label>
                    <input
                      placeholder="e.g. Wednesday"
                      value={form.meeting}
                      onChange={(e) => setForm({ ...form, meeting: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Time</label>
                    <input
                      placeholder="e.g. 5:00 PM"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* VENUE */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelClasses}>Venue</label>
                  <input
                    placeholder="e.g. Room 402, Academic Block"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className={inputClasses}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelClasses}>Description</label>
                  <textarea
                    placeholder="Provide a brief summary of club activities and mission..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputClasses} h-20 resize-none`}
                  />
                </div>

                {/* SUBMIT BUTTONS */}
                <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center md:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-7 py-3 text-base font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Icons.Save />
                        <span>{form._id ? "Save Changes" : "Create Club"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
                  >
                    <Icons.X /> <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>}

          {/* CLUBS DIRECTORY / LIST */}
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Directory</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Published clubs</h2>
              </div>
              <span className="hidden text-sm text-slate-500 sm:block">Review and update community details</span>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 flex gap-4">
                    <div className="w-36 h-full bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : clubs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Icons.Sparkles />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No clubs registered yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  Use the registration form on the left to add your first student organization.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {clubs.map((c) => (
                  <div
                    key={c._id}
                    className="uniform-card group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                  >
                    {/* CARD THUMBNAIL */}
                    <div className="uniform-card-media relative w-full shrink-0 overflow-hidden bg-slate-100">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-indigo-900 flex items-center justify-center text-white/70">
                          <span className="text-2xl font-black tracking-widest uppercase">
                            {c.name.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border uppercase tracking-wider ${getCategoryBadge(
                            c.category
                          )}`}
                        >
                          {c.category}
                        </span>
                      </div>
                    </div>

                    {/* CARD INFO */}
                    <div className="uniform-card-body flex-1 justify-between p-4">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                            {c.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {c.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Icons.Calendar />
                            <span>
                              {c.meeting || "Day TBD"}
                              {c.time && ` • ${c.time}`}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Icons.MapPin />
                            <span>{c.venue || "Venue TBD"}</span>
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200/80 transition-colors"
                          >
                            <Icons.Edit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 text-xs font-medium rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete club"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
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