// Spotify API credentials configuration
export const spotifyclientId = 'e60deea5bed44033b1a4a165aca9a6f0';
export const spotifyclientSecret = '7c0e82ce6f5d4d6e83a241117abada41';
export const spotifyredirectUri = process.env.CODESPACE_NAME ? `http://${process.env.CODESPACE_NAME}-3000.app.github.dev/callback` : 'http://localhost:3000/callback';
