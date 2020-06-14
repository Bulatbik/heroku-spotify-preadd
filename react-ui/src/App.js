import React, { useCallback, useEffect, useState, Component} from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from "spotify-web-api-js";
import {Helmet} from "react-helmet";
const spotifyApi = new SpotifyWebApi();
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

const meta1 = {
    title: 'Some Meta Title',
    description: 'I am a description, and I can create multiple tags',
    canonical: 'http://example.com/path/to/page',
    meta: {
        charset: 'utf-8',
        name: "apple-music-developer-token",
        content: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZQQUdCNFNaNEwifQ.eyJpYXQiOjE1OTIwNzAxNTksImV4cCI6MTYwNzYyMjE1OSwiaXNzIjoiNlVEMlk3SjZTTiJ9.u-KKSe1kASGkxWKv12YaNcovI4d4h-48pHVVzV9v5rex4yB_Guqso1E5r02HiujOStdSeQP8nyDDnD3Rk2cFzw"
    }
}
const meta2 = {
    title: 'Some Meta Title',
    description: 'I am a description, and I can create multiple tags',
    canonical: 'http://example.com/path/to/page',
    meta: {
        charset: 'utf-8',
        name: "apple-music-app-name",
        content: "PreAdd for Apple Music"
    }
}
const meta3 = {
    title: 'Some Meta Title',
    description: 'I am a description, and I can create multiple tags',
    canonical: 'http://example.com/path/to/page',
    meta: {
        charset: 'utf-8',
        name: "apple-music-app-build",
        content: "1978.4.1"
    }
}

class App extends Component {
    constructor(){
        super();
        const params = this.getHashParams();
        const token = params.access_token;

        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.state = {
            loggedIn: token ? true : false,
            nowPlaying: { name: 'Not Checked', albumArt: '' },
            trackToAdd: {trackIds: []}
        }
    }
    componentDidMount () {
        const script = document.createElement("script");

        script.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
        script.async = true;

        document.body.appendChild(script);
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
    render() {
        return (
            <div className="App">
                <a href='https://young-peak-41948.herokuapp.com/login' > PreAdd Album with Spotify </a>
                <a href='https://young-peak-41948.herokuapp.com/loginOne' > PreAdd Album with Apple Music </a>
                <button id="apple-music-authorize">apple-music-authorize</button>
                <script>(function() {
                    document.addEventListener('musickitloaded', () => {
                        // MusicKit global is now defined
                        fetch('/applemusictoken').then(response => response.json()).then(res => {
                            /***
                             Configure our MusicKit instance with the signed token from server, returns a configured MusicKit Instance
                             https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance
                             ***/
                            const music = MusicKit.configure({
                                developerToken: res.token,
                                app: {
                                    name: 'PreAdd for Apple Music',
                                    build: '1978.4.1'
                                }
                            });

                            // setup click handlers

                            document.getElementById('apple-music-authorize').addEventListener('click', () => {
                                /***
                                 Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
                                 https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992701-authorize
                                 ***/
                                music.authorize().then(musicUserToken => {
                                    console.log(`Authorized, music-user-token: ${musicUserToken}`);
                                });
                            });

                            // expose our instance globally for testing
                            window.music = music;
                        });
                    })};
                )();
                </script>
                <div>
                    Now Playing: { this.state.nowPlaying.name }
                </div>
                <div>
                    <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
                </div>
                { this.state.loggedIn &&
                <button onClick={() => this.getNowPlaying()}>
                    Check Now Playing
                </button>
                }
                { this.state.loggedIn &&
                  <button onClick={() => this.addToLibrary()}>
                Add it to your library
                </button>
            }
            </div>

        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;