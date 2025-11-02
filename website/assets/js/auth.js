// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const { username, password } = req.body;
    
    if (username === 'raham' && password === 'devnex2024') {
        next();
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Unauthorized access' 
        });
    }
};

module.exports = { adminAuth };