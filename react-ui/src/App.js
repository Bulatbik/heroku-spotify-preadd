import React, { useCallback, useEffect, useState, Component} from 'react';
import co from 'co';
import './App.css';
import ReactLoading from "react-loading";
import SpotifyWebApi from "spotify-web-api-js";
import moment from 'moment';
import useProgressiveImg from "./useProgressiveImg";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';
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
            descriptionName: "",
            artistName: "",
            artworkLink:"",
            byTitle: "",
            UPC: "",
            done: undefined,
            openEmailModal: false,
            email: "",
            checkBoxDefaultStatus: true,
            websiteType: undefined,
            date: "",
            location: "",
            isInstagramBrowser: false,
            isNoticeOpen: false,
            copied: false
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.musicInstance = this.props.musicInstance;
        this.signIn = this.signIn.bind(this);
        this.OpenAppleInstNotice = this.OpenAppleInstNotice.bind(this);
        this.CloseAppleInstNotice = this.CloseAppleInstNotice.bind(this);
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
    isInstagramApp() {
        var ua = navigator.userAgent || navigator.vendor || window.opera;
        return (ua.indexOf("Instagram") > -1) || (ua.indexOf("Instagram") > -1);
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
        let data =  await axios.post('https://endlss.herokuapp.com/createTheSite', {linkID:sub+"."+path.split('/')[0], location:location.data.city+"-"+location.data.country_name, country_flag: location.data.location.country_flag})
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
          //  var date = datares.data.ReleaseDate.substring(0,10)+" 00:00";
          //  console.log(date)
          //  const d = new Date(date);
          //  console.log(d)
            const finaldate = moment(datares.data.ReleaseDate.substring(0,10), "YYYY-MM-DD").format('MMMM DD');
            console.log(finaldate)
            await this.setState({
                title: datares.data.albumName,
                artworkLink: artwork,
                artistName: datares.data.artistName,
                descriptionName: datares.data.descriptionName,
                byTitle: byTitle,
                UPC: datares.data.UPC,
                date: finaldate,
                websiteType: datares.data.siteType,
                location: location.data.city+"-"+location.data.country_name,
                isInstagramBrowser: this.isInstagramApp()
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
        axios.post('https://endlss.herokuapp.com/applemusicclicks', {urlLink: window.location.href, location: this.state.location})
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
    OpenAppleInstNotice(){
       this.setState({isNoticeOpen:true});
    }
    CloseAppleInstNotice(){
        this.setState({isNoticeOpen:false});
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
           form.action ="https://endlss.herokuapp.com/login?updates=yes&upc="+this.state.UPC+"&url="+window.location.href+"&location="+this.state.location;
        } else {
            form.action ="https://endlss.herokuapp.com/login?updates=no&upc="+this.state.UPC+"&url="+window.location.href+"&location="+this.state.location;
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
                    <ReactLoading type={"spin"} color={"#c3a48f"} />
                    </div>
                ) : (
                    <div style={{height:"100%"}}>
                    {(this.state.websiteType===1) && (
                <div id="contentfadein" class="content-containerOne">
                    <div style={{marginTop: '-3%'}}>
                    <h1 class="h1basic">{this.state.artistName}</h1>
                    <h2 class="h2basic">{this.state.byTitle}</h2>
                    <h3 class="h3basic">Available {this.state.date}</h3>
                        {(this.state.descriptionName!==undefined)&&(
                    <div className="ssnotice"><p>{this.state.descriptionName}</p>
                    </div>
                        )}
                    </div>
                    <div style={{marginBottom:"20%"}}>
                        <div>
                        <a class="buttonViewTypeOne buttonglow" onClick={() => this.OnSubmitForm()}>
                            <img class="spotifyLogo" src="/Spotify_Icon_RGB_ff8eff.png" />
                            {(token!=null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="buttonbasic"id="buttonSpotify">Pre-Saved!</button>
                                </form> )}
                            {(token==null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="buttonbasic" id="buttonSpotify">Pre-Save on Spotify</button>
                                </form> )}
                                </a>
                            <div class="checkboxcolumn">
                                <label class="checkboxContainerbasic">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="myCheck" checked onClick="this.checked=!this.checked;"/>
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                            {this.state.isInstagramBrowser ? (  //Right now im showing the notice from any browser for dbg purposes. Remove the "!" to make it work
                              <a class="buttonViewAppleTypeOne buttonglow" onClick={() => this.OpenAppleInstNotice()} >
                                <img class="appleLogo" src="/Apple_Music_Icon_RGB_ff8eff.png" />
                                <button class="buttonApplebasic">Pre-Add on Apple Music
                                </button>
                              </a>
                                ):(
                                <a className="buttonViewAppleTypeOne buttonglow" onClick={() => this.signIn()} id="apple-music-authorize">
                                <img className="appleLogo" src="/Apple_Music_Icon_RGB_ff8eff.png"/>
                                <button className="buttonApplebasic" id="apple-music-authorize-button">Pre-Add on Apple Music
                                </button>
                            </a>
                            )}
                                <Popup open={this.state.isNoticeOpen} closeOnDocumentClick onClose={this.CloseAppleInstNotice}>
                                    <div className="modal">
                                        <a className="close" onClick={this.CloseAppleInstNotice}>
                                            &times;
                                        </a>
                                        Copy & paste this link into Safari to pre-add {this.state.byTitle} on Apple Music
                                        <img className="applenoticelogo" src="/Apple_Music_Icon_RGB_Black.png"/>
                                        <input className="notice" value={window.location.href}/>
                                        <CopyToClipboard text={window.location.href}
                                                         onCopy={() => this.setState({copied: true})}>
                                            <button className="noticecopy">Copy</button>
                                        </CopyToClipboard>
                                        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
                                    </div>
                                </Popup>

                        </div>
                                {!this.state.openEmailModal ? (
                                        <div className="checkboxcolumn">
                                <label class="checkboxContainerbasic">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="CheckApple" checked={this.state.checkBoxDefaultStatus} onChange={this.handleCheckBoxClick} />
                                    <span class="checkmark"></span>
                                </label>
                                        </div>
                                ) : (

                                        <form className="checkboxcolumn" style={{width: "100%"}} onSubmit={this.test}>
                                        <h3 className="emailcapturebasic">Confirm your email</h3>
                                        <input className="input1basic" type="eamil" value={this.state.email} onChange={this.handleEmailChange}/>
                                        <input type="submit" class="submit" value="CONTINUE"/>
                                        </form>

                                    )}
                    </div>
                        <div class="legalfooter">
                                <div class="legaltextbasic basic"><p>By using this service, you agree to our <a class="legallinks basic" href="https://terms.endlessdigital.co" target="_blank"><br />Terms of Service</a> &
                                <a class="legallinks basic" href="https://privacy.endlessdigital.co" target="_blank"> Privacy Policy</a>.</p>
                                </div>
                        <div class="poweredby">powered by<a href="https://instagram.com/endlessdigital"><img class="endlesslogobasic" src="/Endless_Logo_AAO.png"/></a></div>
                        </div>
                    </div>
                    )}
                    {(this.state.websiteType===2) && (
                        <div id="contentfadein" className="content-container">
                            <div style={{marginTop: '0%'}}>
                                <h1 className="h1">{this.state.artistName}</h1>
                                <h2 className="h2">{this.state.byTitle}</h2>
                                <h3 className="h3">Available {this.state.date}</h3>
                                {(this.state.descriptionName !== undefined) && (
                                    <div className="ssnotice"><p>{this.state.descriptionName}</p>
                                    </div>
                                )}
                            </div>
                            <div style={{}}>
                                <div>
                                    <a className="buttonView" onClick={() => this.OnSubmitForm()}>
                                        <img className="spotifyLogo" src="/Spotify_Icon_RGB_Black.png"/>
                                        {(token != null) && (
                                            <form name="myform" id="myform" method="post">
                                                <button className="button" id="buttonSpotify">Pre-Saved!</button>
                                            </form>)}
                                        {(token == null) && (
                                            <form name="myform" id="myform" method="post">
                                                <button className="button" id="buttonSpotify">Pre-Save on Spotify
                                                </button>
                                            </form>)}
                                    </a>
                                    <div className="checkboxcolumn">
                                        <label className="checkboxContainer">Get updates from {this.state.artistName}
                                            <input type="checkbox" id="myCheck" checked
                                                   onClick="this.checked=!this.checked;"/>
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>

                                    <a className="buttonViewApple" onClick={() => this.signIn()}
                                       id="apple-music-authorize">
                                        <img className="appleLogo" src="/Apple_Music_Icon_RGB_Black.png"/>
                                        <button className="buttonApple" id="apple-music-authorize-button">Pre-Add on
                                            Apple Music
                                        </button>
                                    </a>
                                </div>
                                {!this.state.openEmailModal ? (
                                    <div className="checkboxcolumn">
                                        <label className="checkboxContainer">Get updates from {this.state.artistName}
                                            <input type="checkbox" id="CheckApple"
                                                   checked={this.state.checkBoxDefaultStatus}
                                                   onChange={this.handleCheckBoxClick}/>
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>
                                ) : (

                                    <form className="checkboxcolumn" style={{width: "100%"}} onSubmit={this.test}>
                                        <h3 className="emailcapture">Confirm your email</h3>
                                        <input className="input1" type="eamil" value={this.state.email}
                                               onChange={this.handleEmailChange}/>
                                        <input type="submit" className="submit" value="CONTINUE"/>
                                    </form>

                                )}
                                <a className="buttonViewApple" href="https://shop.ramriddlz.com">
                                    <button className="button">Official Shop</button>
                                </a>
                            </div>
                            <div className="textupdates"><p>For more updates from Ramriddlz<br/>Text 647-372-2252</p>
                            </div>
                            <div className="legalfooter">
                                <div className="sslink"><a href="https://competitions.endlessdigital.co">Competition
                                    Rules<br/><br/></a></div>
                                <div className="legaltext"><p>By using this service, you agree to our <a
                                    className="legallinks" href="https://terms.endlessdigital.co" target="_blank"><br/>Terms
                                    of Service</a> &
                                    <a className="legallinks" href="https://privacy.endlessdigital.co"
                                       target="_blank"> Privacy Policy</a>.</p>
                                </div>
                                <div><a href="https://instagram.com/endlessdigital"><img className="endlesslogo"
                                                                                         src="Endless_Logo_White.png"/></a>
                                </div>
                            </div>
                        </div>
                        )}
                        {(this.state.websiteType===3) && (
                <div id="contentfadein" class="content-containerOne">
                    <div style={{marginTop: '-3%'}}>
                    <h1 class="h1three">{this.state.artistName}</h1>
                    <h2 class="h2three">{this.state.byTitle}</h2>
                    <h3 class="h3three">Available {this.state.date}</h3>
                        {(this.state.descriptionName!==undefined)&&(
                    <div className="ssnotice"><p>{this.state.descriptionName}</p>
                    </div>
                        )}
                    </div>
                    <div style={{marginBottom:"20%"}}>
                        <div>
                        <a class="buttonView3" onClick={() => this.OnSubmitForm()}>
                            <img class="spotifyLogo" src="/Spotify_Icon_RGB_Black.png" />
                            {(token!=null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="button" id="buttonSpotify">Pre-Saved!</button>
                                </form> )}
                            {(token==null)&&(
                                <form name="myform" id="myform" method="post">
                                    <button class="button" id="buttonSpotify">Pre-Save on Spotify</button>
                                </form> )}
                                </a>
                            <div class="checkboxcolumn">
                                <label class="checkboxContainer3">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="myCheck" checked onClick="this.checked=!this.checked;"/>
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                            {!this.state.isInstagramBrowser ? (  //Right now im showing the notice from any browser for dbg purposes. Remove the "!" to make it work
                              <a class="buttonViewApple3" onClick={() => this.OpenAppleInstNotice()} >
                                <img class="appleLogo" src="/Apple_Music_Icon_RGB_Black.png" />
                                <button class="buttonApple">Pre-Add on Apple Music
                                </button>
                              </a>
                                ):(
                                <a className="buttonViewApple3" onClick={() => this.signIn()} id="apple-music-authorize">
                                <img className="appleLogo" src="/Apple_Music_Icon_RGB_Black.png"/>
                                <button className="buttonApple" id="apple-music-authorize-button">Pre-Add on Apple Music
                                </button>
                            </a>
                            )}
                                <Popup open={this.state.isNoticeOpen} closeOnDocumentClick onClose={this.CloseAppleInstNotice}>
                                    <div className="modal">
                                        <a className="close" onClick={this.CloseAppleInstNotice}>
                                            &times;
                                        </a>
                                        Copy & paste this link into Safari to pre-add {this.state.byTitle} on Apple Music
                                        <img className="applenoticelogo" src="/Apple_Music_Icon_RGB_Black.png"/>
                                        <input className="notice" value={window.location.href}/>
                                        <CopyToClipboard text={window.location.href}
                                                         onCopy={() => this.setState({copied: true})}>
                                            <button className="noticecopy">Copy</button>
                                        </CopyToClipboard>
                                        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
                                    </div>
                                </Popup>

                        </div>
                                {!this.state.openEmailModal ? (
                                        <div className="checkboxcolumn">
                                <label class="checkboxContainer3">Get updates from {this.state.artistName}
                                    <input type="checkbox" id="CheckApple" checked={this.state.checkBoxDefaultStatus} onChange={this.handleCheckBoxClick} />
                                    <span class="checkmark"></span>
                                </label>
                                        </div> 
                                         ) : (

                                        <form className="checkboxcolumn" style={{width: "100%"}} onSubmit={this.test}>
                                        <h3 className="emailcapture3">Confirm your email</h3>
                                        <input className="input1three" type="eamil" value={this.state.email} onChange={this.handleEmailChange}/>
                                        <input type="submit" class="submit" value="CONTINUE"/>
                                        </form>

                                    )}
                    </div>
                        <div class="legalfooter">
                                <div class="legaltext3 three"><p>By using this service, you agree to our <a class="legallinks three" href="https://terms.endlessdigital.co" target="_blank"><br />Terms of Service</a> &
                                <a class="legallinks three" href="https://privacy.endlessdigital.co" target="_blank"> Privacy Policy</a>.</p>
                                </div>
                        <div class="poweredby3">powered by<a href="https://instagram.com/endlessdigital"><img class="endlesslogobasic" src="/Endless_Logo_PDGI2.png"/></a></div>
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
        );
    }
}
//module.exports = window.location.hash.substring(1);
export default App;