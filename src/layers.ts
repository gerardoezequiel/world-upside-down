/* ══════════════════════════════════════════════════════════════
   Layer Toggles — toggle map layer visibility from the sidebar
   ══════════════════════════════════════════════════════════════ */
import type { AppState } from "./map-state";

export interface LayerGroup {
  id: string;
  label: string;
  match: (layerId: string, layerType: string) => boolean;
  visible: boolean;
}

export function createLayerGroups(): LayerGroup[] {
  return [
    { id: 'roads',      label: 'Roads',      match: (id) => id.startsWith('roads_'),                                          visible: true },
    { id: 'labels',     label: 'Labels',     match: (_id, type) => type === 'symbol',                                          visible: true },
    { id: 'buildings',  label: 'Buildings',   match: (id) => id.startsWith('buildings'),                                        visible: true },
    { id: 'parks',      label: 'Parks',       match: (id) => id.startsWith('landuse_park') || id === 'landuse_urban_green',     visible: true },
    { id: 'water',      label: 'Water',       match: (id) => id.startsWith('water'),                                            visible: true },
    { id: 'boundaries', label: 'Boundaries',  match: (id) => id.startsWith('boundaries'),                                       visible: true },
  ];
}

function setGroupVisibility(state: AppState, group: LayerGroup, visible: boolean): void {
  const style = state.map.getStyle();
  if (!style) return;

  group.visible = visible;

  for (const layer of style.layers) {
    if (group.match(layer.id, layer.type)) {
      try {
        state.map.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
      } catch { /* layer not found */ }
    }
  }
}

export function setupLayers(state: AppState): void {
  const container = document.getElementById('sidebar-layers');
  if (!container) return;

  const groups = createLayerGroups();

  const title = document.createElement('div');
  title.className = 'ink-section-title';
  title.textContent = 'Toggle layers';
  container.appendChild(title);

  for (const group of groups) {
    const row = document.createElement('label');
    row.className = 'layer-toggle-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = group.visible;
    checkbox.className = 'layer-toggle-checkbox';

    const label = document.createElement('span');
    label.className = 'layer-toggle-label';
    label.textContent = group.label;

    checkbox.addEventListener('change', () => {
      setGroupVisibility(state, group, checkbox.checked);
    });

    row.appendChild(checkbox);
    row.appendChild(label);
    container.appendChild(row);
  }
}
