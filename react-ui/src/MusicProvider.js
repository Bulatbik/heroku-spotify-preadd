export default class MusicProvider {

    static sharedProvider() {
        if(!MusicProvider.instance) {
            MusicProvider.instance = new MusicProvider();
        }
        return MusicProvider.instance;
    }

    configure() {
        fetch('/applemusictoken').then(response => response.json()).then(res => {
            /***
             Configure our MusicKit instance with the signed token from server, returns a configured MusicKit Instance
             https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance
             ***/
            console.log(res.token);
            window.MusicKit.configure({
                developerToken: res.token,
                app: {
                    name: 'PreAdd for Apple Music',
                    build: '1978.4.1'
                }
            });
        });

    }

    getMusicInstance() {
        return window.MusicKit.getInstance();
    }
}