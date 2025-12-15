import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onLogout }) {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>
                {/* LOGO I NAZWA */}
                <LibraryMusicIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    Chór App
                </Typography>

                {/* PRZYCISKI MENU */}
                <Box>
                    <Button color="inherit" onClick={() => navigate('/')}>
                        Pulpit
                    </Button>
                    {/* --- NOWY PRZYCISK --- */}
                    <Button color="inherit" onClick={() => navigate('/admin')}>
                        Zarządzanie
                    </Button>
                    {/* --------------------- */}
                    <Button color="inherit" onClick={onLogout} sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}>
                        Wyloguj
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}