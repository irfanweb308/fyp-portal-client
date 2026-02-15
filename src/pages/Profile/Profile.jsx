import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const Profile = () => {
    const { user } = use(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("");

    const [faculty, setFaculty] = useState("");
    const [image, setImage] = useState("");
    const [icPassport, setIcPassport] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [currentSemester, setCurrentSemester] = useState("");

    // Load user profile from server
    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/users/${user.uid}`);
                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Failed to load profile");
                    setLoading(false);
                    return;
                }

                setName(data.name || "");
                setEmail(data.email || "");
                setUserId(data.userId || "");
                setRole(data.role || "");

                setFaculty(data.faculty || "");
                setImage(data.image || "");
                setIcPassport(data.icPassport || "");
                setAcademicYear(data.academicYear || "");
                setCurrentSemester(data.currentSemester || "");
            } catch (err) {
                console.log(err);
                alert("Server error");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user?.uid]);

    // Save profile to server
    const handleSave = async (e) => {
        e.preventDefault();
        if (!user?.uid) return;

        setSaving(true);
        try {
            const payload = {
                faculty,
                image,
                icPassport,
                academicYear,
                currentSemester
            };

            const res = await fetch(`http://localhost:8000/users/${user.uid}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to save");
                return;
            }

            alert("Profile updated!");
        } catch (err) {
            console.log(err);
            alert("Server error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <span className="loading loading-ring loading-lg"></span>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left card: basic info */}
                <div className="card bg-base-100 shadow p-5">
                    <div className="flex flex-col items-center gap-3">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                    src={
                                        image ||
                                        "https://i.ibb.co/7QpKsCX/default-avatar.png"
                                    }
                                    alt="profile"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xl font-semibold">{name || "No Name"}</div>
                            <div className="text-sm opacity-80">{email}</div>
                            <div className="mt-2 flex justify-center gap-2">
                                <span className="badge badge-outline">{role || "role"}</span>
                                <span className="badge badge-outline">ID: {userId || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right card: editable fields */}
                <div className="card bg-base-100 shadow p-5 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Update Details</h2>

                    <form onSubmit={handleSave} className="space-y-4">
                        <input
                            className="input input-bordered w-full"
                            placeholder="Faculty (e.g., Faculty of Computing)"
                            value={faculty}
                            onChange={(e) => setFaculty(e.target.value)}
                        />

                        <input
                            className="input input-bordered w-full"
                            placeholder="Profile Image URL"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />

                        <input
                            className="input input-bordered w-full"
                            placeholder="IC / Passport Number"
                            value={icPassport}
                            onChange={(e) => setIcPassport(e.target.value)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                className="input input-bordered w-full"
                                placeholder="Academic Year (e.g., 2025/2026)"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                            />

                            <input
                                className="input input-bordered w-full"
                                placeholder="Current Semester (e.g., Semester 2)"
                                value={currentSemester}
                                onChange={(e) => setCurrentSemester(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
