import fetch from 'node-fetch';
import { spotifyclientId, spotifyclientSecret, spotifyredirectUri } from '../Config/spotifyConfig.js';

// Function to exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';
  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: spotifyredirectUri,
    client_id: spotifyclientId,
    client_secret: spotifyclientSecret,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    throw error;
  }
}

// Function to retrieve user profile information
export async function getUserProfile(accessToken) {
  const userProfileEndpoint = 'https://api.spotify.com/v1/me';

  try {
    const response = await fetch(userProfileEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user profile');
    }

    const data = await response.json();
    return data; // Return user profile information
  } catch (error) {
    console.error('Error retrieving user profile:', error.message);
    throw error;
  }
}

// Function to retrieve user's playlists
export async function getUserPlaylists(accessToken, userId) {
  const playlistsEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;

  try {
    const response = await fetch(playlistsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user playlists');
    }

    const data = await response.json();
    return data.items; // Return an array of playlist objects
  } catch (error) {
    console.error('Error retrieving user playlists:', error.message);
    throw error;
  }
}



// Function to retrieve tracks of the selected playlist
export async function getPlaylistTracks(accessToken, playlistId) {
  const playlistTrackInfoEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  try {
    const response = await fetch(playlistTrackInfoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve playlist tracks');
    }

    const data = await response.json();
    return data.items.map(item => item.track);
  } catch (error) {
    console.error('Error retrieving playlist tracks:', error.message);
    throw error;
  }
}

// Function to create a new playlist
export async function createPlaylist(accessToken, userId, name, description, isPublic) {
  const createPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;

  try {
    const response = await fetch(createPlaylistEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: description,
        public: isPublic,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating playlist:', error.message);
    throw error;
  }
}

// Function to add tracks to a playlist
export async function addTracksToPlaylist(accessToken, userId, playlistId, trackUris) {
  const addTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  try {
    const response = await fetch(addTracksEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding tracks to playlist:', error.message);
    throw error;
  }
}