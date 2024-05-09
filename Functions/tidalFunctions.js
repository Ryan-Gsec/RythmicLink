import fetch from 'node-fetch';
import TidalAPI from "tidal-api-wrapper"
import { tidalclientId, tidalclientSecret, tidalredirectUri } from '../Config/tidalConfig.js';

// Function to exchange authorization code for access token
export async function exchangeCodeForToken(code, codeVerifier) {
    const tokenEndpoint = 'https://auth.tidal.com/v1/oauth2/token';
    
    const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: tidalclientId,
        code: code,
        redirect_uri: tidalredirectUri,
        code_verifier: codeVerifier,
    });

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            body: requestBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await response.json();
        console.log("token: ", tokenData);
        return tokenData;
    } catch (error) {
        console.error('Error exchanging code for token:', error.message);
        throw error;
    }
}

// Function to retrieve user's playlists
export async function getUserPlaylists(accessToken, userId) {
    const playlistsEndpoint = 'https://api.tidal.com/v2/user-playlists/197800930/public';
    console.log("endpoint: ", playlistsEndpoint);
    console.log("inside getplaylist function");
    try {
        const response = await fetch(playlistsEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('1Failed to retrieve playlists');
        }
        
        const playlistsData = await response.json();
        return playlistsData;
    } catch (error) {
        console.error('2Error retrieving playlists:', error.message);
        throw error;
    }
}