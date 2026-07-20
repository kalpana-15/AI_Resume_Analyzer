import React, { useState, useRef, useEffect } from 'react';
import { Link, Form, useLocation } from "react-router";

interface NavbarProps {
    user?: {
        name?: string | null;
        email: string;
    } | null;
}

const Navbar = ({ user }: NavbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);

    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node);
            const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node);
            
            if (isOutsideDesktop && isOutsideMobile) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayName = user?.name || user?.email.split('@')[0] || 'User';

    const getLinkStyle = (path: string) => {
        const isActive = location.pathname === path;
        return `text-sm font-semibold transition-all ${isActive ? 'text-white underline decoration-2 decoration-[#a5e1f3] underline-offset-[6px]' : 'text-white/80 hover:text-white'}`;
    };

    const getMobileLinkStyle = (path: string) => {
        const isActive = location.pathname === path;
        return `w-full text-left px-3 py-2 text-sm hover:bg-white/10 font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive ? 'text-[#a5e1f3] underline decoration-2 underline-offset-[6px] bg-white/5' : 'text-white'}`;
    };

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-xl md:text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">RESUMIFY</p>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-row gap-6 items-center">
                {user && (
                    <>
                        <Link to="/" className={getLinkStyle('/')}>
                            Home
                        </Link>
                        <Link to="/history" className={getLinkStyle('/history')}>
                            History
                        </Link>
                    </>
                )}
                <Link to="/upload" className="primary-button w-fit !py-1.5 !px-5">
                    <span className="text-[0.95rem] font-bold">Upload</span>
                </Link>
                
                {user && (
                    <div className="relative" ref={desktopDropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a5e1f3]/20 to-[#a5e1f3]/5 border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(165,225,243,0.3)] hover:scale-105 transition-transform focus:outline-none backdrop-blur-md"
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-[#170d37]/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                                <div className="px-4 py-4 border-b border-white/10 bg-white/5">
                                    <p className="text-sm font-semibold text-white truncate">{user.name || 'Welcome'}</p>
                                    <p className="text-xs text-[#b4a8d1] truncate mt-0.5">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <a href="/logout"
                                       className="w-full text-left px-3 py-2 text-sm text-[#ff8a8a] hover:bg-white/10 font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        Logout
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Navigation (Hamburger) */}
            <div className="flex md:hidden flex-row items-center gap-3">
                {!user && (
                    <Link to="/upload" className="primary-button w-fit !py-1.5 !px-4">
                        <span className="text-sm font-bold">Upload</span>
                    </Link>
                )}
                {user && (
                    <div className="relative" ref={mobileDropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white focus:outline-none backdrop-blur-md active:scale-95 transition-transform"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isDropdownOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </>
                                )}
                            </svg>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-52 bg-[#170d37]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/20 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200 flex flex-col p-2 gap-1">
                                <div className="px-3 py-3 border-b border-white/10 bg-white/5 rounded-xl mb-1">
                                    <p className="text-sm font-semibold text-white truncate">{user.name || 'Welcome'}</p>
                                    <p className="text-xs text-[#b4a8d1] truncate mt-0.5">{user.email}</p>
                                </div>
                                <Link to="/" onClick={() => setIsDropdownOpen(false)} className={getMobileLinkStyle('/')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                    Home
                                </Link>
                                <Link to="/upload" onClick={() => setIsDropdownOpen(false)} className={getMobileLinkStyle('/upload')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    Upload Resume
                                </Link>
                                <Link to="/history" onClick={() => setIsDropdownOpen(false)} className={getMobileLinkStyle('/history')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    History
                                </Link>
                                <a href="/logout" className="mt-1 border-t border-white/10 pt-1 w-full text-left px-3 py-2 text-sm text-[#ff8a8a] hover:bg-white/10 font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                    Logout
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;