import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { Link } from "react-router";

const SupervisorDashboard = () => {
    const { user, role } = use(AuthContext);

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const updateStatus = async (appId, status, reason = "") => {
        try {
            const res = await fetch(`http://localhost:8000/applications/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, reason })
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


    const badgeClass = (status) => {
        if (status === "accepted") return "badge badge-success";
        if (status === "rejected") return "badge badge-error";
        return "badge badge-warning"; // pending
    };

    // optional: block non-supervisor
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

            <div className="card bg-base-100 shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Student Applications</h2>
                <Link to="/projects/add" className="btn btn-sm btn-primary mb-4">
                    Add Project
                </Link>
                <Link to="/projects/mine" className="btn btn-sm btn-outline mb-4 ml-2">
                    My Posts
                </Link>



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
                                    <th>Student ID/Name</th>
                                    <th>Faculty</th>
                                    <th>Year</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {apps.map((a) => (
                                    <tr key={a._id}>
                                        <td>
                                            <div className="font-medium">
                                                {a.projectTitle || "(title not available)"}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="font-semibold">
                                                {a.studentName || "No Name"}
                                            </div>
                                            <div className="text-sm opacity-70">
                                                ID: {a.studentId || "-"}
                                            </div>
                                        </td>



                                        <td>{a.studentFaculty || "-"}</td>

                                        <td>{a.studentAcademicYear || "-"}</td>

                                        <td>{a.studentCurrentSemester || "-"}</td>

                                        <td>
                                            <span className={badgeClass(a.status)}>
                                                {a.status || "pending"}
                                            </span>
                                        </td>

                                        <td className="flex gap-2">
                                            <button
                                                className="btn btn-xs btn-success"
                                                onClick={() => updateStatus(a._id, "accepted")}
                                                disabled={a.status === "accepted"}
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="btn btn-xs btn-error"
                                                onClick={() => {
                                                    const reason = prompt("Reason for rejection:");
                                                    if (!reason || !reason.trim()) {
                                                        alert("Rejection reason is required.");
                                                        return;
                                                    }
                                                    updateStatus(a._id, "rejected", reason);
                                                }}
                                                disabled={a.status === "rejected"}
                                            >
                                                Reject
                                            </button>


                                            <button
                                                className="btn btn-xs"
                                                onClick={() => updateStatus(a._id, "pending")}
                                                disabled={a.status === "pending"}
                                            >
                                                Pending
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
