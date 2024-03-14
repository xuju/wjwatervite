import React from 'react';

import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';

import FeatureSet from '@arcgis/core/tasks/support/FeatureSet';
import Geoprocessor from '@arcgis/core/tasks/Geoprocessor';

import { equivalence } from '@/config';
import { message } from 'antd';
import { intersect } from '@turf/turf';
import * as turf from '@turf/turf';
import jsonData from '@/assets/js/wjqjson.json';
import Polygon from '@arcgis/core/geometry/Polygon';
import SceneView from '@arcgis/core/views/SceneView';

const markerSymbol = {
  type: 'simple-marker',
  color: [226, 119, 40],
  width: 20,
  outline: {
    color: [255, 255, 255],
    width: 2
  }
};

const data = [
  { OBJECTID: 1, stnm: '盛泽', drp: 330, x: 120.651502, y: 30.925711 },
  { OBJECTID: 2, stnm: '桃源', drp: 210, x: 120.500564, y: 30.828365 },
  { OBJECTID: 3, stnm: '松陵内河（西门二站）', drp: 320, x: 120.646745, y: 31.163235 },
  { OBJECTID: 4, stnm: '松陵外河（运河）', drp: 590, x: 120.660837, y: 31.155732 },
  { OBJECTID: 5, stnm: '东太湖', drp: 170, x: 120.593812, y: 31.134543 },
  { OBJECTID: 6, stnm: '开发区', drp: 510, x: 120.552077, y: 31.02549 },
  { OBJECTID: 7, stnm: '横扇', drp: 300, x: 120.552077, y: 31.02549 },
  { OBJECTID: 8, stnm: '南大港闸站', drp: 540, x: 120.670944, y: 31.106012 }
];

let slsymbol = {
  type: 'simple-line', // autocasts as new SimpleLineSymbol()
  color: 'red',
  width: '3px',
  style: 'short-dot'
};

let symbol = {
  type: 'simple-fill', // autocasts as new SimpleFillSymbol()
  color: [51, 51, 204, 0.9],
  style: 'solid',
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: 'white',
    width: 0
  }
};
export const requestLine = async (view: MapView | SceneView, type: string, data: any[]) => {
  const tem = data.filter((item) => item.x && item.y);
  message.loading({ content: '加载中,请稍后', duration: 0 });
  let url = '';
  let output = '';
  if (type === '等值线') {
    url = equivalence.line;
    output = 'Contour_Idw_YL_1';
  } else {
    url = equivalence.polygon;
    output = 'output';
  }
  let gp = new Geoprocessor({ url: url });
  let features = [] as Graphic[];

  tem.forEach((item) => {
    let point = new Point({ x: item.x, y: item.y, spatialReference: view.spatialReference });
    var graphic1 = new Graphic({
      geometry: point,
      attributes: {
        ...item,
        drp: item.drp * 100
      }
      // symbol: markerSymbol
    });
    features.push(graphic1);
  });

  let featureset = new FeatureSet();
  featureset.features = features;

  let para = {
    YL_point: featureset
  };

  return new Promise(async (resolve, reject) => {
    const result: any = await gp.submitJob(para);
    const { jobId, status } = result;
    const jobInfo = await gp.waitForJobCompletion(jobId, { interval: 3000 });
    const response = await gp.getResultData(jobInfo.jobId, output);
    let layer = response.value.features;
    if (layer) {
      layer.forEach((item: any) => {
        const attributes = item.attributes;
        const { gridcode } = attributes;
        if (type === '等值线') {
          item.symbol = slsymbol;
        } else if (type === '等值面') {
          if (gridcode > 0 && gridcode <= 100) {
            symbol.color = [255, 246, 5, 0.7];
          } else if (gridcode > 100 && gridcode <= 200) {
            symbol.color = [255, 200, 9, 0.7];
          } else if (gridcode > 200 && gridcode <= 300) {
            symbol.color = [245, 147, 0, 0.7];
          } else if (gridcode > 300 && gridcode <= 400) {
            symbol.color = [245, 98, 0, 0.7];
          } else if (gridcode > 500 && gridcode <= 600) {
            symbol.color = [245, 49, 0, 0.7];
          } else {
            symbol.color = [245, 0, 0, 0.7];
          }
          item.symbol = symbol;
        }
      });
      resolve(layer);
      message.destroy();
    }
  });
};
export const clipPolygon = (arr: any) => {
  const result: Graphic[] = [];
  arr.forEach((item: any) => {
    const rings = item.geometry.rings;
    var poly1 = turf.polygon(jsonData.features[0].geometry.coordinates);

    var poly2 = turf.polygon(rings);

    let intersection = intersect(poly1, poly2);
    if (intersection) {
      const polygon = new Polygon({
        hasZ: true,
        hasM: true,
        rings: intersection.geometry.coordinates as any
      });
      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: item.symbol
      });
      result.push(polygonGraphic);
    }
  });
  return result;
};
export const clipPaths = (arr: any) => {
  const result: Graphic[] = [];
  arr.forEach((item: any) => {
    const rings = item.geometry.paths;

    var line = turf.lineString(rings);

    //     var poly1 = turf.polygon(jsonData.features[0].geometry.coordinates);

    //     var poly2 = turf.lineToPolygon(rings);
    // console.log(rings,'line');

    // let intersection = intersect(poly1, poly2);
    // if (intersection) {
    //   const polygon = new Polygon({
    //     hasZ: true,
    //     hasM: true,
    //     rings: intersection.geometry.coordinates as any
    //   });
    //   const polygonGraphic = new Graphic({
    //     geometry: polygon,
    //     symbol: item.symbol
    //   });
    //   result.push(polygonGraphic);
    // }
  });
  return result;
};

export const generateLine = (arr: any[], view: MapView) => {};
