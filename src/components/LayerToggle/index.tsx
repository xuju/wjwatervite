import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import './index.less';
import dzImg from '@/assets/images/电子map.png';
import wylImg from '@/assets/images/蓝map.png';
import yxImg from '@/assets/images/影响map.png';
import MapView from '@arcgis/core/views/MapView';
import { getLayers } from '@/config';
import { useRequest } from 'ahooks';
import service from '@/axios';
import TileLayer from '@arcgis/core/layers/TileLayer';
import { useLayerContext } from '@/store/layer';
import SceneView from '@arcgis/core/views/SceneView';

interface Props {
  view: MapView | SceneView;
  style?: CSSProperties;
}
const mapurl = [
  { name: '午夜蓝', img: wylImg },
  { name: '电子地图', img: dzImg },
  { name: '影像地图', img: yxImg }
];
export default function LayerToggle(props: Props) {
  const { view, style = {} } = props;
  const { state, dispatch } = useLayerContext();
  const selectLayer = useMemo(() => {
    if (state) {
      return state.currentLayer;
    } else {
      return '';
    }
  }, [state]);

  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers), {
    formatResult: (res) => res.data.data
  });
  const onclick = (index: number) => {
    let dom = document.getElementsByClassName('layer-toggle')[0];
    let children = Array.from(dom.children);
    dispatch({ type: 'setCurrentLayer', data: { currentLayer: mapurl[index].name } });
    // setSelectLayer(mapurl[index].name);
    children.forEach((item) => {
      item.classList.remove('layer-0', 'layer-1', 'layer-2');
      if (index === 0) {
        document.getElementsByClassName('layer-item')[0].classList.add('layer-0');
        document.getElementsByClassName('layer-item')[1].classList.add('layer-1');
        document.getElementsByClassName('layer-item')[2].classList.add('layer-2');
      } else if (index === 1) {
        document.getElementsByClassName('layer-item')[0].classList.add('layer-1');
        document.getElementsByClassName('layer-item')[1].classList.add('layer-0');
        document.getElementsByClassName('layer-item')[2].classList.add('layer-2');
      } else if (index === 2) {
        document.getElementsByClassName('layer-item')[0].classList.add('layer-1');
        document.getElementsByClassName('layer-item')[1].classList.add('layer-2');
        document.getElementsByClassName('layer-item')[2].classList.add('layer-0');
      }
    });
  };
  useEffect(() => {
    if (selectLayer && LayerData) {
      const find = LayerData.find((f: any) => f.title === selectLayer);
      const findBaseMap = view.map.findLayerById('baseMaps');
      view.map.basemap.baseLayers.forEach((layer) => {
        layer.visible = false;
      });

      if (find) {
        const url = (window as any).isTest ? find.testurl : find.onlineurl;
        if (findBaseMap) {
          view.map.remove(findBaseMap);
        }
        const baseLayer = new TileLayer({
          url: url,
          id: 'baseMaps',
          maxScale: 70.53107352157943
        });
        view.map.add(baseLayer, 0);
      }
    }
  }, [selectLayer, LayerData]);
  return (
    <div className="layer-toggle" style={{ ...style }}>
      {mapurl.map((item: any, index) => {
        return (
          <div
            className={[`layer-item`, `layer-${index}`].join(' ')}
            key={index}
            onClick={(e) => onclick(index)}
            style={{ background: `url(${item.img})` }}
          >
            <span className="name">{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}
