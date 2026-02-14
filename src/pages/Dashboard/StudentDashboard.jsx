import { useEffect, useState, use } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const StudentDashboard = () => {
    const { user } = use(AuthContext);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

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
        return "badge badge-warning"; // pending default
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

            <div className="card bg-base-100 shadow p-4">
                <h2 className="text-xl font-semibold mb-4">My Applications</h2>

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
                                </tr>
                            </thead>

                            <tbody>
                                {apps.map((a) => (
                                    <tr key={a._id}>
                                        <td>{a.project?.title || "Unknown Project"}</td>

                                        <td>
                                            <span className={badgeClass(a.status)}>
                                                {a.status || "pending"}
                                            </span>
                                        </td>

                                        <td>
                                            <Link
                                                to={`/projects/${a.projectId}`}
                                                className="btn btn-xs btn-outline"
                                            >
                                                View
                                            </Link>
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
