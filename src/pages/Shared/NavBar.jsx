import React, { use } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import {
    FiHome,
    FiGrid,
    FiUser,
    FiLogOut,
    FiLogIn,
    FiUserPlus,
    FiActivity,
    FiCheckSquare,
} from "react-icons/fi";

import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { GoBrowser } from "react-icons/go";

const NavBar = () => {
    const { user, role, logOut } = use(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logOut()
            .then(() => navigate("/"))
            .catch((err) => console.log(err));
    };

    const dashboardPath =
        role === "student"
            ? "/dashboard/student"
            : role === "supervisor"
                ? "/dashboard/supervisor"
                : role === "headSupervisor"
                    ? "/dashboard/headSupervisor"
                    : "/";

    const linkClass =
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition";

    return (
        <div className="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
            <div className="navbar container mx-auto px-4">

                {/* Left - Logo */}
                <div className="navbar-start">
                    <Link to="/" className="text-xl font-bold tracking-wide">
                        FYP Portal
                    </Link>
                </div>

                {/* Center - Links (Desktop) */}
                <div className="navbar-center hidden lg:flex gap-2">
                    <NavLink to="/" className={linkClass}>
                        <FiHome /> Home
                    </NavLink>

                    {user && (
                        <>
                            <NavLink to={dashboardPath} className={linkClass}>
                                <FiGrid /> Dashboard
                            </NavLink>

                            <NavLink to="/projects/browse" className={linkClass}>
                                <GoBrowser /> Browse Projects
                            </NavLink>

                            <NavLink to="/activities" className={linkClass}>
                                <FiActivity /> Activities
                            </NavLink>

                            {role === "supervisor" && (
                                <NavLink to="/dashboard/supervisor/completed-projects" className={linkClass}>
                                    <IoCheckmarkDoneSharp /> Completed Projects
                                </NavLink>
                            )}

                            {user && role === "headSupervisor" && (
                                <NavLink to="/dashboard/headSupervisor/students" className={linkClass}>
                                    Students
                                </NavLink>
                            )}

                            {role === "supervisor" && (
                                <NavLink to="/dashboard/supervisor/student-progress" className={linkClass}>
                                    Student Progress
                                </NavLink>
                            )}

                            {(role === "student" || role === "supervisor") && (
                                <NavLink to="/announcements" className={linkClass}>
                                    Announcement
                                </NavLink>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-end gap-2">
                    {!user ? (
                        <>
                            <Link to="/signIn" className="btn btn-sm btn-outline rounded-xl">
                                <FiLogIn className="mr-1" /> Sign In
                            </Link>

                            <Link to="/register" className="btn btn-sm btn-primary rounded-xl">
                                <FiUserPlus className="mr-1" /> Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/profile"
                                className="btn btn-sm btn-ghost rounded-xl flex items-center gap-2"
                            >
                                <FiUser />
                                Profile
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className="btn btn-sm btn-outline rounded-xl"
                            >
                                <FiLogOut className="mr-1" /> Logout
                            </button>
                        </>
                    )}

                    {/* Mobile dropdown */}
                    <div className="dropdown dropdown-end lg:hidden">
                        <label tabIndex={0} className="btn btn-sm btn-ghost">
                            ☰
                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
                        >
                            <li>
                                <Link to="/">
                                    <FiHome className="mr-1" /> Home
                                </Link>
                            </li>

                            {user && (
                                <>
                                    <li>
                                        <Link to={dashboardPath}>
                                            <FiGrid /> Dashboard
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/projects/browse">
                                            <GoBrowser /> Browse Projects
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/activities">
                                            <FiActivity /> Activities
                                        </Link>
                                    </li>


                                    {role === "supervisor" && (
                                        <li>
                                            <Link to="/dashboard/supervisor/completed-projects">
                                                <IoCheckmarkDoneSharp /> Completed Projects
                                            </Link>
                                        </li>
                                    )}

                                    {user && role === "headSupervisor" && (
                                        <li>
                                            <NavLink to="/dashboard/headSupervisor/students">
                                                Students
                                            </NavLink>
                                        </li>
                                    )}
                                    {role === "supervisor" && (
                                        <li>
                                            <Link to="/dashboard/supervisor/student-progress">Student Progress</Link>
                                        </li>
                                    )}

                                    {(role === "student" || role === "supervisor") && (
                                        <li>
                                            <NavLink to="/announcements">
                                                Announcement
                                            </NavLink>
                                        </li>
                                    )}

                                    <li>
                                        <Link to="/profile">
                                            <FiUser /> Profile
                                        </Link>
                                    </li>

                                    <li>
                                        <button onClick={handleLogout} className="flex items-center gap-2">
                                            <FiLogOut /> Logout
                                        </button>
                                    </li>
                                </>
                            )}

                            {!user && (
                                <>
                                    <li>
                                        <Link to="/signIn">Sign In</Link>
                                    </li>
                                    <li>
                                        <Link to="/register">Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;