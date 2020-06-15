import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import MusicProvider from './MusicProvider';
//ReactDOM.render(<App />, document.getElementById('root'));
//var script = document.createElement("script");
//script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
//document.body.appendChild(script);
//script.async = true;

let musicProvider = MusicProvider.sharedProvider();
musicProvider.configure();
let musicInstance = musicProvider.getMusicInstance();
ReactDOM.render(
    <React.StrictMode>
        <App musicInstance={musicInstance}/>
    </React.StrictMode>,
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
