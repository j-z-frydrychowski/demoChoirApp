import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, TextField, Button,
    MenuItem, Select, InputLabel, FormControl, Alert,
    List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function AdminPanel() {
    // Stan formularza
    const [formData, setFormData] = useState({
        name: '',
        type: 'REHEARSAL',
        startDateTime: '',
        enrollmentDeadline: '',
        minAttendancePercentage: 0
    });

    const [events, setEvents] = useState([]);
    const [msg, setMsg] = useState(null);

    // Pobranie listy wydarzeń przy wejściu
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Obsługa pól formularza
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Wysłanie nowego wydarzenia
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        try {
            await axios.post('http://localhost:8080/api/events', formData);
            setMsg({ type: 'success', text: 'Wydarzenie zostało utworzone!' });
            fetchEvents(); // Odśwież listę
            // Opcjonalnie: wyczyść formularz
            setFormData({ ...formData, name: '' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Błąd tworzenia. Sprawdź uprawnienia lub dane.' });
        }
    };

    // Usuwanie wydarzenia
    const handleDelete = async (id) => {
        if(!window.confirm("Czy na pewno chcesz usunąć to wydarzenie?")) return;

        try {
            // Zakładam, że masz endpoint DELETE /api/events/{id} (jeśli nie, zaraz go dodamy na backendzie,
            // ale zazwyczaj w CRUD to standard. Jeśli nie robiłeś delete, ten guzik nie zadziała - to OK na start).
            // W Twoim kodzie EventController może nie mieć delete - sprawdźmy to później.
            // Na razie zostawmy logikę frontendową.
            await axios.delete(`http://localhost:8080/api/events/${id}`);
            setMsg({ type: 'success', text: 'Usunięto wydarzenie.' });
            fetchEvents();
        } catch (err) {
            setMsg({ type: 'error', text: 'Nie udało się usunąć wydarzenia.' });
        }
    };

    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Panel Zarządu 🛠️
            </Typography>

            {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

            <Grid container spacing={4}>
                {/* LEWA STRONA: KREATOR */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Nowe Wydarzenie</Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth label="Nazwa wydarzenia" name="name" margin="normal" required
                                value={formData.name} onChange={handleChange}
                            />

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Typ wydarzenia</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    label="Typ wydarzenia"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="REHEARSAL">Próba (1.0 pkt)</MenuItem>
                                    <MenuItem value="CONCERT">Koncert (2.0 pkt)</MenuItem>
                                    <MenuItem value="WORKSHOP">Warsztaty (1.5 pkt)</MenuItem>
                                    <MenuItem value="OTHER">Inne (0.5 pkt)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth label="Data i godzina" name="startDateTime" type="datetime-local" margin="normal" required
                                InputLabelProps={{ shrink: true }}
                                value={formData.startDateTime} onChange={handleChange}
                            />

                            <TextField
                                fullWidth label="Deadline zapisów" name="enrollmentDeadline" type="datetime-local" margin="normal" required
                                InputLabelProps={{ shrink: true }}
                                helperText="Do kiedy chórzyści mogą klikać Będę/Nie będę"
                                value={formData.enrollmentDeadline} onChange={handleChange}
                            />

                            <TextField
                                fullWidth label="Wymagana frekwencja (%)" name="minAttendancePercentage" type="number" margin="normal"
                                helperText="0 = dla wszystkich. Ustaw np. 50 dla nagród."
                                value={formData.minAttendancePercentage} onChange={handleChange}
                            />

                            <Button
                                type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}
                                startIcon={<AddCircleIcon />}
                            >
                                Utwórz
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                {/* PRAWA STRONA: LISTA */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Lista Wydarzeń w Systemie</Typography>
                        <List>
                            {events.length === 0 ? <Typography>Brak wydarzeń.</Typography> : events.map((ev) => (
                                <div key={ev.id}>
                                    <ListItem
                                        secondaryAction={
                                            // Używamy Box, żeby mieć dwa przyciski obok siebie
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => navigate(`/admin/attendance/${ev.id}`)}
                                                >
                                                    Obecność
                                                </Button>
                                                <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(ev.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        }
                                    >
                                        <ListItemText
                                            primary={`${ev.name} (${ev.type})`}
                                            secondary={`${new Date(ev.startDateTime).toLocaleString()} | Deadline: ${new Date(ev.enrollmentDeadline).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                    <Divider />
                                </div>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}