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
});