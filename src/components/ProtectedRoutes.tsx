import { useAuth } from './AuthProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import { PermissionDeniedDialog } from './shared/Permission'; 
import { useState } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: ('admin' | 'teacher' | 'student')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, authToken } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  // If there's no authToken, redirect to login
  if (!authToken) {
    return <Navigate to="/login" />;
  }

  // If the user is not loaded yet, show a loading state
  if (!currentUser) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // If the user's role is not allowed, show the permission denied dialog
  if (!allowedRoles.includes(currentUser.role)) {
    // Only show dialog if it hasn't been shown yet
    if (!showDialog) {
      setShowDialog(true);
    }
    return (
      <PermissionDeniedDialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          navigate('/');
        }}
      />
    );
  }

  // Render the protected component if the user is authenticated and has the required role
  return children;
};