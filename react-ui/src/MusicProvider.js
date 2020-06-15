export default class MusicProvider {

    static sharedProvider() {
        if(!MusicProvider.instance) {
            MusicProvider.instance = new MusicProvider();
        }
        return MusicProvider.instance;
    }

    async configure() {
            window.MusicKit.configure({
                developerToken: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZQQUdCNFNaNEwifQ.eyJpYXQiOjE1OTIyMzEwNTIsImV4cCI6MTYwNzc4MzA1MiwiaXNzIjoiNlVEMlk3SjZTTiJ9.TYi_nXC0gLSpkKbT4q6WVCD7FNu49HqG7gh-oEmdExMxypbjgqcWS7wL_s1zRzGsoR2UkfHgu-ctBBxTU64m4Q",
                app: {
                    name: 'PreAdd for Apple Music',
                    build: '1978.4.1'
                }
            });


    }

    getMusicInstance() {
        return window.MusicKit.getInstance();
    }
}