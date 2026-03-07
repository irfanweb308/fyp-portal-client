import React, { use } from "react";
import SignInLottie from "../../assets/lotties/Login.json";
import Lottie from "lottie-react";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { useNavigate, useLocation, Link } from "react-router";
import { FiMail, FiLock } from "react-icons/fi";

const SignIn = () => {
    const { signInUser } = use(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignIn = (e) => {
        e.preventDefault();

        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        signInUser(email, password)
            .then(async (result) => {
                // RoleRoute sends: state={location.pathname}
                const from = location.state || "/";

                try {
                    const res = await fetch(
                        `http://localhost:8000/users/${result.user.uid}`
                    );
                    const data = await res.json();

                   
                    const isValidRedirect =
                        typeof from === "string" &&
                        from !== "/" &&
                        from !== "/signIn" &&
                        from !== "/register";

                    if (isValidRedirect) {
                        navigate(from, { replace: true });
                        return;
                    }

                    // ✅ Otherwise go to dashboard based on role
                    if (data.role === "headSupervisor") {
                        navigate("/dashboard/headSupervisor", { replace: true });
                    } else if (data.role === "supervisor") {
                        navigate("/dashboard/supervisor", { replace: true });
                    } else {
                        navigate("/dashboard/student", { replace: true });
                    }
                } catch (err) {
                    console.log(err);
                    // fallback
                    navigate(from, { replace: true });
                }
            })
            .catch((err) => {
                console.log(err);
                alert("Sign in failed. Please check your email/password.");
            });
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
            <div className="w-full max-w-4xl">
                <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                        <div className="p-7 sm:p-8">
                            <div className="flex items-center justify-between gap-3">
                                
                                <div>
                                    <div className="badge badge-outline mb-4">FYP Portal</div>
                                    <h2 className="text-2xl font-bold">Welcome back</h2>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        Please sign in with your account
                                    </p>
                                </div>
                                 
                            </div>

                            <div className="divider my-5" />

                            <form onSubmit={handleSignIn} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="label py-1">
                                        <span className="label-text text-sm font-medium">Email</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
                                            <FiMail />
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            className="input input-bordered w-full pl-10 rounded-xl h-11"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="label py-1">
                                        <span className="label-text text-sm font-medium">Password</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
                                            <FiLock />
                                        </span>
                                        <input
                                            type="password"
                                            name="password"
                                            className="input input-bordered w-full pl-10 rounded-xl h-11"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <a className="link link-hover text-sm">Forgot password?</a>
                                        <span className="text-xs text-base-content/60">
                                            Protected access
                                        </span>
                                    </div>
                                </div>

                                {/* Button */}
                                <button className="btn btn-primary w-full rounded-xl h-11">
                                    Sign In
                                </button>

                                {/* Register link */}
                                <div className="text-center text-sm pt-1">
                                    Don&apos;t have an account?{" "}
                                    <Link to="/register" className="link link-primary font-semibold">
                                        Register
                                    </Link>
                                </div>
                            </form>

                             
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-10 rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
                        <div>
                            
                            <h1 className="text-3xl font-bold leading-snug">
                                Sign in to continue
                            </h1>
                            <p className="mt-2 text-base-content/70">
                                Manage projects, applications, activities and submissions in one place.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Lottie style={{ width: "250px" }} animationData={SignInLottie} loop />
                        </div>

                         
                    </div>



                </div>

                {/* Mobile mini header + lottie */}
                <div className="lg:hidden mt-6 flex flex-col items-center gap-3 text-center">
                    <div className="badge badge-outline">FYP Portal</div>
                    <Lottie style={{ width: "180px" }} animationData={SignInLottie} loop />
                </div>
            </div>
        </div>
    );
};

export default SignIn;