import { useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { use } from "react";
import { Link } from "react-router";

const BrowseProjects = () => {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const { user, role } = use(AuthContext);

    // ✅ Apply modal (normal application)
    const [applyOpen, setApplyOpen] = useState(false);
    const [applyProject, setApplyProject] = useState(null);
    const [applyForm, setApplyForm] = useState({
        motivation: "",
        canCompleteOnTime: "",
        canFinishProject: "",
        plan: "",
    });

    // ✅ NEW: assigned supervisor info for student
    const [assignedSupervisorUid, setAssignedSupervisorUid] = useState("");
    const [loadingAssign, setLoadingAssign] = useState(false);

    // ✅ NEW: load student supervisor assignment
    useEffect(() => {
        const loadMySupervisor = async () => {
            // only students need this filtering
            if (role !== "student") return;

            // if not logged in, we can't fetch assignment
            if (!user?.uid) {
                setAssignedSupervisorUid("");
                return;
            }

            setLoadingAssign(true);
            try {
                const res = await fetch(`http://localhost:8000/students/${user.uid}/supervisor`);
                const data = await res.json();

                if (!data || !data?.assignment?.supervisorUid) {
                    setAssignedSupervisorUid("");
                } else {
                    setAssignedSupervisorUid(data.assignment.supervisorUid);
                }
            } catch (err) {
                console.log(err);
                setAssignedSupervisorUid("");
            } finally {
                setLoadingAssign(false);
            }
        };

        loadMySupervisor();
    }, [user?.uid, role]);

    const loadProjects = async (keyword = "") => {
        setLoading(true);
        try {
            const url = keyword
                ? `http://localhost:8000/projects?search=${encodeURIComponent(keyword)}`
                : `http://localhost:8000/projects`;

            const res = await fetch(url);
            const data = await res.json();

            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadProjects(search);
    };

    // ✅ Open modal instead of direct apply
    const openApplyModal = (project) => {
        if (!user) {
            alert("Please sign in first.");
            return;
        }

        if (role !== "student") {
            alert("Only students can apply.");
            return;
        }

        // ✅ block if no assigned supervisor
        if (!assignedSupervisorUid) {
            alert("No supervisor assigned to you yet. Please contact Head Supervisor.");
            return;
        }

        // ✅ block if trying to apply outside assigned supervisor projects
        if (project.supervisorUid !== assignedSupervisorUid) {
            alert("You can only apply to projects posted by your assigned supervisor.");
            return;
        }

        setApplyProject(project);
        setApplyForm({
            motivation: "",
            canCompleteOnTime: "",
            canFinishProject: "",
            plan: "",
        });
        setApplyOpen(true);
    };

    // ✅ Submit modal application
    const submitApplication = async (e) => {
        e.preventDefault();

        if (!user?.uid) {
            alert("Please sign in first.");
            return;
        }
        if (role !== "student") {
            alert("Only students can apply.");
            return;
        }
        if (!applyProject?._id) {
            alert("Project not selected");
            return;
        }

        const required = ["motivation", "canCompleteOnTime", "canFinishProject", "plan"];
        const missing = required.filter((k) => !String(applyForm[k] || "").trim());
        if (missing.length) {
            alert("Please fill all fields before submitting.");
            return;
        }

        const applicationData = {
            type: "application",
            studentUid: user.uid,
            projectId: applyProject._id,
            supervisorUid: applyProject.supervisorUid,
            projectTitle: applyProject.title,
            applicationForm: {
                motivation: String(applyForm.motivation).trim(),
                canCompleteOnTime: String(applyForm.canCompleteOnTime).trim(),
                canFinishProject: String(applyForm.canFinishProject).trim(),
                plan: String(applyForm.plan).trim(),
            },
        };

        try {
            const res = await fetch("http://localhost:8000/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to apply");
                return;
            }

            alert("Application submitted successfully!");
            setApplyOpen(false);
            setApplyProject(null);
            loadProjects(search);
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    // ✅ filter projects shown to students by assigned supervisor
    const visibleProjects = useMemo(() => {
        if (role !== "student") return projects;

        // student but not assigned => show none
        if (!assignedSupervisorUid) return [];

        return projects.filter((p) => p.supervisorUid === assignedSupervisorUid);
    }, [projects, role, assignedSupervisorUid]);

    // ✅ For students: show assignment loading state on top
    const showStudentAssignmentWarning =
        role === "student" && user?.uid && !loadingAssign && !assignedSupervisorUid;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Browse Projects</h1>

            {/* ✅ NEW: student assignment status */}
            {role === "student" && user?.uid && (
                <div className="mb-4">
                    {loadingAssign ? (
                        <span className="loading loading-ring loading-lg"></span>
                    ) : showStudentAssignmentWarning ? (
                        <div className="alert alert-warning">
                            <span>
                                No supervisor assigned to you yet. You cannot view/apply projects until Head Supervisor assigns you.
                            </span>
                        </div>
                    ) : (
                        <div className="alert alert-success">
                            <span>
                                You can only view projects posted by your assigned supervisor.
                            </span>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    className="input input-bordered w-full"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={role === "student" && user?.uid && !assignedSupervisorUid}
                />
                <button
                    className="btn btn-neutral"
                    disabled={role === "student" && user?.uid && !assignedSupervisorUid}
                >
                    Search
                </button>
            </form>

            {loading && <span className="loading loading-ring loading-lg"></span>}

            {!loading && visibleProjects.length === 0 && (
                <p>No projects found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleProjects.map((p) => (
                    <div key={p._id} className="card bg-base-100 shadow p-4">
                        <h2 className="text-xl font-semibold">{p.title}</h2>

                        <p className="text-sm opacity-80 mt-2">{p.description}</p>

                        <div className="mt-2 flex gap-2">
                            <span className="badge badge-outline">Status: {p.status}</span>

                            {p.isBooked && (
                                <span className="badge badge-error">Booked</span>
                            )}
                        </div>

                        <div className="mt-4 gap-2 flex">
                            <Link to={`/projects/${p._id}`} className="btn btn-sm btn-outline">
                                View Details
                            </Link>

                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => openApplyModal(p)}
                                disabled={
                                    p.isBooked ||
                                    (role === "student" && user?.uid && !assignedSupervisorUid)
                                }
                            >
                                {p.isBooked ? "Booked" : "Apply"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ Apply Modal (Normal Application) */}
            {applyOpen && (
                <div className="modal modal-open">
                    <div className="modal-box rounded-2xl">
                        <h3 className="font-bold text-lg">Apply for Project</h3>
                        <p className="text-sm text-base-content/70 mt-1">
                            Please answer all questions before submitting.
                        </p>

                        {applyProject && (
                            <div className="mt-3 p-3 rounded-xl bg-base-200">
                                <div className="text-xs text-base-content/60">Project</div>
                                <div className="font-semibold">{applyProject.title}</div>
                            </div>
                        )}

                        <form onSubmit={submitApplication} className="mt-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium">Why you want to do this project?</label>
                                <textarea
                                    className="textarea textarea-bordered w-full rounded-xl mt-1"
                                    value={applyForm.motivation}
                                    onChange={(e) =>
                                        setApplyForm((prev) => ({ ...prev, motivation: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Can you complete the project on time?</label>
                                <textarea
                                    className="textarea textarea-bordered w-full rounded-xl mt-1"
                                    value={applyForm.canCompleteOnTime}
                                    onChange={(e) =>
                                        setApplyForm((prev) => ({ ...prev, canCompleteOnTime: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Can you finish the project?</label>
                                <textarea
                                    className="textarea textarea-bordered w-full rounded-xl mt-1"
                                    value={applyForm.canFinishProject}
                                    onChange={(e) =>
                                        setApplyForm((prev) => ({ ...prev, canFinishProject: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    What is your plan to finish the project from start to end?
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full rounded-xl mt-1"
                                    value={applyForm.plan}
                                    onChange={(e) => setApplyForm((prev) => ({ ...prev, plan: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost rounded-xl"
                                    onClick={() => {
                                        setApplyOpen(false);
                                        setApplyProject(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary rounded-xl">
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseProjects;