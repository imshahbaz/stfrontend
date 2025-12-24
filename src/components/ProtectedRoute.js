import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import {
    Backdrop,
    CircularProgress
} from '@mui/material';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return (<Backdrop open={true}>
        <CircularProgress color="inherit" />
    </Backdrop>);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;