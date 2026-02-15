import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { Link } from "react-router";

const MyPosts = () => {
    const { user, role } = use(AuthContext);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (projectId) => {
        if (!confirm("Delete this project?")) return;

        try {
            const res = await fetch(
                `http://localhost:8000/projects/${projectId}?supervisorUid=${user.uid}`,
                { method: "DELETE" }
            );

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to delete");
                return;
            }

            // refresh list
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
            alert("Project deleted");
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };


    useEffect(() => {
        const load = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/projects/mine?supervisorUid=${user.uid}`
                );
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load projects");
                    setProjects([]);
                    return;
                }

                setProjects(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user?.uid]);

    if (role && role !== "supervisor") {
        return (
            <div className="p-6">
                <p>Only supervisors can access this page.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">My Posts</h1>

                <Link to="/projects/add" className="btn btn-sm btn-primary">
                    Add Project
                </Link>
            </div>

            {loading && <span className="loading loading-ring loading-lg"></span>}

            {!loading && projects.length === 0 && (
                <p className="opacity-80">No projects posted yet.</p>
            )}

            {!loading && projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((p) => (
                        <div key={p._id} className="card bg-base-100 shadow p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="text-xl font-semibold">{p.title}</h2>
                                {p.isBooked ? (
                                    <span className="badge badge-error">Booked</span>
                                ) : (
                                    <span className="badge badge-outline">{p.status || "open"}</span>
                                )}
                            </div>

                            {p.description ? (
                                <p className="text-sm opacity-80 mt-2">{p.description}</p>

                            ) : (
                                <p className="text-sm opacity-80 mt-2">{p.shortDescription}</p>
                            )}

                            <div className="mt-4 flex gap-2">
                                <Link to={`/projects/${p._id}`} className="btn btn-xs btn-outline">
                                    View
                                </Link>

                                <Link to={`/projects/edit/${p._id}`} className="btn btn-xs btn-warning">
                                    Edit
                                </Link>

                                <button
                                    className="btn btn-xs btn-error"
                                    onClick={() => handleDelete(p._id)}
                                >
                                    Delete
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
