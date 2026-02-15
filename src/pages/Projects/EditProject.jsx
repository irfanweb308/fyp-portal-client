import { useEffect, useState, use } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const EditProject = () => {
    const { user, role } = use(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [status, setStatus] = useState("open");
    const [duration, setDuration] = useState("");
    const [technologiesText, setTechnologiesText] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/projects/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load project");
                    navigate("/projects/mine");
                    return;
                }

                setTitle(data.title || "");
                setDescription(data.description || "");
                setShortDescription(data.shortDescription || "");
                setStatus(data.status || "open");
                setDuration(data.duration || "");
                setTechnologiesText(Array.isArray(data.technologies) ? data.technologies.join(", ") : "");
            } catch (err) {
                console.log(err);
                alert("Server error");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) return alert("Please sign in.");
        if (role !== "supervisor") return alert("Only supervisors can edit.");

        const technologies = technologiesText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user.uid, // required by backend
                    title,
                    description,
                    shortDescription,
                    status,
                    duration,
                    technologies
                })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to update project");
                return;
            }

            alert("Project updated!");
            navigate("/projects/mine");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <span className="loading loading-ring loading-lg"></span>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow p-6 space-y-4">
                <input
                    className="input input-bordered w-full"
                    placeholder="Project Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Short Description (5-6 lines)"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                        className="select select-bordered w-full"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="open">open</option>
                        <option value="closed">closed</option>
                    </select>

                    <input
                        className="input input-bordered w-full"
                        placeholder="Duration (e.g., 12 weeks)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>

                <input
                    className="input input-bordered w-full"
                    placeholder="Technologies (comma separated)"
                    value={technologiesText}
                    onChange={(e) => setTechnologiesText(e.target.value)}
                />

                <button className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditProject;
