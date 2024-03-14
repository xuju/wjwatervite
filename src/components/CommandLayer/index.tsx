import { Checkbox, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import jwdwimg from './images/抢险队伍.png';
import jywzimg from './images/抢险物资.png';
import chbzimg from './images/泵站.png';
import rhpwkimg from './images/入河排污口.png';
import qxdwimg from './images/区级抢险队伍.png';
import zbqkimg from './images/筑坝情况.png';
import hlfximg from './images/筑坝情况.png';
import './index.less';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { commandApi, projectID } from '@/config';
import L from 'leaflet';
import catchError from '@/utils';

import ReactDOM from 'react-dom';
import PopupBox from '../PopupBox';
import { legendList } from '@/pages/Command/WaterDisaster/fun';

const layerArr = [
  { label: '抢险队伍', value: 'jydw', img: jwdwimg },
  { label: '抢险物资', value: 'jywz', img: jywzimg },
  { label: '城市泵站', value: 'csbz', img: chbzimg },
  { label: '入河排污口', value: 'rhpwk', img: rhpwkimg },
  { label: '区级抢险队伍', value: 'qxjjydw', img: qxdwimg },
  { label: '筑坝情况', value: 'zhuba', img: zbqkimg },
  { label: '洪涝风险点位分布', value: 'honglao', img: hlfximg },
  { label: '危化品企业', value: 'whpqy', img: hlfximg }
];
interface Props {
  map: L.Map;
  xqClick: Function;
}
export default function CommandLayer(props: Props) {
  const { map, xqClick } = props;
  const [selectLayer, setSelectLayer] = useState(['jydw']);
  const { data, loading } = useRequest(() =>
    service.post(commandApi.getLayer, { xmid: projectID, mapname: '水灾害防御作战' })
  );

  const { data: result } = useRequest(
    () => service.post(commandApi.getPointType, { types: selectLayer }),
    { refreshDeps: [selectLayer] }
  );
  const { run: getDetailRun } = useRequest((params) => service.post(commandApi.getDetail, params), {
    manual: true
  });


  const [layerGroup] = useState(L.featureGroup());

  const onChange = (checkedValues: any) => {
    const dom = document.getElementsByClassName('command-popup')[0];
    dom && dom.remove();
    setSelectLayer(checkedValues);
  };
  const addLayer = async (datas: CommandPoint[]) => {
    if (!datas) return false;

    datas.forEach((item) => {
      const { x, y, type } = item;

      if (x && y) {
        let icon = L.icon({ iconUrl: item.icon, iconSize: [26, 26], iconAnchor: [13, 30] });
        let marker = (L as any).marker([y, x], { icon: icon, data: item });
        layerGroup.addLayer(marker);
      }
    });
    layerGroup.addTo(map);
    layerGroup.off('click');
    layerGroup.on('click', async (e: any) => {
      const { latlng, layer } = e;
      const data = layer.options.data;
      const { x, y, type, id } = layer.options.data;

      if (type === 'xqxx') {
        xqClick(data)
        // const result = await getxqRun(`?fr_id=${id}`);
        // console.log(result, 'result');

      } else {
        const result = await getDetailRun({ type, id });
        let res = result.data.data[type];
        const resData = res.data[0];
        const resColums = res.col;

        const div = document.createElement('div');

        if (resData) {
          let datas = {
            data: resData,
            colums: resColums,
            type: legendList.find((f) => f.type === type)?.title
          };

          ReactDOM.render(<PopupBox data={datas} />, div);
          var popup = L.popup({ minWidth: 318, maxHeight: 220, className: 'command-popup' })
            .setLatLng(latlng)
            .setContent(div)
            .openOn(map);
        }
      }

    });
  };
  useEffect(() => {
    if (result && data) {
      layerGroup.clearLayers();

      if (result && result.data.code == 200) {
        let datas = result.data.data;
        let layerData = data?.data.data;

        let arr: any[] = [];
        Object.entries(datas).forEach(([key, value]) => {
          const findIcon = layerData.find((f: any) => f.layerywmc === key);

          (value as any).forEach((item: any) => {
            if (findIcon && findIcon.icon) {
              item.icon = findIcon.icon;
            }
            item.type = key;
            arr.push(item);
          });
        });

        addLayer(arr);
      }
    }
  }, [result, data]);
  return (
    <div className="command-layer">
      <Spin spinning={loading}>
        <Checkbox.Group defaultValue={selectLayer} onChange={onChange}>
          {data?.data.data &&
            data?.data.data.map((item: LayerType) => {
              return (
                <Checkbox value={item.layerywmc} key={item.id}>
                  <div className="check-right-wrap">
                    <img src={item.icon} alt="" width={14} height={14} />
                    {item.layerzwmc}
                  </div>
                </Checkbox>
              );
            })}
        </Checkbox.Group>
      </Spin>
    </div>
  );
}
