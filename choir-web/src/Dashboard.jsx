import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, Button,
    Card, CardContent, CardActions, Chip, Divider, Alert, CircularProgress, Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MicIcon from '@mui/icons-material/Mic';

export default function Dashboard({ onLogout }) {
    // Domyślne stany - bezpieczne
    const [stats, setStats] = useState({ frequencyPercentage: 0 });
    const [events, setEvents] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Statystyki (Obsługa błędu jeśli user jest nowy i nie ma statystyk)
            try {
                const statsRes = await axios.get('http://localhost:8080/api/statistics/me');
                if(statsRes.data) setStats(statsRes.data);
            } catch (e) {
                console.warn("Brak statystyk lub błąd:", e);
                // Nie przerywamy, bo chcemy pobrać eventy
            }

            // 2. Wydarzenia
            const eventsRes = await axios.get('http://localhost:8080/api/events');
            setEvents(eventsRes.data);

            // 3. Sloty (tylko jeśli statystyki pozwoliły)
            // Uwaga: używamy stanu lokalnego statsRes, bo setState jest asynchroniczny
            // Ale dla uproszczenia pobierzemy sloty oddzielnym warunkiem w renderze lub tutaj "na ślepo"
            // jeśli backend i tak zablokuje.
            // Lepiej: Sprawdźmy to co przyszło

        } catch (err) {
            console.error("Główny błąd pobierania:", err);
            setMsg({ type: 'error', text: 'Nie udało się pobrać danych z serwera.' });
        } finally {
            setLoading(false);
        }
    };

    // Dodatkowe pobranie slotów, jeśli stats się zmieniło i jest > 50%
    useEffect(() => {
        if (stats.frequencyPercentage >= 50) {
            axios.get('http://localhost:8080/api/emission/slots')
                .then(res => setSlots(res.data))
                .catch(e => console.log("Błąd slotów:", e));
        }
    }, [stats]);


    const handleEnroll = async (eventId, status) => {
        try {
            await axios.post(`http://localhost:8080/api/events/${eventId}/enroll`, { status });
            setMsg({ type: 'success', text: status === 'I_WILL_BE_THERE' ? 'Zadeklarowano obecność!' : 'Zgłoszono nieobecność.' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data || 'Błąd zapisu.' });
        }
    };

    const handleBookSlot = async (slotId) => {
        try {
            await axios.post(`http://localhost:8080/api/emission/slots/${slotId}/book`);
            setMsg({ type: 'success', text: 'Zarezerwowano termin emisji!' });
            // Odśwież sloty
            const res = await axios.get('http://localhost:8080/api/emission/slots');
            setSlots(res.data);
        } catch (err) {
            // Tutaj wyświetli się Twój ładny komunikat z GlobalExceptionHandler (409 Conflict)
            setMsg({ type: 'error', text: err.response?.data || 'Błąd rezerwacji.' });
        }
    };

    // Ekran ładowania
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Obliczenia pomocnicze do widoku
    const frequency = stats.frequencyPercentage || 0;
    const isEligible = frequency >= 50;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* NAGŁÓWEK */}
            <Paper elevation={1} sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
                    Panel Chórzysty 🎶
                </Typography>
                <Button variant="outlined" color="inherit" onClick={onLogout}>
                    Wyloguj
                </Button>
            </Paper>

            {msg && (
                <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 3 }}>
                    {msg.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* LEWA KOLUMNA: STATYSTYKI */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            borderTop: `6px solid ${isEligible ? '#2e7d32' : '#d32f2f'}`,
                            height: '100%'
                        }}
                    >
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                            TWOJA FREKWENCJA
                        </Typography>
                        <Typography variant="h2" color={isEligible ? 'success.main' : 'error.main'} fontWeight="bold">
                            {frequency.toFixed(1)}%
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2">
                            {isEligible
                                ? "🎉 Gratulacje! Masz dostęp do indywidualnych zajęć emisji głosu."
                                : "📉 Musisz osiągnąć 50%, aby odblokować nagrody. Nie poddawaj się!"}
                        </Typography>
                    </Paper>
                </Grid>

                {/* PRAWA KOLUMNA: WYDARZENIA I EMISJA */}
                <Grid item xs={12} md={8}>

                    {/* SEKCJA 1: WYDARZENIA */}
                    <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                        Nadchodzące Wydarzenia
                    </Typography>

                    {events.length === 0 ? (
                        <Alert severity="info">Brak nadchodzących wydarzeń w kalendarzu.</Alert>
                    ) : (
                        events.map((ev) => (
                            <Card key={ev.id} sx={{ mb: 2, borderLeft: '4px solid #1976d2' }}>
                                <CardContent sx={{ pb: 1 }}>
                                    <Grid container justifyContent="space-between" alignItems="flex-start">
                                        <Grid item>
                                            <Typography variant="h6" component="div">
                                                {ev.name}
                                            </Typography>
                                            <Typography color="textSecondary" variant="body2">
                                                📅 {new Date(ev.startDateTime).toLocaleDateString()} &nbsp;
                                                🕒 {new Date(ev.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </Typography>
                                            <Chip label={ev.type} size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleEnroll(ev.id, 'I_WILL_BE_THERE')}
                                        sx={{ mr: 1 }}
                                    >
                                        Będę
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleEnroll(ev.id, 'I_WILL_NOT_BE_THERE')}
                                    >
                                        Nie będę
                                    </Button>
                                </CardActions>
                            </Card>
                        ))
                    )}

                    {/* SEKCJA 2: EMISJA GŁOSU (Tylko dla uprawnionych) */}
                    {isEligible && (
                        <Box sx={{ mt: 4 }}>
                            <Divider sx={{ my: 2 }}>
                                <Chip icon={<MicIcon />} label="STREFA EMISJI GŁOSU" color="warning" />
                            </Divider>

                            <Typography variant="body2" color="textSecondary" paragraph>
                                Jako aktywny chórzysta możesz zarezerwować darmową lekcję.
                            </Typography>

                            {slots.length === 0 ? (
                                <Alert severity="warning">Brak wolnych terminów. Sprawdź później.</Alert>
                            ) : (
                                <Grid container spacing={2}>
                                    {slots.map(slot => (
                                        <Grid item xs={12} sm={6} key={slot.id}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="h6" color="primary">
                                                        {new Date(slot.startTime).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="h4" fontWeight="bold">
                                                        {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Czas trwania: {slot.durationMinutes} min
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button fullWidth variant="contained" color="warning" onClick={() => handleBookSlot(slot.id)}>
                                                        REZERWUJ
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                </Grid>
            </Grid>
        </Container>
    );
}