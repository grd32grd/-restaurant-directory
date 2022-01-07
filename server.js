/// SETUP ///

const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBUsers = require('connect-mongodb-session')(session);
const mc = require("mongodb").MongoClient;

app.set('view engine', 'pug');
app.set('title','a4');

let mongoStore = new MongoDBUsers({
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessions'
});
mongoStore.on('error', (error) => {console.log(error)});

app.use(session({ 
    secret: 'some secret key here',
    resave: true,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/// SERVER ///

mc.connect("mongodb://localhost:27017", function(err, client) {
	if (err) {
		console.log("Error in connecting to database.");
		console.log(err);
		return;
	}

    users = client.db('a4').collection('users');
    sessions = client.db('a4').collection('sessions');

    // Route to home page. //
    app.get('/', function(req, res){
        res.render('homepage.pug', {session : req.session});
    });

    // Route to the 'users' page, aka the page with a list of all public users. //
    app.get('/users', function(req, res){
        users.find().toArray(function(err, docs){
            if (err) throw err;

            let userprofiles = [];
            docs.forEach(u => {
                if ( u.privacy == false && (req.query.name == undefined || u.username.toLowerCase().includes(req.query.name.toLowerCase() )) ){
                    userprofiles.push(u);                
                }
            });

            res.render('users.pug', { users : userprofiles, session : req.session });
        });

    });

    // Parameter used by a number of routes needing the id of a user's profile. //
    app.param('profileid', function(req, res, next, value) {
        users.find().toArray(function(err, docs){
            if (err) throw err;

            docs.forEach(u => {
                if (u._id == value) {
                    res.userprofile = u;
                    next();
                }
            });

        });
    });

    // Route to a user's profile page. //
    app.get('/users/:profileid', function (req, res) {

        //Avoids access to a private profile page, other than the logged in client's own page.
        if (res.userprofile.privacy && req.session.username != res.userprofile.username){
            res.status(404).send("You can't access this private user profile.");
        }

        res.render('profile.pug', {profile: res.userprofile, session: req.session});
    });

    // Route for a user to change privacy status to private. //
    app.put('/users/private/:profileid', function (req, res) {

        // If parameter can't find a profile with the same id.
        if (res.userprofile == undefined){
            res.status(400).send(JSON.stringify('User not found.'));
        } else {
            users.updateOne({ _id: res.userprofile._id },
                {
                  $set: {
                    username: res.userprofile.username,
                    password: res.userprofile.password,
                    orderhistory: res.userprofile.orderhistory,
                    privacy: true
                  }
                }
             );

            res.sendStatus(200);
        }
    });

    // Route for a user to change privacy status to public. //
    app.put('/users/public/:profileid', function (req, res) {

        // If parameter can't find a profile with the same id.
        if (res.userprofile == undefined){
            res.status(400).send(JSON.stringify('User not found.'));
        } else {
            users.updateOne({ _id: res.userprofile._id },
                {
                  $set: {
                    username: res.userprofile.username,
                    password: res.userprofile.password,
                    orderhistory: res.userprofile.orderhistory,
                    privacy: false
                  }
                }
             );

            res.sendStatus(200);
        }
    });

    // Route to the order form page. //
    app.get('/orderform', function(req, res){

        //Makes sure that you can only order if logged in.
        if (!(req.session.loggedin)){
            res.sendStatus(404);
        }
        res.render('orderform.pug', {session : req.session});
    });

    // Route to the register page. //
    app.get('/register', function(req, res){
        res.render('register.pug');
    });

    // Route to register a new user. //
    app.put('/register', function(req, res, next){

        //Logins in newly registered user.
        req.session.loggedin = true;
        req.session.username = req.body.username;
        req.session.password = req.body.password;
    
        //Insert's newly registered user to the databas.
        users.insertOne({
            username: req.body.username,
            password: req.body.password,
            privacy: false
        });

        //Set's session's _id parameter to the newly created ObjectID
        users.find().toArray(function(err, docs){
            if (err) throw err;

            docs.forEach(u => {
                if (u.username == req.body.username){
                    req.session._id = u._id;
                    if (!res.headersSent){
                        res.status(200).send(JSON.stringify(req.session._id));
                    }
           
                }
            });  
        });
 
        
    });

    // Route to get a user logged in //
    app.put('/login', function(req,res){

        users.find().toArray(function(err, docs){
            if (err) throw err;

            //Finds user in database with equivalant username / password
            docs.forEach(u => {
                if (u.username == req.body.username && u.password == req.body.password){
                    req.session.loggedin = true;
                    req.session.username = u.username;
                    req.session.password = u.password;

                    req.session._id = u._id;
                    res.status(200).send(JSON.stringify(u._id));
                    
                }
            });

        });
    });

    // Route to log a logged in user out //
    app.get('/logout', function(req, res){

        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;

        res.render('homepage.pug', {session : req.session});
    });

    // Route to update a user's order history after they submit a order at a restaurant.
    app.put('/orderupdate', function(req,res){
        users.find().toArray(function(err, docs){
            if (err) throw err;

            //Searches database to find logged in user's order history.
            docs.forEach(u => {
                if (u.username == req.session.username && u.password == req.session.password){
                    let order = {};

                    //Determines new order ID
                    if (!u.orderhistory){
                        orderId = 0;
                    } else {
                        order = u.orderhistory;
                        orderId = Object.keys(u.orderhistory).length;
                    }

                    //Updates user fields in the database
                    order[orderId] = req.body;
                    users.updateOne({ _id: u._id },{
                        $set: {
                            username: u.username,
                            password: u.password,
                            privacy: u.privacy,
                            orderhistory: order
                        }
                    });
                }
            });
        });

    });


    // Route to access a order's page
    app.get('/users/:profileid/orders/:orderid', function (req, res) {
        users.find().toArray(function(err, docs){

            if (err) throw err;

            //Iterates over the database to find the order
            docs.forEach(u => {
                if (u._id == req.params.profileid) {

                    for (orderId in Object.keys(u.orderhistory)){
                        if (orderId = req.params.orderid){
                            //Only shows order summary page if user is logged in or user is public
                            if (!u.privacy || req.session.loggedin){
                                res.render('order.pug', {
                                    user: u,
                                    orderid: orderId,
                                    order: u.orderhistory[orderId],
                                    session : req.session
                                });
                                break;
                            } else {
                                res.sendStatus(404);
                            }
                        }
                    }

                }
            });
        });
    });

    /*app.get('/assets/add.png', function(req, res){
        res.render("assets/add.png");
    });*/
        
});

/// PORT LISTENING ///
app.listen(3000);
console.log("Listening on port 3000");