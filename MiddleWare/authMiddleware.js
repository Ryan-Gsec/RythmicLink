// In authMiddleware.js

import { pool } from '../Database/database.js';

const authenticateSession = (req, res, next) => {
    const sessionID = req.sessionID;
    console.log("Session ID:", sessionID);
    console.log('Authenticating session...');
    pool.query('SELECT * FROM sessions WHERE session_id = $1', [sessionID])
        .then(result => {
            if (result.rows.length > 0) {
                req.sessionData = result.rows[0];
                next();
            } else {
                console.log('Session not found, redirecting to login page...');
                res.redirect('/spotify/login'); // Redirect to the login page
            }
        })
        .catch(err => {
            console.error('Error retrieving session data:', err);
            res.status(500).send('Internal Server Error');
        });
};

export { authenticateSession };
