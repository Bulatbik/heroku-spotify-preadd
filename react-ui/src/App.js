import React, { useCallback, useEffect, useState, Component} from 'react';
import co from 'co';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from "spotify-web-api-js";
import {Helmet} from "react-helmet";
const spotifyApi = new SpotifyWebApi();
const axios = require('axios');
/*function App() {
  const [message, setMessage] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [url, setUrl] = useState('/api');
  const fetchData = useCallback(() => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setMessage(json.message);
        setIsFetching(false);
      }).catch(e => {
        setMessage(`API call failed: ${e}`);
        setIsFetching(false);
      })
  }, [url]);

  useEffect(() => {
    setIsFetching(true);
    fetchData();
  }, [fetchData]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        { process.env.NODE_ENV === 'production' ?
            <p>
              This is a production build from create-react-app.
            </p>
          : <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
        }
        <p>{'« '}<strong>
          {isFetching
            ? 'Fetching message from API'
            : message}
        </strong>{' »'}</p>
        <p><a
          className="App-link"
          href="https://github.com/mars/heroku-cra-node"
        >
          React + Node deployment on Heroku
        </a></p>
        <p><a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a></p>
      </header>
    </div>
  );

}*/
//export default App;

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
    render() {
        return (
            <div className="App">
                <div className="bg-image"><img src="/Albumcover.png"/></div>
                <div id="contentfadein" className="bg-text">
                    <img class="artwork" src="/Albumcover.png"/>
                    <h1 class="h1">Pre-Save/Pre-Add</h1>
                    <h2 class="h2">Light Path 8</h2>
                    <div>
                        <a className="buttonView" href="https://young-peak-41948.herokuapp.com/login" target="_blank">
                            <img className="spotifyLogo" src="/Spotify_Logo_RGB_Green.png" />
                        <form  action="https://young-peak-41948.herokuapp.com/login" target="_blank" method="get">
                            <button className="button">Pre-Save on Spotify</button></form></a>
                                <label class="checkboxContainer">Get updates from KILLY
                                    <input type="checkbox" checked/>
                                    <span class="checkmark"></span>
                                </label>
                        <a className="buttonViewApple" onClick={() => this.signIn()} id="apple-music-authorize">
                            <img className="appleLogo" src="/AppleMusic.png" />
                            <button className="buttonApple" onClick={() => this.signIn()} id="apple-music-authorize">Pre-Add on Apple Music</button>
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