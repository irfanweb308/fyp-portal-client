import React, { useEffect, useState } from "react";

const API = "http://localhost:8000";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState("");

    const [loadingList, setLoadingList] = useState(false);
    const [loadingFull, setLoadingFull] = useState(false);

    const [error, setError] = useState("");
    const [selectedUid, setSelectedUid] = useState(null);

    // full payload from /students/:uid/full
    const [full, setFull] = useState(null);

    const [tab, setTab] = useState("details"); // details | applications | supervisor | submissions

    const loadList = async (id = "") => {
        setLoadingList(true);
        setError("");
        setFull(null);
        setSelectedUid(null);

        try {
            const url = id
                ? `${API}/students?studentId=${encodeURIComponent(id)}`
                : `${API}/students`;

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to load students");
                setStudents([]);
            } else {
                setStudents(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.log(e);
            setError("Server error while loading students");
            setStudents([]);
        } finally {
            setLoadingList(false);
        }
    };

    const loadFull = async (studentUid) => {
        if (!studentUid) return;

        setLoadingFull(true);
        setError("");
        setTab("details");
        setSelectedUid(studentUid);
        setFull(null);

        try {
            const res = await fetch(`${API}/students/${studentUid}/full`);
            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || "Failed to load student details");
                setFull(null);
            } else {
                setFull(data);
            }
        } catch (e) {
            console.log(e);
            setError("Server error while loading student details");
            setFull(null);
        } finally {
            setLoadingFull(false);
        }
    };

    useEffect(() => {
        loadList();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadList(studentId.trim());
    };

    const student = full?.student || null;
    const applications = full?.applications || [];
    const supervisor = full?.supervisor || null;
    const submissions = full?.submissions || [];

    // ✅ FIX: pick values from studentProfile if available
    const profile = student?.studentProfile || {};

    const programme = profile.programme || student?.programme || "";
    const intake = profile.intake || student?.intake || "";
    const phone = profile.phone || student?.phone || "";
    const cgpa = profile.cgpa || student?.cgpa || "";
    const github = profile.github || student?.githubLink || student?.github || "";
    const linkedin = profile.linkedin || student?.linkedinLink || student?.linkedin || "";

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold">All Students</h2>
                <p className="text-sm text-base-content/70">
                    Search by Student ID, view details, applications, supervisor assignment and submission history.
                </p>
            </div>

            {/* Search */}
            <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <input
                            className="input input-bordered rounded-xl w-full sm:w-80"
                            placeholder="Search by Student ID (example: 10023)"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                        />
                        <button className="btn btn-primary rounded-xl" type="submit">
                            Search
                        </button>
                        <button
                            className="btn btn-outline rounded-xl"
                            type="button"
                            onClick={() => {
                                setStudentId("");
                                loadList("");
                            }}
                        >
                            Reset
                        </button>

                        {loadingList && (
                            <span className="text-sm text-base-content/70 flex items-center">
                                Loading list...
                            </span>
                        )}
                    </form>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* List + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                {/* Table */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Student List</h3>
                                <span className="text-sm text-base-content/70">
                                    Total: {students.length}
                                </span>
                            </div>

                            <div className="overflow-x-auto mt-3">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => (
                                            <tr key={s._id}>
                                                <td className="font-medium">{s.userId}</td>
                                                <td>{s.name}</td>
                                                <td>{s.email}</td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-sm btn-outline rounded-xl"
                                                        onClick={() => loadFull(s.firebaseUid)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {!loadingList && students.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center text-base-content/60">
                                                    No students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-2 text-xs text-base-content/60">
                                Click “View” to load details + applications + submissions.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div>
                    <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-sm">
                        <div className="card-body">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold">Student Panel</h3>
                                {loadingFull && (
                                    <span className="text-xs text-base-content/60">Loading...</span>
                                )}
                            </div>

                            {!selectedUid ? (
                                <p className="text-sm text-base-content/70 mt-2">
                                    Select a student from the list to view details.
                                </p>
                            ) : !full ? (
                                <p className="text-sm text-base-content/70 mt-2">
                                    {loadingFull ? "Loading student details..." : "No details loaded."}
                                </p>
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div role="tablist" className="tabs tabs-boxed mt-2">
                                        <button
                                            role="tab"
                                            className={`tab ${tab === "details" ? "tab-active" : ""}`}
                                            onClick={() => setTab("details")}
                                            type="button"
                                        >
                                            Details
                                        </button>
                                        <button
                                            role="tab"
                                            className={`tab ${tab === "applications" ? "tab-active" : ""}`}
                                            onClick={() => setTab("applications")}
                                            type="button"
                                        >
                                            Applications ({applications.length})
                                        </button>
                                        <button
                                            role="tab"
                                            className={`tab ${tab === "supervisor" ? "tab-active" : ""}`}
                                            onClick={() => setTab("supervisor")}
                                            type="button"
                                        >
                                            Supervisor
                                        </button>
                                        <button
                                            role="tab"
                                            className={`tab ${tab === "submissions" ? "tab-active" : ""}`}
                                            onClick={() => setTab("submissions")}
                                            type="button"
                                        >
                                            Submissions ({submissions.length})
                                        </button>
                                    </div>

                                    {/* Tab content */}
                                    <div className="mt-3">
                                        {/* ✅ DETAILS TAB */}
                                        {tab === "details" && student && (
                                            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                                <div className="flex justify-center">
                                                    {student.image ? (
                                                        <img
                                                            src={student.image}
                                                            alt="Student"
                                                            className="w-28 h-28 rounded-full object-cover border border-base-300"
                                                        />
                                                    ) : (
                                                        <div className="w-28 h-28 rounded-full bg-base-200 flex items-center justify-center text-sm text-base-content/60">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                <Info label="Name" value={student.name} />
                                                <Info label="Student ID" value={student.userId} />
                                                <Info label="Faculty" value={student.faculty} />
                                                <Info label="Academic Year" value={student.academicYear} />
                                                <Info label="Current Semester" value={student.currentSemester} />
                                                <Info label="Programme" value={programme} />
                                                <Info label="CGPA" value={cgpa} />
                                                <Info label="Intake / Batch" value={intake} />
                                                <Info label="Phone Number" value={phone} />
                                                <LinkField label="GitHub Link" value={github} />
                                                <LinkField label="LinkedIn Link" value={linkedin} />
                                            </div>
                                        )}

                                        {/* ✅ Applications (NORMAL + PROPOSAL) */}
                                        {tab === "applications" && (
                                            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                                {applications.length === 0 ? (
                                                    <div className="text-sm text-base-content/70">
                                                        No applications found for this student.
                                                    </div>
                                                ) : (
                                                    applications.map((a) => {
                                                        const isProposalApp = a.type === "proposal";

                                                        return (
                                                            <div key={a._id} className="rounded-xl border border-base-200 p-4">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <div className="font-semibold text-base">
                                                                            {a.projectTitle || "Untitled"}
                                                                        </div>
                                                                        <div className="text-xs text-base-content/60 mt-1">
                                                                            Type: {isProposalApp ? "proposal" : "application"} • Created:{" "}
                                                                            {a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}
                                                                        </div>
                                                                    </div>

                                                                    <span className="badge badge-outline">{a.status || "-"}</span>
                                                                </div>

                                                                {a.rejectionReason && (
                                                                    <div className="mt-3">
                                                                        <div className="text-xs text-base-content/60">Rejection Reason</div>
                                                                        <div className="text-sm font-medium break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                                                                            {a.rejectionReason}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* ✅ show different details by type */}
                                                                <div className="mt-4 space-y-2">
                                                                    {isProposalApp ? (
                                                                        <>
                                                                            {/* PROPOSAL DETAILS (from a.details) */}
                                                                            <Field label="Academic Year" value={a.details?.year} />
                                                                            <Field label="Category" value={a.details?.category} />
                                                                            <Field label="Department" value={a.details?.department} />
                                                                            <Field label="Methodology" value={a.details?.methodology} />
                                                                            <Field label="Duration" value={a.details?.duration} />

                                                                            <Field label="Abstract" value={a.details?.abstract} multiline />
                                                                            <Field label="Problem Statement" value={a.details?.problemStatement} multiline />

                                                                            <ListField label="Objectives" items={a.details?.objectives} />
                                                                            <ListField label="Features" items={a.details?.features} />
                                                                            <ListField label="Technologies" items={a.details?.technologies} />

                                                                            <Field label="Expected Outcome" value={a.details?.expectedOutcome} multiline />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* NORMAL APPLICATION DETAILS (from a.applicationForm) */}
                                                                            <Field
                                                                                label="Why you want to do this project?"
                                                                                value={a.applicationForm?.motivation}
                                                                                multiline
                                                                            />
                                                                            <Field
                                                                                label="Can you complete the project on time?"
                                                                                value={a.applicationForm?.canCompleteOnTime}
                                                                                multiline
                                                                            />
                                                                            <Field
                                                                                label="Can you finish the project?"
                                                                                value={a.applicationForm?.canFinishProject}
                                                                                multiline
                                                                            />
                                                                            <Field
                                                                                label="Plan from start to end"
                                                                                value={a.applicationForm?.plan}
                                                                                multiline
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {/* Supervisor */}
                                        {tab === "supervisor" && (
                                            <div className="space-y-2">
                                                {!supervisor ? (
                                                    <div className="text-sm text-base-content/70">
                                                        No current supervisor assignment found (no approved/accepted application).
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-base-200 p-3">
                                                        <div className="font-semibold">{supervisor.name}</div>
                                                        <div className="text-sm text-base-content/80 mt-1">
                                                            <div>
                                                                <span className="font-medium">Staff ID:</span>{" "}
                                                                {supervisor.userId || "-"}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Email:</span>{" "}
                                                                {supervisor.email || "-"}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Firebase UID:</span>{" "}
                                                                {supervisor.firebaseUid || "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Submissions */}
                                        {tab === "submissions" && (
                                            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                                                {submissions.length === 0 ? (
                                                    <div className="text-sm text-base-content/70">
                                                        No student submissions found.
                                                    </div>
                                                ) : (
                                                    submissions.map((f) => (
                                                        <div key={f._id} className="rounded-xl border border-base-200 p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="font-semibold">{f.fileName || "File"}</div>
                                                                <span className="text-xs text-base-content/60">
                                                                    {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "-"}
                                                                </span>
                                                            </div>

                                                            <div className="text-sm text-base-content/80 mt-2 space-y-1">
                                                                <div>
                                                                    <span className="font-medium">Activity Title:</span>{" "}
                                                                    {f.activityTitle || "-"}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">File URL:</span>{" "}
                                                                    <a
                                                                        className="link link-primary break-all"
                                                                        href={`${API}${f.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        {f.fileUrl}
                                                                    </a>
                                                                </div>
                                                                <div className="text-xs text-base-content/60">
                                                                    Activity ID: {f.activityId}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            className="btn btn-sm btn-ghost rounded-xl"
                                            onClick={() => {
                                                setSelectedUid(null);
                                                setFull(null);
                                            }}
                                            type="button"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-base-content/60">
                        Note: This page is for Head Supervisor only.
                    </div>
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div className="rounded-xl border border-base-200 p-3">
        <div className="text-xs text-base-content/60">{label}</div>
        <div className="font-medium break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
            {value || "-"}
        </div>
    </div>
);

const LinkField = ({ label, value }) => (
    <div className="rounded-xl border border-base-200 p-3">
        <div className="text-xs text-base-content/60">{label}</div>
        {value ? (
            <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="link link-primary break-all"
            >
                {value}
            </a>
        ) : (
            <div className="font-medium">-</div>
        )}
    </div>
);

const Field = ({ label, value, multiline }) => (
    <div className="rounded-xl border border-base-200 p-3">
        <div className="text-xs text-base-content/60">{label}</div>
        <div
            className={`font-medium break-words [overflow-wrap:anywhere] ${multiline ? "whitespace-pre-wrap" : ""
                }`}
        >
            {value !== undefined && value !== null && String(value).trim() !== "" ? value : "-"}
        </div>
    </div>
);

const ListField = ({ label, items }) => {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    return (
        <div className="rounded-xl border border-base-200 p-3">
            <div className="text-xs text-base-content/60">{label}</div>
            {list.length === 0 ? (
                <div className="font-medium">-</div>
            ) : (
                <ul className="list-disc ml-5 mt-1 space-y-1">
                    {list.map((x, idx) => (
                        <li key={idx} className="font-medium break-words [overflow-wrap:anywhere]">
                            {x}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Students;