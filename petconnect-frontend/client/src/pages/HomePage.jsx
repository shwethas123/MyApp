import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJoinClick = () => {
    if (isAuthenticated) {
      navigate("/browse");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
              <ellipse cx="7" cy="6" rx="1.2" ry="1.6" />
              <ellipse cx="4.5" cy="7.5" rx="1" ry="1.4" />
              <ellipse cx="9.5" cy="7.5" rx="1" ry="1.4" />
              <path d="M7 10 C4 10 3 13 4.5 14.5 C5.5 15.5 8.5 15.5 9.5 14.5 C11 13 10 10 7 10Z" />
              <ellipse cx="17" cy="4" rx="1.2" ry="1.6" />
              <ellipse cx="14.5" cy="5.5" rx="1" ry="1.4" />
              <ellipse cx="19.5" cy="5.5" rx="1" ry="1.4" />
              <path d="M17 8 C14 8 13 11 14.5 12.5 C15.5 13.5 18.5 13.5 19.5 12.5 C21 11 20 8 17 8Z" />
            </svg>
            <Link to="/" className="text-blue-600 font-bold text-xl">PetConnect</Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about-us" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-300">
              About Us
            </a>
           
            {currentUser?.role === "shelter" && (
              <Link to="/shelter/pets" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-300">
                Dashboard
              </Link>
            )}
            {(!isAuthenticated || currentUser?.role === "adopter") && (
              <Link to="/browse" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-300">
                Browse Pets
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hi, {currentUser?.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-gray-100 pt-4 px-2">
            <a href="#about-us" className="text-gray-600 text-sm font-medium transition-colors duration-500" onClick={() => setMenuOpen(false)}>
              About Us
            </a>
           
            {currentUser?.role === "shelter" && (
              <Link to="/shelter/pets" className="text-gray-600 text-sm font-medium transition-colors duration-500" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            {/* :white_check_mark: Fixed: show Browse Pets for guests AND adopters, matching desktop logic */}
            {(!isAuthenticated || currentUser?.role === "adopter") && (
              <Link to="/browse" className="text-gray-600 text-sm font-medium transition-colors duration-500" onClick={() => setMenuOpen(false)}>
                Browse Pets
              </Link>
            )}
            {!isAuthenticated ? (
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg w-full"
              >
                Login/Register
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600">Hi, {currentUser?.name?.split(" ")[0]}</span>
                <button
                  onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                  className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Finding Your New <span className="text-blue-600">Best Friend</span> Starts Here.
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            We bridge the gap between compassionate shelters and loving families.
            Join our community and discover thousands of pets waiting for their forever home.
          </p>
          <div className="flex gap-4 justify-center md:justify-start flex-wrap">
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Join PetConnect
              </button>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full md:w-[420px] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop"
            alt="Family with pets"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about-us" className="bg-gray-50 py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
                title: "Easy Adoption",
                desc: "Our streamlined process makes it simple to find and meet your future companion with minimal paperwork.",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Verified Shelters",
                desc: "Every shelter in our network undergoes a rigorous vetting process to ensure the health and safety of all animals.",
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: "Community Support",
                desc: "Join a network of thousands of pet owners who share advice, stories, and local pet-friendly tips.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-blue-600">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section id="footer" className="py-14 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-8">
            Trusted by 1000+ Pet Lovers
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
            {["SafePaws", "AnimalRescue", "UrbanPets", "FurryFriends Co.", "AdoptNation"].map((name, i) => (
              <span key={i} className="text-gray-400 font-semibold text-base md:text-lg hover:text-gray-600 transition cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}