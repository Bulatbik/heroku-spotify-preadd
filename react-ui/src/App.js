import React, { useCallback, useEffect, useState, Component} from 'react';
import co from 'co';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from "spotify-web-api-js";
const spotifyApi = new SpotifyWebApi();
const axios = require('axios');

const useScript = url => {
    useEffect(() => {
        const script = document.createElement('script');

        script.src = url;
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, [url]);
};

class App extends Component {
    constructor(props){
        super(props);
        const params = this.getHashParams();
        const token = params.access_token;

        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.state = {
            loggedIn: token ? true : false,
            nowPlaying: { name: 'Not Checked', albumArt: '' },
            trackToAdd: {trackIds: []},
            music: [],
            isLoginApple: false,
            title: "",
            artistName: "",
            artworkLink:""
        }
        this.musicInstance = this.props.musicInstance;
    }
    async componentWillMount(){
        console.log(window.location.pathname);
        var full = window.location.host
        //window.location.host is subdomain.domain.com
        var parts = full.split('.')
        var sub = parts[0]
        console.log(sub);
//sub is 'subdomain', 'domain', type is 'com'
        var datares;
        let data =  await axios.post('https://young-peak-41948.herokuapp.com/createTheSite', {linkID:sub+"."+window.location.pathname.substring(1)})
            .then(function (response) {
                datares = response.data;
            }).catch(err => console.log(err));
        console.dir(datares.data.albumName);
        var artwork = "https://music-dashboard-uploads.s3.us-east-2.amazonaws.com/private/"+datares.data.userId+"/"+datares.data.attachment;
        this.setState({title:datares.data.albumName,artworkLink: artwork, artistName: datares.data.artistName})
       // this.setState({albumName: datares.data.data.data.albumName})
        // console.log(datares.data);
        // console.dir(data);
        // console.dir(data.data);
    }
    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        e = r.exec(q)
        while (e) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(q);
        }
        return hashParams;
    }
    getNowPlaying(){
        spotifyApi.getMyCurrentPlaybackState()
            .then((response) => {
                this.setState({
                    nowPlaying: {
                        name: response.item.name,
                        albumArt: response.item.album.images[0].url
                    },
                    trackToAdd: {
                        trackIds: response.item.id
                    }
                });
            })
    }
    addToLibrary(){
        spotifyApi.addToMySavedAlbums(["55zg331p7m1EFA4uRggkwt"]).then((e,r) =>{
            console.dir(e);
            console.dir(r);

        })
    }

    signIn() {
        var button = document.getElementById("apple-music-authorize-button");
        button.innerHTML = "Pre-adding...";
        let that = this;
        co(function*() {
            let key  = yield that.musicInstance.authorize();
            console.log(`Authorized, music-user-token: ${key}`);
            if(key) {
                that.setState({isLoginApple: true});
            }
            axios.post('https://endlss.to/applemusic', {userToken:key})
                .then( button.innerHTML = "Pre-added!")
                .catch(err => console.log(err));

         //   console.log(that.musicInstance.api.addToLibrary({ ["albums"]: ["1106659171"] }));
        });

    }


    signOut() {
        let that = this;
        co(function*() {
            let status = yield that.musicInstance.unauthorize();
            console.log(status);
            that.setState({isLoginApple: false});
        });
    }
    OnSubmitForm()
    {
        var button = document.getElementById("buttonSpotify");
        var checkBox = document.getElementById("myCheck");
        var form = document.getElementById("myform");
        button.innerHTML = "Pre-saving...";
        if (checkBox.checked === true){
           form.action ="https://endlss.to/login?updates=yes";
        } else {
            form.action ="https://endlss.to/login?updates=no";
        }
        return true;
    }
    render() {
        const params = this.getHashParams();
        const token = params.access_token;
        const userToken = params.userToken;
        console.log(userToken);
        return (
            <div class="app">
                <div class="bg-image"><img src={this.state.artworkLink}/></div>
                <div id="contentfadein" class="content-container">
                    <img class="artwork" src={this.state.artworkLink}/>
                    <h1 class="h1">Pre-Save/Pre-Add</h1>
                    <h2 class="h2">{this.state.title} by {this.state.artistName}</h2>
                    <div>
                        <a class="buttonView" onClick={() => this.OnSubmitForm()}>
                            <img class="spotifyLogo" src="/Spotify_Logo_RGB_Green.png" />
                            {(token!=null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="button"id="buttonSpotify">Pre-Saved!</button>
                                </form> )}
                            {(token==null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="button" id="buttonSpotify">Pre-Save on Spotify</button>
                                </form> )}
                                </a>
                            <div class="checkboxcolumn">
                                <label class="checkboxContainer">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="myCheck" checked onClick="this.checked=!this.checked;"/>
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                        <a class="buttonViewApple" onClick={() => this.signIn()} id="apple-music-authorize">
                            <img class="appleLogo" src="/AppleMusic.png" />
                            <button class="buttonApple" onClick={() => this.signIn()} id="apple-music-authorize-button">Pre-Add on Apple Music</button>
                        </a>
                        <div class="legallinks">
                            <a href="https://endless.lnk.to/TOS" target="_blank">Terms of Service&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
                            <span class="legal-links-seperator">|</span>
                            <a href="https://endless.lnk.to/PrivacyPolicy" target="_blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;