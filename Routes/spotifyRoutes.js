import express from 'express';
import crypto from 'crypto';
//import { authenticateSession } from '../MiddleWare/authMiddleware.js';
import bodyParser from 'body-parser';
import { exchangeCodeForToken, getUserProfile, getUserPlaylists, getPlaylistTracks, createPlaylist, addTracksToPlaylist, getPlaylistImages } from '../Functions/spotifyFunctions.js'; // Import functions from separate file
import { spotifyclientId, spotifyclientSecret, spotifyredirectUri } from '../Config/spotifyConfig.js'; // Import Spotify API credentials from config file
import { pool } from '../Database/database.js';

const router = express.Router(); // Create a router object

// Middleware to parse incoming request bodies
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route for handling login with Spotify
router.get('/login', (req, res) => {
  // Redirect users to the Spotify authorization page
  const state = crypto.randomBytes(20).toString('hex'); // Generate random state value
  const scopes = 'playlist-read-private playlist-modify-private playlist-modify-public user-read-private user-read-email'; // Required scopes
  const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyclientId}&response_type=code&redirect_uri=${encodeURIComponent(spotifyredirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
  
  res.redirect(authorizeUrl);
});

// Function for handling callback from Spotify
export const spotifycallbackHandler = async (req, res) => {
  const {code} = req.query;
  // Exchange authorization code for access token
  try {
    const accessToken = await exchangeCodeForToken(code);
    //Get user profile data, from defined function assign to userId
    const userProfile = await getUserProfile(accessToken);
    const userId = userProfile.id;

    // Redirect to user playlists page with access token and user ID
    res.redirect(`/spotify/playlists?access_token=${accessToken}&user_id=${userId}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    res.status(500).send('Failed to exchange code for token');
  }
};

// Route for fetching user's playlists
router.get('/playlists', async (req, res) => {
  try {
    const accessToken = req.query.access_token; // Get access token from query params or session
    const userId = req.query.user_id; // Get user ID from query params or session

    // Retrieve the user's playlists from Spotify API
    const playlists = await getUserPlaylists(accessToken, userId);
    // Render the playlists in an HTML format
    let html = `
    <html>
    <head>
      <title>User Playlists</title>

      <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <body>
      <h1>User Playlists</h1>
      <ul>
    `;
    playlists.forEach(playlist => {
      const playlistLink = `/spotify/createPlaylist?access_token=${accessToken}&user_id=${userId}&playlist_id=${playlist.id}`;
      // Check if playlist.images is not null and not empty
      if (playlist.images && playlist.images.length > 0) {
        const playlistImageUrl = playlist.images[0].url;
        html += `<li class="playlist-entry"><img src="${playlistImageUrl}" alt="Playlist Image"> <div><strong>${playlist.name}</strong> (${playlist.tracks.total} tracks) - <a href="${playlistLink}">Create Public Playlist</a></div></li>`;
      } else {
        html += `<li class="playlist-entry"><strong>${playlist.name}</strong> by ${playlist.owner.display_name} (${playlist.tracks.total} tracks) - <a href="${playlistLink}">Create Public Playlist</a></li>`;
      }
    });
    html += `
          </ul>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for creating a public playlist from the selected playlist
router.get('/createPlaylist', async (req, res) => {
  try {
    const accessToken = req.query.access_token;
    const userId = req.query.user_id;
    const playlistId = req.query.playlist_id;

    // Ensure all required parameters are present
    if (!accessToken || !userId || !playlistId) {
      throw new Error('Missing required parameters');
    }

    // Render a form for the user to enter the playlist name
    const form = `
      <form action="/spotify/createPlaylist" method="post"> <!-- Adjusted action attribute -->
        <label for="playlistName">Enter Playlist Name:</label>
        <input type="text" id="playlistName" name="playlistName">
        <input type="hidden" name="accessToken" value="${accessToken}">
        <input type="hidden" name="userId" value="${userId}">
        <input type="hidden" name="playlistId" value="${playlistId}">
        <button type="submit">Create Public Playlist</button>
      </form>
    `;
    console.log(form);
    res.send(form);
  } catch (error) {
    console.error('Error creating public playlist:', error.message);
    res.status(500).send(error.message); // Send error message as response
  }
});

// Route for handling the form submission and creating the public playlist
router.post('/createPlaylist', async (req, res) => {
  try {
    const accessToken = req.body.accessToken;
    const userId = req.body.userId;
    const playlistId = req.body.playlistId;
    const playlistName = req.body.playlistName;

    // Ensure all required parameters are present
    if (!accessToken || !userId || !playlistId || !playlistName) {
      throw new Error('Missing required parameters');
    }

    // Retrieve tracks of the selected playlist
    const playlistTracks = await getPlaylistTracks(accessToken, playlistId);

    // Create a new public playlist
    const createdPlaylist = await createPlaylist(accessToken, userId, playlistName, 'This is a demo playlist created by the app', true);
    
    // Extract the playlist ID from the createdPlaylist response
    const newPlaylistId = createdPlaylist.id;

    // Extract track URIs from the playlist tracks
    const trackUris = playlistTracks.map(track => track.uri);

    // Add tracks to the newly created public playlist
    await addTracksToPlaylist(accessToken, userId, newPlaylistId, trackUris);

    // Redirect to the newly created public playlist
    res.redirect(`/spotify/redirectPlaylist/${newPlaylistId}`);
  } catch (error) {
    console.error('Error creating public playlist:', error.message);
    res.status(500).send(error.message); // Send error message as response
  }
});

// Route for redirecting to the newly created public playlist
router.get('/redirectPlaylist/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId) {
      throw new Error('Missing playlist ID');
    }

    // Redirect the user to the Spotify playlist page
    const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;
    res.redirect(playlistUrl);
  } catch (error) {
    console.error('Error redirecting to playlist:', error.message);
    res.status(500).send(error.message);
  }
});


export default router;