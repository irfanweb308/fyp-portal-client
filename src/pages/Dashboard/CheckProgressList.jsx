import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const API = "http://localhost:8000";

const CheckProgressList = () => {
    const { role } = use(AuthContext);

    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState({ ip1: [], ip2: [] });

    const [newIp1Item, setNewIp1Item] = useState("");
    const [newIp2Item, setNewIp2Item] = useState("");

    const [editingItemId, setEditingItemId] = useState("");
    const [editingSection, setEditingSection] = useState("");
    const [editingLabel, setEditingLabel] = useState("");

    if (role && role !== "headSupervisor") {
        return (
            <div className="p-6">
                <p>Only Head Supervisor can access this page.</p>
            </div>
        );
    }

    const loadTemplate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/progress-template`);
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to load progress template");
                setTemplate({ ip1: [], ip2: [] });
                return;
            }

            setTemplate({
                ip1: Array.isArray(data.ip1) ? data.ip1 : [],
                ip2: Array.isArray(data.ip2) ? data.ip2 : [],
            });
        } catch (err) {
            console.log(err);
            alert("Server error");
            setTemplate({ ip1: [], ip2: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplate();
    }, []);

    const addItem = async (section) => {
        const label = section === "ip1" ? newIp1Item : newIp2Item;

        if (!label.trim()) {
            return alert("Please enter item name");
        }

        try {
            const res = await fetch(`${API}/progress-template/item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section,
                    label: label.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to add item");
                return;
            }

            if (section === "ip1") setNewIp1Item("");
            if (section === "ip2") setNewIp2Item("");

            loadTemplate();
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    const startEdit = (section, item) => {
        setEditingItemId(item.id);
        setEditingSection(section);
        setEditingLabel(item.label);
    };

    const cancelEdit = () => {
        setEditingItemId("");
        setEditingSection("");
        setEditingLabel("");
    };

    const saveEdit = async () => {
        if (!editingItemId || !editingSection) return;
        if (!editingLabel.trim()) return alert("Item label is required");

        try {
            const res = await fetch(`${API}/progress-template/item/${editingItemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section: editingSection,
                    label: editingLabel.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to update item");
                return;
            }

            cancelEdit();
            loadTemplate();
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    const deleteItem = async (section, itemId) => {
        const ok = confirm("Delete this checklist item?");
        if (!ok) return;

        try {
            const res = await fetch(`${API}/progress-template/item/${itemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ section }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete item");
                return;
            }

            if (editingItemId === itemId) cancelEdit();

            loadTemplate();
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    const renderSection = (title, sectionKey, items, newValue, setNewValue) => (
        <div className="card bg-base-100 shadow p-5">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>

            <div className="flex flex-col md:flex-row gap-3 mb-5">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={`Add new ${title} item`}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={() => addItem(sectionKey)}
                >
                    Add Item
                </button>
            </div>

            {items.length === 0 ? (
                <p className="opacity-70">No items found.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => {
                        const isEditing =
                            editingItemId === item.id && editingSection === sectionKey;

                        return (
                            <div
                                key={item.id || index}
                                className="p-4 rounded-xl bg-base-200"
                            >
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={editingLabel}
                                            onChange={(e) => setEditingLabel(e.target.value)}
                                        />

                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={saveEdit}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {index + 1}. {item.label}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => startEdit(sectionKey, item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => deleteItem(sectionKey, item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Check Progress List</h1>

            {loading ? (
                <span className="loading loading-ring loading-lg"></span>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderSection(
                        "IP1 Checklist",
                        "ip1",
                        template.ip1,
                        newIp1Item,
                        setNewIp1Item
                    )}

                    {renderSection(
                        "IP2 Checklist",
                        "ip2",
                        template.ip2,
                        newIp2Item,
                        setNewIp2Item
                    )}
                </div>
            )}
        </div>
    );
};

export default CheckProgressList;