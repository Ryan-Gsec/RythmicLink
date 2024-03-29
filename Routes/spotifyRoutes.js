import express from 'express';
import crypto from 'crypto';
//import { authenticateSession } from '../MiddleWare/authMiddleware.js';
import bodyParser from 'body-parser';
import { exchangeCodeForToken, getUserProfile, getUserPlaylists, getPlaylistTracks, createPlaylist, addTracksToPlaylist } from '../Functions/spotifyFunctions.js'; // Import functions from separate file
import { clientId, clientSecret, redirectUri } from '../Config/spotifyConfig.js'; // Import Spotify API credentials from config file
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
  const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
  
  res.redirect(authorizeUrl);
});

// Function for handling callback from Spotify
export const callbackHandler = async (req, res) => {
  const { code, state } = req.query;

  // Validate state parameter to prevent CSRF attacks
  // Add your state validation logic here if needed

  // Exchange authorization code for access token
  try {
    const accessToken = await exchangeCodeForToken(code);

    // Retrieve user profile information to get the user ID
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
    let html = '<h1>User Playlists</h1>';
    html += '<ul>';
    playlists.forEach(playlist => {
      const playlistLink = `/spotify/createPlaylist?access_token=${accessToken}&user_id=${userId}&playlist_id=${playlist.id}`;
      html += `<li>${playlist.name} by ${playlist.owner.display_name} (${playlist.tracks.total} tracks) - <a href="${playlistLink}">Create Public Playlist</a></li>`;
    });
    html += '</ul>';

    res.send(html);
  } catch (error) {
    console.error('Error fetching user playlists:', error.message);
    res.status(500).send('Failed to fetch user playlists');
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
