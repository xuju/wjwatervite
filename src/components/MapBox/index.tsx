import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import BaseMap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';
import MapView from '@arcgis/core/views/MapView';
import { ArcGISOptions, getLayers } from '@/config';

import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import GroupLayer from '@arcgis/core/layers/GroupLayer';

import Point from '@arcgis/core/geometry/Point';
import { useRequest } from 'ahooks';
import service from '@/axios';
import './index.less';

import { memo } from 'react';
import { usePageContext } from '@/store';

import ScaleBar from '@arcgis/core/widgets/ScaleBar';

import { mapProxy } from '@/utils/mapProxy';
interface Props {
  getView?: Function;
  selectedLayers?: any[];

  onClick?: Function;
  showPosition?: boolean;
}

const MapBox = (props: Props) => {
  const [view, setView] = useState<MapView>();
  const [hoverLocation, setHoverLocation] = useState<Point>();

  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers));
  const { getView, showPosition = false } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { state, dispatch } = usePageContext();

  const initMap = (layerArr: any[]) => {
    mapProxy.other();
    // 新建基础地图
    const findLayer = layerArr.find((f) => f.title === '午夜蓝');

    const baseLayers: __esri.CollectionProperties<__esri.LayerProperties> = [];
    if (findLayer) {
      const url = (window as any).isTest ? findLayer.testurl : findLayer.onlineurl;

      const baseLayer = new TileLayer({
        url: url,
        id: findLayer.title,
        visible: true,
        maxScale: 70.53107352157943
      });
      baseLayers.push(baseLayer);
    }

    const basemap = new BaseMap({
      baseLayers,
      title: 'Custom Basemap',
      id: 'wyl'
    });
    const map = new Map({
      basemap
    });
    const view = new MapView({
      map,
      container: ref.current as HTMLDivElement,
      center: new Point({
        x: 120.62395924265776,
        y: 31.001418599360157,
        spatialReference: new SpatialReference({ wkid: 4490 })
      }),
      zoom: 3,
      spatialReference: new SpatialReference({ wkid: 4490 })
    });

    view.when(() => {
      if (view) dispatch({ type: 'setView', data: { view } });
    });

    view.on('pointer-move', (event) => {
      const { x, y } = event;
      const location = view.toMap({ x, y });
      setHoverLocation(location);
    });

    view.ui.remove('zoom');
    view.ui.remove('attribution');
    getView && getView(view);
    setView(view);

    var scaleBar = new ScaleBar({
      view: view,
      unit: 'metric'
    });

    view.ui.add(scaleBar, {
      position: 'bottom-right'
    });
  };
  useEffect(() => {
    if (LayerData && LayerData.data && LayerData.data.code == 200) {
      const result = LayerData.data.data;

      initMap(result);
    }
  }, [LayerData]);

  return (
    <>
      <div ref={ref} style={{ width: '100%', height: '100%' }} id="viewDiv" className="viewDiv" />
      {showPosition && hoverLocation && (
        <div className="position-wrap">
          x:{hoverLocation?.x.toFixed(6)} y:{hoverLocation?.y.toFixed(6)}
        </div>
      )}
    </>
  );
};
export default memo(MapBox);
