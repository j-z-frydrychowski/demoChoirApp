import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, TextField, Button,
    MenuItem, Select, InputLabel, FormControl, Alert,
    List, ListItem, ListItemText, IconButton, Divider, Tabs, Tab, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Card, CardContent, InputAdornment, Accordion, AccordionSummary, AccordionDetails,
    Checkbox, FormControlLabel, Menu, ListItemIcon
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
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt'; // Ikona do nowej zakładki
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Trzy kropki
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CancelIcon from '@mui/icons-material/Cancel';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
                    <Tab icon={<ListAltIcon />} label="Listy Tak, jest!" /> {/* NOWA ZAKŁADKA */}
                    <Tab icon={<MicIcon />} label="Emisja" />
                    <Tab icon={<PeopleIcon />} label="Chórzyści" />
                </Tabs>
            </Paper>

            {msg && <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>{msg.text}</Alert>}

            <Box sx={{ minHeight: '60vh' }}>
                {tabIndex === 0 && <AdminOverview />}
                {tabIndex === 1 && <EventsManager showMsg={showMsg} />}
                {tabIndex === 2 && <EnrollmentLists showMsg={showMsg} />} {/* NOWY KOMPONENT */}
                {tabIndex === 3 && <EmissionManager showMsg={showMsg} />}
                {tabIndex === 4 && <MembersManager showMsg={showMsg} />}
            </Box>

        </Container>
    );
}

// --- 0. DASHBOARD ---
function AdminOverview() {
    // (Kod bez zmian - skrócony dla czytelności, wklej tu pełną wersję z poprzedniego kroku lub zostaw tę)
    const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, avgFrequency: 0, nextEvent: null });
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [membersRes, statsRes, eventsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/members'),
                    axios.get('http://localhost:8080/api/statistics'),
                    axios.get('http://localhost:8080/api/events')
                ]);
                // Prosta logika statystyk (taka sama jak wcześniej)
                const members = membersRes.data;
                const events = eventsRes.data;
                const futureEvents = events.filter(e => new Date(e.startDateTime) > new Date()).sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

                let totalFreq = 0, count = 0;
                statsRes.data.forEach(s => { if(s.totalEvents > 0) { totalFreq += s.frequencyPercentage; count++; }});

                setStats({
                    totalMembers: members.length,
                    activeMembers: members.filter(m => m.status === 'ACTIVE').length,
                    avgFrequency: count > 0 ? (totalFreq / count) : 0,
                    nextEvent: futureEvents[0] || null
                });
            } catch (e) { console.error(e); }
        };
        fetchAll();
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #1976d2' }}>
                    <CardContent><Typography color="textSecondary">Chórzyści</Typography><Typography variant="h3">{stats.totalMembers}</Typography></CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #2e7d32' }}>
                    <CardContent><Typography color="textSecondary">Średnia Frekwencja</Typography><Typography variant="h3">{stats.avgFrequency.toFixed(1)}%</Typography></CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ borderLeft: '5px solid #ed6c02' }}>
                    <CardContent><Typography color="textSecondary">Najbliższe</Typography><Typography variant="h5">{stats.nextEvent ? stats.nextEvent.name : "Brak"}</Typography></CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

