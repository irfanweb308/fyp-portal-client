import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate, useParams } from "react-router";

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = use(AuthContext);

    const [appDoc, setAppDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // 1) load application
                const res = await fetch(`http://localhost:8000/applications/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load application");
                    navigate(-1);
                    return;
                }

                setAppDoc(data);

                // 2) if normal application, load full project details
                if (data.projectId) {
                    const pres = await fetch(`http://localhost:8000/projects/${data.projectId}`);
                    const pData = await pres.json();

                    // if project was deleted, just skip showing project
                    if (pres.ok) setProject(pData);
                    else setProject(null);
                } else {
                    setProject(null);
                }
            } catch (err) {
                console.log(err);
                alert("Server error");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, navigate]);

    if (loading) return <span className="loading loading-ring loading-lg"></span>;
    if (!appDoc) return null;

    const title = appDoc.projectTitle || "Application";

    const isProposal = appDoc.type === "proposal";
    const d = appDoc.details || {};
    const isOwnerStudent =
        role === "student" && user?.uid && appDoc.studentUid === user.uid;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button className="btn btn-sm mb-4" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="card bg-base-100 shadow p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-3xl font-bold">{title}</h1>

                    {/* ✅ Only student owner can edit proposal */}
                    {isProposal && isOwnerStudent && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/applications/${appDoc._id}/edit`)}
                        >
                            Edit Proposal
                        </button>
                    )}
                </div>

                <div className="flex gap-2 flex-wrap">
                    <span className="badge badge-outline">Type: {appDoc.type || "normal"}</span>
                    <span className="badge badge-outline">Status: {appDoc.status || "pending"}</span>
                </div>

                {/* ========================= */}
                {/* Normal Project Details */}
                {/* ========================= */}
                {project && (
                    <div className="mt-4 space-y-3">
                        <h2 className="text-xl font-semibold">Project Details</h2>

                        <div className="flex gap-2 flex-wrap">
                            {project.status && (
                                <span className="badge badge-outline">Status: {project.status}</span>
                            )}
                            {project.isBooked && <span className="badge badge-error">Booked</span>}
                            {project.duration && (
                                <span className="badge badge-outline">Duration: {project.duration}</span>
                            )}
                        </div>

                        {project.description && (
                            <div>
                                <h3 className="font-semibold">Description</h3>
                                <p className="mt-1 leading-relaxed">{project.description}</p>
                            </div>
                        )}

                        {project.shortDescription && (
                            <div>
                                <h3 className="font-semibold">Short Description</h3>
                                <p className="mt-1 leading-relaxed">{project.shortDescription}</p>
                            </div>
                        )}

                        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                            <div>
                                <h3 className="font-semibold">Technologies</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {project.technologies.map((t, idx) => (
                                        <span key={idx} className="badge badge-primary badge-outline">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(project.supervisorName || project.supervisorEmail) && (
                            <div className="p-4 rounded bg-base-200">
                                <h3 className="font-semibold mb-1">Supervisor</h3>
                                {project.supervisorName && <p>Name: {project.supervisorName}</p>}
                                {project.supervisorEmail && <p>Email: {project.supervisorEmail}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================= */}
                {/* Proposal Details (NEW) */}
                {/* ========================= */}
                {isProposal && (
                    <div className="mt-4 space-y-3">
                        <h2 className="text-xl font-semibold">Proposal Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-4 rounded bg-base-200">
                                <p className="text-sm opacity-70">Category</p>
                                <p className="font-semibold">{d.category || "-"}</p>
                            </div>

                            <div className="p-4 rounded bg-base-200">
                                <p className="text-sm opacity-70">Department</p>
                                <p className="font-semibold">{d.department || "-"}</p>
                            </div>

                            <div className="p-4 rounded bg-base-200">
                                <p className="text-sm opacity-70">Methodology</p>
                                <p className="font-semibold">{d.methodology || "-"}</p>
                            </div>

                            <div className="p-4 rounded bg-base-200">
                                <p className="text-sm opacity-70">Duration</p>
                                <p className="font-semibold">{d.duration || "-"}</p>
                            </div>
                        </div>

                        {d.abstract && (
                            <div>
                                <h3 className="font-semibold">Abstract</h3>
                                <p className="mt-1 leading-relaxed">{d.abstract}</p>
                            </div>
                        )}

                        {d.problemStatement && (
                            <div>
                                <h3 className="font-semibold">Problem Statement</h3>
                                <p className="mt-1 leading-relaxed">{d.problemStatement}</p>
                            </div>
                        )}

                        {Array.isArray(d.technologies) && d.technologies.length > 0 && (
                            <div>
                                <h3 className="font-semibold">Technologies</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {d.technologies.map((t, idx) => (
                                        <span key={idx} className="badge badge-primary badge-outline">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(d.objectives) && d.objectives.length > 0 && (
                            <div>
                                <h3 className="font-semibold">Objectives</h3>
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    {d.objectives.map((o, idx) => (
                                        <li key={idx}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {Array.isArray(d.features) && d.features.length > 0 && (
                            <div>
                                <h3 className="font-semibold">Features</h3>
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    {d.features.map((f, idx) => (
                                        <li key={idx}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {d.expectedOutcome && (
                            <div>
                                <h3 className="font-semibold">Expected Outcome</h3>
                                <p className="mt-1 leading-relaxed">{d.expectedOutcome}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection reason */}
                {appDoc.status === "rejected" && appDoc.rejectionReason && (
                    <div className="p-4 rounded bg-base-200">
                        <h3 className="font-semibold text-error">Rejection Reason</h3>
                        <p className="mt-1">{appDoc.rejectionReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationDetails;
