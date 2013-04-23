$(document).ready(function ()
{
  google.maps.event.addDomListener(window, "load", map_init);

  function map_init()
  {
    mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 2,
      center: new google.maps.LatLng(37.7750, 250.4183)
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  }
});
