import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { Link } from "react-router";

const SupervisorDashboard = () => {
    const { user, role } = use(AuthContext);

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    // My students state
    const [myStudents, setMyStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    const loadApplications = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const res = await fetch(
                `http://localhost:8000/applications?supervisorUid=${user.uid}`
            );
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to load applications");
                setApps([]);
                return;
            }

            setApps(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setApps([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, [user?.uid]);

    // Load my students
    useEffect(() => {
        const loadMyStudents = async () => {
            try {
                if (!user?.uid) return;

                setLoadingStudents(true);
                const res = await fetch(`http://localhost:8000/supervisors/${user.uid}/students`);
                const data = await res.json();

                setMyStudents(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log(e);
                setMyStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        loadMyStudents();
    }, [user?.uid]);

    const updateStatus = async (appId, status, reason = "") => {
        try {
            const res = await fetch(`http://localhost:8000/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, reason }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to update status");
                return;
            }

            loadApplications();
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    const deleteApplication = async (appId) => {
        const ok = confirm("Are you sure you want to delete this application?");
        if (!ok) return;

        try {
            const res = await fetch(`http://localhost:8000/applications/${appId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete application");
                return;
            }

            alert("Application deleted successfully");
            loadApplications();
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    // Simple supervisor-only guard
    if (role && role !== "supervisor") {
        return (
            <div className="p-6">
                <p>Only supervisors can access this page.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Supervisor Dashboard</h1>

            {/* My Students Section */}
            <div className="card bg-base-100 shadow p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3">My Students</h2>

                {loadingStudents && <span className="loading loading-ring loading-lg"></span>}

                {!loadingStudents && myStudents.length === 0 && (
                    <p>No students assigned to you yet.</p>
                )}

                {!loadingStudents && myStudents.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>User ID</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myStudents.map((s) => (
                                    <tr key={s.firebaseUid}>
                                        <td>{s.name || "—"}</td>
                                        <td>{s.userId || "—"}</td>
                                        <td>{s.email || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card bg-base-100 shadow p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Link to="/projects/add" className="btn btn-sm btn-primary">
                        Add Project
                    </Link>

                    <Link to="/projects/mine" className="btn btn-sm btn-outline">
                        My Posted Projects
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <span className="loading loading-ring loading-lg"></span>
                    </div>
                ) : apps.length === 0 ? (
                    <p>No applications yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Project</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {apps.map((a) => (
                                    <tr key={a._id}>
                                        <td>
                                            <div>
                                                <div className="font-semibold">{a.studentName || "N/A"}</div>
                                                <div className="text-sm opacity-70">{a.studentEmail || ""}</div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="font-semibold">{a.projectTitle || "N/A"}</div>
                                        </td>

                                        <td>
                                            <span className="badge badge-info">
                                                {a.type === "proposal" ? "Proposal" : "Normal Application"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge badge-outline">{a.status || "pending"}</span>
                                            {a.reason && (
                                                <div className="text-xs opacity-70 mt-1">Reason: {a.reason}</div>
                                            )}
                                        </td>

                                        <td>
                                            <Link to={`/applications/${a._id}`} className="btn btn-xs btn-outline">
                                                View
                                            </Link>
                                        </td>

                                        <td className="flex flex-wrap gap-2">
                                            <button
                                                className="btn btn-xs btn-success"
                                                onClick={() => updateStatus(a._id, "accepted")}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                className="btn btn-xs btn-error"
                                                onClick={() => {
                                                    const reason = prompt("Reason for rejection?");
                                                    updateStatus(a._id, "rejected", reason || "");
                                                }}
                                            >
                                                Reject
                                            </button>

                                            <button
                                                className="btn btn-xs btn-warning"
                                                onClick={() => updateStatus(a._id, "pending")}
                                            >
                                                Pending
                                            </button>

                                            <button
                                                className="btn btn-xs btn-outline btn-error"
                                                onClick={() => deleteApplication(a._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupervisorDashboard;