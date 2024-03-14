import service from '@/axios';
import { getLayers } from '@/config';
import { usePageContext } from '@/store';
import { useRequest } from 'ahooks';
import { Timeline } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import TileLayer from '@arcgis/core/layers/TileLayer';
import './index.less';
import _ from 'lodash';
import { useLayerContext } from '@/store/layer';

const DotCircle = (props: { click: Function }) => {
  const click = () => {
    props.click();
  };
  return <div className="dotcircle" onClick={click}></div>;
};
export default function LayerTimeline() {
  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers), {
    formatResult: (res) => res.data.data.slice(3, res.data.data.length)
  });
  console.log(LayerData, 'LayerData');
  const { dispatch } = useLayerContext();
  const { state } = usePageContext();
  const [select, setSelect] = useState<LayerTime>();
  const onClick = (data: LayerTime) => {
    dispatch({ type: 'clearLayer', data: { currentLayer: '' } });
    setSelect(data);
  };

  useEffect(() => {
    if (state && state.view && select) {
      let { view } = state;
      const url = (window as any).isTest ? select.testurl : select.onlineurl;
      const findBaseMap = view.map.findLayerById('baseMaps');
      if (findBaseMap) {
        view.map.remove(findBaseMap);
      }

      const baseLayer = new TileLayer({
        url: url,
        id: 'baseMaps'
      });
      view.map.add(baseLayer, -1);
    }
  }, [select]);
  const dataList = useMemo(() => {
    if (LayerData) {
      let result = _.sortBy(LayerData, function (item) {
        return item.year; //根据code对数据进行升序排序，如果降序则改为：return -item.code
      });

      return result.reverse();
    }
  }, [LayerData]);

  return (
    <div className="LayerTimeline">
      <Timeline>
        {dataList &&
          dataList.map((item: LayerTime) => {
            return (
              <Timeline.Item
                key={item.id}
                className={[select?.year === item.year ? 'select' : ''].join(' ')}
                dot={<DotCircle click={() => onClick(item)} />}
              >
                <span onClick={() => onClick(item)}>{item.year}</span>
              </Timeline.Item>
            );
          })}
      </Timeline>
    </div>
  );
}
