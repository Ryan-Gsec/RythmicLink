import express from 'express';
import bodyParser from 'body-parser';
//import sessionMiddleware from './MiddleWare/sessionMiddleware.js';
import spotifyRoutes from './Routes/spotifyRoutes.js';
import { callbackHandler } from './Routes/spotifyRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Apply session middleware
//app.use(sessionMiddleware);

// Apply other middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mount the Spotify routes under /spotify
app.use('/spotify', spotifyRoutes);

// Define the root route
app.get('/', (req, res) => {
  // Display a button to login to Spotify
  res.send(`
    <h1>Welcome to RythmicLink</h1>
    <form action="/spotify/login" method="get">
      <button type="submit">Login to Spotify</button>
    </form>
  `);
});

// Define the callback route using the callbackHandler function from spotifyRoutes.js
app.get('/callback', callbackHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
