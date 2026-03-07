import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate, useParams } from "react-router";

const UpdateProgress = () => {
    const { user, role } = use(AuthContext);
    const navigate = useNavigate();
    const { appId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [application, setApplication] = useState(null);
    const [appAccepted, setAppAccepted] = useState(false);

    const [ip1, setIp1] = useState([]);
    const [ip2, setIp2] = useState([]);

    if (role && role !== "student") {
        return (
            <div className="p-6">
                <p>Only students can access this page.</p>
            </div>
        );
    }

    useEffect(() => {
        const loadData = async () => {
            if (!user?.uid || !appId) return;

            setLoading(true);
            try {
                const appRes = await fetch(`http://localhost:8000/applications/${appId}`);
                const appData = await appRes.json();

                if (!appRes.ok) {
                    alert(appData.message || "Failed to load application");
                    navigate("/dashboard/student");
                    return;
                }

                if (appData.studentUid !== user.uid) {
                    alert("You are not allowed to access this progress page.");
                    navigate("/dashboard/student");
                    return;
                }

                const accepted =
                    appData.status === "accepted" || appData.status === "approved";

                setApplication(appData);
                setAppAccepted(accepted);

                if (!accepted) {
                    setIp1([]);
                    setIp2([]);
                    return;
                }

                const progressRes = await fetch(
                    `http://localhost:8000/application-progress/${appId}`
                );
                const progressData = await progressRes.json();

                if (!progressRes.ok) {
                    alert(progressData.message || "Failed to load progress");
                    return;
                }

                setIp1(Array.isArray(progressData.ip1) ? progressData.ip1 : []);
                setIp2(Array.isArray(progressData.ip2) ? progressData.ip2 : []);
            } catch (err) {
                console.log(err);
                alert("Server error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.uid, appId, navigate]);

    const toggleItem = (section, index) => {
        const now = new Date().toISOString();

        if (section === "ip1") {
            setIp1((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            done: !item.done,
                            updatedAt: !item.done ? now : null,
                        }
                        : item
                )
            );
        }

        if (section === "ip2") {
            setIp2((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            done: !item.done,
                            updatedAt: !item.done ? now : null,
                        }
                        : item
                )
            );
        }
    };

    const handleSave = async () => {
        if (!user?.uid) return alert("Please sign in first.");
        if (!appAccepted) return alert("This application is not accepted yet.");

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/application-progress/${appId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ip1, ip2 }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to save progress");
                return;
            }

            alert("Progress updated successfully!");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    const completedIp1 = ip1.filter((item) => item.done).length;
    const completedIp2 = ip2.filter((item) => item.done).length;

    if (loading) {
        return (
            <div className="p-6">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    if (!application) return null;

    if (!appAccepted) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <button className="btn btn-sm mb-4" onClick={() => navigate(-1)}>
                    Back
                </button>

                <div className="card bg-base-100 shadow p-6">
                    <h1 className="text-2xl font-bold mb-4">
                        {application.projectTitle || "Project Progress"}
                    </h1>

                    <div className="alert alert-warning">
                        <span>
                            You can update progress only after this application has been accepted.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button className="btn btn-sm mb-4" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="card bg-base-100 shadow p-6 mb-6">
                <h1 className="text-3xl font-bold">Update Your Progress</h1>
                <p className="mt-2 text-lg">
                    <span className="font-semibold">Project Title:</span>{" "}
                    {application.projectTitle || "Untitled Project"}
                </p>
                <p className="mt-1">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="badge badge-success ml-2">
                        {application.status}
                    </span>
                </p>
            </div>

            <div className="flex justify-end mb-6">
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Progress"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow p-5">
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold">IP1</h2>
                        <p className="text-sm opacity-70 mt-1">
                            Completed: {completedIp1} / {ip1.length}
                        </p>
                        <progress
                            className="progress progress-primary w-full mt-3"
                            value={completedIp1}
                            max={ip1.length || 1}
                        ></progress>
                    </div>

                    <div className="space-y-3">
                        {ip1.map((item, index) => (
                            <label
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-xl bg-base-200 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary mt-1"
                                    checked={!!item.done}
                                    onChange={() => toggleItem("ip1", index)}
                                />

                                <div className="flex-1">
                                    <p
                                        className={
                                            item.done
                                                ? "font-medium line-through opacity-70"
                                                : "font-medium"
                                        }
                                    >
                                        {item.label}
                                    </p>

                                    {item.updatedAt && (
                                        <p className="text-xs opacity-60 mt-1">
                                            Updated: {new Date(item.updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="card bg-base-100 shadow p-5">
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold">IP2</h2>
                        <p className="text-sm opacity-70 mt-1">
                            Completed: {completedIp2} / {ip2.length}
                        </p>
                        <progress
                            className="progress progress-success w-full mt-3"
                            value={completedIp2}
                            max={ip2.length || 1}
                        ></progress>
                    </div>

                    <div className="space-y-3">
                        {ip2.map((item, index) => (
                            <label
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-xl bg-base-200 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-success mt-1"
                                    checked={!!item.done}
                                    onChange={() => toggleItem("ip2", index)}
                                />

                                <div className="flex-1">
                                    <p
                                        className={
                                            item.done
                                                ? "font-medium line-through opacity-70"
                                                : "font-medium"
                                        }
                                    >
                                        {item.label}
                                    </p>

                                    {item.updatedAt && (
                                        <p className="text-xs opacity-60 mt-1">
                                            Updated: {new Date(item.updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProgress;