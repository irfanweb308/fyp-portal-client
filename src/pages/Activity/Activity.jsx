import { useEffect, useState, useMemo, use, useRef } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import {
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
    FiChevronRight,
    FiChevronDown,
    FiUploadCloud,
    FiFileText,
} from "react-icons/fi";

const API = "http://localhost:8000";

const Activity = () => {
    const { user, role } = use(AuthContext);

    const [activities, setActivities] = useState([]);
    const [selected, setSelected] = useState(null);

    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Sections
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionFiles, setSectionFiles] = useState([]);

    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionType, setSectionType] = useState("group");
    const [parentSectionId, setParentSectionId] = useState("");
    const [creatingSection, setCreatingSection] = useState(false);

    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editSectionTitle, setEditSectionTitle] = useState("");
    const [editSectionType, setEditSectionType] = useState("group");
    const [savingSectionEdit, setSavingSectionEdit] = useState(false);

    // Tasks
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskInstructions, setTaskInstructions] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskPoints, setTaskPoints] = useState("");
    const [creatingTask, setCreatingTask] = useState(false);

    // Supervisor view task submissions
    const [openTaskId, setOpenTaskId] = useState(null);
    const [taskFiles, setTaskFiles] = useState([]);
    const [taskFilesLoading, setTaskFilesLoading] = useState(false);

    // Student own submissions map
    const [mySubmissionsMap, setMySubmissionsMap] = useState({});

    // Student details modal (supervisor)
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsUser, setDetailsUser] = useState(null);

    // Activity title edit
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // tree expand
    const [expandedIds, setExpandedIds] = useState({});

    // success animation
    const [successOpen, setSuccessOpen] = useState(false);
    const successTimerRef = useRef(null);

    const viewerQuery = useMemo(() => {
        if (!user?.uid || !role) return "";
        return `?viewerUid=${encodeURIComponent(user.uid)}&viewerRole=${encodeURIComponent(role)}`;
    }, [user?.uid, role]);

    const showSuccessAnimation = () => {
        setSuccessOpen(true);

        if (successTimerRef.current) {
            clearTimeout(successTimerRef.current);
        }

        successTimerRef.current = setTimeout(() => {
            setSuccessOpen(false);
        }, 1800);
    };

    useEffect(() => {
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, []);

    const loadActivities = async () => {
        try {
            const res = await fetch(`${API}/activities${viewerQuery}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setActivities(list);

            if (selected?._id) {
                const still = list.find((x) => x._id === selected._id);
                if (still) {
                    setSelected(still);
                } else {
                    setSelected(list[0] || null);
                }
            } else if (list.length > 0) {
                setSelected(list[0]);
            }
        } catch (e) {
            console.log(e);
            setActivities([]);
        }
    };

    const loadSections = async (activityId) => {
        try {
            const res = await fetch(`${API}/activities/${activityId}/sections${viewerQuery}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setSections(list);

            if (selectedSection?._id) {
                const still = list.find((x) => x._id === selectedSection._id);
                if (still) {
                    setSelectedSection(still);
                } else {
                    setSelectedSection(null);
                }
            }
        } catch (e) {
            console.log(e);
            setSections([]);
            setSelectedSection(null);
        }
    };

    const loadSectionFiles = async (sectionId) => {
        try {
            const res = await fetch(`${API}/sections/${sectionId}/files${viewerQuery}`);
            const data = await res.json();
            setSectionFiles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log(e);
            setSectionFiles([]);
        }
    };

    const loadTasks = async (sectionId) => {
        setTasksLoading(true);
        try {
            const res = await fetch(`${API}/sections/${sectionId}/tasks${viewerQuery}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setTasks(list);

            if (role === "student") {
                await loadStudentSubmissionsForTasks(list);
            }
        } catch (e) {
            console.log(e);
            setTasks([]);
            if (role === "student") setMySubmissionsMap({});
        } finally {
            setTasksLoading(false);
        }
    };

    const loadTaskFiles = async (taskId) => {
        setTaskFilesLoading(true);
        try {
            const res = await fetch(`${API}/tasks/${taskId}/files${viewerQuery}`);
            const data = await res.json();
            setTaskFiles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log(e);
            setTaskFiles([]);
        } finally {
            setTaskFilesLoading(false);
        }
    };

    const loadStudentSubmissionsForTasks = async (taskList) => {
        try {
            const results = await Promise.all(
                taskList.map(async (task) => {
                    try {
                        const res = await fetch(`${API}/tasks/${task._id}/files${viewerQuery}`);
                        const data = await res.json();
                        return [task._id, Array.isArray(data) ? data : []];
                    } catch {
                        return [task._id, []];
                    }
                })
            );

            const map = Object.fromEntries(results);
            setMySubmissionsMap(map);
        } catch (e) {
            console.log(e);
            setMySubmissionsMap({});
        }
    };

    useEffect(() => {
        if (!user?.uid || !role) return;
        loadActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, role, viewerQuery]);

    useEffect(() => {
        if (!selected?._id) {
            setSections([]);
            setSelectedSection(null);
            setSectionFiles([]);
            setTasks([]);
            setTaskFiles([]);
            setOpenTaskId(null);
            setMySubmissionsMap({});
            return;
        }

        loadSections(selected._id);
        setSectionFiles([]);
        setTasks([]);
        setTaskFiles([]);
        setOpenTaskId(null);
        setMySubmissionsMap({});
        setFile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?._id, viewerQuery]);

    useEffect(() => {
        if (!selectedSection?._id) {
            setSectionFiles([]);
            setTasks([]);
            setTaskFiles([]);
            setOpenTaskId(null);
            setMySubmissionsMap({});
            return;
        }

        setSectionFiles([]);
        setTasks([]);
        setTaskFiles([]);
        setOpenTaskId(null);
        setMySubmissionsMap({});
        setFile(null);

        if (selectedSection.type === "materials") {
            loadSectionFiles(selectedSection._id);
        } else if (selectedSection.type === "submission") {
            loadTasks(selectedSection._id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection?._id, viewerQuery]);

    const createActivity = async (e) => {
        e.preventDefault();
        if (role !== "supervisor") return alert("Only supervisor can create activity.");
        if (!newTitle.trim()) return alert("Title required");

        setCreating(true);
        try {
            const res = await fetch(`${API}/activities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    createdBySupervisorUid: user?.uid,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to create activity");
                return;
            }

            setNewTitle("");
            await loadActivities();
            alert("✅ Activity created!");
        } catch (e2) {
            console.log(e2);
            alert("Server error");
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (activity) => {
        setSelected(activity);
        setEditingId(activity._id);
        setEditTitle(activity.title || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const saveEdit = async (activityId) => {
        if (!editTitle.trim()) return alert("Title required");
        setSavingEdit(true);

        try {
            const res = await fetch(`${API}/activities/${activityId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Update failed");
                return;
            }

            setEditingId(null);
            setEditTitle("");
            await loadActivities();
        } catch (e) {
            console.log(e);
            alert("Server error");
        } finally {
            setSavingEdit(false);
        }
    };

    const deleteActivity = async (activityId) => {
        const ok = confirm("Are you sure you want to delete this activity?");
        if (!ok) return;

        try {
            const res = await fetch(`${API}/activities/${activityId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Delete failed");
                return;
            }

            if (selected?._id === activityId) {
                setSelected(null);
                setSelectedSection(null);
            }

            await loadActivities();
            alert("✅ Activity deleted");
        } catch (e) {
            console.log(e);
            alert("Server error");
        }
    };

    const createSection = async (e) => {
        e.preventDefault();
        if (role !== "supervisor") return alert("Only supervisor can create sections.");
        if (!selected?._id) return alert("Select an activity first.");
        if (!sectionTitle.trim()) return alert("Section title required");

        setCreatingSection(true);
        try {
            const res = await fetch(`${API}/activities/${selected._id}/sections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: sectionTitle.trim(),
                    type: sectionType,
                    parentSectionId: parentSectionId || null,
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to create section");
                return;
            }

            setSectionTitle("");
            setSectionType("group");
            setParentSectionId("");

            await loadSections(selected._id);
            alert("✅ Section created");

            if (parentSectionId) {
                setExpandedIds((prev) => ({ ...prev, [parentSectionId]: true }));
            }
        } catch (e) {
            console.log(e);
            alert("Server error");
        } finally {
            setCreatingSection(false);
        }
    };

    const startSectionEdit = (section) => {
        setSelectedSection(section);
        setEditingSectionId(section._id);
        setEditSectionTitle(section.title || "");
        setEditSectionType(section.type || "group");
    };

    const cancelSectionEdit = () => {
        setEditingSectionId(null);
        setEditSectionTitle("");
        setEditSectionType("group");
    };

    const saveSectionEdit = async (sectionId) => {
        if (!editSectionTitle.trim()) return alert("Section title required");

        setSavingSectionEdit(true);
        try {
            const res = await fetch(`${API}/sections/${sectionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editSectionTitle.trim(),
                    type: editSectionType,
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to update section");
                return;
            }

            setEditingSectionId(null);
            setEditSectionTitle("");
            setEditSectionType("group");
            await loadSections(selected._id);
            alert("✅ Section updated");
        } catch (e) {
            console.log(e);
            alert("Server error");
        } finally {
            setSavingSectionEdit(false);
        }
    };

    const deleteSection = async (sectionId) => {
        const ok = confirm("Delete this section/subsection?");
        if (!ok) return;

        try {
            const res = await fetch(`${API}/sections/${sectionId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Delete failed");
                return;
            }

            if (selectedSection?._id === sectionId) {
                setSelectedSection(null);
                setSectionFiles([]);
                setTasks([]);
                setTaskFiles([]);
                setOpenTaskId(null);
                setMySubmissionsMap({});
            }

            await loadSections(selected._id);
            alert("✅ Section deleted");
        } catch (e) {
            console.log(e);
            alert("Server error");
        }
    };

    const uploadSectionFile = async () => {
        if (!selectedSection?._id) return alert("Select a materials subsection first.");
        if (selectedSection.type !== "materials") return alert("Upload is only for materials subsection.");
        if (!file) return alert("Select a file first.");
        if (role !== "supervisor") return alert("Only supervisor can upload here.");

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("uploaderUid", user?.uid || "");

            const res = await fetch(`${API}/sections/${selectedSection._id}/upload`, {
                method: "POST",
                body: fd,
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Upload failed");
                return;
            }

            setFile(null);
            await loadSectionFiles(selectedSection._id);
            alert("✅ File uploaded!");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setUploading(false);
        }
    };

    const deleteSectionFile = async (fileId) => {
        const ok = confirm("Delete this file?");
        if (!ok) return;

        try {
            const res = await fetch(`${API}/sections/files/${fileId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Delete failed");
                return;
            }

            if (selectedSection?._id) {
                await loadSectionFiles(selectedSection._id);
            }
        } catch (e) {
            console.log(e);
            alert("Server error");
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        if (role !== "supervisor") return alert("Only supervisor can create task.");
        if (!selectedSection?._id) return alert("Select a submission subsection first.");
        if (selectedSection.type !== "submission") return alert("Tasks can only be created in submission subsection.");
        if (!taskTitle.trim()) return alert("Task title required");

        setCreatingTask(true);
        try {
            const res = await fetch(`${API}/sections/${selectedSection._id}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: taskTitle.trim(),
                    instructions: taskInstructions.trim(),
                    dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
                    totalPoints: taskPoints ? Number(taskPoints) : 0,
                    allowSubmissions: false,
                    createdBySupervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed to create task");
                return;
            }

            setTaskTitle("");
            setTaskInstructions("");
            setTaskDueDate("");
            setTaskPoints("");

            await loadTasks(selectedSection._id);
            alert("✅ Task created (submission CLOSED).");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setCreatingTask(false);
        }
    };

    const toggleSubmission = async (taskId, nextOpen) => {
        if (role !== "supervisor") return;

        try {
            const res = await fetch(`${API}/tasks/${taskId}/submission`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                    allowSubmissions: !!nextOpen,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Failed");
                return;
            }

            if (selectedSection?._id) {
                await loadTasks(selectedSection._id);
            }
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    const submitToTask = async (task) => {
        if (role !== "student") return;
        if (!file) return alert("Select a file first.");
        if (!task?.allowSubmissions) return alert("Submission is closed for this task.");

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("studentUid", user?.uid || "");

            const res = await fetch(`${API}/tasks/${task._id}/submit`, {
                method: "POST",
                body: fd,
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Submit failed");
                return;
            }

            setFile(null);
            showSuccessAnimation();

            if (openTaskId === task._id) {
                await loadTaskFiles(task._id);
            }

            if (selectedSection?._id) {
                await loadTasks(selectedSection._id);
            }
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setUploading(false);
        }
    };

    const toggleViewSubmissions = async (taskId) => {
        if (openTaskId === taskId) {
            setOpenTaskId(null);
            setTaskFiles([]);
            return;
        }
        setOpenTaskId(taskId);
        await loadTaskFiles(taskId);
    };

    const openStudentDetails = async (studentUid) => {
        if (!studentUid) return;

        setDetailsOpen(true);
        setDetailsLoading(true);
        setDetailsUser(null);

        try {
            const res = await fetch(`${API}/users/${studentUid}`);
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to load student details");
                setDetailsOpen(false);
                return;
            }

            setDetailsUser(data);
        } catch (e) {
            console.log(e);
            alert("Server error");
            setDetailsOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeStudentDetails = () => {
        setDetailsOpen(false);
        setDetailsUser(null);
    };

    const topLevelSections = useMemo(
        () => sections.filter((s) => !s.parentSectionId),
        [sections]
    );

    const sectionTree = useMemo(() => {
        const byParent = {};

        for (const s of sections) {
            const key = s.parentSectionId || "root";
            if (!byParent[key]) byParent[key] = [];
            byParent[key].push(s);
        }

        for (const key in byParent) {
            byParent[key].sort((a, b) => {
                const oa = Number(a.order || 0);
                const ob = Number(b.order || 0);
                if (oa !== ob) return oa - ob;
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            });
        }

        const build = (parentId = "root") => {
            return (byParent[parentId] || []).map((item) => ({
                ...item,
                children: build(String(item._id)),
            }));
        };

        return build();
    }, [sections]);

    const toggleExpand = (sectionId) => {
        setExpandedIds((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const renderSectionTypeBadge = (type) => {
        if (type === "materials") return <span className="badge badge-info badge-sm">Materials</span>;
        if (type === "submission") return <span className="badge badge-success badge-sm">Submission</span>;
        return <span className="badge badge-ghost badge-sm">Group</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Activity</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* LEFT SIDE - ACTIVITIES */}
                <div className="md:col-span-3">
                    <div className="card bg-base-100 shadow p-4">
                        <h2 className="font-semibold mb-2">Activities</h2>

                        {activities.map((a) => (
                            <div
                                key={a._id}
                                className={`flex items-center gap-2 rounded-lg border p-2 mb-2 ${selected?._id === a._id ? "border-primary" : "border-base-300"
                                    }`}
                            >
                                <button
                                    onClick={() => {
                                        setSelected(a);
                                        if (editingId && editingId !== a._id) cancelEdit();
                                        setSelectedSection(null);
                                        cancelSectionEdit();
                                    }}
                                    className={`flex-1 text-left px-3 py-2 rounded-md transition ${selected?._id === a._id
                                            ? "bg-primary text-primary-content"
                                            : "hover:bg-base-200"
                                        }`}
                                    title="Open activity"
                                    type="button"
                                >
                                    <div className="font-medium truncate">{a.title}</div>
                                </button>

                                {role === "supervisor" && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            type="button"
                                            onClick={() => startEdit(a)}
                                            title="Edit activity"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>

                                        <button
                                            className="btn btn-sm btn-error"
                                            type="button"
                                            onClick={() => deleteActivity(a._id)}
                                            title="Delete activity"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}

                        {role === "supervisor" && (
                            <form onSubmit={createActivity} className="mt-3">
                                <input
                                    className="input input-bordered w-full mb-2"
                                    placeholder="New Activity Title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm w-full" disabled={creating}>
                                    {creating ? "Creating..." : "Create"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* MIDDLE - SECTIONS TREE */}
                <div className="md:col-span-4">
                    <div className="card bg-base-100 shadow p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-semibold">Sections</h2>
                            {selected && (
                                <div className="text-xs opacity-70 truncate max-w-[180px]">
                                    {selected.title}
                                </div>
                            )}
                        </div>

                        {!selected ? (
                            <div className="opacity-70">Select an activity first.</div>
                        ) : sectionTree.length === 0 ? (
                            <div className="opacity-70">No sections yet.</div>
                        ) : (
                            <div className="space-y-1">
                                {sectionTree.map((node) => (
                                    <SectionNode
                                        key={node._id}
                                        node={node}
                                        level={0}
                                        selectedSection={selectedSection}
                                        expandedIds={expandedIds}
                                        toggleExpand={toggleExpand}
                                        onSelect={(section) => {
                                            setSelectedSection(section);
                                            if (editingSectionId && editingSectionId !== section._id) {
                                                cancelSectionEdit();
                                            }
                                        }}
                                        onEdit={startSectionEdit}
                                        onDelete={deleteSection}
                                        role={role}
                                    />
                                ))}
                            </div>
                        )}

                        {role === "supervisor" && selected && (
                            <form onSubmit={createSection} className="mt-4 border-t pt-4">
                                <div className="font-semibold mb-2">Create Section / Subsection</div>

                                <input
                                    className="input input-bordered w-full mb-2"
                                    placeholder="Section title"
                                    value={sectionTitle}
                                    onChange={(e) => setSectionTitle(e.target.value)}
                                />

                                <select
                                    className="select select-bordered w-full mb-2"
                                    value={sectionType}
                                    onChange={(e) => setSectionType(e.target.value)}
                                >
                                    <option value="group">Group Section</option>
                                    <option value="materials">Materials Subsection</option>
                                    <option value="submission">Submission Subsection</option>
                                </select>

                                <select
                                    className="select select-bordered w-full mb-2"
                                    value={parentSectionId}
                                    onChange={(e) => setParentSectionId(e.target.value)}
                                >
                                    <option value="">Top Level Section</option>
                                    {topLevelSections.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.title}
                                        </option>
                                    ))}
                                </select>

                                <button className="btn btn-primary btn-sm w-full" disabled={creatingSection}>
                                    {creatingSection ? "Creating..." : "Create"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - DETAILS */}
                <div className="md:col-span-5">
                    <div className="card bg-base-100 shadow p-5">
                        <div className="mb-4">
                            {!selected ? (
                                <h2 className="font-semibold">Select Activity</h2>
                            ) : role === "supervisor" && editingId === selected._id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="input input-bordered w-full"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        autoFocus
                                    />

                                    <button
                                        className="btn btn-sm btn-success"
                                        type="button"
                                        onClick={() => saveEdit(selected._id)}
                                        disabled={savingEdit}
                                        title="Save"
                                    >
                                        <FiCheck size={16} />
                                    </button>

                                    <button className="btn btn-sm" type="button" onClick={cancelEdit} title="Cancel">
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-semibold">{selected?.title || "Select Activity"}</h2>

                                    {role === "supervisor" && selected && (
                                        <button
                                            className="btn btn-sm btn-outline"
                                            type="button"
                                            onClick={() => startEdit(selected)}
                                            title="Edit activity title"
                                        >
                                            <FiEdit2 size={16} /> <span className="hidden sm:inline">Edit</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {!selected ? (
                            <div className="opacity-70">Select an activity from the left.</div>
                        ) : !selectedSection ? (
                            <div className="opacity-70">Select a section or subsection from the middle panel.</div>
                        ) : role === "supervisor" && editingSectionId === selectedSection._id ? (
                            <div className="border rounded-lg p-4">
                                <div className="font-semibold mb-3">Edit Section</div>

                                <input
                                    className="input input-bordered w-full mb-2"
                                    value={editSectionTitle}
                                    onChange={(e) => setEditSectionTitle(e.target.value)}
                                />

                                <select
                                    className="select select-bordered w-full mb-3"
                                    value={editSectionType}
                                    onChange={(e) => setEditSectionType(e.target.value)}
                                >
                                    <option value="group">Group Section</option>
                                    <option value="materials">Materials Subsection</option>
                                    <option value="submission">Submission Subsection</option>
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-sm btn-success"
                                        type="button"
                                        onClick={() => saveSectionEdit(selectedSection._id)}
                                        disabled={savingSectionEdit}
                                    >
                                        <FiCheck size={16} />
                                        {savingSectionEdit ? "Saving..." : "Save"}
                                    </button>

                                    <button className="btn btn-sm" type="button" onClick={cancelSectionEdit}>
                                        <FiX size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedSection.title}</h3>
                                        <div className="mt-1">{renderSectionTypeBadge(selectedSection.type)}</div>
                                    </div>

                                    {role === "supervisor" && (
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                type="button"
                                                onClick={() => startSectionEdit(selectedSection)}
                                            >
                                                <FiEdit2 size={16} />
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-error"
                                                type="button"
                                                onClick={() => deleteSection(selectedSection._id)}
                                            >
                                                <FiTrash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {selectedSection.type === "group" && (
                                    <div className="opacity-70">
                                        This is a group section. Create or select a subsection under it.
                                    </div>
                                )}

                                {selectedSection.type === "materials" && (
                                    <>
                                        <div className="mb-4">
                                            <input
                                                type="file"
                                                className="file-input file-input-bordered w-full mb-2"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />

                                            {role === "supervisor" ? (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={uploadSectionFile}
                                                    disabled={uploading}
                                                >
                                                    {uploading ? "Uploading..." : "Upload File"}
                                                </button>
                                            ) : (
                                                <div className="text-sm opacity-70">
                                                    This section is for materials only. Download files below.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-2">
                                            <h4 className="font-semibold mb-2">Files</h4>

                                            {sectionFiles.length === 0 ? (
                                                <div className="opacity-70">No files uploaded yet.</div>
                                            ) : (
                                                sectionFiles.map((f) => (
                                                    <div
                                                        key={f._id}
                                                        className="flex justify-between items-center border rounded p-3 mb-2"
                                                    >
                                                        <span className="font-medium break-all">{f.fileName}</span>

                                                        <div className="flex gap-2">
                                                            <a
                                                                className="btn btn-sm btn-outline"
                                                                href={`${API}${f.fileUrl}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Download
                                                            </a>

                                                            {role === "supervisor" && (
                                                                <button
                                                                    className="btn btn-sm btn-error"
                                                                    type="button"
                                                                    onClick={() => deleteSectionFile(f._id)}
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === "submission" && (
                                    <>
                                        <div className="mb-4">
                                            <input
                                                type="file"
                                                className="file-input file-input-bordered w-full mb-2"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />

                                            {role === "student" && (
                                                <div className="text-sm opacity-70">
                                                    Choose a file first, then submit or resubmit inside a task below.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">Tasks</h4>
                                                <button
                                                    className="btn btn-sm"
                                                    type="button"
                                                    onClick={() => selectedSection?._id && loadTasks(selectedSection._id)}
                                                    disabled={tasksLoading}
                                                >
                                                    {tasksLoading ? "Loading..." : "Refresh"}
                                                </button>
                                            </div>

                                            {role === "supervisor" && (
                                                <form onSubmit={createTask} className="border rounded p-3 mb-3">
                                                    <div className="font-semibold mb-2">Create Task</div>

                                                    <input
                                                        className="input input-bordered w-full mb-2"
                                                        placeholder="Task title"
                                                        value={taskTitle}
                                                        onChange={(e) => setTaskTitle(e.target.value)}
                                                    />

                                                    <textarea
                                                        className="textarea textarea-bordered w-full mb-2"
                                                        placeholder="Instructions (optional)"
                                                        value={taskInstructions}
                                                        onChange={(e) => setTaskInstructions(e.target.value)}
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                        <input
                                                            type="date"
                                                            className="input input-bordered w-full"
                                                            value={taskDueDate}
                                                            onChange={(e) => setTaskDueDate(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="input input-bordered w-full"
                                                            placeholder="Total points"
                                                            value={taskPoints}
                                                            onChange={(e) => setTaskPoints(e.target.value)}
                                                        />
                                                    </div>

                                                    <button className="btn btn-primary btn-sm w-full" disabled={creatingTask}>
                                                        {creatingTask ? "Creating..." : "Create (submission CLOSED)"}
                                                    </button>
                                                </form>
                                            )}

                                            {tasks.length === 0 ? (
                                                <div className="opacity-70">No tasks yet.</div>
                                            ) : (
                                                tasks.map((t) => {
                                                    const mySubmissions = mySubmissionsMap[t._id] || [];
                                                    const hasSubmitted = mySubmissions.length > 0;

                                                    return (
                                                        <div key={t._id} className="border rounded p-3 mb-2">
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                                <div>
                                                                    <div className="font-medium">{t.title}</div>
                                                                    {!!t.instructions && (
                                                                        <div className="text-sm opacity-80 mt-1">
                                                                            {t.instructions}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs opacity-70 mt-1">
                                                                        Submission:{" "}
                                                                        <span className={t.allowSubmissions ? "text-success" : "text-error"}>
                                                                            {t.allowSubmissions ? "OPEN" : "CLOSED"}
                                                                        </span>
                                                                        {t.dueDate ? (
                                                                            <span> • Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                                                                        ) : null}
                                                                        {typeof t.totalPoints === "number" && t.totalPoints > 0 ? (
                                                                            <span> • Points: {t.totalPoints}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2 flex-wrap">
                                                                    {role === "supervisor" && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline"
                                                                            type="button"
                                                                            onClick={() => toggleViewSubmissions(t._id)}
                                                                        >
                                                                            {openTaskId === t._id ? "Hide Submissions" : "View Submissions"}
                                                                        </button>
                                                                    )}

                                                                    {role === "supervisor" && (
                                                                        <button
                                                                            className={`btn btn-sm ${t.allowSubmissions ? "btn-error" : "btn-success"
                                                                                }`}
                                                                            type="button"
                                                                            onClick={() => toggleSubmission(t._id, !t.allowSubmissions)}
                                                                        >
                                                                            {t.allowSubmissions ? "Close Submission" : "Open Submission"}
                                                                        </button>
                                                                    )}

                                                                    {role === "student" && (
                                                                        <button
                                                                            className="btn btn-sm btn-primary"
                                                                            type="button"
                                                                            disabled={!t.allowSubmissions || uploading}
                                                                            onClick={() => submitToTask(t)}
                                                                        >
                                                                            {!t.allowSubmissions
                                                                                ? "Submission Closed"
                                                                                : uploading
                                                                                    ? "Submitting..."
                                                                                    : hasSubmitted
                                                                                        ? "Resubmit"
                                                                                        : "Make a Submission"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {role === "student" && (
                                                                <div className="mt-3 border-t pt-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FiFileText className="opacity-70" />
                                                                        <div className="font-medium">My Submissions</div>
                                                                        <span className="badge badge-outline badge-sm">
                                                                            {mySubmissions.length}
                                                                        </span>
                                                                    </div>

                                                                    {mySubmissions.length === 0 ? (
                                                                        <div className="text-sm opacity-70">
                                                                            No submission yet.
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            {mySubmissions.map((sf, index) => (
                                                                                <div
                                                                                    key={sf._id}
                                                                                    className="flex items-center justify-between border rounded-lg p-3"
                                                                                >
                                                                                    <div>
                                                                                        <div className="font-medium break-all">
                                                                                            {sf.fileName}
                                                                                        </div>
                                                                                        <div className="text-xs opacity-70">
                                                                                            Attempt {mySubmissions.length - index}
                                                                                            {sf.uploadedAt
                                                                                                ? ` • ${new Date(sf.uploadedAt).toLocaleString()}`
                                                                                                : ""}
                                                                                        </div>
                                                                                    </div>

                                                                                    <a
                                                                                        className="btn btn-sm btn-outline"
                                                                                        href={`${API}${sf.fileUrl}`}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                    >
                                                                                        View
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {role === "supervisor" && openTaskId === t._id && (
                                                                <div className="mt-3 border-t pt-3">
                                                                    {taskFilesLoading ? (
                                                                        <div className="opacity-70">Loading submissions...</div>
                                                                    ) : taskFiles.length === 0 ? (
                                                                        <div className="opacity-70">No submissions yet.</div>
                                                                    ) : (
                                                                        taskFiles.map((sf) => (
                                                                            <div
                                                                                key={sf._id}
                                                                                className="flex justify-between items-center border rounded p-3 mb-2"
                                                                            >
                                                                                <div>
                                                                                    <div className="font-medium break-all">{sf.fileName}</div>
                                                                                    <div className="text-xs opacity-70">
                                                                                        Student ID: {sf.studentUserId || "-"}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex gap-2">
                                                                                    <a
                                                                                        className="btn btn-sm btn-outline"
                                                                                        href={`${API}${sf.fileUrl}`}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                    >
                                                                                        View
                                                                                    </a>

                                                                                    <button
                                                                                        className="btn btn-sm btn-primary"
                                                                                        type="button"
                                                                                        onClick={() => openStudentDetails(sf.uploaderUid)}
                                                                                    >
                                                                                        Student Details
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {detailsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-base-100 shadow p-5">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold">Student Details</h3>
                            <button className="btn btn-sm" onClick={closeStudentDetails}>
                                Close
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="mt-4">Loading...</div>
                        ) : !detailsUser ? (
                            <div className="mt-4 opacity-70">No details found.</div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Info label="Name" value={detailsUser.name} />
                                    <Info label="Email" value={detailsUser.email} />
                                    <Info label="Role" value={detailsUser.role} />
                                    <Info label="User ID" value={detailsUser.userId} />
                                    <Info label="Faculty" value={detailsUser.faculty} />
                                    <Info label="Academic Year" value={detailsUser.academicYear} />
                                    <Info label="Semester" value={detailsUser.currentSemester} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success Animation Modal */}
            {successOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-base-100 shadow-2xl border border-base-300">
                        <div className="absolute inset-x-0 top-0 h-1 bg-success"></div>

                        <div className="p-8 text-center">
                            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                                <div className="absolute inline-flex h-full w-full rounded-full bg-success/20 animate-ping"></div>
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-content shadow-lg">
                                    <FiCheck size={34} />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2">Submission Done</h3>
                            <p className="text-sm opacity-75 mb-4">
                                Your file has been uploaded successfully.
                            </p>

                            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                                <FiUploadCloud className="text-success" />
                                Saved successfully
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionNode = ({
    node,
    level,
    selectedSection,
    expandedIds,
    toggleExpand,
    onSelect,
    onEdit,
    onDelete,
    role,
}) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isExpanded = expandedIds[node._id] ?? true;
    const isSelected = selectedSection?._id === node._id;

    return (
        <div>
            <div
                className={`flex items-center gap-1 rounded-lg border p-2 ${isSelected ? "border-primary bg-primary/5" : "border-base-300"
                    }`}
                style={{ marginLeft: `${level * 14}px` }}
            >
                <button
                    type="button"
                    className="btn btn-ghost btn-xs px-1"
                    onClick={() => hasChildren && toggleExpand(node._id)}
                    disabled={!hasChildren}
                    title={hasChildren ? "Expand/Collapse" : ""}
                >
                    {hasChildren ? (isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />) : <span className="w-3" />}
                </button>

                <button
                    type="button"
                    onClick={() => onSelect(node)}
                    className={`flex-1 text-left px-2 py-1 rounded ${isSelected ? "bg-primary text-primary-content" : "hover:bg-base-200"
                        }`}
                >
                    <div className="font-medium truncate">{node.title}</div>
                    <div className="text-[11px] opacity-70">
                        {node.type === "group"
                            ? "Group"
                            : node.type === "materials"
                                ? "Materials"
                                : "Submission"}
                    </div>
                </button>

                {role === "supervisor" && (
                    <>
                        <button className="btn btn-xs btn-outline" type="button" onClick={() => onEdit(node)} title="Edit">
                            <FiEdit2 size={13} />
                        </button>
                        <button className="btn btn-xs btn-error" type="button" onClick={() => onDelete(node._id)} title="Delete">
                            <FiTrash2 size={13} />
                        </button>
                    </>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {node.children.map((child) => (
                        <SectionNode
                            key={child._id}
                            node={child}
                            level={level + 1}
                            selectedSection={selectedSection}
                            expandedIds={expandedIds}
                            toggleExpand={toggleExpand}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            role={role}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Info = ({ label, value }) => (
    <div className="p-3 rounded bg-base-200">
        <div className="text-xs opacity-70">{label}</div>
        <div className="font-semibold">{value || "-"}</div>
    </div>
);

export default Activity;