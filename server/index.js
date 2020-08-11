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
var vhost = require('vhost')
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
var connect = require('connect');
var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();
var FormData = require('form-data');
const fs      = require("fs");
const jwt     = require("jsonwebtoken");
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
const privateKey = fs.readFileSync(__dirname+"/AuthKey.p8").toString();
const teamId     = "6UD2Y7J6SN";
const keyId      = "6PAGB4SZ4L";
let rule = new schedule.RecurrenceRule();
var https = require('https');
rule.tz = 'America/Chicago';
// runs at 15:00:00
rule.second = 0;
rule.minute = 0;
rule.hour = 23;
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
//schedule.scheduleJob(rule, () => {
//    scheduler();
//}); // run every minute


if (!isDev && cluster.isMaster) {
    console.error(`Node cluster master ${process.pid} is running`)
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
   app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.enable('trust proxy');
    app.use(express.static(path.resolve(__dirname, '../react-ui/build'))).use(cors()).use(cookieParser());
    var stateKey = "spotify_auth_state";

//    app.all(/.*/, function(req, res, next) {
    //    var host = req.header("host");
    //    if (host.match(/^herokuapp\..*/i)) {
    //        res.redirect(301, "https://www." + host + req.url);
    //    } else {
    //        next();
    //    }
    //});
    app.use (function (req, res, next) {
        if (req.secure) {
            // request was via https, so do no special handling
            next();
        } else {
            // request was via http, so redirect to https
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
    app.all(/.*/, function(req, res, next) {
           var host = req.header("host");
            if (host.match(/^herokuapp\..*/i)) {
                res.redirect(301, "https://www." + host + req.url);
            } else {
                next();
            }
        });

    app.post("/login", function(req, res) {
        //dynamicStatic.setPath(path.resolve(__dirname, '../react-ui/build'));
        // var state = generateRandomString(16);
        //res.cookie(stateKey, state);
        var state =  req.query.updates+"@"+req.query.upc+"@"+req.query.url;
        console.log("THIS SHows if user allowed: "+state);
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

    app.post('/applemusic', jsonParser, (req, res) => {
        //dirname:/app/server!!!!
        let token = req.body.userToken;
        const jwtToken = jwt.sign({}, privateKey, {
            algorithm: "ES256",
            expiresIn: "180d",
            issuer: teamId,
            header: {
                alg: "ES256",
                kid: keyId
            }
        });
        console.log(jwtToken);
        var albumUPC = req.body.upc;
        let data = JSON.stringify({
            presaveID: albumUPC+req.body.userToken,
            albumUPC: albumUPC,
            userToken: req.body.userToken
        });
        axios.post('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumspresaveapple',data,{headers:{"Content-Type" : "application/json"}});

        // res.send(req.body.userToken);
        res.redirect(req.body.urlLink+'/#' +
            querystring.stringify({
                userToken: req.body.userToken,
            }));

    });

    app.get('/loginOne', function (req, res) {
        // dynamicStatic.setPath(__dirname + '/public');
        // res.render(__dirname + '/public');
        // console.log(jwtToken);
        // res.sendFile(path.join(__dirname+'/public/index.html'));
        // res.sendFile(path.join(__dirname + '/../react-ui/build/static/App.js'));
        // res.render(__dirname+ '/public/index.html', {jwtToken: jwtToken});
        // res.render(path.join(__dirname + "/public/index.html"), {data: jwtToken});
    });
    app.get('/callback', async function(req, res) {

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
            const finalData = state.split('@');
            console.log("Debug: "+finalData);
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
                     request.get(options, async function(error, response, body) {
                        console.log(body);
                        var email = body.email;
                        var userID = body.id;
                        var userName = body.display_name;
                        let data = JSON.stringify({
                            presaveID: finalData[1]+email,
                            albumUPC: finalData[1],
                            username: userName,
                            email: email,
                            country: body.country,
                            userID: userID,
                            refToken: refresh_token,
                            wantsUpdates: finalData[0]
                        });
                        axios.post('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumspresave',data,{headers:{"Content-Type" : "application/json"}});
                         var data2 = `{\n    "presaveID":\"${finalData[1]+email}\",\n    "albumUPC": \"${finalData[1]}\",\n    "username": \"${userName}\",\n   "email": \"${email}\",\n   "country": \"${body.country}\", \n    "wantsUpdates": \"${finalData[0]}\" \n}`;
                         var config = {
                             method: 'post',
                             url: 'https://3n7l32gl97.execute-api.us-east-2.amazonaws.com/prod/download',
                             headers: {
                                 'X-Amz-Content-Sha256': 'beaead3198f7da1e70d03ab969765e0821b24fc913697e929e726aeaebf0eba3',
                                 'X-Amz-Date': '20200726T211855Z',
                                 'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAXDN6B3K7VJCHHJQP/20200726/us-east-2/execute-api/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=dc0eed8e238a7737b98f87fd6d67504cf92364f22b6e7d983d40254ec93d497d',
                                 'Content-Type': 'text/plain'
                             },
                             data : data2
                         };

                         axios(config)
                             .then(function (response) {
                                 console.log(JSON.stringify(response.data));
                             })
                             .catch(function (error) {
                                 console.log(error);
                             });
                    });
                    //////////

                    //////////
                    // we can also pass the token to the browser to make requests from there
                    res.redirect(finalData[2]+'/#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }));
                } else {
                    res.redirect(finalData[2]+'/#' +
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
   // app.post('/submit', urlencodedParser, function(req, res){
  //      var nom = req.body.nom;
        /* save nom to database */
   //     res.redirect('http://myDomain/' + nom);
   // });

    //app.get('/:nom', function(req, res){
        /* if nom exists in database -> return ejs template with vars */
        /* else return 404 */
   // });

    app.get("/Albumcover.png", (req, res) => {
        res.sendFile(path.join(__dirname+'/Albumcover.png'));
    });
    app.get("/Spotify_Logo_RGB_Green.png", (req, res) => {
        res.sendFile(path.join(__dirname+'/Spotify_Logo_RGB_Green.png'));
    });
    app.get("/AppleMusic.png", (req, res) => {
        res.sendFile(path.join(__dirname+'/AppleMusic.png'));
    });

    app.get("/test", async (req, res) => {
       // res.sendFile(path.join(__dirname+'/AppleMusic.png'));

    });
    app.get("/notfound",  (req, res) => {
        // res.sendFile(path.join(__dirname+'/AppleMusic.png'));
      //  res.status(404).send('what???');
    //    res.sendFile(path.join(__dirname+'/public/404.html'));
     //   app.use(express.static(path.join(__dirname, 'public')));
      //  res.render(path.join(__dirname + "/public/404.html"));
       // res.render(__dirname + '/public');
      //  next();
        console.log("Im in notfound");
      //  res.sendFile(path.join(__dirname+'/public/404.html'));
      //  res.sendFile(path.join(__dirname,'/index.ejs'));
        dynamicStatic.setPath(__dirname);
        res.render('index');
      //  res.end();
      //  res.status(404).end();
      //  res.sendFile(path.join(__dirname+'/public/404.html'));
     /*   res.sendFile(__dirname + '/index.html', function(err) {
            if (err) {
                res.status(err.status).end();
            }
        });*/
    });

    app.post("/createTheSite", jsonParser,  async (req, res) => {
        var link = req.body.linkID;
       // link = link.substring(1);
        console.log(link);
        var data = new FormData();
        var config = {
            method: 'get',
            url: 'https://3n7l32gl97.execute-api.us-east-2.amazonaws.com/prod/storage/'+link,
            headers: {
                'linkID': '"F"',
                'X-Amz-Date': '20200720T141442Z',
                'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAXDN6B3K7VJCHHJQP/20200720/us-east-2/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=d158d7856a29fa81d913a82c69b2f0c84752c70661d2f9aa295e28df82fe7a7c',
                ...data.getHeaders()
            },
            data : data
        };
        var theData;
         await axios(config)
            .then(function (response) {
                console.log("This is data!! ="+JSON.stringify(response.data));
                theData = response.data;
                theData = JSON.parse(JSON.stringify(theData));
                res.send({
                    data: theData
                });
            })
            .catch(function (error) {
                console.log("ERROR");
               // console.log(error);
                // res.redirect("/AppleMusic.png");
               // res.sendFile(path.join(__dirname+ '/public/404.html'));
                res.redirect(301,"/notfound");
             //   res.end();
             //   res.status(404).end();
            });
       /* var myHeaders = new Headers();
        var headerValue = `\"${link}\"`

        console.log("headerValu: " + headerValue);
        myHeaders.append("id", headerValue.toString());
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        var theData;
        await fetch("https://n3owwdpps6.execute-api.us-east-2.amazonaws.com/latest/getdata", requestOptions)
            .then(response => response.text())
            .then(result => {
                theData = result
            })
            .catch(error => console.log('error', error));*/
    });
    app.get('*', function(request, response) {
     //   response.redirect('https://' + request.headers.host + request.url);
     //   response.writeHead(301, { "Location": "https://" + request.headers['host'] + request.url });
        response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
    });
     /*app.get('/:id', async (req, res) => {
         let albumPageInfo = await axios.get('https://n3owwdpps6.execute-api.us-east-2.amazonaws.com/latest/getdata');
         console.log("Artist Data");
         console.dir(albumPageInfo.data)
         res.render(__dirname +'/views/index', {
             albumName: albumPageInfo.data.Item.albumName.S,
             ImageLink: albumPageInfo.data.Item.imageLink.S
         });
    });*/
    app.listen(PORT, function() {
        console.error(
            `Node ${
                isDev ? "dev server" : "cluster worker " + process.pid
            }: listening on port ${PORT}`
        );
    });

}