// --- 1. WYDARZENIA ---
function EventsManager({ showMsg }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState('ALL');

    // --- STANY DLA FORMULARZA ---
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isFormExpanded, setIsFormExpanded] = useState(false);

    // Checkboxy
    const [enableEnrollment, setEnableEnrollment] = useState(false);
    const [isHidden, setIsHidden] = useState(false); // NOWOŚĆ

    // Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);

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

    // --- RESETOWANIE FORMULARZA ---
    const resetForm = () => {
        setFormData({ name: '', type: 'REHEARSAL', startDateTime: '', enrollmentDeadline: '' });
        setEnableEnrollment(false);
        setIsHidden(false);
        setIsEditing(false);
        setEditId(null);
        setIsFormExpanded(false);
    };

    // --- MENU AKCJI ---
    const handleMenuOpen = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedEventId(id);
    };
    const handleMenuClose = () => { setAnchorEl(null); setSelectedEventId(null); };

    // --- ŁADOWANIE DANYCH DO EDYCJI ---
    const handleActionEdit = () => {
        const eventToEdit = events.find(e => e.id === selectedEventId);
        if (eventToEdit) {
            setFormData({
                name: eventToEdit.name,
                type: eventToEdit.type,
                startDateTime: eventToEdit.startDateTime,
                enrollmentDeadline: eventToEdit.enrollmentDeadline || ''
            });
            setEnableEnrollment(!!eventToEdit.enrollmentDeadline);
            setIsHidden(eventToEdit.hidden); // Ustawiamy flagę ukrycia

            // Ustawiamy tryb edycji
            setIsEditing(true);
            setEditId(selectedEventId);
            setIsFormExpanded(true); // Otwieramy harmonijkę
        }
        handleMenuClose();
    };

    const handleActionAttendance = () => {
        navigate(`/admin/attendance/${selectedEventId}`);
        handleMenuClose();
    };

    const handleActionDelete = async () => {
        if(!window.confirm("Usunąć wydarzenie trwale?")) { handleMenuClose(); return; }
        try {
            await axios.delete(`http://localhost:8080/api/events/${selectedEventId}`);
            showMsg('success', 'Usunięto.');
            fetchEvents();
        } catch (err) { showMsg('error', 'Błąd usuwania.'); }
        handleMenuClose();
    };

    // --- WYSYŁKA FORMULARZA (CREATE / UPDATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            enrollmentDeadline: enableEnrollment ? formData.enrollmentDeadline : null,
            hidden: isHidden
        };

        try {
            if (isEditing) {
                // UPDATE (PUT)
                await axios.put(`http://localhost:8080/api/events/${editId}`, payload);
                showMsg('success', 'Zaktualizowano wydarzenie!');
            } else {
                // CREATE (POST)
                await axios.post('http://localhost:8080/api/events', payload);
                showMsg('success', 'Utworzono wydarzenie!');
            }
            fetchEvents();
            resetForm();
        } catch (err) { showMsg('error', 'Błąd zapisu.'); }
    };

    // Helpery wizualne
    const getTypeColor = (type) => ({'CONCERT':'error','REHEARSAL':'primary','WORKSHOP':'warning'}[type] || 'default');
    const filteredEvents = events.filter(ev => filterType === 'ALL' || ev.type === filterType);

    return (
        <Grid container spacing={4}>
            {/* KREATOR / EDYTOR */}
            <Grid item xs={12} md={4}>
                <Accordion expanded={isFormExpanded} onChange={() => setIsFormExpanded(!isFormExpanded)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: isEditing ? 'warning.main' : 'inherit' }}>
                            <AddCircleIcon sx={{ mr: 1 }} />
                            {isEditing ? "Edytuj Wydarzenie" : "Dodaj Wydarzenie"}
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

                            {/* OPCJE DODATKOWE */}
                            <Box sx={{ mt: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox checked={enableEnrollment} onChange={(e) => setEnableEnrollment(e.target.checked)} />}
                                    label="Włącz zapisy?"
                                />
                                {enableEnrollment && (
                                    <TextField fullWidth label="Deadline" name="enrollmentDeadline" type="datetime-local" margin="normal" size="small" required={enableEnrollment} InputLabelProps={{ shrink: true }} value={formData.enrollmentDeadline} onChange={e => setFormData({...formData, enrollmentDeadline: e.target.value})} />
                                )}

                                {/* NOWY CHECKBOX - UKRYCIE */}
                                <Divider sx={{ my: 1 }} />
                                <FormControlLabel
                                    control={<Checkbox checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} color="error" />}
                                    label={
                                        <Typography variant="body2" color={isHidden ? "error" : "textSecondary"}>
                                            Ukryte wydarzenie (tylko Zarząd)
                                        </Typography>
                                    }
                                />
                            </Box>

                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button type="submit" variant="contained" fullWidth color={isEditing ? "warning" : "primary"}>
                                    {isEditing ? "Zapisz Zmiany" : "Utwórz"}
                                </Button>
                                {isEditing && (
                                    <Button variant="outlined" onClick={resetForm}>Anuluj</Button>
                                )}
                            </Box>
                        </form>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            {/* TABELA */}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Lista Wydarzeń</Typography>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Filtruj Typ</InputLabel>
                            <Select value={filterType} label="Filtruj Typ" onChange={(e) => setFilterType(e.target.value)}>
                                <MenuItem value="ALL">Wszystkie</MenuItem>
                                <MenuItem value="REHEARSAL">Próba</MenuItem>
                                <MenuItem value="CONCERT">Koncert</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer sx={{ maxHeight: 650 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Nazwa</TableCell>
                                    <TableCell>Typ</TableCell>
                                    <TableCell>Zapisy</TableCell>
                                    <TableCell align="right">Akcje</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredEvents.map(ev => (
                                    <TableRow key={ev.id} hover sx={{ backgroundColor: ev.hidden ? 'rgba(0, 0, 0, 0.04)' : 'inherit' }}>
                                        <TableCell>
                                            {new Date(ev.startDateTime).toLocaleDateString()} <br/>
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(ev.startDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            {ev.name}
                                            {/* IKONKA UKRYCIA */}
                                            {ev.hidden && (
                                                <Chip label="Ukryte" size="small" color="default" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                                            )}
                                        </TableCell>
                                        <TableCell><Chip label={ev.type} size="small" color={getTypeColor(ev.type)} variant="outlined" /></TableCell>
                                        <TableCell>
                                            {ev.enrollmentDeadline ? <Chip label="Tak" size="small" color="success" icon={<CheckCircleIcon />} /> : "-"}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, ev.id)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={handleActionEdit}>
                            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon> Edytuj
                        </MenuItem>
                        <MenuItem onClick={handleActionAttendance}>
                            <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon> Sprawdź obecność
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleActionDelete} sx={{ color: 'error.main' }}>
                            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon> Usuń
                        </MenuItem>
                    </Menu>
                </Paper>
            </Grid>
        </Grid>
    );
}

// --- 2. LISTY "TAK, JEST!" (NOWOŚĆ) ---
function EnrollmentLists({ showMsg }) {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState({ yes: 0, no: 0, unknown: 0 });

    useEffect(() => {
        // Pobierz wydarzenia do dropdowna (tylko te z zapisami)
        axios.get('http://localhost:8080/api/events')
            .then(res => {
                // Sortuj chronologicznie, filtruj te co mają deadline
                const withEnrollment = res.data
                    .filter(e => e.enrollmentDeadline != null)
                    .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
                setEvents(withEnrollment);
                if(withEnrollment.length > 0) setSelectedEventId(withEnrollment[0].id);
            })
            .catch(err => console.error(err));
    }, []);

    // Pobierz listę deklaracji po zmianie eventu
    useEffect(() => {
        if (!selectedEventId) return;

        axios.get(`http://localhost:8080/api/events/${selectedEventId}/enrollments`)
            .then(res => {
                setEnrollments(res.data);
                // Policz statystyki
                const yes = res.data.filter(e => e.status === 'I_WILL_BE_THERE').length;
                const no = res.data.filter(e => e.status === 'I_WILL_NOT_BE_THERE').length;
                const unknown = res.data.filter(e => e.status === null).length;
                setStats({ yes, no, unknown });
            })
            .catch(err => showMsg('error', 'Błąd pobierania listy deklaracji'));
    }, [selectedEventId]);

    const getStatusChip = (status) => {
        switch(status) {
            case 'I_WILL_BE_THERE': return <Chip icon={<CheckCircleIcon/>} label="Będzie" color="success" />;
            case 'I_WILL_NOT_BE_THERE': return <Chip icon={<CancelIcon/>} label="Nie będzie" color="error" variant="outlined" />;
            default: return <Chip icon={<QuestionMarkIcon/>} label="Brak dekl." color="default" variant="outlined" />;
        }
    };

    return (
        <Grid container spacing={3}>
            {/* WYBÓR I STATYSTYKI */}
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Wybierz Wydarzenie</Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                        <InputLabel>Wydarzenie</InputLabel>
                        <Select
                            value={selectedEventId}
                            label="Wydarzenie"
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            {events.map(ev => (
                                <MenuItem key={ev.id} value={ev.id}>
                                    {new Date(ev.startDateTime).toLocaleDateString()} - {ev.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Podsumowanie deklaracji:</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip label={`Będzie: ${stats.yes}`} color="success" onDelete={()=>{}} deleteIcon={<CheckCircleIcon />} />
                        <Chip label={`Nie będzie: ${stats.no}`} color="error" variant="outlined" onDelete={()=>{}} deleteIcon={<CancelIcon />} />
                        <Chip label={`Bez odpowiedzi: ${stats.unknown}`} color="default" variant="outlined" onDelete={()=>{}} deleteIcon={<QuestionMarkIcon />} />
                    </Box>
                </Paper>
            </Grid>

            {/* LISTA IMIENNA */}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Lista Deklaracji</Typography>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nazwisko i Imię</TableCell>
                                    <TableCell>Głos</TableCell>
                                    <TableCell>Deklaracja</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {enrollments
                                    .sort((a,b) => {
                                        // Sortowanie: Najpierw ci co będą, potem reszta, alfabetycznie
                                        if (a.status === 'I_WILL_BE_THERE' && b.status !== 'I_WILL_BE_THERE') return -1;
                                        if (a.status !== 'I_WILL_BE_THERE' && b.status === 'I_WILL_BE_THERE') return 1;
                                        return a.lastName.localeCompare(b.lastName);
                                    })
                                    .map((p) => (
                                        <TableRow key={p.memberId} hover>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{p.lastName} {p.firstName}</TableCell>
                                            <TableCell>{p.voiceType}</TableCell>
                                            <TableCell>{getStatusChip(p.status)}</TableCell>
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

// --- 3. EMISJA (Bez zmian) ---
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

// --- 4. CHÓRZYŚCI (Bez zmian) ---
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

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Czy na pewno usunąć użytkownika ${name}? Ta operacja jest nieodwracalna.`)) return;
        try {
            await axios.delete(`http://localhost:8080/api/members/${id}`);
            showMsg('success', 'Użytkownik usunięty.');
            fetchMembers();
        } catch (err) { showMsg('error', 'Błąd usuwania.'); }
    };

    const filteredMembers = members.filter(m =>
        m.lastName.toLowerCase().includes(search.toLowerCase()) ||
        m.firstName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 1. Pobieramy token
        const token = localStorage.getItem('token');
        if (!token) {
            showMsg('error', 'Błąd: Brak tokena. Zaloguj się ponownie.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 2. Wysyłamy BEZ ustawiania ręcznego Content-Type (Axios sam to zrobi lepiej)
            // Ale Z nagłówkiem Authorization
            await axios.post('http://localhost:8080/api/members/import', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showMsg('success', 'Zaimportowano pomyślnie! Hasło domyślne: Choir2025!');
            fetchMembers();
            event.target.value = null; // Reset inputa
        } catch (err) {
            console.error("Upload error:", err);
            if (err.response && err.response.status === 403) {
                showMsg('error', 'Błąd 403: Brak uprawnień. (Czy twoja rola to ADMIN lub BOARD?)');
            } else {
                showMsg('error', 'Błąd importu. Sprawdź plik.');
            }
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Baza Członków ({members.length})</Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* INPUT UKRYTY + PRZYCISK */}
                    <Button variant="contained" component="label" startIcon={<AddCircleIcon />}>
                        Importuj CSV
                        <input hidden accept=".csv" type="file" onChange={handleFileUpload} />
                    </Button>

                    <TextField
                        size="small"
                        placeholder="Szukaj..."
                        value={search}
                        // ... reszta propsów search ...
                    />
                </Box>
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
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        {member.status === 'PENDING' && (
                                            <Button variant="contained" size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleActivate(member.id)}>Aktywuj</Button>
                                        )}
                                        <IconButton color="error" onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}>
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
    );
}