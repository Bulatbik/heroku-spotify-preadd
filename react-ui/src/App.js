import React, { useCallback, useEffect, useState, Component} from 'react';
import co from 'co';
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
            userToken: "userTokennn",
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
            openEmailModal: false,
            email: "",
            checkBoxDefaultStatus: true
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.musicInstance = this.props.musicInstance;
        this.signIn = this.signIn.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.test = this.test.bind(this);
        this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this);
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
      // let location = await axios.get('https://api.hostip.info/get_json.php');
       // let location = await axios.get('https://api.ipstack.com/check?access_key=37591f965e236f741bc6196bef32c8c2').then(function (response) {console.log(response.data)}
       // ).catch(err => console.log(err));

        var config = {
            method: 'get',
            url: 'https://api.ipstack.com/check?access_key=37591f965e236f741bc6196bef32c8c2',
            headers: {
                'Cookie': '__cfduid=d2d45e2f5c34f4180fa37edd645f8471a1598385770'
            }
        };
        var location;
        await axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                location = response;
            })
            .catch(function (error) {
                console.log(error);
            });
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
        var checkBox = document.getElementById("CheckApple");
      // var saveCheckBoxState = checkBox.checked;
        console.log("checkBoxDefaultStatus = "+this.state.checkBoxDefaultStatus);
        button.innerHTML = "Pre-adding...";
        axios.post('https://endlss.herokuapp.com/applemusicclicks', {urlLink: window.location.href})
       // checkBox.checked = true;
        let that = this;
        co(function*() {
            let key  = yield that.musicInstance.authorize();
          //  console.log(`Authorized, music-user-token: ${key}`);
            if(key) {
                that.setState({isLoginApple: true, userToken:key});
            }
            axios.post('https://endlss.herokuapp.com/applemusic', {userToken:key, upc:that.state.UPC, urlLink: window.location.href})
                .then( (value) =>{
                if(that.state.checkBoxDefaultStatus === true) {
                    that.openModal()
                }else{
                    button.innerHTML = "Pre-added!";
                }
                })
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
    handleEmailChange(event) {
        event.preventDefault();
        this.setState({email: event.target.value});
    }
    async test(e) {
        e.preventDefault();
        let that = this;
        var button = document.getElementById("apple-music-authorize-button");
        await axios.post('https://endlss.herokuapp.com/appleemail', {email:this.state.email, upc:this.state.UPC, userToken: this.state.userToken})
            .then(function (response) { button.innerHTML = "Pre-added!"; that.closeModal();
            }).catch(err => console.log(err));
    }
    handleCheckBoxClick(e){
     //   e.preventDefault();
        this.setState({checkBoxDefaultStatus: !this.state.checkBoxDefaultStatus})
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
      //  if(token!=null){
      //      window.history.pushState(null, null, '#myhash');
      //  }

        console.log(userToken);
        return (
            <div class="app" id="mydiv">
                <div class="bg-image"><img style={this.state.done ? {} : {display: 'none'}} src={this.state.artworkLink} onLoad={() => this.setState({done: true})}/></div>
                {!this.state.done ? (
                    <div class="loading-container">
                    <ReactLoading type={"spin"} color={"#FEB46D"} />
                    </div>
                ) : (
                <div id="contentfadein" class="content-container">
                    <div style={{marginTop: '0%'}}>
                    <h1 class="h1">{this.state.artistName}</h1>
                    <h2 class="h2">{this.state.byTitle}</h2>
                    <h3 class="h3">Available September 4</h3>
                    <div className="ssnotice"><p>Pre-save/pre-add my new EP "Ain't Shit Sweeter", and you'll have
                        the chance to win an exclusive merch bundle, to be revealed.</p>
                    </div>
                    </div>
                    <div style={{}}>
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
                        </div>
                                {!this.state.openEmailModal ? (
                                        <div className="checkboxcolumn">
                                <label class="checkboxContainer">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="CheckApple" checked={this.state.checkBoxDefaultStatus} onChange={this.handleCheckBoxClick} />
                                    <span class="checkmark"></span>
                                </label>
                                        </div>
                                ) : (

                                        <form className="checkboxcolumn" style={{width: "100%"}} onSubmit={this.test}>
                                        <h3 className="emailcapture">Confirm your email</h3>
                                        <input className="input1" type="eamil" value={this.state.email} onChange={this.handleEmailChange}/>
                                        <input type="submit" class="submit" value="CONTINUE"/>
                                        </form>

                                    )}
                            <a class="buttonViewApple" href="https://shop.ramriddlz.com"><button class="button">Official Shop</button></a>
                    </div>
                        <div class="textupdates"><p>For more updates from Ramriddlz<br/>Text 647-372-2252</p></div>
                        <div class="legalfooter">
                            <div class="sslink"><a href="https://competitions.endlessdigital.co">Competition Rules<br/><br/></a></div>
                                <div class="legaltext"><p>By using this service, you agree to our <a class="legallinks" href="https://terms.endlessdigital.co" target="_blank"><br />Terms of Service</a> &
                                <a class="legallinks" href="https://privacy.endlessdigital.co" target="_blank"> Privacy Policy</a>.</p>
                                </div>
                            <div><a href="https://instagram.com/endlessdigital"><img class="endlesslogo" src="endlesslogo.png"/></a></div>
                        </div>
                    </div>
                )}
        </div>
        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;