import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { datas } from './data';
import Mapbox from '@/components/MapBox';
import Circle from '@arcgis/core/geometry/Circle';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
export default function Test() {
  const [view, setView] = useState<MapView>();
  const [dataP, setDataP] = useState(null);
  const graphicLayer = useRef(new GraphicsLayer());
  useEffect(() => {
    let features = [
      {
        geometry: {
          type: 'point',
          x: 120.5328,
          y: 30.873821
        },
        attributes: {
          ObjectID: 1,
          them: '视频监控',
          NAME: '盛泽水葫芦自动打捞点（乌金浜）',
          id: '121'
        }
      },
      {
        geometry: {
          type: 'point',
          x: 120.5328,
          y: 30.873821
        },
        attributes: {
          ObjectID: 2,
          them: '视频监控',
          NAME: '七都水葫芦自动打捞点（横古塘）',
          id: '122'
        }
      }
    ];
    let flayer = new FeatureLayer({
      id: 'tflayer',
      source: features,
      objectIdField: 'ObjectID'
    });
    if (view) {
      view.map.add(graphicLayer.current);
      view.map.add(flayer);
      view.on('click', (event) => {
        setDataP(event.mapPoint);
        const dataP = event.mapPoint;
        let flayer = view?.map.findLayerById('tflayer') as FeatureLayer;
        let query = flayer.createQuery();
        query.geometry = {
          type: 'point',
          longitude: dataP.x,
          latitude: dataP.y
        };
        query.distance = 50;
        query.unit = 'kilometers';
        query.spatialRelationship = 'intersects';
        flayer
          .queryFeatures(query)
          .then((results) => {
            console.log(results.features);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }, [view]);

  useEffect(() => {
    if (dataP && view) {
      // const circleGeometry = new Circle({
      //   center: [dataP.x, dataP.y],
      //   geodesic: true,
      //   numberOfPoints: 100,
      //   radius: 100,
      //   radiusUnit: 'kilometers'
      // });
      // view.graphics.add(
      //   new Graphic({
      //     geometry: circleGeometry,
      //     symbol: {
      //       type: 'simple-fill',
      //       style: 'none',
      //       outline: {
      //         width: 3,
      //         color: 'red'
      //       }
      //     }
      //   })
      // );
      // console.log(view, 'view');
      // const bufferGraphic = new Graphic({
      //   symbol: {
      //     type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      //     color: [173, 216, 230, 0.2],
      //     outline: {
      //       // autocasts as new SimpleLineSymbol()
      //       color: [255, 255, 255],
      //       width: 1
      //     }
      //   }
      // });
      // bufferGraphic.geometry = dataP;
      // view.graphics.add(bufferGraphic);
      if (view && dataP) {
        graphicLayer.current.removeAll();
        const center = new Point({
          x: dataP.x,
          y: dataP.y
        });
        var line = new Circle({
          center: center,
          radius: 50,
          spatialReference: view.spatialReference,
          radiusUnit: 'kilometers'
        });
        var lineSymbol = {
          type: 'simple-fill',
          color: [255, 255, 255, 0.2],
          style: 'solid',
          outline: {
            color: 'red',
            width: 1
          }
        };
        var inputPolygon = new Graphic({
          geometry: line,
          symbol: lineSymbol
        });
        graphicLayer.current.add(inputPolygon);
      }
    }
  }, [dataP, view]);
  // useEffect(() => {
  //   if (view) {
  //     const center = new Point({
  //       x: 120.5328,
  //       y: 30.873821
  //     });
  //     var line = new Circle({
  //       center: center,
  //       radius: 1000,
  //       spatialReference: view.spatialReference
  //     });
  //     var lineSymbol = {
  //       type: 'simple-fill',
  //       color: [255, 255, 255, 0.2],
  //       style: 'solid',
  //       outline: {
  //         color: 'red',
  //         width: 1
  //       }
  //     };
  //     var inputPolygon = new Graphic({
  //       geometry: line,
  //       symbol: lineSymbol
  //     });
  //     graphicLayer.current.add(inputPolygon);
  //   }
  // }, [view]);

  //   return <div id="viewDiv" style={{ width: '100%', height: '100%' }}></div>;
  return <Mapbox getView={setView} />;
}
