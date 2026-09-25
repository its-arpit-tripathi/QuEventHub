import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Loader2, MapPin, Users } from "lucide-react";
import api from "../api";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/events"), api.get("/clubs")])
      .then(([eventsResponse, clubsResponse]) => {
        setEvents((eventsResponse.data.data || eventsResponse.data || []).slice(0, 4));
        setClubs((clubsResponse.data.data || clubsResponse.data || []).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-[#102a43] via-blue-800 to-cyan-600 p-6 text-white shadow-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Student dashboard</p>
          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user?.name?.split(" ")[0] || "student"}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Your space to discover events, find communities, and plan your campus week.</p>
            </div>
            <Link to="/profile" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/25">View profile <ArrowRight size={17} /></Link>
          </div>
        </section>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div> : (
          <>
            <DashboardSection title="Upcoming events" link="/events" label="Explore all events">
              {events.length === 0 ? <EmptyState text="No events are available right now." /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{events.map((event) => <Link key={event._id} to={`/events/${event._id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" /><div className="p-5"><span className="text-xs font-bold uppercase tracking-wide text-blue-600">{event.category || "Campus"}</span><h2 className="mt-3 line-clamp-2 font-bold text-slate-900">{event.title}</h2><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} />{event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}</p><p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-500"><MapPin size={15} />{event.venue || "Venue TBD"}</p></div></Link>)}</div>}
            </DashboardSection>

            <DashboardSection title="Communities for you" link="/clubs" label="Browse all clubs">
              {clubs.length === 0 ? <EmptyState text="No clubs are available right now." /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{clubs.map((club) => <Link key={club._id} to={`/clubs/${club._id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" /><div className="p-5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><Users size={21} /></div><h2 className="truncate font-bold text-slate-900">{club.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{club.description || "Find students who share your interests."}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-purple-600">{club.category || "Community"}</p></div></Link>)}</div>}
            </DashboardSection>
          </>
        )}
      </div>
    </div>
  );
}

function DashboardSection({ title, link, label, children }) {
  return <section><div className="mb-4 flex items-end justify-between gap-4"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2><Link to={link} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700">{label} <ArrowRight size={16} /></Link></div>{children}</section>;
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{text}</div>;
}
