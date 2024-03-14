import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import React, { useEffect, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { datas } from './data';
import Mapbox from '@/components/MapBox';
export default function Test() {
  const [view, setView] = useState<MapView>();
  const [dataP, setDataP] = useState(null);
  useEffect(() => {
    let features = [
      {
        geometry: {
          type: "point",
          x: 120.5328,
          y: 30.873821
        },
        attributes: {
          ObjectID: 1,
          them: "视频监控",
          NAME: "盛泽水葫芦自动打捞点（乌金浜）",
          id: "121"
        }
      },{
        geometry: {
          type: "point",
          x: 120.5328,
          y: 30.873821
        },
        attributes: {
          ObjectID: 2,
          them: "视频监控",
          NAME: "七都水葫芦自动打捞点（横古塘）",
          id: "122"
        }
      }];
    let flayer = new FeatureLayer({
      id:'tflayer',
      source: features,
      objectIdField: "ObjectID"
    });
    if (view) {
      view.map.add(flayer);
      view.on('click', (event)=>{
        setDataP(event.mapPoint);
      });

    }
  }, [view]);

  useEffect(()=>{
    if(dataP){
      let flayer = view?.map.findLayerById("tflayer");
      let query = flayer.createQuery();
      query.geometry ={
        type: 'point', 
        longitude: dataP.x,
        latitude: dataP.y
      };
      query.distance=16;
      query.spatialRelationship='intersects';
      flayer.queryFeatures(query)
        .then((results) => {
          console.log(results.features) ;
        })
        .catch((error) => {
          console.log(error);
        });
    }

  },[dataP]);

  
  //   return <div id="viewDiv" style={{ width: '100%', height: '100%' }}></div>;
  return <Mapbox getView={setView} />;
}
