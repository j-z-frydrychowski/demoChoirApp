import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, Button,
    List, ListItem, ListItemText, ListItemIcon, Checkbox,
    Alert, CircularProgress, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AttendanceCheck() {
    const { eventId } = useParams(); // Pobieramy ID wydarzenia z adresu URL
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [checkedIds, setCheckedIds] = useState(new Set()); // Zbiór ID obecnych osób
    const [loading, setLoading] = useState(true);
    const [eventName, setEventName] = useState('');
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Pobierz szczegóły wydarzenia (żeby wyświetlić nazwę)
            // Uwaga: Zakładam, że masz endpoint GET /api/events/{id}.
            // Jeśli nie, nazwę można pominąć w szkielecie, ale spróbujmy.
            try {
                const eventRes = await axios.get(`http://localhost:8080/api/events`);
                const event = eventRes.data.find(e => e.id === eventId);
                if(event) setEventName(event.name);
            } catch(e) { console.log("Nie udało się pobrać nazwy eventu"); }

            // 2. Pobierz WSZYSTKICH członków
            const membersRes = await axios.get('http://localhost:8080/api/members');
            const allMembers = membersRes.data;

            // 3. Pobierz obecną listę obecności (żeby zaznaczyć tych, co już byli wpisani)
            // Jeśli backend tego nie obsługuje w prosty sposób, zaczynamy z pustą listą.
            // Ale my zrobiliśmy GET /api/attendance/events/{eventId} w poprzednich krokach (chyba dla statystyk).
            // W wersji MVP (szkielet) po prostu pobierzmy listę ludzi i domyślnie odznaczmy.

            setMembers(allMembers);

            // Opcjonalnie: Tutaj można by pobrać "enrollments" (deklaracje) i wstępnie zaznaczyć tych, co kliknęli "Będę".
            // Na razie: Pusta lista.

        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Błąd pobierania danych.' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id) => {
        const newChecked = new Set(checkedIds);
        if (newChecked.has(id)) {
            newChecked.delete(id);
        } else {
            newChecked.add(id);
        }
        setCheckedIds(newChecked);
    };

    const handleSave = async () => {
        try {
            // POPRAWKA: Backend oczekuje Set<UUID> w polu "presentMemberIds"
            // Konwertujemy nasz Set z Reacta na zwykłą tablicę (Array.from)

            const requestBody = {
                presentMemberIds: Array.from(checkedIds)
            };

            await axios.put(`http://localhost:8080/api/events/${eventId}/attendance`, requestBody);

            setMsg({ type: 'success', text: 'Lista obecności zapisana!' });

            setTimeout(() => navigate('/admin'), 1500);

        } catch (err) {
            console.error(err);
            // Wyświetl konkretny komunikat błędu z backendu, jeśli dostępny
            setMsg({
                type: 'error',
                text: err.response?.data?.message || 'Błąd zapisu obecności.'
            });
        }
    };

    if (loading) return <CircularProgress sx={{mt:5, ml:5}} />;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
                Wróć
            </Button>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Sprawdzanie Obecności 📋
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    {eventName}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {msg && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

                <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto' }}>
                    {members.map((member) => {
                        const labelId = `checkbox-list-label-${member.id}`;
                        return (
                            <ListItem
                                key={member.id}
                                dense
                                button
                                onClick={() => handleToggle(member.id)}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checkedIds.has(member.id)}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={`${member.firstName} ${member.lastName}`}
                                    secondary={member.voiceType}
                                />
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{ my: 2 }} />

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Zapisz Obecność
                </Button>

            </Paper>
        </Container>
    );
}