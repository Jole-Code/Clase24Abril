//ENCARNACION GARCIA - SISTEMA AVANZADO DE JWT
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "mi_clave_secreta";
const REFRESH_SECRET_KEY = "mi_refresh_secret_key";

// Almacenamiento de refresh tokens (en producción usar base de datos)
const refreshTokens = [];

// Base de datos de usuarios con roles
const users = [
    { id: 1, username: 'admin', password: '1234', role: 'admin' },
    { id: 2, username: 'user1', password: '5678', role: 'user' },
    { id: 3, username: 'user2', password: 'pass123', role: 'user' }
];

// Función para generar tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '5m' } // 5 minutos
    );
    
    const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        REFRESH_SECRET_KEY,
        { expiresIn: '7d' } // 7 días
    );
    
    return { accessToken, refreshToken };
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Guardar refresh token
    refreshTokens.push(refreshToken);
    
    res.json({
        message: 'Login exitoso',
        accessToken,
        refreshToken,
        user: { id: user.id, username: user.username, role: user.role }
    });
});

// Endpoint para refrescar token
app.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token requerido' });
    }
    
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
        const user = users.find(u => u.id === decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        
        // Reemplazar token antiguo
        const index = refreshTokens.indexOf(refreshToken);
        if (index > -1) {
            refreshTokens.splice(index, 1);
        }
        refreshTokens.push(newRefreshToken);
        
        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(403).json({ message: 'Token expirado o inválido' });
    }
});

// Endpoint para logout
app.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
        const index = refreshTokens.indexOf(refreshToken);
        if (index > -1) {
            refreshTokens.splice(index, 1);
        }
    }
    
    res.json({ message: 'Logout exitoso' });
});

const { verifyToken, checkRole } = require('./middleware/auth');

// Ruta pública
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a JWT App - ENCARNACION GARCIA' });
});

app.get('/public', (req, res) => {
    res.json({ message: 'Ruta pública - ENCARNACION GARCIA' });
});

// Ruta protegida para todos los usuarios autenticados
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({
        message: "Bienvenido al dashboard",
        user: req.user
    });
});

// Ruta solo para admin
app.get('/admin', verifyToken, checkRole('admin'), (req, res) => {
    res.json({
        message: "Panel de administrador",
        user: req.user,
        adminData: { users: users.map(u => ({ id: u.id, username: u.username, role: u.role })) }
    });
});

// Ruta solo para usuarios
app.get('/user-profile', verifyToken, checkRole('user'), (req, res) => {
    res.json({
        message: "Perfil de usuario",
        user: req.user
    });
});

app.get('/steal', (req, res) => {
    const token = req.query.token;
    console.log("TOKEN ROBADO:", token);

    if (!token) {
        return res.status(400).json({ message: "Token faltante" });
    }

    res.json({
        message: "Token robado exitosamente",
        token
    });
});

app.listen(4000, () => {
    console.log("Servidor iniciado en http://localhost:4000 - ENCARNACION GARCIA");
});