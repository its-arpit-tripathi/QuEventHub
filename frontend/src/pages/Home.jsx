import { createElement, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Compass, Loader2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import bg from "../assets/QUimage.jpg";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/events"), api.get("/clubs")])
      .then(([eventsResponse, clubsResponse]) => {
        setEvents((eventsResponse.data.data || eventsResponse.data || []).slice(0, 3));
        setClubs((clubsResponse.data.data || clubsResponse.data || []).slice(0, 3));
      })
      .catch((error) => console.error("Unable to load home previews:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f6f8fb]">
      <section className="relative isolate overflow-hidden bg-[#102a43] text-white">
        <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${bg})` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102a43] via-[#102a43]/90 to-[#102a43]/35" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              <Compass size={17} /> Your campus, in motion
            </p>
            <h1 className="font-['Space_Grotesk'] text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Find the next thing worth showing up for.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
              Discover events, meet people with the same interests, and turn campus time into memories that last.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/events" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
                Explore events <ArrowRight size={18} />
              </Link>
              <Link to="/clubs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20">
                Browse clubs <Users size={18} />
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">This week on campus</span>
                <CalendarDays className="text-cyan-300" size={22} />
              </div>
              <div className="space-y-4">
                {['Design sprint', 'Open mic night', 'Inter-college hackathon'].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 border-t border-white/15 pt-4">
                    <span className="text-sm font-bold text-cyan-300">0{index + 1}</span>
                    <span className="font-medium text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:grid-cols-3 sm:px-10 lg:px-12">
        {[
          { icon: CalendarDays, title: 'Events that fit you', text: 'Search workshops, fests, talks, and competitions in one place.' },
          { icon: Users, title: 'Communities to join', text: 'Find clubs that match your interests and meet your people.' },
          { icon: Compass, title: 'A simpler campus life', text: 'Keep your plans, registrations, and discoveries together.' },
        ].map(({ icon, title, text }) => (
          <div key={title} className="border-t-2 border-slate-200 px-1 py-5 sm:px-4">
            {createElement(icon, { className: "mb-4 text-blue-600", size: 22 })}
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl space-y-12 px-6 pb-20 sm:px-10 lg:px-12">
        <PreviewSection title="Upcoming events" subtitle="Make your next campus plan count." link="/events" linkLabel="Show more events">
          {loading ? <PreviewLoading /> : events.length === 0 ? <PreviewEmpty label="No events available yet." /> : (
            <div className="grid gap-5 md:grid-cols-3">
              {events.map((event) => (
                <Link key={event._id} to={`/events/${event._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400">
                    {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    <span className="absolute left-4 top-4 rounded-full bg-slate-950/65 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{event.category || "Campus"}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="truncate font-['Space_Grotesk'] text-lg font-bold text-slate-900 group-hover:text-blue-600">{event.title}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} className="text-blue-600" /> {formatDate(event.date)}</p>
                    <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-500"><MapPin size={16} className="text-cyan-600" /> {event.venue || "Venue to be announced"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PreviewSection>

        <PreviewSection title="Clubs to discover" subtitle="Find your people and make campus yours." link="/clubs" linkLabel="Show more clubs">
          {loading ? <PreviewLoading /> : clubs.length === 0 ? <PreviewEmpty label="No clubs available yet." /> : (
            <div className="grid gap-5 md:grid-cols-3">
              {clubs.map((club) => (
                <Link key={club._id} to={`/clubs/${club._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative flex h-36 items-end overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-5">
                    {club.imageUrl && <img src={club.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                    <span className="relative rounded-full bg-slate-950/55 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{club.category || "Community"}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="truncate font-['Space_Grotesk'] text-lg font-bold text-slate-900 group-hover:text-purple-600">{club.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{club.description || "Connect with students who share your interests."}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Users size={16} className="text-purple-600" /> {club.membersCount || club.members?.length || 0} active members</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PreviewSection>
      </section>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Date to be announced";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PreviewSection({ title, subtitle, link, linkLabel, children }) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-slate-500">{subtitle}</p>
        </div>
        <Link to={link} className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700">{linkLabel} <ArrowRight size={17} /></Link>
      </div>
      {children}
    </div>
  );
}

function PreviewLoading() {
  return <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-12"><Loader2 className="animate-spin text-blue-600" /></div>;
}

function PreviewEmpty({ label }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">{label}</div>;
}


