# Style Guide -- style.json Layer Analysis

Source: Protomaps PMTiles v4 basemap (`v4.pmtiles`)
Sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/light`
Glyphs: `https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf`
Total layers: **71**

---

## Complete Layer Inventory

| # | Layer ID | Type | Source-Layer | Key Paint Properties |
|---|---------|------|-------------|---------------------|
| 1 | `background` | background | (none) | `background-color: #cccccc` |
| 2 | `earth` | fill | `earth` | `fill-color: #e2dfda` |
| 3 | `landcover` | fill | `landcover` | `fill-color: match(kind)` -- grassland/barren/urban/farmland/glacier/scrub; `fill-opacity: interpolate z5->1, z7->0` |
| 4 | `landuse_park` | fill | `landuse` | `fill-color: case(kind)` -- greens (#9cd3b4, #a0d9a0, #99d2bb etc.); `fill-opacity: interpolate z6->0, z11->1` |
| 5 | `landuse_urban_green` | fill | `landuse` | `fill-color: #9cd3b4`, `fill-opacity: 0.7` |
| 6 | `landuse_hospital` | fill | `landuse` | `fill-color: #e4dad9` |
| 7 | `landuse_industrial` | fill | `landuse` | `fill-color: #d1dde1` |
| 8 | `landuse_school` | fill | `landuse` | `fill-color: #e4ded7` |
| 9 | `landuse_beach` | fill | `landuse` | `fill-color: #e8e4d0` |
| 10 | `landuse_zoo` | fill | `landuse` | `fill-color: #c6dcdc` |
| 11 | `landuse_aerodrome` | fill | `landuse` | `fill-color: #dadbdf` |
| 12 | `roads_runway` | line | `roads` | `line-color: #e9e9ed`, `line-width: exp1.6 z10->0, z12->4, z18->30` |
| 13 | `roads_taxiway` | line | `roads` | `line-color: #e9e9ed`, `line-width: exp1.6 z13->0, z13.5->1, z15->6`; minzoom 13 |
| 14 | `landuse_runway` | fill | `landuse` | `fill-color: #e9e9ed` |
| 15 | `water` | fill | `water` | `fill-color: #80deea` |
| 16 | `water_stream` | line | `water` | `line-color: #80deea`, `line-width: 0.5`; minzoom 14 |
| 17 | `water_river` | line | `water` | `line-color: #80deea`, `line-width: exp1.6 z9->0, z9.5->1, z18->12`; minzoom 9 |
| 18 | `landuse_pedestrian` | fill | `landuse` | `fill-color: #e3e0d4` |
| 19 | `landuse_pier` | fill | `landuse` | `fill-color: #e0e0e0` |
| 20 | `roads_tunnels_other_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z14->0, z20->7` |
| 21 | `roads_tunnels_minor_casing` | line | `roads` | `line-color: #e0e0e0`, dash `[3,2]`, `line-gap-width: exp1.6 z11->0..z18->11`, `line-width: exp1.6 z12->0, z12.5->1` |
| 22 | `roads_tunnels_link_casing` | line | `roads` | `line-color: #e0e0e0`, dash `[3,2]`, `line-gap-width: exp1.6 z13->0..z18->11`, `line-width: exp1.6 z12->0, z12.5->1` |
| 23 | `roads_tunnels_major_casing` | line | `roads` | `line-color: #e0e0e0`, dash `[3,2]`, `line-gap-width: exp1.6 z7->0..z18->13`, `line-width: exp1.6 z9->0, z9.5->1` **BUG: filter says !is_tunnel AND !is_bridge -- should be is_tunnel** |
| 24 | `roads_tunnels_highway_casing` | line | `roads` | `line-color: #e0e0e0`, dash `[6,0.5]`, `line-gap-width: exp1.6 z3->0..z18->15`, `line-width: exp1.6 z7->0, z7.5->1, z20->15` **BUG: filter says !is_tunnel AND !is_bridge** |
| 25 | `roads_tunnels_other` | line | `roads` | `line-color: #d5d5d5`, dash `[4.5,0.5]`, `line-width: exp1.6 z14->0, z20->7` |
| 26 | `roads_tunnels_minor` | line | `roads` | `line-color: #d5d5d5`, `line-width: exp1.6 z11->0, z12.5->0.5, z15->2, z18->11` |
| 27 | `roads_tunnels_link` | line | `roads` | `line-color: #d5d5d5`, `line-width: exp1.6 z13->0, z13.5->1, z18->11` |
| 28 | `roads_tunnels_major` | line | `roads` | `line-color: #d5d5d5`, `line-width: exp1.6 z6->0, z12->1.6, z15->3, z18->13` |
| 29 | `roads_tunnels_highway` | line | `roads` | `line-color: #d5d5d5`, `line-width: exp1.6 z3->0, z6->1.1, z12->1.6, z15->5, z18->15` |
| 30 | `buildings` | fill | `buildings` | `fill-color: #cccccc`, `fill-opacity: 0.5` |
| 31 | `roads_pier` | line | `roads` | `line-color: #e0e0e0`, `line-width: exp1.6 z12->0, z12.5->0.5, z20->16` |
| 32 | `roads_minor_service_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z13->0, z18->8`, `line-width: exp1.6 z13->0, z13.5->0.8`; minzoom 13 |
| 33 | `roads_minor_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z11->0..z18->11`, `line-width: exp1.6 z12->0, z12.5->1` |
| 34 | `roads_link_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z13->0..z18->11`, `line-width: exp1.6 z13->0, z13.5->1.5`; minzoom 13 |
| 35 | `roads_major_casing_late` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z6->0..z18->13`, `line-width: exp1.6 z9->0, z9.5->1`; minzoom 12 |
| 36 | `roads_highway_casing_late` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z3->0..z18->15`, `line-width: exp1.6 z7->0, z7.5->1, z20->15`; minzoom 12 |
| 37 | `roads_other` | line | `roads` | `line-color: #ebebeb`, dash `[3,1]`, `line-width: exp1.6 z14->0, z20->7` |
| 38 | `roads_link` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z13->0, z13.5->1, z18->11` |
| 39 | `roads_minor_service` | line | `roads` | `line-color: #ebebeb`, `line-width: exp1.6 z13->0, z18->8` |
| 40 | `roads_minor` | line | `roads` | `line-color: interpolate z11->#ebebeb, z16->#ffffff`, `line-width: exp1.6 z11->0, z12.5->0.5, z15->2, z18->11` |
| 41 | `roads_major_casing_early` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z7->0..z18->13`, `line-width: exp1.6 z9->0, z9.5->1`; maxzoom 12 |
| 42 | `roads_major` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z6->0, z12->1.6, z15->3, z18->13` |
| 43 | `roads_highway_casing_early` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z3->0..z18->15`, `line-width: exp1.6 z7->0, z7.5->1`; maxzoom 12 |
| 44 | `roads_highway` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z3->0, z6->1.1, z12->1.6, z15->5, z18->15` |
| 45 | `roads_rail` | line | `roads` | `line-color: #a7b1b3`, dash `[0.3,0.75]`, `line-opacity: 0.5`, `line-width: exp1.6 z3->0, z6->0.15, z18->9` |
| 46 | `boundaries_country` | line | `boundaries` | `line-color: #adadad`, `line-width: 0.7`, dash step |
| 47 | `boundaries` | line | `boundaries` | `line-color: #adadad`, `line-width: 0.4`, dash step |
| 48 | `roads_bridges_other_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z14->0, z20->7`; minzoom 12 |
| 49 | `roads_bridges_link_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z13->0..z18->11`, `line-width: exp1.6 z12->0, z12.5->1.5`; minzoom 12 |
| 50 | `roads_bridges_minor_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z11->0..z18->11`, `line-width: exp1.6 z13->0, z13.5->0.8`; minzoom 12 |
| 51 | `roads_bridges_major_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z7->0..z18->10`, `line-width: exp1.6 z9->0, z9.5->1.5`; minzoom 12 |
| 52 | `roads_bridges_other` | line | `roads` | `line-color: #ebebeb`, dash `[2,1]`, `line-width: exp1.6 z14->0, z20->7`; minzoom 12 |
| 53 | `roads_bridges_minor` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z11->0, z12.5->0.5, z15->2, z18->11`; minzoom 12 |
| 54 | `roads_bridges_link` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z13->0, z13.5->1, z18->11`; minzoom 12 |
| 55 | `roads_bridges_major` | line | `roads` | `line-color: #f5f5f5`, `line-width: exp1.6 z6->0, z12->1.6, z15->3, z18->13`; minzoom 12 |
| 56 | `roads_bridges_highway_casing` | line | `roads` | `line-color: #e0e0e0`, `line-gap-width: exp1.6 z3->0..z18->15`, `line-width: exp1.6 z7->0, z7.5->1, z20->15`; minzoom 12 |
| 57 | `roads_bridges_highway` | line | `roads` | `line-color: #ffffff`, `line-width: exp1.6 z3->0, z6->1.1, z12->1.6, z15->5, z18->15` |
| 58 | `address_label` | symbol | `buildings` | `text-color: #91888b`, halo white; minzoom 18 |
| 59 | `water_waterway_label` | symbol | `water` | `text-color: #728dd4`, halo `#80deea` |
| 60 | `roads_oneway` | symbol | `roads` | icon arrow; minzoom 16 |
| 61 | `roads_labels_minor` | symbol | `roads` | `text-color: #91888b`, halo white; minzoom 15 |
| 62 | `water_label_ocean` | symbol | `water` | `text-color: #728dd4`, halo `#80deea`; uppercase |
| 63 | `earth_label_islands` | symbol | `earth` | `text-color: #8f8f8f`, halo `#e0e0e0` |
| 64 | `water_label_lakes` | symbol | `water` | `text-color: #728dd4`, halo `#80deea` |
| 65 | `roads_shields` | symbol | `roads` | `text-color: #938a8d` |
| 66 | `roads_labels_major` | symbol | `roads` | `text-color: #938a8d`, halo white; minzoom 11 |
| 67 | `pois` | symbol | `pois` | multi-color by kind category |
| 68 | `places_subplace` | symbol | `places` | `text-color: #8f8f8f`, halo `#e0e0e0`; uppercase |
| 69 | `places_region` | symbol | `places` | `text-color: #b3b3b3`, halo `#e0e0e0`; uppercase |
| 70 | `places_locality` | symbol | `places` | `text-color: #5c5c5c`, halo `#e0e0e0`; population-based sizing |
| 71 | `places_country` | symbol | `places` | `text-color: #a3a3a3`, halo `#e2dfda`; uppercase |

---

## Layers Grouped by Function

### 1. Water Layers

| Layer ID | Type | Source-Layer | Filter | Key Paint |
|----------|------|-------------|--------|-----------|
| `water` | fill | `water` | `$type == Polygon` | `fill-color: #80deea` |
| `water_stream` | line | `water` | `kind in [stream]` | `line-color: #80deea`, width 0.5 |
| `water_river` | line | `water` | `kind in [river]` | `line-color: #80deea`, width z9->0..z18->12 |
| `water_waterway_label` | symbol | `water` | `kind in [river, stream]` | `text-color: #728dd4` |
| `water_label_ocean` | symbol | `water` | `kind in [sea, ocean, bay, strait, fjord]` | `text-color: #728dd4` |
| `water_label_lakes` | symbol | `water` | `kind in [lake, water]` | `text-color: #728dd4` |

**Water Analysis:**
- **fill-antialias is MISSING** from the `water` fill layer. This is the default MapLibre behavior (`true`), but explicitly setting it is recommended to prevent jagged polygon edges, especially at low zooms or along complex coastlines.
- The `water` fill layer uses `filter: ["==", "$type", "Polygon"]` which filters to polygon geometry only. The line layers (`water_stream`, `water_river`) are separate and use `kind` filters, so there is no geometric overlap between the fill and line layers.
- **Potential z-fighting risk**: The `water` fill layer has no `kind` filter -- it matches ALL polygon features in the `water` source-layer. If the PMTiles data includes both ocean polygons and lake polygons at the same location, they could overlap and z-fight. However, since they use the same `fill-color` (`#80deea`) with default opacity 1, visual z-fighting would be invisible. The risk is theoretical only.
- **No `fill-antialias: true`** is explicitly set. MapLibre GL defaults to `true`, but being explicit prevents edge cases where rendering pipelines differ.

### 2. Road Layers (33 layers)

Organized by context (tunnel/surface/bridge) and by hierarchy (highway > major > minor > link > other/path).

#### Surface roads (non-tunnel, non-bridge)

| Layer ID | Kind | Width Stops (exponential 1.6) |
|----------|------|------------------------------|
| `roads_runway` | runway | z10->0, z12->4, z18->**30** |
| `roads_taxiway` | taxiway | z13->0, z13.5->1, z15->**6** |
| `roads_pier` | pier | z12->0, z12.5->0.5, z20->**16** |
| `roads_other` | other/path | z14->0, z20->**7** |
| `roads_minor_service` | minor_road (service) | z13->0, z18->**8** |
| `roads_minor` | minor_road (!service) | z11->0, z12.5->0.5, z15->2, z18->**11** |
| `roads_link` | is_link | z13->0, z13.5->1, z18->**11** |
| `roads_major` | major_road | z6->0, z12->1.6, z15->3, z18->**13** |
| `roads_highway` | highway | z3->0, z6->1.1, z12->1.6, z15->5, z18->**15** |
| `roads_rail` | rail | z3->0, z6->0.15, z18->**9** |

#### Casing layers (surface)

| Layer ID | Kind | Gap-Width Stops | Casing-Width Stops |
|----------|------|----------------|-------------------|
| `roads_minor_service_casing` | minor (service) | z13->0, z18->8 | z13->0, z13.5->0.8 |
| `roads_minor_casing` | minor (!service) | z11->0..z18->11 | z12->0, z12.5->1 |
| `roads_link_casing` | is_link | z13->0..z18->11 | z13->0, z13.5->1.5 |
| `roads_major_casing_early` | major (maxzoom 12) | z7->0..z18->13 | z9->0, z9.5->1 |
| `roads_major_casing_late` | major (minzoom 12) | z6->0..z18->13 | z9->0, z9.5->1 |
| `roads_highway_casing_early` | highway (maxzoom 12) | z3->0..z18->15 | z7->0, z7.5->1 |
| `roads_highway_casing_late` | highway (minzoom 12) | z3->0..z18->15 | z7->0, z7.5->1, z20->15 |

#### Tunnel roads

| Layer ID | Kind | Width Stops |
|----------|------|-------------|
| `roads_tunnels_other` | other/path | z14->0, z20->7 |
| `roads_tunnels_minor` | minor_road | z11->0, z12.5->0.5, z15->2, z18->11 |
| `roads_tunnels_link` | is_link | z13->0, z13.5->1, z18->11 |
| `roads_tunnels_major` | major_road | z6->0, z12->1.6, z15->3, z18->13 |
| `roads_tunnels_highway` | highway | z3->0, z6->1.1, z12->1.6, z15->5, z18->15 |

#### Bridge roads

| Layer ID | Kind | Width Stops |
|----------|------|-------------|
| `roads_bridges_other` | other/path | z14->0, z20->7 |
| `roads_bridges_minor` | minor_road | z11->0, z12.5->0.5, z15->2, z18->11 |
| `roads_bridges_link` | is_link | z13->0, z13.5->1, z18->11 |
| `roads_bridges_major` | major_road | z6->0, z12->1.6, z15->3, z18->13 |
| `roads_bridges_highway` | highway | z3->0, z6->1.1, z12->1.6, z15->5, z18->15 |

**Road Width Observations:**
- At z18, highways are **15px** wide (plus casing of 15px on each side = **45px total** with gap-width). This is very wide.
- Major roads reach **13px** at z18 (plus casing = ~27px total).
- Minor roads reach **11px** at z18.
- Runways are the widest at **30px** at z18.
- The exponential base of 1.6 means widths grow fast between mid-high zoom levels.

**Road Filter Bugs:**
- `roads_tunnels_major_casing` (layer 23): Filter is `["all", ["!has", "is_tunnel"], ["!has", "is_bridge"], ...]` which is the SURFACE filter, not the tunnel filter. This layer is named "tunnels" but filters for surface roads. It duplicates the surface casing layers.
- `roads_tunnels_highway_casing` (layer 24): Same bug -- filters for `!is_tunnel && !is_bridge` instead of `is_tunnel`.

### 3. Park / Green / Landuse Layers

| Layer ID | Source-Layer | Kinds Matched | Fill Color |
|----------|-------------|--------------|------------|
| `landcover` | `landcover` | grassland, barren, urban_area, farmland, glacier, scrub | Various greens/neutrals; fades out z5->z7 |
| `landuse_park` | `landuse` | national_park, park, cemetery, protected_area, nature_reserve, forest, golf_course, wood, scrub, grassland, grass, military, naval_base, airfield | Case-based greens (#9cd3b4, #a0d9a0, #99d2bb, #e7e7e7, #e2e0d7, #c6dcdc) |
| `landuse_urban_green` | `landuse` | allotments, village_green, playground | `#9cd3b4`, opacity 0.7 |
| `landuse_hospital` | `landuse` | hospital | `#e4dad9` |
| `landuse_industrial` | `landuse` | industrial | `#d1dde1` |
| `landuse_school` | `landuse` | school, university, college | `#e4ded7` |
| `landuse_beach` | `landuse` | beach | `#e8e4d0` |
| `landuse_zoo` | `landuse` | zoo | `#c6dcdc` |
| `landuse_aerodrome` | `landuse` | aerodrome | `#dadbdf` |
| `landuse_runway` | `landuse` | runway, taxiway | `#e9e9ed` |
| `landuse_pedestrian` | `landuse` | pedestrian, dam | `#e3e0d4` |
| `landuse_pier` | `landuse` | pier | `#e0e0e0` |

**Park/Green Analysis:**
- **No pink `#FF48B0` fill exists anywhere in the style.** All park/green layers use muted greens and grays.
- The `landuse_park` layer is **overly broad**. Its filter matches 14 different `pmap:kind` values:
  - Actual parks/green: `national_park`, `park`, `cemetery`, `protected_area`, `nature_reserve`, `golf_course`
  - Forest/vegetation: `forest`, `wood`, `scrub`, `grassland`, `grass` -- these overlap conceptually with `landcover`
  - Military: `military`, `naval_base`, `airfield` -- these are NOT parks
- `nature_reserve` and `forest` appear TWICE in the filter array (duplicates).
- The `landcover` layer (which includes farmland, grassland, scrub) fades to opacity 0 at z7, while `landuse_park` fades IN from z6 to z11. Between z7 and z11, neither is fully visible, creating a gap where vegetation disappears.

### 4. Building Layers

| Layer ID | Type | Source-Layer | Filter | Paint |
|----------|------|-------------|--------|-------|
| `buildings` | fill | `buildings` | `kind in [building, building_part]` | `fill-color: #cccccc`, `fill-opacity: 0.5` |
| `address_label` | symbol | `buildings` | `kind == address` | `text-color: #91888b`; minzoom 18 |

### 5. Land / Earth Layers

| Layer ID | Type | Source-Layer | Filter | Paint |
|----------|------|-------------|--------|-------|
| `earth` | fill | `earth` | `$type == Polygon` | `fill-color: #e2dfda` |
| `landcover` | fill | `landcover` | (none) | match-based fill; fades z5->z7 |
| `earth_label_islands` | symbol | `earth` | `kind in [island]` | `text-color: #8f8f8f` |

### 6. Label / Symbol Layers (14 layers)

| Layer ID | Source-Layer | Content |
|----------|-------------|---------|
| `address_label` | `buildings` | House numbers; minzoom 18 |
| `water_waterway_label` | `water` | River/stream names; minzoom 13 |
| `roads_oneway` | `roads` | One-way arrows; minzoom 16 |
| `roads_labels_minor` | `roads` | Minor road names; minzoom 15 |
| `water_label_ocean` | `water` | Ocean/sea/bay names; uppercase |
| `earth_label_islands` | `earth` | Island names |
| `water_label_lakes` | `water` | Lake/water names |
| `roads_shields` | `roads` | Highway shields with route numbers |
| `roads_labels_major` | `roads` | Major road/highway names; minzoom 11 |
| `pois` | `pois` | Points of interest (37 kinds) |
| `places_subplace` | `places` | Neighborhood/macrohood; uppercase |
| `places_region` | `places` | State/province; uppercase |
| `places_locality` | `places` | City/town; population-based sizing |
| `places_country` | `places` | Country names; uppercase |

All label layers use the Protomaps multi-script text-field pattern with `name:en` fallback, supporting Devanagari via `pgf:name` properties.

### 7. Boundary Layers

| Layer ID | Type | Source-Layer | Filter | Paint |
|----------|------|-------------|--------|-------|
| `boundaries_country` | line | `boundaries` | `kind_detail <= 2` | `line-color: #adadad`, `line-width: 0.7`, dash step |
| `boundaries` | line | `boundaries` | `kind_detail > 2` | `line-color: #adadad`, `line-width: 0.4`, dash step |

---

## Source-Layer Usage Summary

| Source-Layer | Layer Count | Types |
|-------------|-------------|-------|
| `roads` | 33 | line (29), symbol (4) |
| `water` | 6 | fill (1), line (2), symbol (3) |
| `landuse` | 12 | fill (12) |
| `places` | 4 | symbol (4) |
| `earth` | 2 | fill (1), symbol (1) |
| `buildings` | 2 | fill (1), symbol (1) |
| `boundaries` | 2 | line (2) |
| `landcover` | 1 | fill (1) |
| `pois` | 1 | symbol (1) |
| (none/background) | 1 | background (1) |

---

## Issues Summary

1. **Water: Missing explicit `fill-antialias: true`** -- the `water` fill layer relies on MapLibre defaults.
2. **Road widths are excessive** -- highways reach 15px + 15px casing at z18, totaling ~45px.
3. **Filter bugs in tunnel casing layers** -- `roads_tunnels_major_casing` and `roads_tunnels_highway_casing` incorrectly filter for surface roads instead of tunnels.
4. **Park filter is overly broad** -- military, airfield, and naval_base are styled as parks. Forest/scrub/grassland overlap with landcover.
5. **Duplicate filter entries** -- `nature_reserve` and `forest` each appear twice in the `landuse_park` filter array.
6. **Landcover/park opacity gap** -- between z7 and z11, vegetation is partially invisible due to mismatched opacity transitions.
7. **No pink (#FF48B0) colors exist** in the style -- all fills use muted greens and grays from the Protomaps light theme.
