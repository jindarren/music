var express = require('express');
var path = require('path');
var router = express.Router();
var http = require('http');
var bodyParser = require('body-parser');
var parseString = require('xml2js').parseString;
var querystring = require('querystring');

//router.use(express.static(path.join(__dirname, '../public')));
/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

//router.use(bodyParser.json());
//router.get('/', function(req, res){
//  res.sendfile('./public/javascripts/index.ejs');//,{ root: __dirname + "/javascripts" } );
//});



router.get('/iestudy', function(req, res){
  console.log(req.query.uid);
  console.log(req.query.name);

  res.sendFile('index.html', { root: path.join(__dirname, '../public/javascripts') });
});

router.post("/iestudy/userinfo", function(req, res) {
      var content = req.body;
        var userinfo = querystring.stringify({
            email: content.email,
            password: content.password
        });

        //console.log(userinfo);
        var options = {
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3mobile/authenticateUser.jsp?" + userinfo,
            method: 'GET',
        };

        var request = http.request(options, function(response) {
            //console.log('STATUS: ' + response.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            // Continuously update stream with data
            var resXml = '';
            response.on('data', function(d) {
                resXml += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                resXml = resXml.replace(/(\r\n|\n|\r|\t)/gm, '');
                try {
                    //console.log(resXml);
                    parseString(resXml, function (err, result) {
                        //result = JSON.parse(result);
                        //console.log(result);
                        //console.log(result.Results.status);
                        if (result.Results.status == "ERROR") {
                            res.json({status: 0, message: result.Results.message});
                        }
                        else {
                            //console.log(result.Results.Items);
                            res.json({status: 1, userid: result.Results.Items[0].Item[0].UserID.toString(), name: result.Results.Items[0].Item[0].name.toString()});
                        }
                    });
                }
                catch(e){
                    console.log(e);
                }
            });
        });

        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/proceedings", function(req, res) {
        var content = req.body;
        var options = {
            //host: '134.58.40.17',
            // proxy IP
            //port: 8008,
            // proxy port
            //method: 'GET',
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3/xml/proceedings_139.xml",
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var paperXml = '';
            response.on('data', function(d) {
                paperXml += d;
            });
            response.on('end', function() {

                console.log(paperXml);
                // Data reception is done, do whatever with it!
                paperXml = paperXml.replace(/(\r\n|\n|\r|\t)/gm, '');
                res.header('Content-Type','text/xml').send(paperXml)
                //parseString(resXml, function (err, result) {
                //    res.json(result);
                //});
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/bookmarks", function(req, res) {
        var content = req.body;
        var options = {
            //host: '134.58.40.17',
            // proxy IP
            //port: 8008,
            // proxy port
            //method: 'GET',
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3/xml/scheduling.xml.php?conferenceID=139",
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var bookmarkXml = '';
            response.on('data', function(d) {
                bookmarkXml += d;
            });
            response.on('end', function() {
                // Data reception is done, do whatever with it!
                bookmarkXml = bookmarkXml.replace(/(\r\n|\n|\r|\t)/gm, '');
                res.header('Content-Type','text/xml').send(bookmarkXml)
                //parseString(resXml, function (err, result) {
                //    res.json(result);
                //});
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/tags", function(req, res) {
        var content = req.body;
        var options = {
            //host: '134.58.40.17',
            // proxy IP
            //port: 8008,
            // proxy port
            //method: 'GET',
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3/xml/tagging.xml.php?conferenceID=139",
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var tagXml = '';
            response.on('data', function(d) {
                tagXml += d;
            });
            response.on('end', function() {
                // Data reception is done, do whatever with it!
                tagXml = tagXml.replace(/(\r\n|\n|\r|\t)/gm, '');
                res.header('Content-Type','text/xml').send(tagXml)
                //parseString(resXml, function (err, result) {
                //    res.json(result);
                //});
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/tagbased", function(req, res) {
        var content = req.body;
        var options = {
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3mobile/bM25SysRec.jsp?conferenceID=139&userID=" + content.userid,
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var resXml = '';
            response.on('data', function(d) {
                resXml += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                resXml = resXml.replace(/(\r\n|\n|\r|\t)/gm, '');

                parseString(resXml, function (err, result) {
                    res.json(result);
                });
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/bibli", function(req, res) {
        var content = req.body;
        var options = {
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3mobile/contentBasedSysRecKatrien.jsp?conferenceID=139&sourcetype=2&userID=" + content.userid,
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var resXml = '';
            response.on('data', function(d) {
                resXml += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                resXml = resXml.replace(/(\r\n|\n|\r|\t)/gm, '');

                parseString(resXml, function (err, result) {
                    res.json(result);
                });
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/external", function(req, res) {
        var content = req.body;
        var options = {
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3mobile/contentBasedSysRecKatrien.jsp?conferenceID=139&sourcetype=3&userID=" + content.userid,
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var resXml = '';
            response.on('data', function(d) {
                resXml += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                resXml = resXml.replace(/(\r\n|\n|\r|\t)/gm, '');

                parseString(resXml, function (err, result) {
                    res.json(result);
                });
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/contentbased", function(req, res) {
        var content = req.body;
        //console.log(content.userid);
        var options = {
            host: "halley.exp.sis.pitt.edu",
            port: 80,
            path: "/cn3mobile/contentBasedSysRecKatrien.jsp?conferenceID=139&userID=" + content.userid,
            method: 'POST',
        };
        var request = http.request(options, function(response){
            // Continuously update stream with data
            var resXml = '';
            response.on('data', function(d) {
                resXml += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                resXml = resXml.replace(/(\r\n|\n|\r|\t)/gm, '');

                parseString(resXml, function (err, result) {
                    //result = JSON.parse(result);
                    //console.log(result);

                        //console.log(result.Results.Items);
                        res.json(result);
                });
            });
        });
        request.on('error', function(e) {
            res.json(500);
            console.log('problem with request: ' + e.message);
        });

        request.end();
    }
);

router.post("/iestudy/savedata", function(req, res){
  console.log(req.body);
  var date = new Date();
  var fs = require('fs');
  var stream = fs.createWriteStream("../saveTest/" + (date.getDate()<10?'0':'') + date.getDate()  + " @ " + (date.getHours()<10?'0':'') + date.getHours()  + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes()  + ":" + (date.getSeconds()<10?'0':'') + date.getSeconds() + ".json");
  stream.once('open', function(fd) {
    stream.write(JSON.stringify(req.body));
    stream.end();
  });
  res.json(204);
});

module.exports = router;
