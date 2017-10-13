/**
 * Module dependencies.
 */

var express = require("express"),
  routes = require("./routes"),
  user = require('./routes/user'),
  movie = require("./routes/movie"),
  http = require("http"),
  path = require("path"),
  ejs = require("ejs"),
  SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
  url: "mongodb://localhost/session",
  interval: 120000
});

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'logs/access.log', 
      maxLogSize: 1024,
      backups:3,
      category: 'normal' 
    }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

var app = express();

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.engine(".html", ejs.__express);
app.set("view engine", "html"); // app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: "fens.me" }));
app.use(
  express.session({
    secret: "fens.me",
    store: store,
    cookie: { maxAge: 900000 }
  })
);
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  var err = req.session.error;
  delete req.session.error;
  res.locals.message = "";
  if (err)
    res.locals.message = '<div class="alert alert-error">' + err + "</div>";
  next();
});

//app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO, format:':method :url'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));

// development only
if ("development" == app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", routes.index);
app.all("/login", notAuthentication);
app.get("/login", routes.login);
app.post("/login", routes.doLogin);

app.get("/logout", authentication);
app.get("/logout", routes.logout);

app.get("/home", authentication);
app.get("/home", routes.home);

app.get("/movie/add", movie.movieAdd); //增加
app.post("/movie/add", movie.doMovieAdd); //提交
app.get("/movie/:name", movie.movieAdd); //编辑查询
//app.get('/movie/json/:name',movie.movieJSON);//JSON数据
app.get("/admin/movie", routes.mv);

function authentication(req, res, next) {
  if (!req.session.user) {
    req.session.error = "请先登陆";
    return res.redirect("/login");
  }
  next();
}
function notAuthentication(req, res, next) {
  if (req.session.user) {
    req.session.error = "已登陆";
    return res.redirect("/home");
  }
  next();
}

http.createServer(app).listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
