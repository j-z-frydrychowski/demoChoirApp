import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, TextField, Button,
    MenuItem, Select, InputLabel, FormControl, Alert,
    List, ListItem, ListItemText, IconButton, Divider, Tabs, Tab, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MicIcon from '@mui/icons-material/Mic';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People'; // <--- NOWA IKONA
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AdminPanel() {
    const [tabIndex, setTabIndex] = useState(0);
    const [msg, setMsg] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setMsg(null);
    };

    const showMsg = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 5000);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Panel Zarządu 🛠️
            </Typography>

            {/* ZAKŁADKI */}
            <Paper elevation={1} sx={{ mb: 3 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered variant="fullWidth">
                    <Tab icon={<EventIcon />} label="Wydarzenia" />
                    <Tab icon={<MicIcon />} label="Emisja (Sloty)" />
                    <Tab icon={<PeopleIcon />} label="Chórzyści" /> {/* <--- NOWA ZAKŁADKA */}
                </Tabs>
            </Paper>

            {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

            {/* PRZEŁĄCZANIE WIDOKÓW */}
            {tabIndex === 0 && <EventsManager showMsg={showMsg} />}
            {tabIndex === 1 && <EmissionManager showMsg={showMsg} />}
            {tabIndex === 2 && <MembersManager showMsg={showMsg} />} {/* <--- NOWY KOMPONENT */}

        </Container>
    );
}

// --- 1. ZARZĄDZANIE WYDARZENIAMI ---
function EventsManager({ showMsg }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        name: '', type: 'REHEARSAL', startDateTime: '', enrollmentDeadline: '', minAttendancePercentage: 0
    });

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/events');
            setEvents(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/events', formData);
            showMsg('success', 'Wydarzenie utworzone!');
            fetchEvents();
            setFormData({ ...formData, name: '' });
        } catch (err) { showMsg('error', 'Błąd tworzenia wydarzenia.'); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Usunąć wydarzenie?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/events/${id}`);
            showMsg('success', 'Usunięto.');
            fetchEvents();
        } catch (err) { showMsg('error', 'Błąd usuwania.'); }
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Nowe Wydarzenie</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Nazwa" name="name" margin="normal" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Typ</InputLabel>
                            <Select name="type" value={formData.type} label="Typ" onChange={e => setFormData({...formData, type: e.target.value})}>
                                <MenuItem value="REHEARSAL">Próba (1.0)</MenuItem>
                                <MenuItem value="CONCERT">Koncert (2.0)</MenuItem>
                                <MenuItem value="WORKSHOP">Warsztaty (1.5)</MenuItem>
                                <MenuItem value="OTHER">Inne (0.5)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Start" name="startDateTime" type="datetime-local" margin="normal" required InputLabelProps={{ shrink: true }} value={formData.startDateTime} onChange={e => setFormData({...formData, startDateTime: e.target.value})} />
                        <TextField fullWidth label="Deadline" name="enrollmentDeadline" type="datetime-local" margin="normal" required InputLabelProps={{ shrink: true }} value={formData.enrollmentDeadline} onChange={e => setFormData({...formData, enrollmentDeadline: e.target.value})} />
                        <TextField fullWidth label="Min % Frekwencji" name="minAttendancePercentage" type="number" margin="normal" value={formData.minAttendancePercentage} onChange={e => setFormData({...formData, minAttendancePercentage: e.target.value})} />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<AddCircleIcon />}>Dodaj</Button>
                    </form>
                </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Kalendarz</Typography>
                    <List>
                        {events.map(ev => (
                            <div key={ev.id}>
                                <ListItem secondaryAction={
                                    <Box>
                                        <Button variant="outlined" size="small" onClick={() => navigate(`/admin/attendance/${ev.id}`)} sx={{mr:1}}>Obecność</Button>
                                        <IconButton color="error" onClick={() => handleDelete(ev.id)}><DeleteIcon /></IconButton>
                                    </Box>
                                }>
                                    <ListItemText primary={ev.name} secondary={new Date(ev.startDateTime).toLocaleString()} />
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                    </List>
                </Paper>
            </Grid>
        </Grid>
    );
}

// --- 2. ZARZĄDZANIE EMISJĄ ---
function EmissionManager({ showMsg }) {
    const [slots, setSlots] = useState([]);
    const [formData, setFormData] = useState({ startTime: '', durationMinutes: 45 });

    useEffect(() => { fetchSlots(); }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/emission/slots');
            setSlots(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/emission/slots', formData);
            showMsg('success', 'Termin emisji dodany!');
            fetchSlots();
        } catch (err) { showMsg('error', 'Błąd tworzenia terminu.'); }
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 3, borderTop: '4px solid #ed6c02' }}>
                    <Typography variant="h6" gutterBottom>Dodaj Termin Emisji</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="Data i Godzina" name="startTime"
                            type="datetime-local" margin="normal" required InputLabelProps={{ shrink: true }}
                            value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                        />
                        <TextField
                            fullWidth label="Czas trwania (min)" name="durationMinutes"
                            type="number" margin="normal" required
                            value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})}
                        />
                        <Button type="submit" variant="contained" color="warning" fullWidth sx={{ mt: 2 }} startIcon={<AddCircleIcon />}>Utwórz Termin</Button>
                    </form>
                </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Dostępne Terminy</Typography>
                    <List>
                        {slots.length === 0 ? <Typography sx={{mt:2}}>Brak wolnych terminów.</Typography> : slots.map(slot => (
                            <div key={slot.id}>
                                <ListItem>
                                    <ListItemText primary={new Date(slot.startTime).toLocaleString()} secondary={`Czas trwania: ${slot.durationMinutes} min`} />
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                    </List>
                </Paper>
            </Grid>
        </Grid>
    );
}

// --- 3. ZARZĄDZANIE CZŁONKAMI (NOWOŚĆ) ---
function MembersManager({ showMsg }) {
    const [members, setMembers] = useState([]);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/members');
            setMembers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleActivate = async (id) => {
        try {
            await axios.patch(`http://localhost:8080/api/members/${id}/activate`);
            showMsg('success', 'Użytkownik aktywowany!');
            fetchMembers(); // Odśwież listę, żeby zmienił się status
        } catch (err) {
            showMsg('error', 'Nie udało się aktywować.');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Lista Chórzystów</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Imię i Nazwisko</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Głos</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Akcja</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.firstName} {member.lastName}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>
                                    <Chip label={member.voiceType} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={member.status}
                                        color={member.status === 'ACTIVE' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {member.status === 'PENDING' && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="success"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleActivate(member.id)}
                                        >
                                            Aktywuj
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}