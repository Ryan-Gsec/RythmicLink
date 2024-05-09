import express from 'express';
import crypto from 'crypto';
import Tidal from 'tidal-api-wrapper'
import { tidalclientId, tidalredirectUri } from "../Config/tidalConfig.js";
import { exchangeCodeForToken, getUserPlaylists } from '../Functions/tidalFunctions.js';
const tidal = new Tidal();
const router = express.Router();
let codeVerifierex; 
router.get('/login', (req, res) => {
    // Generate a random state value
    const state = crypto.randomBytes(20).toString('hex');

    // Your TIDAL application's client ID and redirect URI
    const clientId = tidalclientId;
    const redirectUri = tidalredirectUri;

    // Define the scopes required by your application
    const scopes = 'playlists.read collection.read playlists.write collection.write';

    // Generate a random code verifier
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    codeVerifierex = codeVerifier;
    // Create the code challenge using SHA-256 hash function
    const codeChallenge = base64URLEncode(sha256(codeVerifier));
    // Construct the authorization URL with code challenge and method
    const authorizeUrl = `https://login.tidal.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    
    // Redirect the user to the authorization URL
    res.redirect(authorizeUrl);
});

// Callback route after authorization
export const tidalcallbackHandler = async (req, res) => {
    const { code, state } = req.query;

    try {
        const accessToken = await exchangeCodeForToken(code, codeVerifierex);
        console.log("code: ", code);
        //res.send('Access Token received');
        console.log(accessToken);
        const uid = accessToken.user_id;
        //console.log("uid: ", uid);
        res.redirect(`/tidal/playlists?access_token=${accessToken}&user_id=${uid}`);
    } catch(error) {
        console.error('Error exchanging code for token:', error.message);
        res.status(500).send('Failed to exchange code for token');
    }
};

// Route for fetching user's playlists
router.get('/playlists', async (req, res) => {
    try {
      const accessToken = req.query.access_token; // Get access token from query params or session
      const userId = req.query.uid; // Get user ID from query params or session
      console.log("Inside /playlists route");
      // Retrieve the user's playlists from Spotify API
      const playlists = await getUserPlaylists(accessToken, userId);
  
      // Render the playlists in an HTML format
      let html = '<h1>User Playlists</h1>';
      html += '<ul>';
      playlists.forEach(playlist => {
        const playlistLink = `/tidal/createPlaylist?access_token=${accessToken}&user_id=${userId}&playlist_id=${playlist.id}`;
        html += `<li>${playlist.name} by ${playlist.owner.display_name} (${playlist.tracks.total} tracks) - <a href="${playlistLink}">Create Public Playlist</a></li>`;
      });
      html += '</ul>';
  
      res.send(html);
    } catch (error) {
      console.error('Error fetching user playlists:', error.message);
      res.status(500).send('Failed to fetch user playlists');
    }
  });

  router.get('/sign-in', async (req, res) => {
    try{
      const user = await tidal.login('ryan.p.gonzales01@utrgv.edu', 'Rpg070998_')
      const playlists = await tidal.getPlaylists();
      let htmlResponse = "<h2>Your Playlists</h2><ul>";
      playlists.forEach(playlist => {
        if(playlist.publicPlaylist == true)
          {
            const playlistLink = playlist.url;
            htmlResponse += `<li><strong>${playlist.name}</strong> (${playlist.numberOfTracks} tracks)- <a href="${playlistLink}">Create Public Playlist</a></li>`;
          }
        });
        htmlResponse += `
          </ul>
        </body>
      </html>
    `;
    }catch (error) {
      console.error("Error during sign-in:", error);
      res.status(500).send("Error during sign-in");
  }
});

// Function to encode bytes to base64 URL encoding
function base64URLEncode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Function to compute SHA-256 hash
function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

export default router;