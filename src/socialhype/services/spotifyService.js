const axios = require('axios');
const querystring = require('querystring');
const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const SpotifyModel = require('../models/spotifyAccessToken');

async function getSpotifyAuthUrl(code) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

    const authString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Spotify auth URL error:", error || error.message);
        throw new ApiError(error.message || "Failed to get Spotify auth URL", httpStatus.status.INTERNAL_SERVER_ERROR);

    }
}

async function refreshAccessToken(refreshToken) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const authString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Spotify refresh token error:", error || error.message);
        throw new ApiError(error.message || "Failed to refresh Spotify access token", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
};

async function getValidAccessToken(userId) {
    try {
        const tokenData = await SpotifyModel.findOne({ userId: userId });

        const currentTime = Date.now();

        if (currentTime >= tokenData.expiresIn) {
            const newTokens = await refreshAccessToken(tokenData.refreshToken);

            tokenData.accessToken = newTokens.access_token;
            tokenData.refreshToken = newTokens.refresh_token;
            tokenData.expiresIn = new Date(Date.now() + newTokens.expires_in * 1000);
            const updatedData = await tokenData.save();

            return updatedData.accessToken;
        }

        return tokenData.accessToken;
    } catch (error) {
        console.error("Error fetching valid access token:", error || error.message);
        throw new ApiError(error.message || "Failed to fetch valid access token", httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

// async function getUserTopTracks(accessToken) {
//     try {
//       const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         params: {
//           limit: 50,
//           time_range: 'long_term', // "long_term", "medium_term", or "short_term"
//         },
//       });
//       console.log("sound", response.data);

//       return response.data.items; // An array of tracks
//     } catch (error) {
//       console.error('Error fetching top tracks:', error.response.data || error.message);
//       throw new ApiError(error.message || "Failed fetch tracks", httpStatus.status.INTERNAL_SERVER_ERROR);
//     }
//   }

async function getNewReleasesForCountry(accessToken, countryCode, limit) {
    try {
        const albumsResponse = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                country: countryCode,
                limit: limit,
            },
        });

        const albums = albumsResponse.data.albums.items;
        let allTracks = [];

        for (const album of albums) {
            const albumId = album.id;
            const tracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    limit: limit 
                }
            });

            const tracks = tracksResponse.data.items.map(track => ({
                name: track.name,
                spotifyUrl: track.external_urls.spotify,
                previewUrl: track.preview_url,
                trackNumber: track.track_number,
                albumName: album.name,
                artistNames: album.artists.map(artist => artist.name).join(', ')
            }));

            allTracks.push(...tracks);
        }

        return allTracks;
    } catch (error) {
        console.error("Error fetching new released tracks:", error.response?.data || error.message);
        throw new Error("Failed to fetch new release tracks.");
    }
}



module.exports = {
    getSpotifyAuthUrl,
    refreshAccessToken,
    getValidAccessToken,
    // getUserTopTracks,
    getNewReleasesForCountry
}

