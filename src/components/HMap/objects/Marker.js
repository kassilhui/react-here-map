import React from "react";
import PropTypes from "prop-types";
import merge from "lodash.merge";
import initMapObjectEvents from "../../../libs/initMapObjectEvents";
import { getBehavior } from "../../../libs/initInteraction";

function Marker(props) {
  const {
    icon,
    map,
    coords,
    type,
    options,
    setViewBounds,
    updateMarker,
    marker,
    getMarker,
    objectEvents,
    platform,
    ui,
    draggable,
    __options
  } = merge(
    { setViewBounds: true, updateMarker: false, marker: null, getMarker() {},draggable: false },
    props
  );
  let _options = options;
  if (!H || !H.map || !map) {
    throw new Error("HMap has to be initialized before adding Map Objects");
  }

  if (!coords.lat || !coords.lng) {
    throw new Error(
      "coords should be an object having 'lat' and 'lng' as props"
    );
  }

  if (!icon) {
    // throw new Error("icon is not set, Marker will not be rendered");
  }

  if (type && type === "DOM") {
    // Displays a DOM Icon
    _options.icon = new H.map.DomIcon(icon);
  } else if (type) {
    // Displays a static icon
    _options.icon = new H.map.Icon(icon);
  }

  // Create an icon, an object holding the latitude and longitude, and a marker:
  const _marker =
    updateMarker && marker ? marker : new H.map.Marker(coords, _options);

    if (draggable) {
      _marker.draggable = draggable;
      _options.volatility = draggable;

      var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) {}

      map.addEventListener('dragstart', function(ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
          var targetPosition = map.geoToScreen(target.getGeometry());
          target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
          var interaction = getBehavior();
          //if(interaction.disable){
            interaction.disable();
          //}
        }
      }, supportsPassive ? { passive: true } : false);

          // re-enable the default draggability of the underlying map
      // when dragging has completed
      map.addEventListener('dragend', function(ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
          var interaction = getBehavior();
          //if(interaction.enable){
            interaction.enable();
          //}
        }
      }, supportsPassive ? { passive: true } : false);

      // Listen to the drag event and move the position of the marker
      // as necessary
      map.addEventListener('drag', function(ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
          target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
        }
      }, supportsPassive ? { passive: true } : false);
    }
    
  // Checks if object of same coordinates have been added formerly
  const addedObjects = map.getObjects();
  const objectExists = addedObjects.some(object => {
    if (typeof object.getPosition === "function") {
      const { lat, lng } = object.getPosition();
      return lat === coords.lat && coords.lng === lng;
    }
  });

  // This object exists we don't want to add it again. Update the position
  if (!objectExists && !updateMarker) {
    // Add event listener to the object if intention of using the object is defined
    initMapObjectEvents(_marker, objectEvents, __options);
    map.addObject(_marker);
  } else if (updateMarker) {
    // If we are updating, no need to create
    _marker.setPosition(coords);
  }

  // Send the marker to the parent
  !marker ? getMarker(_marker) : null;

  // Centers the marker
  setViewBounds ? map.setCenter(coords) : null;

  // There is no need to render something useful here, HereMap does that magically
  return <div style={{ display: "none" }} />;
}

Marker.propTypes = {
  coords: PropTypes.object.isRequired,
  icon: PropTypes.any,
  options: PropTypes.object,
  type: PropTypes.string,
  setViewBounds: PropTypes.bool,
  map: PropTypes.object,
  objectEvents: PropTypes.object
};

export default Marker;
