import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/projects/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load project");
                    navigate("/projects/browse");
                    return;
                }

                setProject(data);
            } catch (err) {
                console.log(err);
                alert("Server error");
                navigate("/projects/browse");
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id, navigate]);

    if (loading) return <span className="loading loading-ring loading-lg"></span>;
    if (!project) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button className="btn btn-sm mb-4" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="card bg-base-100 shadow p-6">
                <h1 className="text-3xl font-bold">{project.title}</h1>

                {/* Main Description */}
                {project.description && (
                    <p className="mt-4 leading-relaxed">{project.description}</p>
                )}

                {/* Short Description */}
                {project.shortDescription && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Short Description</h3>
                        <p className="mt-2 leading-relaxed">{project.shortDescription}</p>
                    </div>
                )}

                {/* Badges */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {project.status && (
                        <span className="badge badge-outline">Status: {project.status}</span>
                    )}
                    {project.duration && (
                        <span className="badge badge-outline">Duration: {project.duration}</span>
                    )}
                </div>

                {/* Technologies */}
                {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <div className="mt-5">
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

                {/* Supervisor info */}
                {(project.supervisorName || project.supervisorEmail) && (
                    <div className="mt-6 p-4 rounded bg-base-200">
                        <h3 className="font-semibold mb-2">Supervisor</h3>
                        {project.supervisorName && <p>Name: {project.supervisorName}</p>}
                        {project.supervisorEmail && <p>Email: {project.supervisorEmail}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
