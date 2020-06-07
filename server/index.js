/*var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '631ca25cb3e0449aa420715f50dc6b73'; // Your client id
var client_secret = 'c2a34c1230904ddbab060d36b9020b01'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';*/
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
/*var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  //var scope = 'user-read-private user-read-email';
  const scopesArr = ['user-modify-playback-state','user-read-currently-playing','user-read-playback-state','user-library-modify',
    'user-library-read','playlist-read-private','playlist-read-collaborative','playlist-modify-public',
    'playlist-modify-private','user-read-recently-played','user-top-read'];
  const scope = scopesArr.join(' ');
  res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:3000/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
      } else {
        res.redirect('http://localhost:3000/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
//app.listen(8888);
app.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});*/
/*var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '631ca25cb3e0449aa420715f50dc6b73'; // Your client id
var client_secret = 'c2a34c1230904ddbab060d36b9020b01'; // Your secret
var redirect_uri = 'https://young-peak-41948.herokuapp.com'; // Your redirect uri
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';
const path = require('path');

// Multi-process to utilize all CPU cores.

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

  var stateKey = 'spotify_auth_state';
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build'))).use(cors()).use(cookieParser());
//app.use(express.static(__dirname + '/public'))
 //   .use(cors())
  //  .use(cookieParser());
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  //var scope = 'user-read-private user-read-email';
  const scopesArr = ['user-modify-playback-state','user-read-currently-playing','user-read-playback-state','user-library-modify',
    'user-library-read','playlist-read-private','playlist-read-collaborative','playlist-modify-public',
    'playlist-modify-private','user-read-recently-played','user-top-read'];
  const scope = scopesArr.join(' ');
  res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('https://young-peak-41948.herokuapp.com/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
      } else {
        res.redirect('https://young-peak-41948.herokuapp.com/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
  // Answer API requests.
  app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
  });
*/

var client_id = '631ca25cb3e0449aa420715f50dc6b73'; // Your client id
var client_secret = 'c2a34c1230904ddbab060d36b9020b01'; // Your secret
var redirect_uri = 'https://young-peak-41948.herokuapp.com/callback'; // Your redirect uri
var env = process.env.NODE_ENV || "development";

