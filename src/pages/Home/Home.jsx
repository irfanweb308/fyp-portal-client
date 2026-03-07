import React, { use, useMemo } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import {
    FiSearch,
    FiSend,
    FiCheckCircle,
    FiUpload,
    FiUsers,
    FiShield,
    FiArrowRight,
} from "react-icons/fi";

const Home = () => {
    const { user, role } = use(AuthContext);

    const dashboardPath = useMemo(() => {
        if (role === "student") return "/dashboard/student";
        if (role === "supervisor") return "/dashboard/supervisor";
        if (role === "headSupervisor") return "/dashboard/headSupervisor";
        return "/";
    }, [role]);

    return (
        <div className="min-h-screen bg-base-100">
            {/* HERO */}
            <section className="relative overflow-hidden">
                {/* animated blobs */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
                <div className="pointer-events-none absolute top-10 -right-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-pulse" />
                <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl animate-pulse" />

                <div className="container mx-auto px-4 py-14 lg:py-20">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <div className="badge badge-outline mb-4">
                                Final Year Project Management Portal
                            </div>

                            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                                Find projects. Apply confidently. Track progress. Submit on time.
                            </h1>

                            <p className="mt-4 text-base-content/70 text-lg">
                                A single platform for students, supervisors, and head supervisors
                                to manage FYP projects, proposals, review workflow, activities,
                                and file submissions — clearly and professionally.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                {user ? (
                                    <>
                                        <Link to={dashboardPath} className="btn btn-primary">
                                            Go to Dashboard <FiArrowRight className="ml-2" />
                                        </Link>
                                        <Link to="/projects/browse" className="btn btn-outline">
                                            Browse Projects
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/projects/browse" className="btn btn-primary">
                                            Browse Projects <FiSearch className="ml-2" />
                                        </Link>
                                        <Link to="/register" className="btn btn-outline">
                                            Create Account
                                        </Link>
                                        <Link to="/signIn" className="btn btn-ghost">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                <div className="stat bg-base-200 rounded-2xl shadow-sm">
                                    <div className="stat-title">Workflow</div>
                                    <div className="stat-value text-2xl">Clear</div>
                                    <div className="stat-desc">Apply → Review → Submit</div>
                                </div>
                                <div className="stat bg-base-200 rounded-2xl shadow-sm">
                                    <div className="stat-title">Tracking</div>
                                    <div className="stat-value text-2xl">Live</div>
                                    <div className="stat-desc">Status & feedback</div>
                                </div>
                                <div className="stat bg-base-200 rounded-2xl shadow-sm">
                                    <div className="stat-title">Files</div>
                                    <div className="stat-value text-2xl">Safe</div>
                                    <div className="stat-desc">Role-based access</div>
                                </div>
                            </div>
                        </div>

                        {/* Right side preview card */}
                        <div className="relative">
                            <div className="card bg-base-200 shadow-xl rounded-2xl border border-base-300">
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <h2 className="card-title">Portal Overview</h2>
                                        <div className="badge badge-primary badge-outline">
                                            FYP System
                                        </div>
                                    </div>

                                    <div className="mt-2 grid gap-3">
                                        <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-4 shadow-sm hover:shadow transition">
                                            <div className="btn btn-circle btn-sm btn-primary">
                                                <FiSearch />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Browse & Choose Projects</p>
                                                <p className="text-sm text-base-content/70">
                                                    Students discover supervisor postings and project details.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-4 shadow-sm hover:shadow transition">
                                            <div className="btn btn-circle btn-sm btn-secondary">
                                                <FiSend />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Apply with Proposal</p>
                                                <p className="text-sm text-base-content/70">
                                                    Submit your proposal and keep everything in one place.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-4 shadow-sm hover:shadow transition">
                                            <div className="btn btn-circle btn-sm btn-accent">
                                                <FiCheckCircle />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Review & Decisions</p>
                                                <p className="text-sm text-base-content/70">
                                                    Supervisors review applications and approve/reject clearly.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-4 shadow-sm hover:shadow transition">
                                            <div className="btn btn-circle btn-sm">
                                                <FiUpload />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Activities & Submissions</p>
                                                <p className="text-sm text-base-content/70">
                                                    Upload submissions only when the supervisor enables it.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 alert">
                                        <FiShield />
                                        <span className="text-sm">
                                            Role-based access: Student / Supervisor / Head Supervisor
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pointer-events-none absolute -bottom-6 -right-6 hidden h-24 w-24 rotate-12 rounded-2xl bg-primary/30 blur-sm lg:block" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="container mx-auto px-4 py-14">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold">Everything your FYP needs</h2>
                    <p className="mt-3 text-base-content/70">
                        Built to match your portal flow: projects → applications → dashboards → activities → submissions.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<FiUsers />}
                        title="Role-based Dashboards"
                        desc="Student, Supervisor, and Head Supervisor dashboards with controlled access."
                    />
                    <FeatureCard
                        icon={<FiSearch />}
                        title="Project Browsing"
                        desc="Students browse available projects with clear details and requirements."
                    />
                    <FeatureCard
                        icon={<FiSend />}
                        title="Proposal Submission"
                        desc="Apply with a proposal and track progress without losing updates."
                    />
                    <FeatureCard
                        icon={<FiCheckCircle />}
                        title="Review & Status Tracking"
                        desc="Decisions and updates are visible, so everyone stays aligned."
                    />
                    <FeatureCard
                        icon={<FiUpload />}
                        title="Controlled File Submissions"
                        desc="Supervisor enables submissions per task—students don’t submit randomly."
                    />
                    <FeatureCard
                        icon={<FiShield />}
                        title="Organized & Secure"
                        desc="Cleaner workflow, fewer mistakes, and better accountability."
                    />
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="bg-base-200">
                <div className="container mx-auto px-4 py-14">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-bold">How it works</h2>
                            <p className="mt-3 text-base-content/70">
                                Simple process for students and supervisors.
                            </p>

                            <ul className="steps steps-vertical mt-6">
                                <li className="step step-primary">Browse projects</li>
                                <li className="step step-primary">Submit proposal</li>
                                <li className="step step-primary">Supervisor review</li>
                                <li className="step step-primary">Track status & feedback</li>
                                <li className="step step-primary">Submit tasks & files</li>
                            </ul>
                        </div>

                        <div className="card bg-base-100 shadow-xl rounded-2xl">
                            <div className="card-body">
                                <h3 className="card-title">Quick actions</h3>
                                <p className="text-base-content/70">
                                    Start exploring now. You can browse projects even before creating an account.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link to="/projects/browse" className="btn btn-primary">
                                        Browse Projects <FiArrowRight className="ml-2" />
                                    </Link>
                                    {!user && (
                                        <>
                                            <Link to="/register" className="btn btn-outline">
                                                Register
                                            </Link>
                                            <Link to="/signIn" className="btn btn-ghost">
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                    {user && (
                                        <Link to={dashboardPath} className="btn btn-outline">
                                            Dashboard
                                        </Link>
                                    )}
                                </div>

                                <div className="divider" />

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-base-200 p-4">
                                        <p className="font-semibold">Students</p>
                                        <p className="text-sm text-base-content/70 mt-1">
                                            Browse, apply, and submit tasks when enabled.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-base-200 p-4">
                                        <p className="font-semibold">Supervisors</p>
                                        <p className="text-sm text-base-content/70 mt-1">
                                            Post projects, review proposals, manage activities/submissions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-center">FAQ</h3>
                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            <Faq
                                q="Can students submit files anytime?"
                                a="No. The supervisor can create a submission section for a specific task, so students submit only when allowed."
                            />
                            <Faq
                                q="Do I need an account to view projects?"
                                a="You can browse projects first. Register when you want to apply and track your progress."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="container mx-auto px-4 py-14">
                <div className="card bg-gradient-to-r from-base-200 to-base-100 border border-base-300 shadow-xl rounded-2xl">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title text-3xl">Ready to start your FYP journey?</h2>
                        <p className="max-w-2xl text-base-content/70">
                            Explore projects, apply with confidence, and keep everything organized — from proposal to submission.
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <Link to="/projects/browse" className="btn btn-primary">
                                Browse Projects <FiArrowRight className="ml-2" />
                            </Link>
                            {!user ? (
                                <Link to="/register" className="btn btn-outline">
                                    Register
                                </Link>
                            ) : (
                                <Link to={dashboardPath} className="btn btn-outline">
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="card bg-base-100 shadow-sm hover:shadow-xl transition rounded-2xl border border-base-200">
            <div className="card-body">
                <div className="flex items-center gap-3">
                    <div className="btn btn-circle btn-outline">{icon}</div>
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <p className="mt-2 text-base-content/70">{desc}</p>
            </div>
        </div>
    );
}

function Faq({ q, a }) {
    return (
        <div className="collapse collapse-arrow bg-base-100 rounded-2xl border border-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-semibold">{q}</div>
            <div className="collapse-content text-base-content/70">
                <p>{a}</p>
            </div>
        </div>
    );
}

export default Home;