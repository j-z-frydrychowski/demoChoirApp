import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, TextField, Button,
    MenuItem, Select, InputLabel, FormControl, Alert,
    List, ListItem, ListItemText, IconButton, Divider, Tabs, Tab, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Card, CardContent, InputAdornment, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MicIcon from '@mui/icons-material/Mic';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Ikona rozwijania

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
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Panel Zarządu 🛠️
            </Typography>

            {/* ZAKŁADKI */}
            <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    centered
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab icon={<DashboardIcon />} label="Przegląd" />
                    <Tab icon={<EventIcon />} label="Wydarzenia" />
                    <Tab icon={<MicIcon />} label="Emisja" />
                    <Tab icon={<PeopleIcon />} label="Chórzyści" />
                </Tabs>
            </Paper>

            {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

            {/* ZAWARTOŚĆ */}
            <Box sx={{ minHeight: '60vh' }}>
                {tabIndex === 0 && <AdminOverview />}
                {tabIndex === 1 && <EventsManager showMsg={showMsg} />}
                {tabIndex === 2 && <EmissionManager showMsg={showMsg} />}
                {tabIndex === 3 && <MembersManager showMsg={showMsg} />}
            </Box>

        </Container>
    );
}

// --- 0. DASHBOARD ---
function AdminOverview() {
    const [stats, setStats] = useState({
        totalMembers: 0, activeMembers: 0, avgFrequency: 0, nextEvent: null
    });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [membersRes, statsRes, eventsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/members'),
                    axios.get('http://localhost:8080/api/statistics'),
                    axios.get('http://localhost:8080/api/events')
                ]);

                const members = membersRes.data;
                const statistics = statsRes.data;
                const events = eventsRes.data;

                const activeCount = members.filter(m => m.status === 'ACTIVE').length;

                let totalFreq = 0, countWithStats = 0;
                statistics.forEach(s => {
                    if(s.totalEvents > 0) {
                        totalFreq += s.frequencyPercentage;
                        countWithStats++;
                    }
                });
                const avgFreq = countWithStats > 0 ? (totalFreq / countWithStats) : 0;

                const futureEvents = events.filter(e => new Date(e.startDateTime) > new Date());
                futureEvents.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

                setStats({
                    totalMembers: members.length,
                    activeMembers: activeCount,
                    avgFrequency: avgFreq,
                    nextEvent: futureEvents.length > 0 ? futureEvents[0] : null
                });

            } catch (err) { console.error("Błąd statystyk", err); }
        };
        fetchAll();
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #1976d2' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Liczba Chórzystów</Typography>
                        <Typography variant="h3">{stats.totalMembers}</Typography>
                        <Typography variant="body2" color="textSecondary">W tym aktywnych: <strong>{stats.activeMembers}</strong></Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #2e7d32' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Średnia Frekwencja</Typography>
                        <Typography variant="h3">{stats.avgFrequency.toFixed(1)}%</Typography>
                        <Typography variant="body2" color="textSecondary">Całego zespołu</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #ed6c02' }}>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Najbliższe Wydarzenie</Typography>
                        {stats.nextEvent ? (
                            <>
                                <Typography variant="h5" noWrap>{stats.nextEvent.name}</Typography>
                                <Typography variant="body2" sx={{mt:1}}>
                                    📅 {new Date(stats.nextEvent.startDateTime).toLocaleDateString()}
                                </Typography>
                            </>
                        ) : (<Typography variant="h5" color="textSecondary">Brak planów</Typography>)}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

