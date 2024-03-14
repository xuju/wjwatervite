import React, { useEffect, useRef } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TiledMapLayer, tiledMapLayer } from 'esri-leaflet';
import 'proj4';
import 'proj4leaflet';
import './index.less';
let CRS_4490 = new (L as any).Proj.CRS('EPSG:4490', '+proj=longlat +ellps=GRS80 +no_defs', {
  resolutions: (window as any).mapConfig.resolutions,
  origin: (window as any).mapConfig.origin,
  bounds: L.bounds((window as any).mapConfig.bounds[0], (window as any).mapConfig.bounds[1])
});

let CRS_4490onLine = new (L as any).Proj.CRS('EPSG:4490', '+proj=longlat +ellps=GRS80 +no_defs', {
  resolutions: (window as any).mapConfig1.resolutions,
  origin: (window as any).mapConfig1.origin,
  bounds: L.bounds((window as any).mapConfig1.bounds[0], (window as any).mapConfig1.bounds[1])
});
interface Props {
  setMap: Function;
  LayerData: ILayer;
}
export default function LeafletBox(props: Props) {
  const { setMap, LayerData } = props;

  const leafletRef = useRef<any>();
  useEffect(() => {
    if (LayerData) {
      let baseLayer: TiledMapLayer[] = [];

      const url = (window as any).isTest ? LayerData.testurl : LayerData.onlineurl2;
      let layer = (tiledMapLayer as any)({
        url: url,
        id: LayerData.title,
        type: 'baseLayer'
      });
      baseLayer.push(layer);

      let map = L.map(leafletRef.current, {
        center: [31.150933, 120.658235],
        zoom: 5,
        attributionControl: false,
        zoomControl: false,
        crs: (window as any).isTest ? CRS_4490 : CRS_4490onLine,
        maxZoom: 10,
        layers: baseLayer
      });

      setMap(map);
    }
  }, [LayerData]);
  return <div className="map" ref={leafletRef}></div>;
}
