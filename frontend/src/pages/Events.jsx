import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import { 
  Loader2, 
  Search, 
  MapPin, 
  Clock, 
  CalendarDays, 
  Filter,
  Tag
} from "lucide-react";

const categories = ["All", "Technical", "Cultural", "Sports", "Workshop", "Seminar", "Fest"];

const eventFallbackColors = {
    Technical: "from-blue-600 via-cyan-500 to-teal-400",
    Cultural: "from-fuchsia-600 via-pink-500 to-rose-400",
    Sports: "from-orange-500 via-amber-500 to-yellow-400",
    Workshop: "from-violet-600 via-indigo-500 to-blue-400",
    Seminar: "from-slate-700 via-slate-600 to-slate-400",
    Fest: "from-emerald-600 via-teal-500 to-cyan-400",
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sync selectedCategory with URL query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newCategory = params.get("category") || "All";
    setSelectedCategory((prev) => (newCategory !== prev ? newCategory : prev));
  }, [location.search]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const categoryQuery = selectedCategory !== "All" ? `category=${selectedCategory}` : "";
        const res = await api.get(`/events?${categoryQuery}`);
        const fetchedEvents = res.data.data || res.data || [];
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCategory]);

  // Handle Search Filtering (Client-side for better performance on small datasets)
  useEffect(() => {
    if (!searchTerm) {
        setFilteredEvents(events);
    } else {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = events.filter(event => 
            event.title.toLowerCase().includes(lowerSearch) || 
            event.description.toLowerCase().includes(lowerSearch) ||
            event.venue?.toLowerCase().includes(lowerSearch)
        );
        setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams();
    if (cat !== "All") {
        newParams.set('category', cat);
    }
    window.history.pushState(null, '', `/events?${newParams.toString()}`);
  }

  // Helper to format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
        full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center mb-12 mt-5">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Explore Campus <span className="text-blue-600">Events</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover workshops, competitions, and cultural fests happening around you.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto mb-12 space-y-6">
        
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                placeholder="Search events by name, venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                        selectedCategory === cat
                            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading upcoming events...</p>
            </div>
        ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-500 max-w-sm">
                    We couldn't find any events matching your criteria. Try selecting a different category or clearing your search.
                </p>
                <button 
                    onClick={() => { setSearchTerm(""); handleCategoryChange("All"); }}
                    className="mt-6 text-blue-600 font-medium hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => {
                    const dateInfo = formatDate(event.date);
                    
                    return (
                        <div 
                            key={event._id} 
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                        >
                            {/* Card Image Area */}
                            <div className="relative h-36 bg-gray-200 overflow-hidden">
                                {event.imageUrl || event.image?.path ? (
                                    <img 
                                        src={event.imageUrl || event.image?.path} 
                                        alt={event.title} 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${eventFallbackColors[event.category] || "from-blue-600 to-indigo-600"}`}>
                                        <CalendarDays className="text-white/30 w-16 h-16" />
                                    </div>
                                )}
                                
                                {/* Date Badge */}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg min-w-[60px]">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">{dateInfo.month}</div>
                                    <div className="text-2xl font-extrabold text-gray-900 leading-none">{dateInfo.day}</div>
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md">
                                        {event.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex flex-grow flex-col p-4">
                                <h2 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                    {event.title}
                                </h2>
                                
                                <div className="mb-3 space-y-1.5">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                        <span>{event.time || "Time TBD"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                        <span className="truncate">{event.venue || "Venue TBD"}</span>
                                    </div>
                                </div>

                                <p className="mb-4 line-clamp-2 flex-grow text-sm text-gray-600">
                                    {event.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Price</span>
                                        <span className={`text-sm font-bold ${event.isPaid ? "text-green-600" : "text-gray-900"}`}>
                                            {event.isPaid ? `₹${event.price}` : "Free"}
                                        </span>
                                    </div>
                                    
                                    <Link 
                                        to={`/events/${event._id}`} 
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Events;