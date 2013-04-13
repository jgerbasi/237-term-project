exports.init = function(app, mongoExpressAuth) {
  app.get('/', function(req, res){
      mongoExpressAuth.checkLogin(req, res, function(err){
          if (err)
              res.sendfile('static/login.html');
          else
              res.sendfile('static/main.html');
      });
  });


  app.get("/stats", function(req, res) {
      sendBackStats(res);
  })

  app.get('/me', function(req, res){
      mongoExpressAuth.checkLogin(req, res, function(err){
          if (err)
              res.send(err);
          else {
              mongoExpressAuth.getAccount(req, function(err, result){
                  if (err)
                      res.send(err);
                  else 
                      res.send(result); // NOTE: direct access to the database is a bad idea in a real app
              });
          }
      });
  });

  app.post('/login', function(req, res){
      mongoExpressAuth.login(req, res, function(err){
          if (err)
              res.send(err);
          else
              res.send('ok');
      });
  });

  app.post('/logout', function(req, res){
      mongoExpressAuth.logout(req, res);
      res.send('ok');
  });

  app.post('/register', function(req, res){
      mongoExpressAuth.register(req, function(err){
          if (err)
              res.send(err);
          else
              res.send('ok');
      });
  });
};