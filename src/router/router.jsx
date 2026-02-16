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
import ProjectDetails from "../pages/Projects/ProjectDetails";
import AddProject from "../pages/Projects/AddProject";
import MyPosts from "../pages/Projects/MyPosts";
import EditProject from "../pages/Projects/EditProject";
import SendProposal from "../pages/Applications/SendProposal";
import ApplicationDetails from "../pages/Applications/ApplicationDetails";
import CompletedProjects from "../pages/CompletedProjects/CompletedProjects";
import EditProposal from "../pages/Proposals/EditProposal";


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
        path: "projects/:id",
        Component: ProjectDetails
      },
      {
        path: "dashboard/student",
        element: <RoleRoute allowed={["student"]}>
          <StudentDashboard />
        </RoleRoute>
      },
      {
        path: "dashboard/supervisor",
        element: <RoleRoute allowed={["supervisor"]}>
          <SupervisorDashboard />
        </RoleRoute>
      },
      {
        path: "projects/add",
        element: <RoleRoute allowed={["supervisor"]}>
          <AddProject />
        </RoleRoute>
      },
      {
        path: "projects/mine",
        element: <RoleRoute allowed={["supervisor"]}>
          <MyPosts />
        </RoleRoute>
      },
      {
        path: "projects/edit/:id",
        element: <RoleRoute allowed={["supervisor"]}>
          <EditProject />
        </RoleRoute>
      },
      {
        path: "applications/proposal",
        element: <RoleRoute allowed={["student"]}>
          <SendProposal />
        </RoleRoute>
      },
      {
        path: "applications/:id",
        element: <RoleRoute allowed={["student", "supervisor"]}>
          <ApplicationDetails />
        </RoleRoute>
      },
      {
        path: "dashboard/supervisor/completed-projects",
        element: (
          <RoleRoute allowed={["supervisor"]}>
            <CompletedProjects />
          </RoleRoute>
        ),
      },
      {
        path: "applications/:id/edit",
        element: <RoleRoute allowed={["student"]}>
          <EditProposal />
        </RoleRoute>
      }







    ]
  },
]);

export default router;