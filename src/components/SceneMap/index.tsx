import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { getLayers } from '@/config';
import './index.less';
import { useRecoilState } from 'recoil';
import { layerDataAtom, sceneAtom } from '@/store/scene';
import TileLayer from '@arcgis/core/layers/TileLayer';
import { message } from 'antd';
import { getMapToken } from '@/utils';
import Basemap from '@arcgis/core/Basemap';

export default function SceneMap() {
  const domRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useRecoilState(sceneAtom);
  const { data } = useRequest(() => service.get(getLayers.Get3DBaseUrlLayer), {
    formatResult: (res) => res.data.data
  });
  useEffect(() => {
    if (data && data.length) {
      getMapToken()
        .then((res: any) => {
          if (res.code === 200) {
            const token = res.data.token;
            if (token) {
              const baseLayers = data.map((item: any, index: number) => {
                const url = window.isTest ? item.testurl : item.onlineurl;

                return new TileLayer({
                  url: url.replace('{token}', token),
                  id: item.title,
                  visible: item.title === '影像地图',
                  maxScale: 0
                });
              });

              const baseMap = new Basemap({
                baseLayers
              });
              const map = new Map({
                basemap: baseMap
              });
              const view = new SceneView({
                container: domRef.current!,
                map: map,
                constraints: {
                  altitude: {
                    max: 70000
                    // min: 1000
                  }
                }
              });
              view.when(() => {
                setView(view);
              });
              view.ui.remove(view.ui.components);
            }
          } else {
            message.warning(res.message);
          }
        })
        .catch((error: any) => {
          console.log(error, 'error');
        });
    }
  }, [data]);

  return <div className="SceneMap" ref={domRef}></div>;
}
