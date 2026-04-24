const jwt = require('jsonwebtoken');
const SECRET_KEY = "mi_clave_secreta";

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'Acceso denegado - Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado. Use refresh-token para obtener uno nuevo' });
            }
            return res.status(401).json({ message: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
}

// Middleware para verificar roles
function checkRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }
        
        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                message: `Acceso denegado. Se requiere rol: ${requiredRole}`,
                userRole: req.user.role
            });
        }
        
        next();
    };
}

module.exports = { verifyToken, checkRole };