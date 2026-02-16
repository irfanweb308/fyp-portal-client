import { useEffect, useState } from "react";

const CompletedProjects = () => {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // track which cards are expanded
    const [openMap, setOpenMap] = useState({}); // { [id]: true/false }

    const toggleOpen = (id) => {
        setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const load = async (q = "") => {
        setLoading(true);
        try {
            const url = q
                ? `http://localhost:8000/completed-projects?search=${encodeURIComponent(q)}`
                : `http://localhost:8000/completed-projects`;

            const res = await fetch(url);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);

            // reset open states when results change
            setOpenMap({});
        } catch (err) {
            console.error(err);
            setItems([]);
            setOpenMap({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load("");
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        load(search);
    };

    return (
        <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
                Completed Projects
            </h2>
            <p style={{ marginTop: 0, color: "#555" }}>
                Search by project title to check uniqueness.
            </p>

            <form
                onSubmit={handleSearch}
                style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                }}
            >
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by project title..."
                    style={{
                        padding: 10,
                        flex: 1,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #333",
                        cursor: "pointer",
                    }}
                >
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        load("");
                    }}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        background: "#fff",
                    }}
                >
                    Reset
                </button>
            </form>

            {loading && <p style={{ marginTop: 12 }}>Loading...</p>}

            {!loading && items.length === 0 && (
                <div
                    style={{
                        marginTop: 12,
                        padding: 14,
                        borderRadius: 10,
                        border: "1px dashed #bbb",
                        color: "#666",
                    }}
                >
                    No completed projects found.
                </div>
            )}

            <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {items.map((p) => {
                    const d = p.details || {};
                    const isOpen = !!openMap[p._id];

                    return (
                        <div
                            key={p._id}
                            style={{
                                border: "1px solid #e5e5e5",
                                borderRadius: 12,
                                padding: 14,
                                background: "#fff",
                            }}
                        >
                            {/* Top row */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    alignItems: "flex-start",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                                        {p.title}
                                    </h3>

                                    {/* Small summary line */}
                                    <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>
                                        <span style={{ marginRight: 10 }}>
                                            <b>Year:</b> {d.year ?? "-"}
                                        </span>
                                        <span style={{ marginRight: 10 }}>
                                            <b>Student:</b> {d.studentName ?? "-"}
                                        </span>
                                        <span style={{ marginRight: 10 }}>
                                            <b>Category:</b> {d.category ?? "-"}
                                        </span>
                                        <span>
                                            <b>Status:</b> {d.status ?? "-"}
                                        </span>
                                    </div>

                                    {/* Tech pills */}
                                    {Array.isArray(d.technologies) && d.technologies.length > 0 && (
                                        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {d.technologies.slice(0, 6).map((t, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        fontSize: 12,
                                                        padding: "4px 8px",
                                                        borderRadius: 999,
                                                        border: "1px solid #ddd",
                                                        background: "#f7f7f7",
                                                    }}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                            {d.technologies.length > 6 && (
                                                <span style={{ fontSize: 12, color: "#666" }}>
                                                    +{d.technologies.length - 6} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expand button */}
                                <button
                                    onClick={() => toggleOpen(p._id)}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #333",
                                        cursor: "pointer",
                                        background: isOpen ? "#111" : "#fff",
                                        color: isOpen ? "#fff" : "#111",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {isOpen ? "Hide details" : "View details"}
                                </button>
                            </div>

                            {/* Dropdown details */}
                            {isOpen && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        paddingTop: 12,
                                        borderTop: "1px solid #eee",
                                        display: "grid",
                                        gap: 10,
                                    }}
                                >
                                    {/* Abstract */}
                                    {d.abstract && (
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 4 }}>Abstract</div>
                                            <div style={{ color: "#444", lineHeight: 1.5 }}>{d.abstract}</div>
                                        </div>
                                    )}

                                    {/* Two column grid */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 10,
                                        }}
                                    >
                                        <Info label="Project Code" value={d.projectCode} />
                                        <Info label="Supervisor" value={d.supervisor} />
                                        <Info label="Department" value={d.department} />
                                        <Info label="Student ID" value={d.studentId} />
                                        <Info label="Deployment" value={d.deploymentType} />
                                        <Info label="Completion Date" value={d.completionDate} />
                                        <Info label="Grade" value={d.grade} />
                                        <Info label="Repository" value={d.repositoryLink} isLink />
                                    </div>

                                    {/* Objectives */}
                                    {Array.isArray(d.objectives) && d.objectives.length > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 4 }}>Objectives</div>
                                            <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
                                                {d.objectives.map((o, idx) => (
                                                    <li key={idx}>{o}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Features */}
                                    {Array.isArray(d.features) && d.features.length > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 4 }}>Features</div>
                                            <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
                                                {d.features.map((f, idx) => (
                                                    <li key={idx}>{f}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Problem statement */}
                                    {d.problemStatement && (
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 4 }}>Problem Statement</div>
                                            <div style={{ color: "#444", lineHeight: 1.5 }}>{d.problemStatement}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// small helper component
const Info = ({ label, value, isLink }) => {
    const v = value ?? "-";

    return (
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
            {isLink && v !== "-" ? (
                <a href={v} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>
                    {v}
                </a>
            ) : (
                <div style={{ fontWeight: 800 }}>{v}</div>
            )}
        </div>
    );
};

export default CompletedProjects;
