import { demonLayer, symbolObj } from '@/config';
import { useView } from '@/utils/hooks';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Query from '@arcgis/core/rest/support/Query';
import FindTask from '@arcgis/core/tasks/FindTask';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import FindParameters from '@arcgis/core/tasks/support/FindParameters';
import { Checkbox } from 'antd';
import IdentifyParameters from '@arcgis/core/tasks/support/IdentifyParameters';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import { useUnmount } from 'ahooks';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import DemonPopup from '../Popup';
import Legend from '@arcgis/core/widgets/Legend';
import DemonLegend from '../Legend';
const options = [
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' }
];

export default function LayerControl() {
  const [value, setValue] = useState([options[0].value]);
  const view = useView();
  const [params, setParams] = useState('');
  const [layers] = useState(new GroupLayer({ id: 'yearLayer' }));
  const [hightLayer] = useState(new GraphicsLayer({ id: 'yeatHightLayer' }));
  const clickHandle = useRef<IHandle | null>();
  const [popdata, setPopData] = useState<any[] | null>(null);
  useEffect(() => {
    if (view) {
      view.map.add(layers);
      view.map.add(hightLayer);
      if (clickHandle.current) {
        clickHandle.current.remove();
        clickHandle.current = null;
      }
      clickHandle.current = view.on('click', async (e) => {
        const { mapPoint } = e;
        hightLayer.removeAll();
        const identifyTask = new IdentifyTask({
          url: demonLayer.url
        });
        const params = new IdentifyParameters({
          tolerance: 6,
          layerIds: [1, 2, 3],
          layerOption: 'all',
          width: view.width,
          height: view.height,
          geometry: mapPoint,
          mapExtent: view.extent,
          spatialReference: view.spatialReference,
          returnGeometry: true
        });
        const result = await identifyTask.execute(params);
        const data = result.results;
        let tem: any[] = [];
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const { feature, layerName } = item;

            const { attributes } = feature;
            attributes.mapPoint = mapPoint;
            attributes.layerName = layerName;
            const shape = attributes.SHAPE.toLowerCase();
            const symbol = (symbolObj as any)[shape] ?? '';

            feature.symbol = symbol;
            tem.push(attributes);

            hightLayer.add(item.feature);
          });
        }
        setPopData(tem);
      });
    }
  }, [view]);
  useEffect(() => {
    let arr: string[] = [];
    value.forEach((item, index) => {
      arr.push(`year ='${item}'`);
    });
    let str = arr.join(' or ');
    setParams(str);
  }, [value]);
  useEffect(() => {
    if (view) {
      layers.removeAll();
      if (params) {
        const layer = new MapImageLayer({
          url: demonLayer.url,
          sublayers: [
            {
              id: 1,
              visible: true,
              definitionExpression: params
            },
            {
              id: 2,
              visible: true,
              definitionExpression: params
            },
            {
              id: 3,
              visible: true,
              definitionExpression: params
            }
          ]
        });

        layers.add(layer);
      }
    }
  }, [view, params]);
  useUnmount(() => {
    if (view) {
      view.map.remove(layers);
    }
    if (clickHandle.current) {
      clickHandle.current.remove();
      clickHandle.current = null;
    }
    hightLayer.removeAll();
    let dom = document.getElementById('DemonPopup') as HTMLDivElement;
    dom && dom.remove();
  });
  const onChange = (v: any) => {
    setValue(v);
  };
  return (
    <>
      <div className="LayerControl">
        <div className="title">年份选择</div>
        <Checkbox.Group options={options} value={value} onChange={onChange} />
      </div>
      {popdata && popdata.length > 0 && <DemonPopup data={popdata} />}
      <DemonLegend />
    </>
  );
}
