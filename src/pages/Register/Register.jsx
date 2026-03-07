import Lottie from "lottie-react";
import React, { use } from "react";
import registerLottie from "../../assets/lotties/Register.json";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { Link } from "react-router";
import { FiUser, FiHash, FiUsers, FiMail, FiLock } from "react-icons/fi";

const Register = () => {
  const { createUser } = use(AuthContext);

  const handleRegister = (e) => {
    e.preventDefault();
    const form = e.target;

    const name = form.name.value;
    const userId = form.userId.value;
    const role = form.role.value;
    const email = form.email.value;
    const password = form.password.value;

    createUser(email, password)
      .then((result) => {
        const savedUser = {
          firebaseUid: result.user.uid,
          email: result.user.email,
          name,
          userId,
          role
        };

        fetch("http://localhost:8000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedUser)
        })
          .then((res) => res.json())
          .then((data) => console.log("user saved to db", data))
          .catch((err) => console.log("db save error", err));
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
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
                  <h2 className="text-2xl font-bold">Register</h2>
                   
                </div>
                <div className="badge badge-primary badge-outline">New</div>
              </div>

              <div className="divider my-5" />

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Full Name</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
                      <FiUser />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full pl-10 rounded-xl h-11"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                {/* ID */}
                <div>
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">ID</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
                      <FiHash />
                    </span>
                    <input
                      type="text"
                      name="userId"
                      className="input input-bordered w-full pl-10 rounded-xl h-11"
                      placeholder="Student/Staff ID"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Role</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">
                      <FiUsers />
                    </span>
                    <select
                      name="role"
                      className="select select-bordered w-full pl-10 rounded-xl h-11"
                      required
                      defaultValue="student"
                    >
                      <option value="student">student</option>
                      <option value="supervisor">supervisor</option>
                    </select>
                  </div>
                   
                </div>

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
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-primary w-full rounded-xl h-11">
                  Register
                </button>

                <div className="text-center text-sm pt-1">
                  Already have an account?{" "}
                  <Link to="/signIn" className="link link-primary font-semibold">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-30 rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
            <div>
              <div className="badge badge-outline mb-4">FYP Portal</div>
              <h1 className="text-3xl font-bold leading-snug">
                Create your account
              </h1>
              <p className="mt-2 text-base-content/70">
                Register once to browse projects, apply, and manage submissions based on your role.
              </p>
            </div>

            <div className="flex justify-center">
              <Lottie style={{ width: "230px" }} animationData={registerLottie} loop />
            </div>
          </div>

        </div>

        {/* Mobile animation */}
        <div className="lg:hidden mt-6 flex flex-col items-center gap-3 text-center">
          <div className="badge badge-outline">FYP Portal</div>
          <Lottie style={{ width: "180px" }} animationData={registerLottie} loop />
        </div>
      </div>
    </div>
  );
};

export default Register;