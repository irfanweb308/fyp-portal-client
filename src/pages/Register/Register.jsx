import Lottie from "lottie-react";
import React, { use } from "react";
import registerLottie from "../../assets/lotties/Register.json";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

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
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <Lottie style={{ width: "200px" }} animationData={registerLottie} loop />
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <h1 className="text-3xl font-bold">Register</h1>

            <form onSubmit={handleRegister}>
              <fieldset className="fieldset space-y-2">
                <label className="label">Full Name</label>
                <input type="text" name="name" className="input input-bordered" placeholder="Your name" required />

                <label className="label">ID</label>
                <input type="text" name="userId" className="input input-bordered" placeholder="Student/Staff ID" required />

                <label className="label">Role</label>
                <select name="role" className="select select-bordered" required defaultValue="student">
                  <option value="student">student</option>
                  <option value="supervisor">supervisor</option>
                </select>

                <label className="label">Email</label>
                <input type="email" name="email" className="input input-bordered" placeholder="Email" required />

                <label className="label">Password</label>
                <input type="password" name="password" className="input input-bordered" placeholder="Password" required />

                <button className="btn btn-neutral mt-4">Register</button>
              </fieldset>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
