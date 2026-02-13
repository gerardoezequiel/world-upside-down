import type maplibregl from "maplibre-gl";

/**
 * Deep-clone and recolor a MapLibre style spec using a palette.
 * Pure function — no DOM, no state dependency.
 */
export function recolorStyle(palette: Record<string, string>, style: maplibregl.StyleSpecification): maplibregl.StyleSpecification {
  const s = JSON.parse(JSON.stringify(style)) as maplibregl.StyleSpecification;
  const P = palette;

  for (const layer of s.layers) {
    const id = (layer as any).id as string;

    if (id === "background" && "paint" in layer) { (layer as any).paint["background-color"] = P.bg; continue; }
    if (id === "earth" && "paint" in layer) { (layer as any).paint["fill-color"] = P.earth; continue; }
    if (id === "buildings" && "paint" in layer) {
      (layer as any).paint["fill-color"] = P.buildings;
      (layer as any).paint["fill-opacity"] = ["interpolate", ["linear"], ["zoom"], 12, 0.5, 14, 0.70, 16, 0.85];
      (layer as any).paint["fill-outline-color"] = "rgba(0, 120, 191, 0.25)";
      continue;
    }
    if (id === "water" && "paint" in layer) {
      (layer as any).paint["fill-color"] = P.water;
      (layer as any).paint["fill-antialias"] = true;
      continue;
    }
    if ((id === "water_stream" || id === "water_river") && "paint" in layer) {
      (layer as any).paint["line-color"] = P.waterLine;
      continue;
    }
    if (id.startsWith("landuse_park") && "paint" in layer) {
      (layer as any).paint["fill-color"] = P.park;
      (layer as any).paint["fill-opacity"] = ["interpolate", ["linear"], ["zoom"], 6, 0.1, 10, 0.25, 14, 0.45];
      continue;
    }
    if (id === "landuse_urban_green" && "paint" in layer) { (layer as any).paint["fill-color"] = P.parkAlt; continue; }
    if (id === "landuse_hospital" && "paint" in layer) { (layer as any).paint["fill-color"] = P.hospital; continue; }
    if (id === "landuse_school" && "paint" in layer) { (layer as any).paint["fill-color"] = P.school; continue; }
    if (id === "landuse_industrial" && "paint" in layer) { (layer as any).paint["fill-color"] = P.industrial; continue; }
    if (id === "landuse_beach" && "paint" in layer) { (layer as any).paint["fill-color"] = P.beach; continue; }
    if (id === "landuse_zoo" && "paint" in layer) { (layer as any).paint["fill-color"] = P.zoo; continue; }
    if (id === "landuse_aerodrome" && "paint" in layer) { (layer as any).paint["fill-color"] = P.aerodrome; continue; }
    if (id === "landuse_pedestrian" && "paint" in layer) { (layer as any).paint["fill-color"] = P.pedestrian; continue; }
    if (id === "landuse_pier" && "paint" in layer) { (layer as any).paint["fill-color"] = P.pier; continue; }
    if (id === "landuse_runway" && "paint" in layer) { (layer as any).paint["fill-color"] = P.runway; continue; }

    if (id === "landcover" && "paint" in layer) {
      (layer as any).paint["fill-color"] = [
        "match", ["get", "kind"],
        "grassland", P.grass, "barren", P.barren, "urban_area", P.urban,
        "farmland", P.farmland, "glacier", P.glacier, "scrub", P.scrub, P.grass,
      ];
      continue;
    }

    if (id.includes("_casing") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) p["line-color"] = P.roadCas;
      p["line-opacity"] = ["interpolate", ["linear"], ["zoom"], 10, 0.3, 16, 0.4];
      continue;
    }

    if (id.startsWith("roads_") && !id.includes("label") && !id.includes("shield") && !id.includes("oneway") && "paint" in layer) {
      const p = (layer as any).paint;
      if (p["line-color"]) {
        if (id.includes("highway") || id.includes("major")) {
          p["line-color"] = P.roadMajor;
          // Thinner roads: reduce visual weight at mid-zooms for a cleaner riso look
          if (id.includes("highway") && !id.includes("casing")) {
            p["line-width"] = ["interpolate", ["exponential", 1.6], ["zoom"], 3, 0, 6, 0, 12, 0.9, 15, 2.5, 18, 8];
          } else if (id.includes("major") && !id.includes("casing")) {
            p["line-width"] = ["interpolate", ["exponential", 1.6], ["zoom"], 6, 0, 12, 0.9, 15, 1.8, 18, 7];
          }
        }
        else if (id.includes("minor") || id.includes("other") || id.includes("link")) {
          p["line-color"] = P.roadMinor;
          // Lighter minor roads
          p["line-opacity"] = ["interpolate", ["linear"], ["zoom"], 12, 0.4, 16, 0.55];
        }
        else if (id.includes("rail")) p["line-color"] = P.rail;
        else if (id.includes("pier")) p["line-color"] = P.pier;
        else if (id.includes("runway") || id.includes("taxiway")) p["line-color"] = P.runway;
      }
      continue;
    }

    if (id.startsWith("boundaries") && "paint" in layer) { (layer as any).paint["line-color"] = P.boundary; continue; }

    if (id === "pois") {
      const l = layer as any;
      delete l.layout["icon-image"];
      l.layout["text-offset"] = [0, 0];
      l.layout["text-variable-anchor"] = ["center", "left", "right", "top", "bottom"];
      l.layout["text-size"] = ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 13];
      l.paint["text-color"] = [
        "match", ["get", "kind"],
        "park", P.park, "forest", P.park, "garden", P.park,
        "beach", P.park, "zoo", P.zoo, "marina", P.waterLine,
        "station", P.road, "bus_stop", P.roadMinor,
        "ferry_terminal", P.waterLine, "aerodrome", P.roadMinor,
        "university", P.boundary, "library", P.boundary,
        "school", P.boundary, "townhall", P.boundary,
        "post_office", P.boundary, "museum", P.boundary,
        "theatre", P.boundary, "artwork", P.boundary,
        P.roadMinor,
      ];
      l.paint["text-halo-color"] = P.labelHalo;
      l.paint["text-halo-width"] = 1.2;
      continue;
    }

    if (id === "places_locality") { delete (layer as any).layout["icon-image"]; continue; }
    if (id === "roads_shields") { (layer as any).layout = { visibility: "none" }; continue; }

    // Fix tunnel casing filter bugs: these layers incorrectly filter for surface roads
    if (id === "roads_tunnels_major_casing" && "filter" in layer) {
      (layer as any).filter = ["all", ["has", "is_tunnel"], ["==", "kind", "major_road"]];
      continue;
    }
    if (id === "roads_tunnels_highway_casing" && "filter" in layer) {
      (layer as any).filter = ["all", ["has", "is_tunnel"], ["==", "kind", "highway"], ["!has", "is_link"]];
      continue;
    }

    // Narrow park filter: remove military/airfield/naval_base and vegetation overlap
    if (id === "landuse_park" && "filter" in layer) {
      (layer as any).filter = [
        "in", "kind",
        "national_park", "park", "cemetery", "protected_area",
        "nature_reserve", "forest", "golf_course",
      ];
    }

    if ("paint" in layer) {
      const p = (layer as any).paint;
      if (p["text-color"]) p["text-color"] = P.label;
      if (p["text-halo-color"]) p["text-halo-color"] = P.labelHalo;
    }
  }

  return s;
}
