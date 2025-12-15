import { useState } from 'react';
import axios from 'axios';
import { Container, Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8080/api/members/login', {
                email, password
            });
            onLogin(response.data.token); // Przekazujemy token w górę do App.jsx
        } catch (err) {
            setError("Błąd logowania. Sprawdź dane.");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" fontWeight="bold">
                        Zaloguj się
                    </Typography>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal" required fullWidth label="Email" autoFocus
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal" required fullWidth label="Hasło" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>
                            Wejdź
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}