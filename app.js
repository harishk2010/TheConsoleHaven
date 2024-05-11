
require("dotenv").config()
const express = require('express');

const handlebars = require('express-handlebars');
const Handlebars=require('handlebars')
const path = require('path');
const createError = require('http-errors');
const logger = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');
const bodyParser = require('body-parser');//oddated

const Swal = require('sweetalert2')
const hbsHelper=require('./helpers/hbsHelper')

const app = express();

require('./DB/db_connection')

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));



app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'layout',
    partialsDir: __dirname + '/views/partials/'
}));
Handlebars.registerHelper(hbsHelper.formatDate(Handlebars), hbsHelper.incHelper(Handlebars), hbsHelper.mulHelper(Handlebars), hbsHelper.subHelper(Handlebars), hbsHelper.addHelper(Handlebars));



// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_KEY ||"CONSOLEHAVENNEWSESSIONKEY",
    saveUninitialized: true,
    cookie: { maxAge: 600000000 },
    resave: false
}));
app.use(nocache());

// Static files
app.use(express.static('public'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

app.use('/', userRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
