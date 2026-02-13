# Style Fixes -- Specific JSON Patches for style.json

This document lists concrete JSON patches to fix identified issues in `/style.json`.

---

## Fix 1: Water Artifacts -- Add `fill-antialias: true`

The `water` fill layer (line 247) has no explicit `fill-antialias` property. While MapLibre defaults to `true`, explicitly setting it prevents edge-case rendering artifacts (jagged coastlines, seams at tile boundaries).

### Patch

Find the `water` layer paint object:

```json
"paint": {
  "fill-color": "#80deea"
}
```

Replace with:

```json
"paint": {
  "fill-color": "#80deea",
  "fill-antialias": true
}
```

### Also apply to these fill layers that lack explicit antialias:

**`earth` layer (line 19):**
```json
"paint": {
  "fill-color": "#e2dfda"
}
```
Replace with:
```json
"paint": {
  "fill-color": "#e2dfda",
  "fill-antialias": true
}
```

**`buildings` layer (line 586):**
```json
"paint": {
  "fill-color": "#cccccc",
  "fill-opacity": 0.5
}
```
Replace with:
```json
"paint": {
  "fill-color": "#cccccc",
  "fill-opacity": 0.5,
  "fill-antialias": true
}
```

---

## Fix 2: Road Width Reductions -- Halve Current Widths

All road widths use exponential 1.6 interpolation, which causes very thick lines at high zoom. The fix halves the terminal width values at z15+ while preserving the low-zoom stops where roads are already thin.

### 2a. `roads_highway` (line 1009) -- z18: 15 -> 7.5

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  3, 0,
  6, 1.1,
  12, 1.6,
  15, 5,
  18, 15
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  3, 0,
  6, 1.1,
  12, 1.6,
  15, 2.5,
  18, 7.5
]
```

### 2b. `roads_major` (line 944) -- z18: 13 -> 6.5

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  6, 0,
  12, 1.6,
  15, 3,
  18, 13
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  6, 0,
  12, 1.6,
  15, 1.5,
  18, 6.5
]
```

### 2c. `roads_minor` (line 871) -- z18: 11 -> 5.5

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  11, 0,
  12.5, 0.5,
  15, 2,
  18, 11
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  11, 0,
  12.5, 0.5,
  15, 1,
  18, 5.5
]
```

### 2d. `roads_link` (line 825) -- z18: 11 -> 5.5

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  13, 0,
  13.5, 1,
  18, 11
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  13, 0,
  13.5, 1,
  18, 5.5
]
```

### 2e. `roads_minor_service` (line 846) -- z18: 8 -> 4

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  13, 0,
  18, 8
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  13, 0,
  18, 4
]
```

### 2f. `roads_runway` (line 194) -- z18: 30 -> 15

Current:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  10, 0,
  12, 4,
  18, 30
]
```

Replacement:
```json
"line-width": [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  10, 0,
  12, 2,
  18, 15
]
```

### 2g. Apply same halving to tunnel and bridge equivalents

The same half-width values should be applied to:
- `roads_tunnels_highway` (z18: 15 -> 7.5)
- `roads_tunnels_major` (z18: 13 -> 6.5)
- `roads_tunnels_minor` (z18: 11 -> 5.5)
- `roads_tunnels_link` (z18: 11 -> 5.5)
- `roads_tunnels_other` (z20: 7 -> 3.5)
- `roads_bridges_highway` (z18: 15 -> 7.5)
- `roads_bridges_major` (z18: 13 -> 6.5)
- `roads_bridges_minor` (z18: 11 -> 5.5)
- `roads_bridges_link` (z18: 11 -> 5.5)
- `roads_bridges_other` (z20: 7 -> 3.5)
- `roads_other` (z20: 7 -> 3.5)

### 2h. Halve corresponding casing gap-widths

Casing `line-gap-width` values must match the halved road widths, otherwise casings will be disproportionate:
- `roads_highway_casing_early` gap: z18: 15 -> 7.5
- `roads_highway_casing_late` gap: z18: 15 -> 7.5
- `roads_major_casing_early` gap: z18: 13 -> 6.5
- `roads_major_casing_late` gap: z18: 13 -> 6.5
- `roads_minor_casing` gap: z18: 11 -> 5.5
- `roads_minor_service_casing` gap: z18: 8 -> 4
- `roads_link_casing` gap: z18: 11 -> 5.5
- All tunnel casing gap-widths
- All bridge casing gap-widths

