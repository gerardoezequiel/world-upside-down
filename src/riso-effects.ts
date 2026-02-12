import type { AppState } from "./map-state";
import { RISO_INKS, generateMisregistration, getSessionSeed } from "./riso";

export function applyRisoMisregistration(state: AppState): void {
  const map = state.map;
  const seed = getSessionSeed();
  const misreg = generateMisregistration(seed);
  const style = map.getStyle();
  if (!style) return;

  const SCALE = 2.5;

  const waterLayer = style.layers.find(l => l.id === 'water');
  if (waterLayer && 'source-layer' in waterLayer) {
    map.addLayer({
      id: 'water-riso-offset', type: 'fill',
      source: (waterLayer as any).source,
      'source-layer': (waterLayer as any)['source-layer'],
      paint: {
        'fill-color': RISO_INKS.teal.hex, 'fill-opacity': 0.12,
        'fill-translate': [misreg.teal.dx * SCALE, misreg.teal.dy * SCALE],
      },
    }, 'water');
  }

  const buildingLayer = style.layers.find(l => l.id === 'buildings');
  if (buildingLayer && 'source-layer' in buildingLayer) {
    map.addLayer({
      id: 'buildings-riso-offset', type: 'fill',
      source: (buildingLayer as any).source,
      'source-layer': (buildingLayer as any)['source-layer'],
      paint: {
        'fill-color': RISO_INKS.blue.hex, 'fill-opacity': 0.10,
        'fill-translate': [misreg.blue.dx * SCALE, misreg.blue.dy * SCALE],
      },
    }, 'buildings');
  }

  for (const layer of style.layers) {
    if (layer.id.startsWith('landuse_park') && layer.type === 'fill' && 'source-layer' in layer) {
      map.addLayer({
        id: `${layer.id}-riso-offset`, type: 'fill',
        source: (layer as any).source,
        'source-layer': (layer as any)['source-layer'],
        filter: (layer as any).filter,
        paint: {
          'fill-color': RISO_INKS.fluorPink.hex, 'fill-opacity': 0.12,
          'fill-translate': [misreg.fluorPink.dx * SCALE, misreg.fluorPink.dy * SCALE],
        },
      }, layer.id);
    }
  }

  for (const layer of style.layers) {
    if ((layer.id.startsWith('roads_') || layer.id.startsWith('boundaries')) &&
        layer.type === 'line' && 'source-layer' in layer &&
        !layer.id.includes('label') && !layer.id.includes('shield')) {
      const lineWidth = (layer as any).paint?.['line-width'] || 1;
      try {
        map.addLayer({
          id: `${layer.id}-riso-offset`, type: 'line',
          source: (layer as any).source,
          'source-layer': (layer as any)['source-layer'],
          filter: (layer as any).filter,
          paint: {
            'line-color': '#333333', 'line-width': lineWidth,
            'line-opacity': 0.08,
            'line-translate': [misreg.black.dx * SCALE, misreg.black.dy * SCALE],
          },
        }, layer.id);
      } catch {
        // Skip
      }
    }
  }
}
