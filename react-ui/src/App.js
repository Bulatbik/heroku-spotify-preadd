import React, { useCallback, useEffect, useState, Component} from 'react';
import co from 'co';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from "spotify-web-api-js";
import {Helmet} from "react-helmet";
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
            isLoginApple: false
        }
        this.musicInstance = this.props.musicInstance;
    }
   /* componentDidMount () {
        document.addEventListener('musickitloaded', () => {
            // MusicKit global is now defined
            fetch('/applemusictoken').then(response => response.json()).then(res => {
                const music =  window.MusicKit.configure({
                    developerToken: res.token,
                    app: {
                        name: 'PreAdd for Apple Music',
                        build: '1978.4.1'
                    }
                });
                this.setState({music:music});

                // setup click handlers

                document.getElementById('apple-music-authorize').addEventListener('click', () => {

                    music.authorize().then(musicUserToken => {
                        console.log(`Authorized, music-user-token: ${musicUserToken}`);
                    });
                });

                // expose our instance globally for testing
                window.music = music;
            });
        });

    }*/
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
        let that = this;
        co(function*() {
            let key  = yield that.musicInstance.authorize();
            console.log(`Authorized, music-user-token: ${key}`);
            if(key) {
                that.setState({isLoginApple: true});
            }
            axios.post('https://young-peak-41948.herokuapp.com/applemusic', {userToken:key})
                .then(response => console.log(response))
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
           form.action ="https://young-peak-41948.herokuapp.com/login?updates=yes";
        } else {
            form.action ="https://young-peak-41948.herokuapp.com/login?updates=no";
        }
    //   axios.get('https://young-peak-41948.herokuapp.com/login')
    //        .then(response => console.log(response))
    //        .catch(err => console.log(err));
        return true;
    }
    render() {
        const params = this.getHashParams();
        const token = params.access_token;
        console.log("Token: "+token)
        return (
            <div class="app">
                <div class="bg-image"><img src="/Albumcover.png"/></div>
                <div id="contentfadein" class="bg-text">
                    <img class="artwork" src="/Albumcover.png"/>
                    <h1 class="h1">Pre-Save/Pre-Add</h1>
                    <h2 class="h2">Light Path 8</h2>
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
                                <label class="checkboxContainer">Get updates from KILLY
                                    <input type="checkbox" id="myCheck" checked onClick="this.checked=!this.checked;"/>
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                        <a class="buttonViewApple" onClick={() => this.signIn()} id="apple-music-authorize">
                            <img class="appleLogo" src="/AppleMusic.png" />
                            <button class="buttonApple" onClick={() => this.signIn()} id="apple-music-authorize">Pre-Add on Apple Music</button>
                        </a>
                        <div class="legallinks">
                            <a href="https://endlessdigital.co/terms">Terms of Service&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
                            <span class="legal_links_seperator">|</span>
                            <a href="https://endlessdigital.co/privacy">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;