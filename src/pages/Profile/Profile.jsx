import { useEffect, useState, use } from "react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const Profile = () => {
    const { user } = use(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // basic info (read-only)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("");

    // common editable fields
    const [faculty, setFaculty] = useState("");
    const [image, setImage] = useState("");
    const [icPassport, setIcPassport] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [currentSemester, setCurrentSemester] = useState("");

    // =========================
    // Student profile fields
    // =========================
    const [matricNo, setMatricNo] = useState("");
    const [programme, setProgramme] = useState("");
    const [intake, setIntake] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [skillsText, setSkillsText] = useState(""); // comma separated
    const [interestsText, setInterestsText] = useState(""); // comma separated
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [preferredDomain, setPreferredDomain] = useState("");

    // =========================
    // Supervisor profile fields
    // =========================
    const [staffId, setStaffId] = useState("");
    const [designation, setDesignation] = useState("");
    const [officeLocation, setOfficeLocation] = useState("");
    const [officeHours, setOfficeHours] = useState("");
    const [supervisorPhone, setSupervisorPhone] = useState("");
    const [researchAreasText, setResearchAreasText] = useState(""); // comma separated
    const [supervisionCapacity, setSupervisionCapacity] = useState("");
    const [availableSlots, setAvailableSlots] = useState("");
    const [googleScholar, setGoogleScholar] = useState("");
    const [website, setWebsite] = useState("");
    const [bio, setBio] = useState("");

    const toText = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
    const toArray = (text) =>
        text
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

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

                // studentProfile
                const sp = data.studentProfile || {};
                setMatricNo(sp.matricNo || "");
                setProgramme(sp.programme || "");
                setIntake(sp.intake || "");
                setStudentPhone(sp.phone || "");
                setCgpa(sp.cgpa || "");
                setSkillsText(toText(sp.skills));
                setInterestsText(toText(sp.interests));
                setGithub(sp.github || "");
                setLinkedin(sp.linkedin || "");
                setPreferredDomain(sp.preferredProjectDomain || "");

                // supervisorProfile
                const sup = data.supervisorProfile || {};
                setStaffId(sup.staffId || "");
                setDesignation(sup.designation || "");
                setOfficeLocation(sup.officeLocation || "");
                setOfficeHours(sup.officeHours || "");
                setSupervisorPhone(sup.phone || "");
                setResearchAreasText(toText(sup.researchAreas));
                setSupervisionCapacity(
                    sup.supervisionCapacity !== undefined ? String(sup.supervisionCapacity) : ""
                );
                setAvailableSlots(
                    sup.availableSlots !== undefined ? String(sup.availableSlots) : ""
                );
                setGoogleScholar(sup.googleScholar || "");
                setWebsite(sup.website || "");
                setBio(sup.bio || "");
            } catch (err) {
                console.log(err);
                alert("Server error");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user?.uid]);

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

            // student-only payload
            if (role === "student") {
                payload.studentProfile = {
                    matricNo,
                    programme,
                    intake,
                    phone: studentPhone,
                    cgpa,
                    skills: toArray(skillsText),
                    interests: toArray(interestsText),
                    github,
                    linkedin,
                    preferredProjectDomain: preferredDomain
                };
            }

            // supervisor-only payload
            if (role === "supervisor") {
                payload.supervisorProfile = {
                    staffId,
                    designation,
                    officeLocation,
                    officeHours,
                    phone: supervisorPhone,
                    researchAreas: toArray(researchAreasText),
                    supervisionCapacity: supervisionCapacity ? Number(supervisionCapacity) : 0,
                    availableSlots: availableSlots ? Number(availableSlots) : 0,
                    googleScholar,
                    website,
                    bio
                };
            }

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
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left card */}
                <div className="card bg-base-100 shadow p-5">
                    <div className="flex flex-col items-center gap-3">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                    src={image || "https://i.ibb.co/7QpKsCX/default-avatar.png"}
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

                {/* Right card */}
                <div className="card bg-base-100 shadow p-5 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Update Details</h2>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Common section */}
                        <div className="p-4 rounded bg-base-200">
                            <h3 className="font-semibold mb-3">General</h3>

                            <div className="space-y-3">
                                <input
                                    className="input input-bordered w-full"
                                    placeholder="Faculty"
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
                            </div>
                        </div>

                        {/* Student section */}
                        {role === "student" && (
                            <div className="p-4 rounded bg-base-200">
                                <h3 className="font-semibold mb-3">Student Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Programme"
                                        value={programme}
                                        onChange={(e) => setProgramme(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Intake / Batch (e.g., Sept 2025)"
                                        value={intake}
                                        onChange={(e) => setIntake(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Phone"
                                        value={studentPhone}
                                        onChange={(e) => setStudentPhone(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="CGPA (optional)"
                                        value={cgpa}
                                        onChange={(e) => setCgpa(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Preferred Project Domain (e.g., AI, Web, IoT)"
                                        value={preferredDomain}
                                        onChange={(e) => setPreferredDomain(e.target.value)}
                                    />
                                </div>

                                <input
                                    className="input input-bordered w-full mt-3"
                                    placeholder="Skills (comma separated) e.g., React, Node, MongoDB"
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                />

                                <input
                                    className="input input-bordered w-full mt-3"
                                    placeholder="Interests (comma separated) e.g., AI, Web, Cybersecurity"
                                    value={interestsText}
                                    onChange={(e) => setInterestsText(e.target.value)}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="GitHub Link"
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="LinkedIn Link"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Supervisor section */}
                        {role === "supervisor" && (
                            <div className="p-4 rounded bg-base-200">
                                <h3 className="font-semibold mb-3">Supervisor Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Staff ID"
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Designation (e.g., Lecturer)"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Office Location"
                                        value={officeLocation}
                                        onChange={(e) => setOfficeLocation(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Office Hours (e.g., Mon 2-4pm)"
                                        value={officeHours}
                                        onChange={(e) => setOfficeHours(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Phone"
                                        value={supervisorPhone}
                                        onChange={(e) => setSupervisorPhone(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Supervision Capacity (e.g., 10)"
                                        value={supervisionCapacity}
                                        onChange={(e) => setSupervisionCapacity(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Available Slots (e.g., 3)"
                                        value={availableSlots}
                                        onChange={(e) => setAvailableSlots(e.target.value)}
                                    />
                                    <input
                                        className="input input-bordered w-full"
                                        placeholder="Google Scholar Link"
                                        value={googleScholar}
                                        onChange={(e) => setGoogleScholar(e.target.value)}
                                    />
                                </div>

                                <input
                                    className="input input-bordered w-full mt-3"
                                    placeholder="Research Areas (comma separated) e.g., AI, NLP, Cybersecurity"
                                    value={researchAreasText}
                                    onChange={(e) => setResearchAreasText(e.target.value)}
                                />

                                <input
                                    className="input input-bordered w-full mt-3"
                                    placeholder="Website (optional)"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />

                                <textarea
                                    className="textarea textarea-bordered w-full mt-3"
                                    rows={4}
                                    placeholder="Short Bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                        )}

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
