// Tidal API credentials configuration
export const tidalclientId = '8ZYbztht6qXPeHs4';
export const tidalclientSecret = 'AOdG0yPj302Nphf51tmCqYpC1TyiWWw06nrVhkV1zrA=';
export const tidalredirectUri = process.env.CODESPACE_NAME ? `http://${process.env.CODESPACE_NAME}-3000.app.github.dev/callback` : 'http://localhost:3000/callback';
