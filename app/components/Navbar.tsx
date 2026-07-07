import React from 'react';
import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIFY</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                <p className="text-lg font-semibold">Upload Resume</p>
            </Link>
        </nav>
    );
};

export default Navbar;