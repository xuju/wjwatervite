import MapBox from '@/components/MapBox';
import MapView from '@arcgis/core/views/MapView';
import { Button } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import Draw from '@arcgis/core/views/draw/Draw';
import Polygon from '@arcgis/core/geometry/Polygon';
import './index.less';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Geoprocessor from '@arcgis/core/tasks/Geoprocessor';
import Point from '@arcgis/core/geometry/Point';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import data1 from './data1';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import JobInfo from '@arcgis/core/tasks/support/JobInfo';
const polygonUrl =
  'http://172.16.9.115:6080/arcgis/rest/services/WJWATER/Model_dengzhixian/GPServer/Model_dengzhixian/submitJob';
function mockData() {
  const markerSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  };
  const featureLayer = new GraphicsLayer({ id: 'dengzhixian' });
  const featureSet = new FeatureSet();
  const features: any[] = [];
  data1.features.forEach((item: any) => {
    const point: any = {
      type: 'point',
      x: item.geometry.coordinates[0],
      y: item.geometry.coordinates[1]
    };

    var graphic1 = new Graphic({
      geometry: point,
      attributes: item.properties,
      symbol: markerSymbol
    });
    features.push(graphic1);
  });
  featureSet.features = features;
  featureLayer.addMany(features);

  return {
    featureLayer,
    featureSet
  };
}

const polyline = {
  type: 'polyline', // autocasts as new Polyline()
  paths: [
    [-111.3, 52.68],
    [-98, 49.5],
    [-93.94, 29.89]
  ]
};

export default function Watereconomy() {
  const [view, setView] = useState<MapView>();
  const [graphicsLayer] = useState(new GraphicsLayer());
  const [layerArr, setLayerArr] = useState<FeatureSet>();
  const draw = useMemo(() => {
    if (view) {
      view.map.add(graphicsLayer);
      return new Draw({
        view: view
      });
    }
  }, [view]);

  useEffect(() => {
    if (view) {
      const { featureLayer, featureSet } = mockData();
      setLayerArr(featureSet);

      view.map.add(featureLayer);
    }
  }, [view]);

  const createPolygon = (e: any) => {
    let symbol = {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [51, 51, 204, 0.9],
      style: 'solid',
      outline: {
        // autocasts as new SimpleLineSymbol()
        color: 'white',
        width: 1
      }
    };
    const { vertices } = e;
    if (vertices.length <= 1) {
      return false;
    }

    //清除之前绘制
    graphicsLayer.removeAll();

    // 生成绘制的图形
    var graphic = new Graphic({
      geometry: new Polygon({
        hasZ: false,
        hasM: false,
        rings: vertices,
        spatialReference: view?.spatialReference
      }),
      symbol: symbol
    });
    graphicsLayer.add(graphic);
  };
  const drawPolygon = async () => {
    // if (!draw) return;
    // const action = draw.create('polygon',);
    // action.on("cursor-update", createPolygon);
    // action.on("draw-complete", e => {
    //     const { vertices } = e;

    // });

    var gp = new Geoprocessor({ url: polygonUrl });
    // var para = {
    //     YL_point: layerArr,
    //     Z_value_field: "drp",

    // }
    let para = {
      YL_point: layerArr
    };
    const submitJob = await gp.submitJob(para);
    if (!submitJob) return;
    const jobId = submitJob.jobId;
    const status = submitJob.jobStatus;

    const getResultData = await gp.getResultData(jobId, 'Contour_Idw_YL_1');
  };
  return (
    <div className="Watereconomy">
      <MapBox getView={setView} />
      <div className="right">
        <Button onClick={drawPolygon}>绘制面</Button>
      </div>
    </div>
  );
}
