import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const StudentProgress = () => {
    const { user, role } = use(AuthContext);

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    if (role && role !== "supervisor") {
        return (
            <div className="p-6">
                <p>Only supervisors can access this page.</p>
            </div>
        );
    }

    useEffect(() => {
        const loadStudentProgress = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/supervisors/${user.uid}/student-progress`
                );
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load student progress");
                    setRows([]);
                    return;
                }

                setRows(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
                alert("Server error");
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        loadStudentProgress();
    }, [user?.uid]);

    const doneCount = (items) => {
        if (!Array.isArray(items)) return 0;
        return items.filter((item) => item.done).length;
    };

    const renderChecklist = (items, badgeClass = "badge badge-outline") => {
        if (!Array.isArray(items) || items.length === 0) {
            return <p className="opacity-70">No items found.</p>;
        }

        return (
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-base-200"
                    >
                        <div className="flex-1">
                            <p className={item.done ? "font-medium" : "opacity-70"}>
                                {item.label}
                            </p>

                            {item.done && item.updatedAt && (
                                <p className="text-xs opacity-60 mt-1">
                                    Updated: {new Date(item.updatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>

                        <span className={item.done ? "badge badge-success" : badgeClass}>
                            {item.done ? "Done" : "Pending"}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Student Progress</h1>

            {loading && <span className="loading loading-ring loading-lg"></span>}

            {!loading && rows.length === 0 && (
                <div className="card bg-base-100 shadow p-6">
                    <p>No accepted student progress found.</p>
                </div>
            )}

            {!loading && rows.length > 0 && (
                <div className="space-y-6">
                    {rows.map((row, index) => {
                        const student = row.student || {};
                        const application = row.application || {};
                        const progress = row.progress || {};
                        const ip1 = Array.isArray(progress.ip1) ? progress.ip1 : [];
                        const ip2 = Array.isArray(progress.ip2) ? progress.ip2 : [];

                        return (
                            <div key={row.applicationId || index} className="card bg-base-100 shadow p-6">
                                <div className="mb-5">
                                    <h2 className="text-2xl font-semibold">
                                        {student.name || "Unknown Student"}
                                    </h2>

                                    <div className="mt-2 space-y-1 text-sm">
                                        <p>
                                            <span className="font-semibold">User ID:</span>{" "}
                                            {student.userId || "—"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Email:</span>{" "}
                                            {student.email || "—"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Project:</span>{" "}
                                            {application.projectTitle || progress.projectTitle || "Untitled Project"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Type:</span>{" "}
                                            {application.type || progress.type || "normal"}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Application Status:</span>{" "}
                                            <span className="badge badge-success ml-2">
                                                {application.status || "accepted"}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-base-200">
                                        <h3 className="font-semibold text-lg">IP1 Summary</h3>
                                        <p className="mt-2">
                                            Completed: {doneCount(ip1)} / {ip1.length}
                                        </p>
                                        <progress
                                            className="progress progress-primary w-full mt-3"
                                            value={doneCount(ip1)}
                                            max={ip1.length || 1}
                                        ></progress>
                                    </div>

                                    <div className="p-4 rounded-xl bg-base-200">
                                        <h3 className="font-semibold text-lg">IP2 Summary</h3>
                                        <p className="mt-2">
                                            Completed: {doneCount(ip2)} / {ip2.length}
                                        </p>
                                        <progress
                                            className="progress progress-success w-full mt-3"
                                            value={doneCount(ip2)}
                                            max={ip2.length || 1}
                                        ></progress>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3">IP1</h3>
                                        {renderChecklist(ip1)}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-3">IP2</h3>
                                        {renderChecklist(ip2)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentProgress;