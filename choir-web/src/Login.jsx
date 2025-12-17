import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Czyścimy stare błędy

        try {
            // 1. Wysłanie żądania do backendu
            const response = await axios.post('http://localhost:8080/api/members/login', formData);

            // 2. Pobranie tokena z odpowiedzi
            // Backend zwraca obiekt: { "token": "eyJ..." }
            // Axios pakuje to w "data", więc szukamy w response.data.token
            const token = response.data.token;

            if (token) {
                // 3. Zapisanie tokena w LocalStorage
                localStorage.setItem('token', token);
                console.log("Zalogowano pomyślnie. Token zapisany.");

                // 4. Dekodowanie roli (opcjonalne, prosta metoda bez bibliotek)
                // Token JWT to: nagłówek.payload.podpis
                try {
                    const payloadBase64 = token.split('.')[1];
                    const decodedJson = atob(payloadBase64);
                    const payload = JSON.parse(decodedJson);

                    // Sprawdzamy role w payloadzie (zależnie jak Spring je zapisał, zazwyczaj "roles" lub "scope")
                    const roles = payload.roles || payload.scope || [];

                    // 5. Przekierowanie w zależności od roli
                    if (roles.includes('ADMIN') || roles.includes('BOARD') || roles.includes('ROLE_ADMIN')) {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard'); // lub inna strona dla zwykłego usera
                    }
                } catch (decodeError) {
                    // Jeśli nie uda się odczytać roli, idź do dashboardu
                    console.warn("Nie udało się zdekodować roli, przekierowanie domyślne.");
                    navigate('/admin'); // Skoro testujesz admina, ustawiam na sztywno admin
                }
            } else {
                setError("Otrzymano odpowiedź, ale brak tokena.");
            }

        } catch (err) {
            console.error("Login error:", err);
            if (err.response && err.response.status === 401) {
                setError("Błędny email lub hasło.");
            } else if (err.code === "ERR_NETWORK") {
                setError("Brak połączenia z serwerem. Czy backend działa?");
            } else {
                setError("Wystąpił błąd logowania.");
            }
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Zaloguj się 🎵
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adres Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Hasło"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Zaloguj
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}