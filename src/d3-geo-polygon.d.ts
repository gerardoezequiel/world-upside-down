declare module 'd3-geo-polygon' {
  import { GeoProjection } from 'd3-geo';
  export function geoAirocean(): GeoProjection;
  export function geoImago(): GeoProjection;
}

declare module 'd3-geo-projection' {
  import { GeoProjection } from 'd3-geo';
  export function geoMollweide(): GeoProjection;
  export function geoRobinson(): GeoProjection;
  export function geoCylindricalEqualArea(): GeoProjection & { parallel(p: number): GeoProjection };
  export function geoInterruptedHomolosine(): GeoProjection;
  export function geoPolyhedralWaterman(): GeoProjection;
}
