/**
 * @extends storeLocator.StaticDataFeed
 * @constructor
 */
function LocationData(getData) {
  $.extend(this, new storeLocator.StaticDataFeed);
  this.setStores(this.parse_(getData));
}

/**
 * @const
 * @type {!storeLocator.FeatureSet}
 * @private
 */
LocationData.prototype.FEATURES_ = null;

/**
 * @return {!storeLocator.FeatureSet}
 */
LocationData.prototype.getFeatures = function() {
  return this.FEATURES_;
};

LocationData.prototype.setFeatures = function(featureNames) {
  var newFeatures = new storeLocator.FeatureSet();
  for(var i = 0; i < featureNames.length; i++) {
    var columnName = featureNames[i];
    var feature = new storeLocator.Feature(columnName, columnName);
    newFeatures.add(feature);
  }
  this.FEATURES_ = newFeatures;
}

/**
 * @private
 * @param {string} csv
 * @return {!Array.<!storeLocator.Store>}
 */
LocationData.prototype.parse_ = function(csv) {
  var stores = [];
  var parseResults = Papa.parse(csv, {header: true});
  var allRows = parseResults.data;

  var headers = parseResults.meta.fields;
  var featureNames = headers.slice(3); // 3 = name, address, coord
  this.setFeatures(featureNames);

  for (var i = 0; i < allRows.length; i++) {
    var row = allRows[i];
    var features = new storeLocator.FeatureSet();
    for(var j = 0; j < featureNames.length; j++) {
      var featName = featureNames[j];
      var value = $.trim(row[featName]);
      if(value)
        features.add(this.FEATURES_.getById(featName));
    }

    if(!row.Coordinates) {
      console.warn("Failed to parse coordinates: row #" + i + " : " + row);
      continue;
    }
    var coords = row.Coordinates.split(",");
    var xcoord = +coords[0];
    var ycoord = +coords[1];
    var position = new google.maps.LatLng(xcoord, ycoord);

    var store = new storeLocator.Store(i, position, features, {
      title: row.Name,
      address: row.Address,
    });
    stores.push(store);
  }
  return stores;
};

/**
 * Joins elements of an array that are non-empty and non-null.
 * @private
 * @param {!Array} arr array of elements to join.
 * @param {string} sep the separator.
 * @return {string}
 */
LocationData.prototype.join_ = function(arr, sep) {
  var parts = [];
  for (var i = 0, ii = arr.length; i < ii; i++) {
    arr[i] && parts.push(arr[i]);
  }
  return parts.join(sep);
};

/**
 * Very rudimentary CSV parsing - we know how this particular CSV is formatted.
 * IMPORTANT: Don't use this for general CSV parsing!
 * @private
 * @param {string} row
 * @return {Array.<string>}
 */
LocationData.prototype.parseRow_ = function(row) {
  // Strip leading quote.
  if (row.charAt(0) == '"') {
    row = row.substring(1);
  }
  // Strip trailing quote. There seems to be a character between the last quote
  // and the line ending, hence 2 instead of 1.
  if (row.charAt(row.length - 2) == '"') {
    row = row.substring(0, row.length - 2);
  }

  row = row.split('","');

  return row;
};

/**
 * Creates an object mapping headings to row elements.
 * @private
 * @param {Array.<string>} headings
 * @param {Array.<string>} row
 * @return {Object}
 */
LocationData.prototype.toObject_ = function(headings, row) {
  var result = {};
  for (var i = 0, ii = row.length; i < ii; i++) {
    result[headings[i]] = row[i];
  }
  return result;
};
