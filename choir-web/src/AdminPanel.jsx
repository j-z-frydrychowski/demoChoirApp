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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditCalendarIcon from '@mui/icons-material/EditCalendar'; // Ikona do akcji obecności

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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* Zmieniono na maxWidth="xl" dla szerszej tabeli */}
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

// --- 1. WYDARZENIA (TABELA) ---
function EventsManager({ showMsg }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState('ALL'); // Stan filtra
    const [enableEnrollment, setEnableEnrollment] = useState(false);

    const [formData, setFormData] = useState({
        name: '', type: 'REHEARSAL', startDateTime: '', enrollmentDeadline: ''
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
            const payload = {
                ...formData,
                enrollmentDeadline: enableEnrollment ? formData.enrollmentDeadline : null
            };
            await axios.post('http://localhost:8080/api/events', payload);
            showMsg('success', 'Wydarzenie utworzone!');
            fetchEvents();
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

    // Helper do kolorów typów
    const getTypeColor = (type) => {
        switch(type) {
            case 'CONCERT': return 'error'; // Czerwony - ważne!
            case 'REHEARSAL': return 'primary'; // Niebieski
            case 'WORKSHOP': return 'warning'; // Pomarańczowy
            default: return 'default';
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'REHEARSAL': return 'Próba';
            case 'CONCERT': return 'Koncert';
            case 'WORKSHOP': return 'Warsztaty';
            case 'OTHER': return 'Inne';
            default: return type;
        }
    };

    // Logika filtrowania
    const filteredEvents = events.filter(ev => filterType === 'ALL' || ev.type === filterType);

    return (
        <Grid container spacing={4}>
            {/* FORMULARZ (Węższy: 4 kolumny) */}
            <Grid item xs={12} md={4}>
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
                                    <MenuItem value="REHEARSAL">Próba</MenuItem>
                                    <MenuItem value="CONCERT">Koncert</MenuItem>
                                    <MenuItem value="WORKSHOP">Warsztaty</MenuItem>
                                    <MenuItem value="OTHER">Inne</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Start" name="startDateTime" type="datetime-local" margin="normal" size="small" required InputLabelProps={{ shrink: true }} value={formData.startDateTime} onChange={e => setFormData({...formData, startDateTime: e.target.value})} />

                            <Box sx={{ mt: 2, mb: 1, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={enableEnrollment} onChange={(e) => setEnableEnrollment(e.target.checked)} />}
                                    label="Włącz zapisy?"
                                />
                                {enableEnrollment && (
                                    <TextField fullWidth label="Deadline" name="enrollmentDeadline" type="datetime-local" margin="normal" size="small" required={enableEnrollment} InputLabelProps={{ shrink: true }} value={formData.enrollmentDeadline} onChange={e => setFormData({...formData, enrollmentDeadline: e.target.value})} />
                                )}
                            </Box>
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Zapisz</Button>
                        </form>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            {/* TABELA (Szersza: 8 kolumn) */}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Lista Wydarzeń</Typography>

                        {/* FILTR TYPÓW */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Filtruj Typ</InputLabel>
                            <Select
                                value={filterType}
                                label="Filtruj Typ"
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <MenuItem value="ALL">Wszystkie</MenuItem>
                                <MenuItem value="REHEARSAL">Próba</MenuItem>
                                <MenuItem value="CONCERT">Koncert</MenuItem>
                                <MenuItem value="WORKSHOP">Warsztaty</MenuItem>
                                <MenuItem value="OTHER">Inne</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer sx={{ maxHeight: 650 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Godzina</TableCell>
                                    <TableCell>Nazwa</TableCell>
                                    <TableCell>Typ</TableCell>
                                    <TableCell>Zapisy do</TableCell>
                                    <TableCell align="right">Akcje</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredEvents.map(ev => (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>{new Date(ev.startDateTime).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(ev.startDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{ev.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getTypeLabel(ev.type)}
                                                size="small"
                                                color={getTypeColor(ev.type)}
                                                variant={ev.type === 'REHEARSAL' ? 'outlined' : 'filled'} // Próby lżejsze wizualnie
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {ev.enrollmentDeadline
                                                ? new Date(ev.enrollmentDeadline).toLocaleDateString()
                                                : <Typography variant="caption" color="textSecondary">-</Typography>
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditCalendarIcon />}
                                                    onClick={() => navigate(`/admin/attendance/${ev.id}`)}
                                                >
                                                    Obecność
                                                </Button>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(ev.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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