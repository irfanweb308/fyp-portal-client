import React, { use }  from "react";

import { AuthContext } from "../contexts/AuthContext/AuthContext";
import {   Navigate, useLocation  } from "react-router";
 
 

const RoleRoute = ({ children, allowed }) => {
  const { user, loading, role } = use(AuthContext);
  const location = useLocation();
  console.log("RoleRoute:", { user, role, allowed });
 
  


  if (loading) return <span className="loading loading-ring loading-xl"></span>;

  // Not logged in
  if (!user) return <Navigate to="/signIn" state={location.pathname} replace />;

  // Role not loaded yet or not allowed
  if (!role || !allowed.includes(role)) return <Navigate to="/" replace />;

  return children;
};

export default RoleRoute;
