export default function(app) {
    // Insert routes below
    app.use('/login', require('./login'));


    app.use('/main', require('./main'));

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });


    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
        });
}