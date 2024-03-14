import React from 'react';

import QueryTask from '@arcgis/core/tasks/QueryTask';
import MapView from '@arcgis/core/views/MapView';
import Query from '@arcgis/core/rest/support/Query';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FindTask from '@arcgis/core/tasks/FindTask';
import FindParameters from '@arcgis/core/tasks/support/FindParameters';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { basics } from '@/config';

const layer = new GraphicsLayer({ id: 'queryHightLayer' });
export const query = (options: any, view: MapView) => {
  const { queryUrl, them, queryStr, layerIds, queryFiled } = options;

  let layers: GraphicsLayer;
  let find = view.map.findLayerById('queryHightLayer');
  if (find) {
    layers = find as any;
  } else {
    view.map.add(layer);
    layers = layer;
  }
  layers.removeAll();

  let findTask = new FindTask({
    url: queryUrl
  });
  var params = new FindParameters({
    layerIds: layerIds.map((item: any) => item.id),
    searchFields: [queryStr],
    searchText: queryFiled,
    returnGeometry: true
  });
  findTask.execute(params).then((results) => {
    if (results) {
      results.results.forEach((item: any) => {
        const { layerName, feature } = item;
        const { attributes, geometry } = feature;
        let type = attributes['shape'] || attributes['Shape'];

        attributes.layerzwmc = layerName;
        attributes.layerName = layerName;

        if (type === 'Polygon') {
          attributes.mapPoint = geometry.centroid;
          feature.symbol = {
            type: 'simple-fill',
            color: [0, 227, 255, 0.1],
            outline: {
              color: [0, 227, 255, 1],
              width: 2
            }
          };
        }
        if (type === 'Polyline') {
          attributes.mapPoint = new Point({
            x: options.x,
            y: options.y,
            spatialReference: new SpatialReference({ wkid: 4490 })
          });
          feature.symbol = {
            type: 'simple-line',
            color: [0, 227, 255, 0.8],
            width: 2
          } as any;
        }

        if (type === 'Point') {
          attributes.mapPoint = new Point({
            x: geometry.longitude,
            y: geometry.latitude,
            spatialReference: new SpatialReference({ wkid: 4490 })
          });
          feature.symbol = {
            type: 'simple-marker',
            color: [0, 227, 255, 0.5],
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [255, 255, 255],
              width: 2
            }
          };
        }

        layers.add(feature);
      });
    }
  });
};

//综合基础河道信息查询
export const queryRiverPolygon = (type: string, view: MapView) => {
  let layers: GraphicsLayer;
  let find = view.map.findLayerById('baseRiverLayer');
  if (find) {
    layers = find as any;
  } else {
    view.map.add(layer);
    layers = new GraphicsLayer({ id: 'baseRiverLayer' });
  }
  layers.removeAll();
  view.map.add(layers);
  let queryTask = new QueryTask({
    url: basics.clickQueryUrl + '/0'
  });
  let query = new Query();
  query.returnGeometry = true;
  query.outFields = ['*'];
  query.where = `management_level = '${type}'`; // Return all cities with a population greater than 1 million

  // When resolved, returns features and graphics that satisfy the query.
  queryTask.execute(query).then(function (results) {
    if (results) {
      const { geometryType } = results;
      const { features, fields } = results;
      features.forEach((item: any) => {
        const { attributes, geometry } = item;
        attributes.layerName = attributes['rv_name'] ?? '';
        if (geometryType === 'polygon') {
          attributes.mapPoint = geometry.centroid;
          attributes.layerName = '河道';
          fields.forEach((f) => {
            attributes[f.alias] = attributes[f.name];
          });
          item.symbol = {
            type: 'simple-fill',
            color: [0, 227, 255, 0.1],
            outline: {
              color: [0, 227, 255, 1],
              width: 2
            }
          };
        }
        layers.add(item);
      });
    }
  });
};
//综合基础湖泊信息查询
// 淀泖区湖泊群-->淀泖湖群
// 浦南区湖泊群-->浦南湖群
// 单独湖泊-->除上面两类之外的都是
export const queryHPPolygon = (type: string, view: MapView) => {
  if (type.includes('淀泖')) {
    type = '淀泖湖群';
  }
  if (type.includes('浦南')) {
    type = '浦南湖群';
  }
  let layers: GraphicsLayer;
  let find = view.map.findLayerById('baseRiverLayer');
  if (find) {
    layers = find as any;
  } else {
    view.map.add(layer);
    layers = new GraphicsLayer({ id: 'baseRiverLayer' });
  }
  layers.removeAll();
  view.map.add(layers);
  let queryTask = new QueryTask({
    url: basics.clickQueryUrl + '/1'
  });
  let query = new Query();
  query.returnGeometry = true;
  query.outFields = ['*'];
  if (type != '单独湖泊') {
    query.where = `rv_sys = '${type}'`; // Return all cities with a population greater than 1 million
  } else {
    query.where = `rv_sys <> '淀泖湖群'  and rv_sys <> '浦南湖群'`; // Return all cities with a population greater than 1 million
  }

  // When resolved, returns features and graphics that satisfy the query.
  queryTask.execute(query).then(function (results) {
    if (results) {
      const { geometryType } = results;
      const { features, fields } = results;

      features.forEach((item: any) => {
        const { attributes, geometry } = item;
        attributes.layerName = attributes['rv_name'] ?? '';
        if (geometryType === 'polygon') {
          attributes.mapPoint = geometry.centroid;
          attributes.layerName = '湖泊';
          fields.forEach((f) => {
            attributes[f.alias] = attributes[f.name];
          });
          item.symbol = {
            type: 'simple-fill',
            color: [0, 227, 255, 0.1],
            outline: {
              color: [0, 227, 255, 1],
              width: 2
            }
          };
        }
        layers.add(item);
      });
    }
  });
};
//根据id查询
export const findByIdTask = async (queryUrl: string, objectid: string) => {
  const queryTask = new QueryTask({
    //在任务中使用的ArcGIS Server REST服务URL（通常是要素服务层或地图服务层）
    url: queryUrl
  });
  console.log(objectid, 'objectid');
  const query = new Query();
  query.returnGeometry = true;
  query.outFields = ['*'];
  query.where = `OBJECTID = ${objectid.toString()}`; //这里是就是查询语句

  const result: any = await queryTask.execute(query);
  return result;
};
