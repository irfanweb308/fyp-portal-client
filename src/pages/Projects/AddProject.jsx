import { useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate } from "react-router";

const AddProject = () => {
    const { user, role } = use(AuthContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [status, setStatus] = useState("open");
    const [technologiesText, setTechnologiesText] = useState(""); // comma separated
    const [duration, setDuration] = useState("");
    const [supervisorName, setSupervisorName] = useState("");
    const [supervisorEmail, setSupervisorEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) return alert("Please sign in first.");
        if (role !== "supervisor") return alert("Only supervisors can add projects.");

        // convert "React, Node" => ["React","Node"]
        const technologies = technologiesText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const projectData = {
            title,
            description,
            shortDescription,
            status,
            technologies,
            duration,
            supervisorUid: user.uid,
            supervisorName,
            supervisorEmail
        };

        setLoading(true);

        
        try {
            const res = await fetch("http://localhost:8000/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to create project");
                return;
            }

            alert("Project created!");
            navigate("/dashboard/supervisor");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Add Project</h1>

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
                    placeholder="Description (main)"
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
                        placeholder="Project Duration (e.g., 12 weeks)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>

                <input
                    className="input input-bordered w-full"
                    placeholder="Technologies (comma separated) e.g., React, Node, MongoDB"
                    value={technologiesText}
                    onChange={(e) => setTechnologiesText(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="input input-bordered w-full"
                        placeholder="Supervisor Name"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                    />

                    <input
                        className="input input-bordered w-full"
                        placeholder="Supervisor Email"
                        value={supervisorEmail}
                        onChange={(e) => setSupervisorEmail(e.target.value)}
                    />
                </div>

                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Post Project"}
                </button>
            </form>
        </div>
    );
};

export default AddProject;