if (env === "development" || env === "test") {
  var config = require("./config.json");
  var envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const dynamicStatic = require('express-dynamic-static')();
const axios = require('axios');
const schedule = require("node-schedule");
let rule = new schedule.RecurrenceRule();
rule.tz = 'America/Chicago';
// runs at 15:00:00
rule.second = 0;
rule.minute = 33;
rule.hour = 17;
//import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require('uuid');

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
const router = express.Router();
// Multi-process to utilize all CPU cores.
async function scheduler() {
 let response = await axios.get('https://n3owwdpps6.execute-api.us-east-2.amazonaws.com/latest/albumspresavelist',{headers:{"Content-Type" : "application/json"}});
 //console.log(response.data);
  var uniqueReleasedUPDS = [];
  var uniqueNotReleasedUPDS = [];
  const bearer =
      await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
            grant_type: "client_credentials",
          }).toString(),
          {
            headers: {
              "Accept": "application/json",
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            }
          }
      )
  console.log("bearer check "+bearer.data.access_token);
  for(var i = 0; i<response.data.length;i++){
     if(uniqueReleasedUPDS.includes(response.data[i].albumUPC)){

     }else if(uniqueNotReleasedUPDS.includes(response.data[i].albumUPC)){

     }else{
       console.log("In else");
       try {
         const UPDsearch =
             await axios.get('https://api.spotify.com/v1/search?q=upc%3A' + response.data[i].albumUPC + '&type=album',
                 {
                   headers: {
                     'Content-Type': 'application/json',
                     'Accept': 'application/json',
                     'Authorization': "Bearer " + bearer.data.access_token//'Bearer BQBQmqs03OwSdKWNES3WpgU4sUJ0MOeefDCcAz_5eLrafXY9WBvWdxbqAvYvRLtRsz6IBTXzA4zFIMyXKd0'
                   }
                 }
             )
         const albumID = UPDsearch.data.albums.items[0].id;
         console.log("The album ID check: "+albumID);
         var refresh_token = response.data[i].refToken;
         console.log("This is refresh_token "+refresh_token);
         var access_token = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
               grant_type: "refresh_token", refresh_token: refresh_token
             }).toString(),
             {
               headers: {
                 "Accept": "application/json",
                 'Content-Type': 'application/x-www-form-urlencoded',
                 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
               }
             }
         ).access_token;
        /* var authOptions = {
           url: "https://accounts.spotify.com/api/token",
           headers: {
             Authorization:
                 "Basic " +
                 new Buffer(
                     client_id + ":" + client_secret
                 ).toString("base64")
           },
           form: {
             grant_type: "refresh_token",
             refresh_token: refresh_token
           },
           json: true
         };
         var access_token;
         request.post(authOptions, function(error, response, body) {
           if (!error && response.statusCode === 200) {
              access_token = body.access_token;
           }
           console.log("This is error "+error);
         });*/
         console.log("This is access_token "+ access_token);
         const libraryAddResult =
             axios.put('https://api.spotify.com/v1/me/albums?ids=' + albumID,
                 {
                   headers: {
                     'Content-Type': 'application/json',
                     'Accept': 'application/json',
                     'Authorization': "Bearer " + access_token
                   }
                 }
             )
         uniqueReleasedUPDS.push(response.data[i].albumUPC);

       }catch (err) {
         uniqueNotReleasedUPDS.push(response.data[i].albumUPC);
       }
      
     }

  }
}
schedule.scheduleJob(rule, () => {
  scheduler();
}); // run every minute
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
        `Node cluster worker ${
            worker.process.pid
        } exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  // Priority serve any static files.
 // app.use(express.static(path.resolve(__dirname, '../react-ui/build', __dirname+'/public'))).use(cors()).use(cookieParser());
  //app.use(dynamicStatic);

  app.use(express.static(path.resolve(__dirname, '../react-ui/build'))).use(cors()).use(cookieParser());
  var stateKey = "spotify_auth_state";
  //dynamicStatic.setPath(path.resolve(__dirname, '../react-ui/build'));
  app.get("/login", function(req, res) {
    //dynamicStatic.setPath(path.resolve(__dirname, '../react-ui/build'));
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    var scope =
        "user-read-recently-played user-read-private user-read-email user-read-playback-state user-top-read user-library-modify";
    res.redirect(
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: client_id,
          scope,
          redirect_uri: redirect_uri,
          state
        })
    );
  });
 /* app.get('*', function(req, res) {
    dynamicStatic.setPath(path.resolve(__dirname, '../react-ui/build'));

    // res.render...
  });*/
  app.get('/loginOne', function (req, res) {
    // dynamicStatic.setPath(__dirname + '/public');
    // res.render(__dirname + '/public');
    res.sendFile(path.join(__dirname+'/public/index.html'));
  });
  app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
              refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
            var email = body.email;
            var userID = body.id;
            var userName = body.display_name;
            let data = JSON.stringify({
              albumid: uuidv4(),
              albumUPC: "886447779774",
              username: userName,
              email: email,
              userID: userID,
              refToken: refresh_token
            });
            axios.post('https://n3owwdpps6.execute-api.us-east-2.amazonaws.com/latest/albumspresave',data,{headers:{"Content-Type" : "application/json"}});
          });
          //////////

          //////////
          // we can also pass the token to the browser to make requests from there
          res.redirect('https://young-peak-41948.herokuapp.com/#' +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));
        } else {
          res.redirect('https://young-peak-41948.herokuapp.com/#' +
              querystring.stringify({
                error: 'invalid_token'
              }));
        }
      });
    }
  });

  app.get("/refresh_token", function(req, res) {
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
            "Basic " +
            new Buffer(
                client_id + ":" + client_secret
            ).toString("base64")
      },
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          access_token: access_token
        });
      }
    });
  });

  app.listen(PORT, function() {
    console.error(
        `Node ${
            isDev ? "dev server" : "cluster worker " + process.pid
        }: listening on port ${PORT}`
    );
  });
}
