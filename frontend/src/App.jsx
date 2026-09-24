import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TicketDetails from "./pages/TicketDetails";


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <p className="text-slate-600">
                    Loading...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};


const RoleRoute = ({
    allowedRoles,
    children
}) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};


const App = () => {
    return (
        <Routes>

            {/* LOGIN */}
            <Route
                path="/login"
                element={<Login />}
            />


            {/* STAFF / ADMIN DASHBOARD */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute
                            allowedRoles={[
                                "STAFF",
                                "ADMIN"
                            ]}
                        >
                            <StaffDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />


            {/* STUDENT DASHBOARD */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute>
                        <RoleRoute
                            allowedRoles={[
                                "STUDENT"
                            ]}
                        >
                            <StudentDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />


            {/* TICKET DETAILS */}
            <Route
                path="/tickets/:id"
                element={
                    <ProtectedRoute>
                        <RoleRoute
                            allowedRoles={[
                                "STUDENT",
                                "STAFF",
                                "ADMIN"
                            ]}
                        >
                            <TicketDetails />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />


            {/* DEFAULT */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* UNKNOWN ROUTES */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
};


export default App;