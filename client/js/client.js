Geo = new Meteor.Collection("geo");

Meteor.startup(function() {
  demo_id = Random.hexString(16);
});

var infoWindows = [];
Deps.autorun(function () {
  var opens = Geo.find({});
  var handle = opens.observeChanges({
    added: function(id, geo_open) {
      if(geo_open.lat && geo_open.lng && geo_open.timestamp)
      {
        var contentString = '<div id="content" style="min-height:100px;">'+
          '<img height=38 width=130 src="mg-logo.png"/>'+
          '<p>This email was opened in ' + geo_open.client_name +
          ' running ' + geo_open.client_os +
          ' on a ' + geo_open.device_type +' device.</p></div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300
        });
        infoWindows.push(infowindow);

        var location = new google.maps.LatLng(geo_open.lat,geo_open.lng);
        var marker = new google.maps.Marker({
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            map: map,
            zindex: 1,
            animation: google.maps.Animation.DROP,
            position: location
        });

        if(geo_open.demo_id == demo_id)
        {
          marker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
          marker.setZIndex(1000);
          map.setCenter(location);
        }

        google.maps.event.addListener(marker, 'click', function() {
          if (infoWindows) {
              for (i in infoWindows) {
                infoWindows[i].close();
              }
          }
            infowindow.open(map,marker);
        });

      }
    }
  });
});


function validateEmail(email)
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

Template.form.events({
    'click #fire' : function (event) {
      $('#error').hide();
      $('#success').hide();

      var email_input = $('#email').val()
      if(email_input.length > 0 && validateEmail(email_input)) {
        $('#success').show();
        $('#email').val("");
        Meteor.call('sendEmail', email_input, demo_id);
      }
      else {
        $('#error').show();
      }
    }
});
