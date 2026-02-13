# Geo Data Scientist -- Agent Memory

## style.json Structure
- 71 layers, Protomaps v4 PMTiles source, light theme
- 33 road layers (tunnel/surface/bridge x highway/major/minor/link/other + casing)
- 6 water layers (1 fill, 2 line, 3 symbol)
- 12 landuse fill layers
- No pink #FF48B0 colors exist -- all fills are muted greens/grays
- Label layers use Protomaps multi-script text-field pattern (name:en, pgf:name, Devanagari support)
- Known bugs: tunnel casing filters (roads_tunnels_major_casing, roads_tunnels_highway_casing) incorrectly filter for surface roads
- Analysis docs: see `/STYLE-GUIDE.md` and `/docs/STYLE-FIXES.md`

## Key File Paths
- `/style.json` -- Protomaps basemap style (4840 lines)
- `/STYLE-GUIDE.md` -- Comprehensive layer inventory and analysis
- `/docs/STYLE-FIXES.md` -- Prioritized JSON patches
