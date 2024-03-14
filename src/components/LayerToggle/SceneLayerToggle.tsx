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
  view: SceneView | MapView;
  style?: CSSProperties;
  layerList?: ILayer[];
}
const mapurl = [
  { name: '午夜蓝', img: wylImg },
  { name: '电子地图', img: dzImg },
  { name: '影像地图', img: yxImg }
];
export default function SceneLayerToggle(props: Props) {
  const { view, style = {}, layerList = [] } = props;

  const LayerData = useMemo(() => {
    return layerList
      .map((item) => {
        const name = item.title;
        const findimg = mapurl.find((f) => f.name === name);
        if (findimg) {
          return {
            name,
            img: findimg.img
          };
        }
      })
      .filter((f) => f);
  }, []);
  const changeBaseMap = (layer: ILayer) => {
    const baseLayers = view.map.basemap.baseLayers;
    baseLayers.forEach((item) => {
      if (item.id === layer.title) {
        item.visible = true;
      } else {
        item.visible = false;
      }
    });
  };

  const onclick = (index: number) => {
    let dom = document.getElementsByClassName('layer-toggle')[0];
    let children = Array.from(dom.children);
    const name = layerList[index];
    changeBaseMap(name);

    children.forEach((item) => {
      item.classList.remove('layer-0', 'layer-1', 'layer-2');
      if (index === 0) {
        document.getElementsByClassName('layer-item')[0]?.classList.add('layer-0');
        document.getElementsByClassName('layer-item')[1]?.classList.add('layer-1');
        document.getElementsByClassName('layer-item')[2]?.classList.add('layer-2');
      } else if (index === 1) {
        document.getElementsByClassName('layer-item')[0]?.classList.add('layer-1');
        document.getElementsByClassName('layer-item')[1]?.classList.add('layer-0');
        document.getElementsByClassName('layer-item')[2]?.classList.add('layer-2');
      } else if (index === 2) {
        document.getElementsByClassName('layer-item')[0]?.classList.add('layer-1');
        document.getElementsByClassName('layer-item')[1]?.classList.add('layer-2');
        document.getElementsByClassName('layer-item')[2]?.classList.add('layer-0');
      }
    });
  };
  useEffect(() => {}, [LayerData]);
  return (
    <div className="layer-toggle" style={{ ...style }}>
      {LayerData.map((item: any, index) => {
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
