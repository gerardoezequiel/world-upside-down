import type { AppState } from "./map-state";
import { showFlipToast } from "./orientation";
import { trackEvent } from "./analytics";

/**
 * Tissot's Indicatrix — circles at regular lat/lng intervals that reveal
 * how the Mercator projection distorts size (area) and shape.
 *
 * On Mercator, circles near the equator stay small while circles near
 * the poles become enormous — making the distortion viscerally visible.
 *
 * Each "circle" is a GeoJSON polygon approximated by 64 vertices.
 * Radius is ~500km on the ground, but Mercator inflates them near poles.
 */

const CIRCLE_VERTICES = 64;
const RADIUS_KM = 500;
const EARTH_RADIUS_KM = 6371;

/** Generate a single geodesic circle as a GeoJSON polygon */
function geodesicCircle(centerLon: number, centerLat: number, radiusKm: number): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const angularRadius = radiusKm / EARTH_RADIUS_KM; // radians

  for (let i = 0; i <= CIRCLE_VERTICES; i++) {
    const bearing = (2 * Math.PI * i) / CIRCLE_VERTICES;
    const latRad = Math.asin(
      Math.sin(centerLat * Math.PI / 180) * Math.cos(angularRadius) +
      Math.cos(centerLat * Math.PI / 180) * Math.sin(angularRadius) * Math.cos(bearing)
    );
    const lonRad = (centerLon * Math.PI / 180) + Math.atan2(
      Math.sin(bearing) * Math.sin(angularRadius) * Math.cos(centerLat * Math.PI / 180),
      Math.cos(angularRadius) - Math.sin(centerLat * Math.PI / 180) * Math.sin(latRad)
    );
    coords.push([lonRad * 180 / Math.PI, latRad * 180 / Math.PI]);
  }

  return {
    type: "Feature",
    properties: {
      lat: centerLat,
      distortion: 1 / Math.cos(centerLat * Math.PI / 180), // Mercator area scale factor
    },
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
  };
}

/** Generate the full Tissot GeoJSON — circles at 30° intervals */
function generateTissotGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  // Latitude: -60° to 60° at 30° intervals (skip extreme poles where circles clip badly)
  // Longitude: -150° to 180° at 30° intervals
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -150; lon <= 150; lon += 30) {
      features.push(geodesicCircle(lon, lat, RADIUS_KM));
    }
  }

  return { type: "FeatureCollection", features };
}

const SOURCE_ID = "tissot-source";
const FILL_LAYER_ID = "tissot-fill";
const LINE_LAYER_ID = "tissot-line";

const tissotToasts = [
  "Tissot's circles reveal the lie",
  "Same size on Earth. Not on Mercator.",
  "Every circle is 500km. Notice anything?",
  "The projection distorts. Now you can see it.",
  "Equal circles, unequal rendering",
];

const tissotOffToasts = [
  "Ignorance is bliss",
  "The distortion is still there",
  "Out of sight, not out of scale",
];

export function setupTissot(state: AppState): void {
  const btn = document.getElementById("tool-tissot");
  if (!btn) return;

  let active = false;
  const geojson = generateTissotGeoJSON();

  btn.addEventListener("click", () => {
    active = !active;
    btn.classList.toggle("active", active);

    if (active) {
      if (!state.map.getSource(SOURCE_ID)) {
        state.map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

        state.map.addLayer({
          id: FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          paint: {
            "fill-color": [
              "interpolate", ["linear"], ["get", "distortion"],
              1, "rgba(0, 131, 138, 0.12)",   // equator: subtle teal
              2, "rgba(255, 72, 176, 0.18)",   // mid-lat: pink tint
              4, "rgba(255, 72, 176, 0.25)",   // high-lat: stronger pink
            ],
            "fill-antialias": true,
          },
        });

        state.map.addLayer({
          id: LINE_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": [
              "interpolate", ["linear"], ["get", "distortion"],
              1, "rgba(0, 131, 138, 0.4)",
              2, "rgba(255, 72, 176, 0.5)",
              4, "rgba(255, 72, 176, 0.6)",
            ],
            "line-width": 1,
          },
        });
      } else {
        state.map.setLayoutProperty(FILL_LAYER_ID, "visibility", "visible");
        state.map.setLayoutProperty(LINE_LAYER_ID, "visibility", "visible");
      }

      trackEvent("tissot", { enabled: true });
      const msg = tissotToasts[Math.floor(Math.random() * tissotToasts.length)];
      showFlipToast(state, msg);
    } else {
      if (state.map.getLayer(FILL_LAYER_ID)) {
        state.map.setLayoutProperty(FILL_LAYER_ID, "visibility", "none");
        state.map.setLayoutProperty(LINE_LAYER_ID, "visibility", "none");
      }

      trackEvent("tissot", { enabled: false });
      const msg = tissotOffToasts[Math.floor(Math.random() * tissotOffToasts.length)];
      showFlipToast(state, msg);
    }
  });
}
