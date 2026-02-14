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
        <div className="p-6 max-w-3xl mx-auto">
            <button className="btn btn-sm mb-4" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="card bg-base-100 shadow p-6">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="mt-4 leading-relaxed">{project.description}</p>

                <div className="mt-6 flex gap-2">
                    <span className="badge badge-outline">Status: {project.status}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
