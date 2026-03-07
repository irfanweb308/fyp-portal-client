import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const API = "http://localhost:8000";

const HeadSupervisorDashboard = () => {
    const { user, role } = use(AuthContext);

    const [students, setStudents] = useState([]);
    const [supervisors, setSupervisors] = useState([]);

    const [selectedStudentUid, setSelectedStudentUid] = useState("");
    const [selectedSupervisorUid, setSelectedSupervisorUid] = useState("");

    const [loadingLists, setLoadingLists] = useState(true);

    // ✅ NEW: assignments
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    // ✅ NEW: per-row selection for change supervisor
    const [rowSupervisorPick, setRowSupervisorPick] = useState({}); // { studentUid: supervisorUid }

    // safety: block non-headSupervisor
    if (role && role !== "headSupervisor") {
        return (
            <div className="p-6">
                <p>Only Head Supervisor can access this page.</p>
            </div>
        );
    }

    const loadLists = async () => {
        setLoadingLists(true);
        try {
            const [sRes, spRes] = await Promise.all([
                fetch(`${API}/students`),
                fetch(`${API}/supervisors`),
            ]);

            const sData = await sRes.json();
            const spData = await spRes.json();

            setStudents(Array.isArray(sData) ? sData : []);
            setSupervisors(Array.isArray(spData) ? spData : []);
        } catch (e) {
            console.log(e);
            setStudents([]);
            setSupervisors([]);
        } finally {
            setLoadingLists(false);
        }
    };

    const loadAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const res = await fetch(`${API}/assignments/all`);
            const data = await res.json();

            const arr = Array.isArray(data) ? data : [];
            setAssignments(arr);

            // init row dropdown default selections to current assigned supervisor
            const init = {};
            for (const a of arr) {
                if (a?.studentUid && a?.supervisorUid) init[a.studentUid] = a.supervisorUid;
            }
            setRowSupervisorPick(init);
        } catch (e) {
            console.log(e);
            setAssignments([]);
            setRowSupervisorPick({});
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        loadLists();
        loadAssignments();
    }, []);

    const assign = async () => {
        if (!selectedStudentUid) return alert("Select a student");
        if (!selectedSupervisorUid) return alert("Select a supervisor");

        try {
            const res = await fetch(`${API}/assignments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentUid: selectedStudentUid,
                    supervisorUid: selectedSupervisorUid,
                    assignedByUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Assign failed");

            alert("Assigned successfully ✅");
            // refresh table
            loadAssignments();
        } catch (e) {
            console.log(e);
            alert("Server error");
        }
    };

    // ✅ NEW: change supervisor from table
    const changeSupervisor = async (studentUid) => {
        const supervisorUid = rowSupervisorPick[studentUid];
        if (!studentUid || !supervisorUid) return alert("Select a supervisor");

        try {
            const res = await fetch(`${API}/assignments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentUid,
                    supervisorUid,
                    assignedByUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Update failed");

            alert("Updated ✅");
            loadAssignments();
        } catch (e) {
            console.log(e);
            alert("Server error");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Head Supervisor Dashboard</h1>

            {/* Assign Section */}
            <div className="card bg-base-100 shadow p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Assign Supervisor to Student</h2>

                {loadingLists && <span className="loading loading-ring loading-lg"></span>}

                {!loadingLists && (
                    <div className="grid gap-4 max-w-xl">
                        <div>
                            <label className="label">
                                <span className="label-text">Select Student</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedStudentUid}
                                onChange={(e) => setSelectedStudentUid(e.target.value)}
                            >
                                <option value="">-- choose student --</option>
                                {students.map((s) => (
                                    <option key={s.firebaseUid} value={s.firebaseUid}>
                                        {s.name || "No Name"} ({s.userId || "No ID"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Select Supervisor</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedSupervisorUid}
                                onChange={(e) => setSelectedSupervisorUid(e.target.value)}
                            >
                                <option value="">-- choose supervisor --</option>
                                {supervisors.map((sp) => (
                                    <option key={sp.firebaseUid} value={sp.firebaseUid}>
                                        {sp.name || "No Name"} ({sp.email || "No Email"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="btn btn-primary" onClick={assign}>
                            Assign
                        </button>
                    </div>
                )}
            </div>

            {/* ✅ Assignments Table */}
            <div className="card bg-base-100 shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>

                {loadingAssignments && (
                    <span className="loading loading-ring loading-lg"></span>
                )}

                {!loadingAssignments && assignments.length === 0 && (
                    <p className="opacity-80">No assignments yet.</p>
                )}

                {!loadingAssignments && assignments.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Supervisor</th>
                                    <th>Change Supervisor</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {assignments.map((a) => (
                                    <tr key={a._id}>
                                        <td>
                                            <div>
                                                <div className="font-semibold">
                                                    {a.student?.name || "—"}
                                                </div>
                                                <div className="text-sm opacity-70">
                                                    {a.student?.email || ""}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div>
                                                <div className="font-semibold">
                                                    {a.supervisor?.name || "—"}
                                                </div>
                                                <div className="text-sm opacity-70">
                                                    {a.supervisor?.email || ""}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <select
                                                className="select select-bordered select-sm w-full max-w-xs"
                                                value={rowSupervisorPick[a.studentUid] || ""}
                                                onChange={(e) =>
                                                    setRowSupervisorPick((prev) => ({
                                                        ...prev,
                                                        [a.studentUid]: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="">-- choose supervisor --</option>
                                                {supervisors.map((sp) => (
                                                    <option key={sp.firebaseUid} value={sp.firebaseUid}>
                                                        {sp.name || "No Name"} ({sp.email || "No Email"})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => changeSupervisor(a.studentUid)}
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeadSupervisorDashboard;