import session from 'express-session';
import { pool } from '../Database/database.js'; // Import your database connection pool

// Define ExpressSessionPoolStore class to store sessions in the database
class ExpressSessionPoolStore extends session.Store {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async get(sid, callback) {
    try {
      const result = await this.pool.query('SELECT * FROM sessions WHERE session_id = $1', [sid]);
      if (result.rows.length > 0) {
        return callback(null, result.rows[0].session_data);
      } else {
        return callback(null, null);
      }
    } catch (error) {
      return callback(error);
    }
  }

  async set(sid, session, callback) {
    try {
      await this.pool.query('INSERT INTO sessions (session_id, session_data) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET session_data = EXCLUDED.session_data', [sid, session]);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.pool.query('DELETE FROM sessions WHERE session_id = $1', [sid]);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }
}

// Create session middleware using custom session store
const sessionMiddleware = session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: new ExpressSessionPoolStore(pool) // Use your database connection pool for session storage
});

export default sessionMiddleware;