---

## Fix 3: Park Extent Corrections

### 3a. Remove non-park kinds from `landuse_park` filter

The `landuse_park` layer (line 55) currently includes military, naval_base, and airfield features styled with park colors. These should be removed from the filter (they already have their own gray color branch in the case expression, but should not be in a layer called "park" at all).

Current filter (line 59-78):
```json
"filter": [
  "in",
  "kind",
  "national_park",
  "park",
  "cemetery",
  "protected_area",
  "nature_reserve",
  "forest",
  "golf_course",
  "wood",
  "nature_reserve",
  "forest",
  "scrub",
  "grassland",
  "grass",
  "military",
  "naval_base",
  "airfield"
]
```

Replacement -- remove duplicates and non-park kinds:
```json
"filter": [
  "in",
  "kind",
  "national_park",
  "park",
  "cemetery",
  "protected_area",
  "nature_reserve",
  "forest",
  "golf_course"
]
```

If you want wood/scrub/grassland/grass to remain as separate green areas, keep them but in a dedicated `landuse_vegetation` layer instead of the park layer.

### 3b. Remove duplicate entries from case expression

If keeping the broad filter, at minimum remove the duplicate `nature_reserve` and `forest` entries from the filter array. The current array lists them twice each:

```
"nature_reserve",   <-- first occurrence (line 66)
"forest",           <-- first occurrence (line 67)
...
"nature_reserve",   <-- duplicate (line 70)
"forest",           <-- duplicate (line 71)
```

### 3c. Also update the paint case expression to match

If you narrow the filter per 3a, you should also simplify the paint `fill-color` case expression (lines 82-119) to remove the branches for `wood`, `scrub`, `grassland`, `grass`, `glacier`, `sand`, `military`, `naval_base`, `airfield` since those kinds will no longer pass the filter.

Simplified paint:
```json
"fill-color": [
  "match",
  ["get", "kind"],
  ["national_park", "park", "cemetery", "protected_area", "nature_reserve", "golf_course"],
  "#9cd3b4",
  "forest",
  "#a0d9a0",
  "#9cd3b4"
]
```

### 3d. Fix landcover/park opacity gap

The `landcover` layer fades OUT from z5 (opacity 1) to z7 (opacity 0).
The `landuse_park` layer fades IN from z6 (opacity 0) to z11 (opacity 1).

Between z7 and z11, vegetation features are barely visible. Fix by tightening the transition:

`landuse_park` fill-opacity -- change from:
```json
"fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 11, 1]
```

To:
```json
"fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 7, 1]
```

This makes the park layer reach full opacity exactly as landcover fades out.

---

## Fix 4: Tunnel Casing Filter Bugs

### 4a. `roads_tunnels_major_casing` (line 393)

Current filter (WRONG -- filters for surface roads):
```json
"filter": [
  "all",
  ["!has", "is_tunnel"],
  ["!has", "is_bridge"],
  ["==", "kind", "major_road"]
]
```

Replacement (correct tunnel filter):
```json
"filter": [
  "all",
  ["has", "is_tunnel"],
  ["==", "kind", "major_road"]
]
```

### 4b. `roads_tunnels_highway_casing` (line 429)

Current filter (WRONG -- filters for surface roads):
```json
"filter": [
  "all",
  ["!has", "is_tunnel"],
  ["!has", "is_bridge"],
  ["==", "kind", "highway"],
  ["!has", "is_link"]
]
```

Replacement (correct tunnel filter):
```json
"filter": [
  "all",
  ["has", "is_tunnel"],
  ["==", "kind", "highway"],
  ["!has", "is_link"]
]
```

---

## Fix Priority

| Priority | Fix | Impact |
|----------|-----|--------|
| P0 | Fix 4 -- Tunnel filter bugs | Broken rendering: tunnel casings draw on surface roads instead of tunnels |
| P1 | Fix 2 -- Road width reduction | Visual: roads dominate the map at z15+ |
| P2 | Fix 3a -- Park filter scope | Semantic: military bases styled as parks |
| P2 | Fix 3d -- Opacity gap | Visual: vegetation disappears between z7-z11 |
| P3 | Fix 1 -- fill-antialias | Defensive: prevent edge-case rendering artifacts |
| P3 | Fix 3b -- Duplicate filter entries | Cleanup: no visual impact, reduces JSON size |
