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
    FiList,
} from "react-icons/fi";

import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { GoBrowser } from "react-icons/go";
import { PiStudent } from "react-icons/pi";
import { GiProgression } from "react-icons/gi";
import { MdOutlineAnnouncement } from "react-icons/md";

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

    const desktopNavClass = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${isActive
            ? "bg-primary text-primary-content border-primary shadow-sm"
            : "text-base-content border-transparent hover:bg-base-200 hover:text-primary hover:border-base-300"
        }`;

    const mobileNavClass = ({ isActive }) =>
        `flex items-center gap-2 rounded-lg transition-all duration-200 ${isActive
            ? "bg-primary text-primary-content font-semibold"
            : "hover:bg-base-200 hover:text-primary"
        }`;

    return (
        <div className="sticky top-0 z-50 bg-base-100 border-b border-base-300 shadow-sm">
            <div className="navbar container mx-auto px-4">
                {/* Left - Logo */}
                <div className="navbar-start">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-wide transition-colors duration-200 hover:text-primary"
                    >
                        FYP Portal
                    </Link>
                </div>

                {/* Center - Links (Desktop) */}
                <div className="navbar-center hidden lg:flex gap-2">
                    <NavLink to="/" className={desktopNavClass}>
                        <FiHome /> Home
                    </NavLink>

                    {user && (
                        <>
                            <NavLink to={dashboardPath} end className={desktopNavClass}>
                                <FiGrid /> Dashboard
                            </NavLink>

                            <NavLink to="/projects/browse" className={desktopNavClass}>
                                <GoBrowser /> Browse Projects
                            </NavLink>

                            <NavLink to="/activities" className={desktopNavClass}>
                                <FiActivity /> Activities
                            </NavLink>

                            {role === "supervisor" && (
                                <NavLink
                                    to="/dashboard/supervisor/completed-projects"
                                    className={desktopNavClass}
                                >
                                    <IoCheckmarkDoneSharp /> Completed Projects
                                </NavLink>
                            )}

                            {role === "headSupervisor" && (
                                <>
                                    <NavLink
                                        to="/dashboard/headSupervisor/students"
                                        className={desktopNavClass}
                                    >
                                        <PiStudent /> Students
                                    </NavLink>

                                    <NavLink
                                        to="/dashboard/headSupervisor/progress-list"
                                        className={desktopNavClass}
                                    >
                                        <FiList /> Progress List
                                    </NavLink>
                                </>
                            )}

                            {role === "supervisor" && (
                                <NavLink
                                    to="/dashboard/supervisor/student-progress"
                                    className={desktopNavClass}
                                >
                                    <GiProgression /> Student Progress
                                </NavLink>
                            )}

                            {(role === "student" || role === "supervisor") && (
                                <NavLink to="/announcements" className={desktopNavClass}>
                                    <MdOutlineAnnouncement /> Announcement
                                </NavLink>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-end gap-2">
                    {!user ? (
                        <>
                            <Link
                                to="/signIn"
                                className="btn btn-sm btn-outline rounded-xl transition-all duration-200 hover:scale-105 hover:border-primary hover:text-primary"
                            >
                                <FiLogIn className="mr-1" /> Sign In
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-sm btn-primary rounded-xl transition-all duration-200 hover:scale-105"
                            >
                                <FiUserPlus className="mr-1" /> Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `btn btn-sm rounded-xl flex items-center gap-2 transition-all duration-200 ${isActive
                                        ? "btn-primary text-primary-content"
                                        : "btn-ghost hover:bg-base-200 hover:text-primary"
                                    }`
                                }
                            >
                                <FiUser />
                                Profile
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className="btn btn-sm btn-outline rounded-xl transition-all duration-200 hover:scale-105 hover:border-error hover:text-error"
                            >
                                <FiLogOut className="mr-1" /> Logout
                            </button>
                        </>
                    )}

                    {/* Mobile dropdown */}
                    <div className="dropdown dropdown-end lg:hidden">
                        <label
                            tabIndex={0}
                            className="btn btn-sm btn-ghost transition-all duration-200 hover:bg-base-200 hover:text-primary"
                        >
                            ☰
                        </label>

                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-56 border border-base-300"
                        >
                            <li>
                                <NavLink to="/" className={mobileNavClass}>
                                    <FiHome className="mr-1" /> Home
                                </NavLink>
                            </li>

                            {user && (
                                <>
                                    <li>
                                        <NavLink to={dashboardPath} end className={mobileNavClass}>
                                            <FiGrid /> Dashboard
                                        </NavLink>
                                    </li>

                                    <li>
                                        <NavLink
                                            to="/projects/browse"
                                            className={mobileNavClass}
                                        >
                                            <GoBrowser /> Browse Projects
                                        </NavLink>
                                    </li>

                                    <li>
                                        <NavLink to="/activities" className={mobileNavClass}>
                                            <FiActivity /> Activities
                                        </NavLink>
                                    </li>

                                    {role === "supervisor" && (
                                        <li>
                                            <NavLink
                                                to="/dashboard/supervisor/completed-projects"
                                                className={mobileNavClass}
                                            >
                                                <IoCheckmarkDoneSharp /> Completed Projects
                                            </NavLink>
                                        </li>
                                    )}

                                    {role === "headSupervisor" && (
                                        <>
                                            <li>
                                                <NavLink
                                                    to="/dashboard/headSupervisor/students"
                                                    className={mobileNavClass}
                                                >
                                                    <PiStudent /> Students
                                                </NavLink>
                                            </li>

                                            <li>
                                                <NavLink
                                                    to="/dashboard/headSupervisor/progress-list"
                                                    className={mobileNavClass}
                                                >
                                                    <FiList /> Progress List
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {role === "supervisor" && (
                                        <li>
                                            <NavLink
                                                to="/dashboard/supervisor/student-progress"
                                                className={mobileNavClass}
                                            >
                                                <GiProgression /> Student Progress
                                            </NavLink>
                                        </li>
                                    )}

                                    {(role === "student" || role === "supervisor") && (
                                        <li>
                                            <NavLink
                                                to="/announcements"
                                                className={mobileNavClass}
                                            >
                                                <MdOutlineAnnouncement /> Announcement
                                            </NavLink>
                                        </li>
                                    )}

                                    <li>
                                        <NavLink to="/profile" className={mobileNavClass}>
                                            <FiUser /> Profile
                                        </NavLink>
                                    </li>

                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 rounded-lg transition-all duration-200 hover:bg-base-200 hover:text-error"
                                        >
                                            <FiLogOut /> Logout
                                        </button>
                                    </li>
                                </>
                            )}

                            {!user && (
                                <>
                                    <li>
                                        <NavLink to="/signIn" className={mobileNavClass}>
                                            <FiLogIn /> Sign In
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/register" className={mobileNavClass}>
                                            <FiUserPlus /> Register
                                        </NavLink>
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