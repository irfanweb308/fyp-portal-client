
import { useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { use } from "react";
import { Link } from "react-router";

const BrowseProjects = () => {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, role } = use(AuthContext);

    const loadProjects = async (keyword = "") => {

        setLoading(true);
        try {
            const url = keyword
                ? `http://localhost:8000/projects?search=${encodeURIComponent(keyword)}`
                : `http://localhost:8000/projects`;

            const res = await fetch(url);
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.log(err);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadProjects(search);
    };

    const handleApply = async (project) => {
        if (!user) {
            alert("Please sign in first.");
            return;
        }

        if (role !== "student") {
            alert("Only students can apply.");
            return;
        }

        const applicationData = {
            studentUid: user.uid,
            projectId: project._id,
            supervisorUid: project.supervisorUid
        };

        try {
            const res = await fetch("http://localhost:8000/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to apply");
                return;
            }

            alert("Application submitted successfully!");
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Browse Projects</h1>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    className="input input-bordered w-full"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-neutral">Search</button>
            </form>

            {loading && <span className="loading loading-ring loading-lg"></span>}

            {!loading && projects.length === 0 && (
                <p>No projects found.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                    <div key={p._id} className="card bg-base-100 shadow p-4">
                        <h2 className="text-xl font-semibold">{p.title}</h2>
                        <p className="text-sm opacity-80 mt-2">{p.description}</p>
                        <div className="mt-4 gap-2 flex">
                            <Link to={`/projects/${p._id}`} className="btn btn-sm btn-outline">
                                View Details
                            </Link>
                            <button className="btn btn-sm btn-primary" onClick={() => handleApply(p)}>
                                Apply
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrowseProjects;
