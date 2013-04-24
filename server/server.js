function validateEmail(email)
{
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

if (Meteor.isServer) {
  process.env['MAILGUN_API_KEY'] = "key-your-key-here";
  process.env['MAILGUN_DOMAIN'] = "your-domain.com";
  process.env['MAILGUN_API_URL'] = "https://api.mailgun.net/v2";

  var app = __meteor_bootstrap__.app
  var connect = Npm.require('connect');
  var Fiber = Npm.require('fibers');
  var crypto = Npm.require('crypto');


  var router = connect.middleware.router(function(route)
  {
    route.post('/mailgun/receive', function(req, res)
    {
      var raw_post_body = "";
      var post_data = [];

      req.on('data', function (chunk) {
        raw_post_body += chunk.toString();
      });

      req.on('end', function () {
          pairs = raw_post_body.split('&');
          for(var i = 0; i < pairs.length; i++) {
            kv = pairs[i].split('=');
            post_data[kv[0]]=decodeURIComponent((kv[1]+'').replace(/\+/g, '%20'));
          }

          //Verify sender is Mailgun
          var sig = crypto.createHmac('sha256', process.env.MAILGUN_API_KEY).update(post_data['timestamp']+post_data['token']).digest('hex');
          if(sig !== post_data['signature']) {
            res.writeHead(403);
            res.end();
          }
          else {
            Fiber(function() {
                Meteor.call("publishGeo", post_data);
                res.writeHead(200);
                res.end();
            }).run();
          }
      });
    });
  });

  app.use(router);
  Geo = new Meteor.Collection("geo");

  Meteor.startup(function () {

    Meteor.methods({
      publishGeo: function (data) {
        var _ip = data['ip'];
        var _city = data['city'];
        var _region = data['region'];
        var _country = data['country'];
        var _demo_id = data['demo_id'];
        var _timestamp = data['timestamp'];
        var _client_os = data['client-os'];
        var _client_name = data['client-name'];
        var _device_type = data['device-type'];

        var _lat = "";
        var _lng = "";
        var cache = Geo.findOne({'city':_city, 'region':_region, 'country':_country, lat:{$ne:null}, lng:{$ne:null}});

        if(cache) { //cache hit
          _lat = cache.lat;
          _lng = cache.lng;
        }
        else {
          var address = encodeURIComponent(_city+" "+_region+" "+_country);
          var gLookup = Meteor.http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+address+'&sensor=false')
          var resp = JSON.parse(gLookup.content);

          _lat = resp.results[0].geometry.location.lat;
          _lng = resp.results[0].geometry.location.lng;
        }

        Geo.insert({ip:_ip, lat:_lat, lng:_lng, city:_city, region:_region, country:_country, demo_id:_demo_id, client_os:_client_os, client_name:_client_name, device_type:_device_type, timestamp:_timestamp}, function(error, _id) {
          if(error){ console.log("Error: " + error);}
        });
      },
      sendEmail: function (to, client_id) {
        if(!validateEmail(to))
          return;

        this.unblock();

        Meteor.http.post(process.env.MAILGUN_API_URL + '/' + process.env.MAILGUN_DOMAIN + '/messages', {
          auth:"api:" + process.env.MAILGUN_API_KEY,
          params: {"from":"Dev McCool  <you@your-domain.com>",
            "to":[to],
            "subject":"Testing",
            "html":"<p>This is a sweet HTML paragraph</p>",
            "h:X-Mailgun-Variables":JSON.stringify({demo_id:client_id}),
            "o:tracking":'True'}
          },
          function(error, result) {
            if(error){ console.log("Error: " + error);}
          }
        );
      }
    });
  });
}
