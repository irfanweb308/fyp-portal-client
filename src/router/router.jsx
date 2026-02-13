import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home";
import Register from "../pages/Register/Register";
import SignIn from "../pages/SignIn/SignIn";
import BrowseProjects from "../pages/Projects/BrowseProjects";
import Profile from "../pages/Profile/Profile";
 
import StudentDashboard from "../pages/Dashboard/StudentDashboard";
import SupervisorDashboard from "../pages/Dashboard/SupervisorDashboard";
import RoleRoute from "../routes/RoleRoute";


const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home
      },
      {
        path: "register",
        Component: Register
      },
      {
        path: "signIn",
        Component: SignIn
      },
      {
        path: "projects/browse",
        Component: BrowseProjects
      },
      {
        path: "profile",
        Component: Profile
      },
      {
        path:"dashboard/student",
        element: <RoleRoute allowed={["student"]}>
          <StudentDashboard />
        </RoleRoute>
      },
      {
        path:"dashboard/supervisor",
        element:<RoleRoute allowed={["supervisor"]}>
          <SupervisorDashboard />
        </RoleRoute>
      }
       


    ]
  },
]);

export default router;