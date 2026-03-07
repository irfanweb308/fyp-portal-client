import { useEffect, useState, use } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const StudentDashboard = () => {
    const { user } = use(AuthContext);

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    // My Supervisor
    const [mySupervisor, setMySupervisor] = useState(null);
    const [loadingSupervisor, setLoadingSupervisor] = useState(true);

    // load my supervisor
    useEffect(() => {
        const loadMySupervisor = async () => {
            if (!user?.uid) return;

            setLoadingSupervisor(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/students/${user.uid}/supervisor`
                );
                const data = await res.json();
                setMySupervisor(data || null);
            } catch (err) {
                console.log(err);
                setMySupervisor(null);
            } finally {
                setLoadingSupervisor(false);
            }
        };

        loadMySupervisor();
    }, [user?.uid]);

    // existing applications load
    useEffect(() => {
        const loadApplications = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/applications?studentUid=${user.uid}`
                );
                const data = await res.json();
                setApps(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
                setApps([]);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, [user?.uid]);

    const badgeClass = (status) => {
        if (status === "accepted") return "badge badge-success";
        if (status === "rejected") return "badge badge-error";
        return "badge badge-warning";
    };

    const isAccepted = (status) => status === "accepted" || status === "approved";

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

            {/* My Supervisor Card */}
            <div className="card bg-base-100 shadow p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3">My Supervisor</h2>

                {loadingSupervisor && (
                    <span className="loading loading-ring loading-lg"></span>
                )}

                {!loadingSupervisor && !mySupervisor && (
                    <p className="opacity-80">No supervisor assigned to you yet.</p>
                )}

                {!loadingSupervisor && mySupervisor?.supervisor && (
                    <div className="space-y-1">
                        <p>
                            <span className="font-semibold">Name:</span>{" "}
                            {mySupervisor.supervisor.name || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {mySupervisor.supervisor.email || "—"}
                        </p>
                        <p>
                            <span className="font-semibold">User ID:</span>{" "}
                            {mySupervisor.supervisor.userId || "—"}
                        </p>
                    </div>
                )}
            </div>

            {/* My Applications */}
            <div className="card bg-base-100 shadow p-4">
                <h2 className="text-xl font-semibold mb-4">My Applications</h2>

                <div className="mb-4">
                    <Link to="/applications/proposal" className="btn btn-sm btn-primary">
                        Send Proposal
                    </Link>
                </div>

                {loading && <span className="loading loading-ring loading-lg"></span>}

                {!loading && apps.length === 0 && (
                    <p className="opacity-80">No applications yet.</p>
                )}

                {!loading && apps.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>

                            <tbody>
                                {apps.map((a) => (
                                    <tr key={a._id}>
                                        <td>{a.projectTitle || "Unknown Project"}</td>

                                        <td>
                                            <span className={badgeClass(a.status)}>
                                                {a.status || "pending"}
                                            </span>
                                        </td>

                                        <td className="space-y-1">
                                            {a.projectId ? (
                                                <Link
                                                    to={`/projects/${a.projectId}`}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    View Project
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/applications/${a._id}`}
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    View Proposal
                                                </Link>
                                            )}

                                            {a.status === "rejected" && a.rejectionReason && (
                                                <div className="text-xs text-error">
                                                    Reason: {a.rejectionReason}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {isAccepted(a.status) ? (
                                                <Link
                                                    to={`/dashboard/student/progress/${a._id}`}
                                                    className="btn btn-xs btn-primary"
                                                >
                                                    Update Your Progress
                                                </Link>
                                            ) : (
                                                <span className="opacity-50">-</span>
                                            )}
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

export default StudentDashboard;