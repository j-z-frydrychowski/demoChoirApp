import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { CssBaseline, Box, CircularProgress } from '@mui/material';

// Import komponentów
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Login from './Login'; // Musimy wydzielić Login do osobnego pliku (patrz Krok 4)
import AdminPanel from './AdminPanel';
import AttendanceCheck from './AttendanceCheck';

function App() {
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));
    const [loading, setLoading] = useState(true); // Żeby nie mrugało przy odświeżaniu

    // 1. Konfiguracja globalna Axiosa
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const handleLogin = (newToken) => {
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
        // Opcjonalnie: przekierowanie, ale stan załatwi sprawę
    };

    if (loading) return <Box sx={{display:'flex', justifyContent:'center', mt:10}}><CircularProgress/></Box>;

    return (
        <BrowserRouter>
            <CssBaseline />

            {/* Navbar pokazujemy TYLKO gdy użytkownik jest zalogowany */}
            {token && <Navbar onLogout={handleLogout} />}

            <Routes>
                {/* Ścieżka główna: Jeśli zalogowany -> Dashboard, jeśli nie -> Login */}
                <Route
                    path="/"
                    element={token ? <Dashboard /> : <Navigate to="/login" />}
                />

                {/* --- NOWA TRASA --- */}
                <Route
                    path="/admin"
                    element={token ? <AdminPanel /> : <Navigate to="/login" />}
                />
                {/* Lista tak jest */}
                <Route
                    path="/admin/attendance/:eventId"
                    element={token ? <AttendanceCheck /> : <Navigate to="/login" />}
                />
                {/* Strona logowania */}
                <Route
                    path="/login"
                    element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
                />

                {/* Tutaj łatwo dodamy kolejne strony: */}
                {/* <Route path="/admin" element={token ? <AdminPanel /> : <Navigate to="/login" />} /> */}

            </Routes>
        </BrowserRouter>
    );
}

export default App;