// --- 1. WYDARZENIA (ZMIENIONY) ---
function EventsManager({ showMsg }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    // Checkbox sterujący zapisami
    const [enableEnrollment, setEnableEnrollment] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'REHEARSAL',
        startDateTime: '',
        enrollmentDeadline: ''
        // Usunięto minAttendancePercentage
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
            // Jeśli zapisy wyłączone, wysyłamy null w deadline
            const payload = {
                ...formData,
                enrollmentDeadline: enableEnrollment ? formData.enrollmentDeadline : null
            };

            await axios.post('http://localhost:8080/api/events', payload);
            showMsg('success', 'Wydarzenie utworzone!');
            fetchEvents();

            // Reset formularza
            setFormData({ name: '', type: 'REHEARSAL', startDateTime: '', enrollmentDeadline: '' });
            setEnableEnrollment(false);
        } catch (err) { showMsg('error', 'Błąd tworzenia.'); }
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
            {/* LEWA KOLUMNA - KREATOR (Accordion) */}
            <Grid item xs={12} md={5}>
                <Accordion defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AddCircleIcon sx={{ mr: 1 }} /> Dodaj Wydarzenie
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <form onSubmit={handleSubmit}>
                            <TextField fullWidth label="Nazwa" name="name" margin="normal" size="small" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Typ</InputLabel>
                                <Select name="type" value={formData.type} label="Typ" onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <MenuItem value="REHEARSAL">Próba (1.0)</MenuItem>
                                    <MenuItem value="CONCERT">Koncert (2.0)</MenuItem>
                                    <MenuItem value="WORKSHOP">Warsztaty (1.5)</MenuItem>
                                    <MenuItem value="OTHER">Inne (0.5)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField fullWidth label="Start" name="startDateTime" type="datetime-local" margin="normal" size="small" required InputLabelProps={{ shrink: true }} value={formData.startDateTime} onChange={e => setFormData({...formData, startDateTime: e.target.value})} />

                            {/* CHECKBOX ZAPISY */}
                            <Box sx={{ mt: 2, mb: 1, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enableEnrollment}
                                            onChange={(e) => setEnableEnrollment(e.target.checked)}
                                        />
                                    }
                                    label="Czy dodać zapisy na wydarzenie?"
                                />

                                {enableEnrollment && (
                                    <TextField
                                        fullWidth
                                        label="Deadline zapisów"
                                        name="enrollmentDeadline"
                                        type="datetime-local"
                                        margin="normal"
                                        size="small"
                                        required={enableEnrollment} // Wymagane tylko jak włączone
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.enrollmentDeadline}
                                        onChange={e => setFormData({...formData, enrollmentDeadline: e.target.value})}
                                    />
                                )}
                            </Box>

                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Zapisz</Button>
                        </form>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            {/* PRAWA KOLUMNA - LISTA */}
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Kalendarz</Typography>
                    <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                        {events.map(ev => (
                            <div key={ev.id}>
                                <ListItem secondaryAction={
                                    <Box>
                                        <Button variant="outlined" size="small" onClick={() => navigate(`/admin/attendance/${ev.id}`)} sx={{mr:1}}>Obecność</Button>
                                        <IconButton color="error" onClick={() => handleDelete(ev.id)}><DeleteIcon /></IconButton>
                                    </Box>
                                }>
                                    <ListItemText
                                        primary={ev.name}
                                        secondary={
                                            <>
                                                {new Date(ev.startDateTime).toLocaleDateString()} {new Date(ev.startDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                <Chip label={ev.type} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                                                {!ev.enrollmentDeadline && <Chip label="Bez zapisów" size="small" color="default" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />}
                                            </>
                                        }
                                    />
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

// --- 2. EMISJA (Bez zmian) ---
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
            showMsg('success', 'Slot dodany!');
            fetchSlots();
        } catch (err) { showMsg('error', 'Błąd dodawania slotu.'); }
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 3, borderTop: '4px solid #ed6c02' }}>
                    <Typography variant="h6" gutterBottom>Dodaj Termin</Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Data i Godzina" name="startTime" type="datetime-local" margin="normal" required InputLabelProps={{ shrink: true }} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                        <TextField fullWidth label="Czas (min)" name="durationMinutes" type="number" margin="normal" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} />
                        <Button type="submit" variant="contained" color="warning" fullWidth sx={{ mt: 2 }} startIcon={<AddCircleIcon />}>Utwórz</Button>
                    </form>
                </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Dostępne Terminy</Typography>
                    <List>
                        {slots.length === 0 ? <Typography>Brak wolnych.</Typography> : slots.map(slot => (
                            <div key={slot.id}>
                                <ListItem>
                                    <ListItemText primary={new Date(slot.startTime).toLocaleString()} secondary={`${slot.durationMinutes} min`} />
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

// --- 3. CHÓRZYŚCI (Bez zmian) ---
function MembersManager({ showMsg }) {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');

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
            showMsg('success', 'Aktywowano!');
            fetchMembers();
        } catch (err) { showMsg('error', 'Błąd aktywacji.'); }
    };

    const filteredMembers = members.filter(m =>
        m.lastName.toLowerCase().includes(search.toLowerCase()) ||
        m.firstName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Baza Członków ({members.length})</Typography>
                <TextField
                    size="small"
                    placeholder="Szukaj..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                />
            </Box>
            <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nazwisko i Imię</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Głos</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Akcja</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{member.lastName} {member.firstName}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell><Chip label={member.voiceType} size="small" variant="outlined" /></TableCell>
                                <TableCell><Chip label={member.status} color={member.status === 'ACTIVE' ? 'success' : 'warning'} size="small" /></TableCell>
                                <TableCell align="right">
                                    {member.status === 'PENDING' && (
                                        <Button variant="contained" size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleActivate(member.id)}>Aktywuj</Button>
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