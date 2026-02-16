import { useEffect, useState, use } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const EditProposal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = use(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // form fields
    const [projectTitle, setProjectTitle] = useState("");
    const [category, setCategory] = useState("Web Application");
    const [department, setDepartment] = useState("Computer Science");
    const [abstractText, setAbstractText] = useState("");
    const [problemStatement, setProblemStatement] = useState("");
    const [technologiesText, setTechnologiesText] = useState("");
    const [objectivesText, setObjectivesText] = useState("");
    const [featuresText, setFeaturesText] = useState("");
    const [methodology, setMethodology] = useState("Scrum");
    const [expectedOutcome, setExpectedOutcome] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/applications/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load proposal");
                    navigate(-1);
                    return;
                }

                // security: only student owner can edit
                if (role !== "student") {
                    alert("Only students can edit proposals.");
                    navigate(-1);
                    return;
                }
                if (data.studentUid !== user.uid) {
                    alert("You can only edit your own proposal.");
                    navigate(-1);
                    return;
                }
                if (data.type !== "proposal") {
                    alert("Only proposal applications can be edited.");
                    navigate(-1);
                    return;
                }

                const d = data.details || {};

                setProjectTitle(data.projectTitle || "");
                setCategory(d.category || "Web Application");
                setDepartment(d.department || "Computer Science");
                setAbstractText(d.abstract || "");
                setProblemStatement(d.problemStatement || "");
                setMethodology(d.methodology || "Scrum");
                setExpectedOutcome(d.expectedOutcome || "");
                setDuration(d.duration || "");

                setTechnologiesText(Array.isArray(d.technologies) ? d.technologies.join(", ") : "");
                setObjectivesText(Array.isArray(d.objectives) ? d.objectives.join(", ") : "");
                setFeaturesText(Array.isArray(d.features) ? d.features.join(", ") : "");
            } catch (err) {
                console.log(err);
                alert("Server error");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, navigate, role, user?.uid]);

    // if role is loading, you can keep it simple
    if (!user?.uid) return <div className="p-6">Please sign in.</div>;
    if (loading) return <div className="p-6">Loading...</div>;

    const toArray = (text) =>
        text
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!projectTitle.trim()) return alert("Project title is required.");
        if (!abstractText.trim()) return alert("Abstract is required.");
        if (!problemStatement.trim()) return alert("Problem statement is required.");

        const details = {
            year: new Date().getFullYear(), // you can keep original year if you want later
            category,
            department,
            abstract: abstractText,
            problemStatement,
            objectives: toArray(objectivesText),
            features: toArray(featuresText),
            technologies: toArray(technologiesText),
            methodology,
            expectedOutcome,
            duration
        };

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentUid: user.uid, // ✅ required for backend permission
                    projectTitle: projectTitle.trim(),
                    details
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to save proposal");
                return;
            }

            alert("Proposal updated!");
            navigate(`/applications/${id}`);
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <button className="btn btn-sm" onClick={() => navigate(-1)}>
                Back
            </button>

            <div className="card bg-base-100 shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Edit Proposal</h1>

                <form onSubmit={handleSave} className="space-y-4">
                    <input
                        className="input input-bordered w-full"
                        placeholder="Project Title"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            className="input input-bordered w-full"
                            placeholder="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <input
                            className="input input-bordered w-full"
                            placeholder="Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>

                    <textarea
                        className="textarea textarea-bordered w-full"
                        rows={6}
                        placeholder="Abstract"
                        value={abstractText}
                        onChange={(e) => setAbstractText(e.target.value)}
                    />

                    <textarea
                        className="textarea textarea-bordered w-full"
                        rows={4}
                        placeholder="Problem Statement"
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                    />

                    <input
                        className="input input-bordered w-full"
                        placeholder="Objectives (comma separated)"
                        value={objectivesText}
                        onChange={(e) => setObjectivesText(e.target.value)}
                    />

                    <input
                        className="input input-bordered w-full"
                        placeholder="Features (comma separated)"
                        value={featuresText}
                        onChange={(e) => setFeaturesText(e.target.value)}
                    />

                    <input
                        className="input input-bordered w-full"
                        placeholder="Technologies (comma separated)"
                        value={technologiesText}
                        onChange={(e) => setTechnologiesText(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            className="input input-bordered w-full"
                            placeholder="Methodology"
                            value={methodology}
                            onChange={(e) => setMethodology(e.target.value)}
                        />
                        <input
                            className="input input-bordered w-full"
                            placeholder="Expected Outcome"
                            value={expectedOutcome}
                            onChange={(e) => setExpectedOutcome(e.target.value)}
                        />
                    </div>

                    <input
                        className="input input-bordered w-full"
                        placeholder="Duration (e.g., 12 weeks)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />

                    <button className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProposal;
