import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
//import sessionMiddleware from './MiddleWare/sessionMiddleware.js';
import spotifyRoutes from './Routes/spotifyRoutes.js';
import tidalRoutes from './Routes/tidalRoutes.js'
import { spotifycallbackHandler } from './Routes/spotifyRoutes.js';
import { tidalcallbackHandler } from './Routes/tidalRoutes.js';

import appleMusicRoutes from './Routes/applemusicRoutes.js';



const app = express();
const PORT = process.env.PORT || 3000;

// Apply other middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mount the Spotify and Tidal routes
app.use('/spotify', spotifyRoutes);
app.use('/tidal', tidalRoutes);
app.use('/applemusic', appleMusicRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(new URL('public', import.meta.url).pathname)));

// Define the root route to serve the main HTML page
app.get('/', (req, res) => {
  // Serve the main HTML page
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define the callback route to dynamically call the correct callback handler based on the platform
app.get('/callback', spotifycallbackHandler)
app.get('/callback', tidalcallbackHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
