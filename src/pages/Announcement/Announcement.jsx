import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import Swal from "sweetalert2";

const API = "http://localhost:8000";

const Announcement = () => {
    const { user, role } = use(AuthContext);

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // supervisor create
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [creating, setCreating] = useState(false);

    // supervisor edit
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const loadAnnouncements = async () => {
        if (!user?.uid || !role) return;

        setLoading(true);
        try {
            const res = await fetch(
                `${API}/announcements?viewerUid=${encodeURIComponent(user.uid)}&viewerRole=${encodeURIComponent(role)}`
            );
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to load announcements");
                setAnnouncements([]);
                return;
            }

            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, [user?.uid, role]);

    const createAnnouncement = async (e) => {
        e.preventDefault();

        if (role !== "supervisor") return;
        if (!title.trim()) return alert("Announcement title required");
        if (!message.trim()) return alert("Announcement message required");

        setCreating(true);
        try {
            const res = await fetch(`${API}/announcements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to create announcement");
                return;
            }

            setTitle("");
            setMessage("");
            await loadAnnouncements();
            Swal.fire({
                title: "Announcement posted",
                icon: "success",
                draggable: true
            });
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setEditTitle(item.title || "");
        setEditMessage(item.message || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditMessage("");
    };

    const saveEdit = async (id) => {
        if (!editTitle.trim()) return alert("Title required");
        if (!editMessage.trim()) return alert("Message required");

        setSaving(true);
        try {
            const res = await fetch(`${API}/announcements/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    message: editMessage.trim(),
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to update announcement");
                return;
            }

            cancelEdit();
            await loadAnnouncements();
            Swal.fire({
                title: "Announcement updated",
                icon: "success",
                draggable: true
            });
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    const deleteAnnouncement = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${API}/announcements/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supervisorUid: user?.uid || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Delete failed",
                    text: data.message || "Failed to delete announcement",
                });
                return;
            }

            await loadAnnouncements();

            Swal.fire({
                title: "Deleted!",
                text: "The announcement has been deleted.",
                icon: "success",
                timer: 1800,
                showConfirmButton: false
            });

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Server error",
                text: "Something went wrong.",
            });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Announcements</h1>

            {role === "supervisor" && (
                <div className="card bg-base-100 shadow p-4 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Post New Announcement</h2>

                    <form onSubmit={createAnnouncement}>
                        <input
                            className="input input-bordered w-full mb-3"
                            placeholder="Announcement title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="textarea textarea-bordered w-full mb-3"
                            rows={5}
                            placeholder="Write announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <button className="btn btn-primary" disabled={creating}>
                            {creating ? "Posting..." : "Post Announcement"}
                        </button>
                    </form>
                </div>
            )}

            <div className="card bg-base-100 shadow p-4">
                <h2 className="text-xl font-semibold mb-4">
                    {role === "supervisor" ? "My Announcements" : "Supervisor Announcements"}
                </h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-ring loading-lg"></span>
                    </div>
                ) : announcements.length === 0 ? (
                    <p className="opacity-70">No announcements yet.</p>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((item) => (
                            <div key={item._id} className="border rounded-lg p-4">
                                {role === "supervisor" && editingId === item._id ? (
                                    <>
                                        <input
                                            className="input input-bordered w-full mb-3"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />

                                        <textarea
                                            className="textarea textarea-bordered w-full mb-3"
                                            rows={5}
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                        />

                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-success"
                                                type="button"
                                                onClick={() => saveEdit(item._id)}
                                                disabled={saving}
                                            >
                                                {saving ? "Saving..." : "Save"}
                                            </button>

                                            <button
                                                className="btn btn-sm"
                                                type="button"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold">{item.title}</h3>
                                                <div className="text-xs opacity-70 mt-1">
                                                    {item.supervisorName ? `By ${item.supervisorName} • ` : ""}
                                                    Posted on {new Date(item.createdAt).toLocaleDateString()} at{" "}
                                                    {new Date(item.createdAt).toLocaleTimeString()}
                                                    {item.updatedAt &&
                                                        new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime()
                                                        ? " • Edited"
                                                        : ""}
                                                </div>
                                            </div>

                                            {role === "supervisor" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        type="button"
                                                        onClick={() => startEdit(item)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-error"
                                                        type="button"
                                                        onClick={() => deleteAnnouncement(item._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
                                            {item.message}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcement;