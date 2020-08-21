import React, { useCallback, useEffect, useState, Component} from 'react';
import Popup from "reactjs-popup";
import co from 'co';
import logo from './logo.svg';
import './App.css';
import ReactLoading from "react-loading";
import SpotifyWebApi from "spotify-web-api-js"; 
import useProgressiveImg from "./useProgressiveImg";
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
            artworkLink:"",
            byTitle: "",
            UPC: "",
            done: undefined,
            openEmailModal: false
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.musicInstance = this.props.musicInstance;
        this.signIn = this.signIn.bind(this);
    }
    openModal() {
        this.setState({ openEmailModal: true });
    }
    closeModal() {
        this.setState({ openEmailModal: false });
    }
    async componentDidMount(){
        console.log(window.location.pathname);
        var path = window.location.pathname.substring(1);
        var full = window.location.host
        //window.location.host is subdomain.domain.com
        var parts = full.split('.')
        var sub = parts[0]
     //   console.log(sub);
       let location = await axios.get('https://api.hostip.info/get_json.php');
//sub is 'subdomain', 'domain', type is 'com'
        var datares;
        let data =  await axios.post('https://endlss.herokuapp.com/createTheSite', {linkID:sub+"."+path.split('/')[0], location:location.data.city+"-"+location.data.country_name})
            .then(function (response) {
                datares = response.data;
            }).catch(err => console.log(err));
        if (datares.data===null){
            await axios.get('https://endlss.herokuapp.com/notfound').then(function (response) {
                document.getElementById("mydiv").innerHTML = response.data;
            });
        }else {
            document.title = datares.data.artistName + " - " + datares.data.albumName;
            var artwork = "https://music-dashboard-uploads.s3.us-east-2.amazonaws.com/private/" + datares.data.userId + "/" + datares.data.attachment;
            var byTitle = datares.data.albumName;
            await this.setState({
                title: datares.data.albumName,
                artworkLink: artwork,
                artistName: datares.data.artistName,
                descriptionName: datares.data.descriptionName,
                byTitle: byTitle,
                UPC: datares.data.UPC
            });
        }
       // this.setState({ done: true })
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
            axios.post('https://endlss.herokuapp.com/applemusic', {userToken:key, upc:that.state.UPC, urlLink: window.location.href})
                .then( (value) =>{button.innerHTML = "Pre-added!";that.openModal()})
                .catch(err => console.log(err));
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
           form.action ="https://endlss.herokuapp.com/login?updates=yes&upc="+this.state.UPC+"&url="+window.location.href;
        } else {
            form.action ="https://endlss.herokuapp.com/login?updates=no&upc="+this.state.UPC+"&url="+window.location.href;
        }
        return true;
    }
    render() {
        const params = this.getHashParams();
        const token = params.access_token;
        const userToken = params.userToken;
        console.log(userToken);
        return (
            <div class="app" id="mydiv">
                <Popup
                    open={this.state.openEmailModal}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                >
                    <div className="modal">
                        <a className="close" onClick={this.closeModal}>
                            &times;
                        </a>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae magni
                        omnis delectus nemo, maxime molestiae dolorem numquam mollitia, voluptate
                        ea, accusamus excepturi deleniti ratione sapiente! Laudantium, aperiam
                        doloribus. Odit, aut.
                    </div>
                </Popup>
                <div class="bg-image"><img style={this.state.done ? {} : {display: 'none'}} src={this.state.artworkLink} onLoad={() => this.setState({done: true})}/></div>
                {!this.state.done ? (
                    <div class="loading-container">
                    <ReactLoading type={"spin"} color={"white"} />
                    </div>
                ) : (
                <div id="contentfadein" class="content-container">
                    <h1 class="h1">{this.state.artistName}</h1>
                    <h2 class="h2">{this.state.byTitle}</h2>
                    <h3 class="h3">{this.state.descriptionName}</h3>
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
                            <button class="buttonApple" id="apple-music-authorize-button">Pre-Add on Apple Music</button>
                        </a>
                            <div class="checkboxcolumn">
                                <label class="checkboxContainer">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="myCheck" checked onClick="this.checked=!this.checked;"/>
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                        <div class="legalfooter">
                                <div class="legaltext"><p>By using this service, you agree to our <a class="legallinks" href="https://terms.endlessdigital.co" target="_blank"><br />Terms of Service</a> &
                                <a class="legallinks" href="https://privacy.endlessdigital.co" target="_blank"> Privacy Policy</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
                )}
        </div>
        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;