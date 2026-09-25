import { createElement } from "react";
import { ArrowRight, CalendarDays, Compass, Users } from "lucide-react";
import { Link } from "react-router-dom";
import bg from "../assets/QUimage.jpg";

export default function Home() {
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
    </div>
  );
}


