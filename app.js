import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
//import sessionMiddleware from './MiddleWare/sessionMiddleware.js';
import spotifyRoutes from './Routes/spotifyRoutes.js';
import tidalRoutes from './Routes/tidalRoutes.js'
import { spotifycallbackHandler } from './Routes/spotifyRoutes.js';
import { tidalcallbackHandler } from './Routes/tidalRoutes.js';
import  appleMusicRoutes  from './Routes/applemusicRoutes.js';


//initialize express application
const app = express();
const PORT = process.env.PORT || 3000;

// Apply other middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mount platform Routes, prefixed "/platform/{route}"
app.use('/spotify', spotifyRoutes);
app.use('/tidal', tidalRoutes);
app.use('/apple', appleMusicRoutes);

// Set static file to caputre button selection
app.use(express.static(path.join(new URL('public', import.meta.url).pathname)));

// send response of server, i.e correct button click follows correct route
app.get('/', (req, res) => {
  // Serve the main HTML page, button and style defined in index.html with seperate stylesheet
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Callback handler not wrapped in /platform, exported seperately
app.get('/callback', spotifycallbackHandler);
app.get('/callback', tidalcallbackHandler);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
