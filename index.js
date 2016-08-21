
google.maps.event.addDomListener(window, 'load', function() {
  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: new google.maps.LatLng(33.677,-117.797),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var panelDiv = document.getElementById('panel');
  $.get('locations.csv', function(data) {
    var locData = new LocationData(data);
    var view = new storeLocator.View(map, locData, {
      geolocation: false,
      features: locData.getFeatures()
    });

    new storeLocator.Panel(panelDiv, {
      view: view
    });
  });
});
