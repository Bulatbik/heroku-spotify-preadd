const axios = require('axios');
var client_id = 'bd981a15dab84776b11094bbf8622dd0'; // Your client id
var client_secret = 'b7f54e137d354d96bfdd2afcf426af74'; // Your secret
var redirect_uri = 'https://young-peak-41948.herokuapp.com/callback'; // Your redirect uri
const jwt     = require("jsonwebtoken");
const fs      = require("fs");
const privateKey = fs.readFileSync(__dirname+"/AuthKey.p8").toString();
const teamId     = "6UD2Y7J6SN";
const keyId      = "6PAGB4SZ4L";
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
async function API(url,token,upc) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer "+token);
    myHeaders.append("Music-User-Token", upc);
    var raw = "";

    var requestOptions = {
        method: 'POST',
        headers: myHeaders
    };
    await fetch(url, requestOptions).then(
        function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }

            // Examine the text in the response
            response.json().then(function(data) {
                console.log(data);
            });
        }
    )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}
async function scheduler() {
    //Spotify presave
    let response = await axios.get('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumspresavelist',{headers:{"Content-Type" : "application/json"}});
    var uniqueReleasedUPDS = [];
    var uniqueNotReleasedUPDS = [];
    var uniqueReleasedSpotifyID = [];
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
            console.log("UPD already added");
            const isLargeNumber = (element) => element === response.data[i].albumUPC;
            var index = uniqueReleasedUPDS.findIndex(isLargeNumber);
            var albumID = uniqueReleasedSpotifyID[index];
            var refresh_token = response.data[i].refToken;
            console.log("This is refresh_token "+refresh_token);
            var access_tokenRaw = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
                    grant_type: "refresh_token", refresh_token: refresh_token
                }).toString(),
                {
                    headers: {
                        "Accept": "application/json",
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                    }
                }
            );
            var access_token = access_tokenRaw.data.access_token;
            console.log("This is access_token "+ access_token);
            const libraryAddResult =
                axios.put('https://api.spotify.com/v1/me/albums?ids=' + albumID,
                    {}, {headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': "Bearer " + access_token
                        }}
                )
            let deleteResponse = await axios.delete('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumdeletepresave',{data: { presaveID: response.data[i].presaveID}, headers:{"Content-Type" : "application/json"}});
            console.log("Response delete res: "+deleteResponse)
        }else if(uniqueNotReleasedUPDS.includes(response.data[i].albumUPC)){
            console.log("Do nothing");
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
                var access_tokenRaw = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
                        grant_type: "refresh_token", refresh_token: refresh_token
                    }).toString(),
                    {
                        headers: {
                            "Accept": "application/json",
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                        }
                    }
                );
                var access_token = access_tokenRaw.data.access_token;
                console.log("This is access_token "+ access_token);
                const libraryAddResult =
                    axios.put('https://api.spotify.com/v1/me/albums?ids=' + albumID,
                        {}, {headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': "Bearer " + access_token
                            }}
                    )
                uniqueReleasedUPDS.push(response.data[i].albumUPC);
                uniqueReleasedSpotifyID.push(albumID);
                let deleteResponse = await axios.delete('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumdeletepresave',{data: { presaveID: response.data[i].presaveID}, headers:{"Content-Type" : "application/json"}});
                console.log("Response delete res: "+deleteResponse)
            }catch (err) {
                console.log("Added to not released array");
                uniqueNotReleasedUPDS.push(response.data[i].albumUPC);
            }

        }

    }
    //Apple music preadd
    const jwtToken = jwt.sign({}, privateKey, {
        algorithm: "ES256",
        expiresIn: "180d",
        issuer: teamId,
        header: {
            alg: "ES256",
            kid: keyId
        }
    });
    let applepresaves = await axios.get('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumsapplepresavelist',{headers:{"Content-Type" : "application/json"}});
    var uniqueReleasedAppleUPDs = [];
    var uniqueNotReleasedAppleUPDs = [];
    var uniqueReleasedAppleIDs = [];
    console.log("Length:  "+applepresaves.data.length)
    for(var i = 0; i<applepresaves.data.length;i++){
        if(uniqueReleasedAppleUPDs.includes(applepresaves.data[i].albumUPC)) {

            console.log("Option 1");
            const isLargeNumber = (element) => element === applepresaves.data[i].albumUPC;
            var index2 = uniqueReleasedAppleUPDs.findIndex(isLargeNumber);
            var albumAppleID = uniqueReleasedAppleIDs[index2];
            var url2 = "https://api.music.apple.com/v1/me/library/?ids[albums]=" + albumAppleID;
            await API(url2,jwtToken,applepresaves.data[i].userToken);
            try {
                let deleteResponse1 = await axios.delete('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumdeletepresaveapple', {
                    data: {presaveID: applepresaves.data[i].presaveID},
                    headers: {"Content-Type": "application/json"}
                });
                console.log("deleteResponse: "+deleteResponse1);
            }catch (e) {
                console.log("ERROR: "+e)
            }
        }else if(uniqueNotReleasedAppleUPDs.includes(applepresaves.data[i].albumUPC)){
            console.log("Option 2");
        }else{
            try {
                console.log("https://itunes.apple.com/lookup?upc=" + applepresaves.data[i].albumUPC);
                var albumInfo;
                albumInfo = await axios({
                    method: 'get',
                    url: "https://itunes.apple.com/lookup?upc=" + applepresaves.data[i].albumUPC+'\n',
                    headers: {

                    }
                });
                const itunesApi = require("node-itunes-search");
                const lookupOptions = new itunesApi.ItunesLookupOptions({
                    keys: [applepresaves.data[i].albumUPC],
                    keyType: itunesApi.ItunesLookupType.UPC
                });

                itunesApi.lookupItunes(lookupOptions).then((result) => {
                    console.log("RESULT"+result);
                });
               //  console.log("Tje JSON: "+JSON.stringify(albumInfo.data));
                var  albumAppleID = albumInfo.data.results[0].collectionId;
                console.log("collectionId "+albumAppleID);
                var url = "https://api.music.apple.com/v1/me/library/?ids[albums]=" + albumAppleID;

                await API(url,jwtToken,applepresaves.data[i].userToken);
                try {
                    let deleteResponse1 = await axios.delete('https://dga92g9r39.execute-api.us-east-2.amazonaws.com/latest/albumdeletepresaveapple', {
                        data: {presaveID: applepresaves.data[i].presaveID},
                        headers: {"Content-Type": "application/json"}
                    });
                    console.log("deleteResponse: "+deleteResponse1);
                }catch (e) {
                    console.log("ERROR: "+e)
                }
                uniqueReleasedAppleUPDs.push(applepresaves.data[i].albumUPC);
                uniqueReleasedAppleIDs.push(albumAppleID);
            }catch(e){
                console.log("option 4 " + e);
                uniqueNotReleasedAppleUPDs.push(applepresaves.data[i].albumUPC);
            }
        }
    }
}
scheduler();