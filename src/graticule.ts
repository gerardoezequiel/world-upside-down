import type { AppState } from "./map-state";
import type maplibregl from "maplibre-gl";

const GRAT_COLOR = '#D4A017';

function getIntervals(zoom: number) {
  if (zoom >= 10) return { major: 1, sub: 0.25, labelSpacing: 5 };
  if (zoom >= 7)  return { major: 2, sub: 0.5, labelSpacing: 10 };
  if (zoom >= 5)  return { major: 5, sub: 1, labelSpacing: 20 };
  if (zoom >= 3)  return { major: 10, sub: 2, labelSpacing: 30 };
  if (zoom >= 2)  return { major: 15, sub: 5, labelSpacing: 45 };
  return { major: 30, sub: 10, labelSpacing: 60 };
}

function buildGraticuleGeoJSON(major: number, sub: number, labelSpacing: number): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (let lon = -180; lon <= 180; lon += major) {
    const coords: [number, number][] = [];
    for (let lat = -85; lat <= 85; lat += 2) coords.push([lon, lat]);
    features.push({ type: 'Feature', properties: { rank: 'major' }, geometry: { type: 'LineString', coordinates: coords } });

    const lonLabel = lon === 0 ? '0°' : `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`;
    for (let lat = -80; lat <= 80; lat += labelSpacing) {
      features.push({
        type: 'Feature',
        properties: { rank: 'label', text: lonLabel, axis: 'lon' },
        geometry: { type: 'Point', coordinates: [lon, lat] },
      });
    }
  }

  for (let lat = -80; lat <= 80; lat += major) {
    const coords: [number, number][] = [];
    for (let lon = -180; lon <= 180; lon += 2) coords.push([lon, lat]);
    features.push({ type: 'Feature', properties: { rank: 'major' }, geometry: { type: 'LineString', coordinates: coords } });

    const latLabel = lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`;
    for (let lon = -180; lon <= 180; lon += labelSpacing) {
      features.push({
        type: 'Feature',
        properties: { rank: 'label', text: latLabel, axis: 'lat' },
        geometry: { type: 'Point', coordinates: [lon, lat] },
      });
    }
  }

  for (let lon = -180; lon <= 180; lon += sub) {
    if (Number.isInteger(lon / major) && lon % major === 0) continue;
    const coords: [number, number][] = [];
    for (let lat = -85; lat <= 85; lat += 2) coords.push([lon, lat]);
    features.push({ type: 'Feature', properties: { rank: 'sub' }, geometry: { type: 'LineString', coordinates: coords } });
  }

  for (let lat = -80; lat <= 80; lat += sub) {
    if (Number.isInteger(lat / major) && lat % major === 0) continue;
    const coords: [number, number][] = [];
    for (let lon = -180; lon <= 180; lon += 2) coords.push([lon, lat]);
    features.push({ type: 'Feature', properties: { rank: 'sub' }, geometry: { type: 'LineString', coordinates: coords } });
  }

  return { type: 'FeatureCollection', features };
}

export function addGraticule(state: AppState): void {
  const map = state.map;
  let currentMajor = getIntervals(map.getZoom()).major;
  const { major, sub, labelSpacing } = getIntervals(map.getZoom());

  map.addSource('graticule', {
    type: 'geojson',
    data: buildGraticuleGeoJSON(major, sub, labelSpacing),
  });

  map.addLayer({
    id: 'graticule-sub', type: 'line', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'sub'],
    paint: {
      'line-color': GRAT_COLOR, 'line-opacity': 0.22,
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 5, 0.5, 10, 0.6, 14, 0.8],
    },
  });

  map.addLayer({
    id: 'graticule-major', type: 'line', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'major'],
    paint: {
      'line-color': GRAT_COLOR, 'line-opacity': 0.40,
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 5, 0.7, 10, 1.0, 14, 1.2],
    },
  });

  map.addLayer({
    id: 'graticule-labels', type: 'symbol', source: 'graticule',
    filter: ['==', ['get', 'rank'], 'label'],
    layout: {
      'text-field': ['get', 'text'],
      'text-font': ['Open Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 1, 8, 5, 9, 10, 10],
      'text-anchor': 'bottom-left',
      'text-offset': [0.3, -0.2],
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-padding': 20,
      'symbol-placement': 'point',
    },
    paint: {
      'text-color': GRAT_COLOR, 'text-opacity': 0.65,
      'text-halo-color': 'rgba(242, 237, 228, 0.6)', 'text-halo-width': 1,
    },
  });

  map.on('zoomend', () => {
    const intervals = getIntervals(map.getZoom());
    if (intervals.major !== currentMajor) {
      currentMajor = intervals.major;
      const src = map.getSource('graticule') as maplibregl.GeoJSONSource;
      if (src) src.setData(buildGraticuleGeoJSON(intervals.major, intervals.sub, intervals.labelSpacing));
    }
  });

  const labelContainer = document.getElementById('grat-edge-labels');
  if (labelContainer) labelContainer.innerHTML = '';
}
