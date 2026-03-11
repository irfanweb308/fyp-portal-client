import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate, useParams } from "react-router";

const UpdateProgress = () => {
    const { user, role } = use(AuthContext);
    const navigate = useNavigate();
    const { appId } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submittingForm, setSubmittingForm] = useState(false);

    const [application, setApplication] = useState(null);
    const [appAccepted, setAppAccepted] = useState(false);
    const [progressDoc, setProgressDoc] = useState(null);

    const [ip1, setIp1] = useState([]);
    const [ip2, setIp2] = useState([]);

    const [successMessage, setSuccessMessage] = useState("");

    const [completionForm, setCompletionForm] = useState({
        year: "",
        studentName: "",
        category: "",
        status: "Completed",
        technologies: "",
        abstract: "",
        projectCode: "",
        supervisor: "",
        department: "",
        studentId: "",
        deploymentType: "",
        completionDate: "",
        grade: "",
        repositoryLink: "",
        objectives: "",
        features: "",
        problemStatement: "",
    });

    if (role && role !== "student") {
        return (
            <div className="p-6">
                <p>Only students can access this page.</p>
            </div>
        );
    }

    const isAllDone = (items) => {
        if (!Array.isArray(items) || items.length === 0) return false;
        return items.every((item) => item.done);
    };

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
                setProgressDoc(null);
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

            setProgressDoc(progressData);
            setIp1(Array.isArray(progressData.ip1) ? progressData.ip1 : []);
            setIp2(Array.isArray(progressData.ip2) ? progressData.ip2 : []);

            setCompletionForm({
                year: progressData?.completionForm?.year || "",
                studentName: progressData?.completionForm?.studentName || "",
                category: progressData?.completionForm?.category || "",
                status: progressData?.completionForm?.status || "Completed",
                technologies: Array.isArray(progressData?.completionForm?.technologies)
                    ? progressData.completionForm.technologies.join(", ")
                    : "",
                abstract: progressData?.completionForm?.abstract || "",
                projectCode: progressData?.completionForm?.projectCode || "",
                supervisor: progressData?.completionForm?.supervisor || "",
                department: progressData?.completionForm?.department || "",
                studentId: progressData?.completionForm?.studentId || "",
                deploymentType: progressData?.completionForm?.deploymentType || "",
                completionDate: progressData?.completionForm?.completionDate || "",
                grade: progressData?.completionForm?.grade || "",
                repositoryLink: progressData?.completionForm?.repositoryLink || "",
                objectives: Array.isArray(progressData?.completionForm?.objectives)
                    ? progressData.completionForm.objectives.join("\n")
                    : "",
                features: Array.isArray(progressData?.completionForm?.features)
                    ? progressData.completionForm.features.join("\n")
                    : "",
                problemStatement: progressData?.completionForm?.problemStatement || "",
            });
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
            loadData();
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitCompletionForm = async () => {
        if (!user?.uid) return;

        setSubmittingForm(true);
        setSuccessMessage("");

        try {
            const payload = {
                studentUid: user.uid,
                details: {
                    year: completionForm.year,
                    studentName: completionForm.studentName,
                    category: completionForm.category,
                    status: completionForm.status,
                    technologies: completionForm.technologies
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    abstract: completionForm.abstract,
                    projectCode: completionForm.projectCode,
                    supervisor: completionForm.supervisor,
                    department: completionForm.department,
                    studentId: completionForm.studentId,
                    deploymentType: completionForm.deploymentType,
                    completionDate: completionForm.completionDate,
                    grade: completionForm.grade,
                    repositoryLink: completionForm.repositoryLink,
                    objectives: completionForm.objectives
                        .split("\n")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    features: completionForm.features
                        .split("\n")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    problemStatement: completionForm.problemStatement,
                },
            };

            const res = await fetch(
                `http://localhost:8000/application-progress/${appId}/submit-completion-form`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to submit completion form");
                return;
            }

            setSuccessMessage("Completion form submitted successfully.");
            alert("Completion form submitted successfully");
            await loadData();
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleCompletionFormChange = (field, value) => {
        setCompletionForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const completedIp1 = ip1.filter((item) => item.done).length;
    const completedIp2 = ip2.filter((item) => item.done).length;
    const projectCompleted = isAllDone(ip1) && isAllDone(ip2);

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

            {successMessage && (
                <div className="alert alert-success mb-6">
                    <span>{successMessage}</span>
                </div>
            )}

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

            {!projectCompleted && (
                <div className="alert alert-info mt-8">
                    <span>
                        Complete all IP1 and IP2 checklist items before project completion can be submitted.
                    </span>
                </div>
            )}

            {projectCompleted &&
                !progressDoc?.completionFormSent &&
                !progressDoc?.completionFormSubmitted && (
                    <div className="alert alert-warning mt-8">
                        <span>
                            Waiting for your supervisor to send the project completion form.
                        </span>
                    </div>
                )}

            {projectCompleted &&
                progressDoc?.completionFormSent &&
                !progressDoc?.completionFormSubmitted && (
                    <div className="card bg-base-100 shadow p-6 mt-8">
                        <h2 className="text-2xl font-bold mb-4">Project Completion Form</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                className="input input-bordered w-full"
                                placeholder="Year"
                                value={completionForm.year}
                                onChange={(e) =>
                                    handleCompletionFormChange("year", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Student Name"
                                value={completionForm.studentName}
                                onChange={(e) =>
                                    handleCompletionFormChange("studentName", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Category"
                                value={completionForm.category}
                                onChange={(e) =>
                                    handleCompletionFormChange("category", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Status"
                                value={completionForm.status}
                                onChange={(e) =>
                                    handleCompletionFormChange("status", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Project Code"
                                value={completionForm.projectCode}
                                onChange={(e) =>
                                    handleCompletionFormChange("projectCode", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Supervisor"
                                value={completionForm.supervisor}
                                onChange={(e) =>
                                    handleCompletionFormChange("supervisor", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Department"
                                value={completionForm.department}
                                onChange={(e) =>
                                    handleCompletionFormChange("department", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Student ID"
                                value={completionForm.studentId}
                                onChange={(e) =>
                                    handleCompletionFormChange("studentId", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Deployment Type"
                                value={completionForm.deploymentType}
                                onChange={(e) =>
                                    handleCompletionFormChange("deploymentType", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                type="date"
                                value={completionForm.completionDate}
                                onChange={(e) =>
                                    handleCompletionFormChange("completionDate", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Grade"
                                value={completionForm.grade}
                                onChange={(e) =>
                                    handleCompletionFormChange("grade", e.target.value)
                                }
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Repository Link"
                                value={completionForm.repositoryLink}
                                onChange={(e) =>
                                    handleCompletionFormChange("repositoryLink", e.target.value)
                                }
                            />
                        </div>

                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="3"
                            placeholder="Technologies (comma separated)"
                            value={completionForm.technologies}
                            onChange={(e) =>
                                handleCompletionFormChange("technologies", e.target.value)
                            }
                        />

                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="4"
                            placeholder="Abstract"
                            value={completionForm.abstract}
                            onChange={(e) =>
                                handleCompletionFormChange("abstract", e.target.value)
                            }
                        />

                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="4"
                            placeholder="Objectives (one per line)"
                            value={completionForm.objectives}
                            onChange={(e) =>
                                handleCompletionFormChange("objectives", e.target.value)
                            }
                        />

                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="4"
                            placeholder="Features (one per line)"
                            value={completionForm.features}
                            onChange={(e) =>
                                handleCompletionFormChange("features", e.target.value)
                            }
                        />

                        <textarea
                            className="textarea textarea-bordered w-full mt-4"
                            rows="4"
                            placeholder="Problem Statement"
                            value={completionForm.problemStatement}
                            onChange={(e) =>
                                handleCompletionFormChange("problemStatement", e.target.value)
                            }
                        />

                        <div className="mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitCompletionForm}
                                disabled={submittingForm}
                            >
                                {submittingForm
                                    ? "Submitting..."
                                    : "Submit Completion Form"}
                            </button>
                        </div>
                    </div>
                )}

            {progressDoc?.completionFormSubmitted && (
                <div className="alert alert-success mt-8">
                    <span>Your completion form has already been submitted.</span>
                </div>
            )}
        </div>
    );
};

export default UpdateProgress;