import { useState, use, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate } from "react-router";

const SendProposal = () => {
    const { user, role } = use(AuthContext);
    const navigate = useNavigate();

    const [supervisors, setSupervisors] = useState([]);
    const [loadingSup, setLoadingSup] = useState(true);

    const [saving, setSaving] = useState(false);

    const [supervisorUid, setSupervisorUid] = useState("");
    const [projectTitle, setProjectTitle] = useState("");
    const [description, setDescription] = useState("");
    const [technologiesText, setTechnologiesText] = useState("");
    const [duration, setDuration] = useState("");

    // ✅ NEW rich proposal fields
    const [category, setCategory] = useState("Web Application");
    const [department, setDepartment] = useState("Computer Science");
    const [problemStatement, setProblemStatement] = useState("");
    const [methodology, setMethodology] = useState("Scrum");
    const [expectedOutcome, setExpectedOutcome] = useState("");

    const [objectivesText, setObjectivesText] = useState(""); // comma separated
    const [featuresText, setFeaturesText] = useState(""); // comma separated

    // only students
    if (role && role !== "student") {
        return (
            <div className="p-6">
                <p>Only students can submit proposals.</p>
            </div>
        );
    }

    useEffect(() => {
        const loadSupervisors = async () => {
            setLoadingSup(true);
            try {
                const res = await fetch("http://localhost:8000/supervisors");
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load supervisors");
                    setSupervisors([]);
                    return;
                }

                setSupervisors(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
                setSupervisors([]);
            } finally {
                setLoadingSup(false);
            }
        };

        loadSupervisors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.uid) return alert("Please sign in first.");
        if (!supervisorUid) return alert("Please select a supervisor.");
        if (!projectTitle.trim()) return alert("Project title is required.");
        if (!description.trim()) return alert("Description is required.");
        if (!problemStatement.trim()) return alert("Problem statement is required.");

        const technologies = technologiesText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const objectives = objectivesText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const features = featuresText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        setSaving(true);
        try {
            const res = await fetch("http://localhost:8000/applications/proposal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentUid: user.uid,
                    supervisorUid,
                    projectTitle: projectTitle.trim(),
                    details: {
                        year: new Date().getFullYear(),
                        category,
                        department,
                        abstract: description, // ✅ old description stored here
                        problemStatement,
                        objectives,
                        features,
                        technologies,
                        methodology,
                        expectedOutcome,
                        duration
                    }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to send proposal");
                return;
            }

            alert("Proposal submitted successfully!");
            navigate("/dashboard/student");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Send Project Proposal</h1>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow p-6 space-y-4">
                {loadingSup ? (
                    <span className="loading loading-ring loading-lg"></span>
                ) : (
                    <select
                        className="select select-bordered w-full"
                        value={supervisorUid}
                        onChange={(e) => setSupervisorUid(e.target.value)}
                    >
                        <option value="">Select Supervisor</option>
                        {supervisors.map((s) => (
                            <option key={s.firebaseUid} value={s.firebaseUid}>
                                {s.name || "No Name"} ({s.email})
                            </option>
                        ))}
                    </select>
                )}

                <input
                    className="input input-bordered w-full"
                    placeholder="Project Title"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                />

               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="input input-bordered w-full"
                        placeholder="Category (e.g., Web Application)"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <input
                        className="input input-bordered w-full"
                        placeholder="Department (e.g., Computer Science)"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                </div>

                {/* abstract */}
                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Abstract / Description (5-6 lines)"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* ✅ NEW: problem statement */}
                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Problem Statement"
                    rows={4}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                />

                {/* objectives + features */}
                <input
                    className="input input-bordered w-full"
                    placeholder="Objectives (comma separated) e.g., Automate process, Reduce time"
                    value={objectivesText}
                    onChange={(e) => setObjectivesText(e.target.value)}
                />

                <input
                    className="input input-bordered w-full"
                    placeholder="Features (comma separated) e.g., Admin dashboard, Report export"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                />

                <input
                    className="input input-bordered w-full"
                    placeholder="Technologies (comma separated) e.g., React, Node, MongoDB"
                    value={technologiesText}
                    onChange={(e) => setTechnologiesText(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="input input-bordered w-full"
                        placeholder="Methodology  "
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
                    {saving ? "Submitting..." : "Submit Proposal"}
                </button>
            </form>
        </div>
    );
};

export default SendProposal;
