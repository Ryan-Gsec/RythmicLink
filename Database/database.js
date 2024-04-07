import pkg from 'pg';

const { Pool } = pkg;

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'RythmicLink2024',
  port: 5432, // Default PostgreSQL port
});

export { pool };
