import React, { useState } from 'react';
import Dashboard from './Dashboard';
import AdminLogin from './pages/AdminLogin';

const App = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

    const handleLoginSuccess = (newToken: string) => {
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    if (!token) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <React.StrictMode>
            <Dashboard onLogout={handleLogout} />
        </React.StrictMode>
    );
};

export default App;
