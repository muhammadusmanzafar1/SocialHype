const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');


exports.getSounds = async (req, res) => {
    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email';
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
    }
