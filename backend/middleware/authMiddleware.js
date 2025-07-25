import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from the 'Bearer TOKEN' header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your secret key
            jwt.verify(token, process.env.JWT_SECRET);

            next(); // If the token is valid, proceed to the requested route
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default protect;