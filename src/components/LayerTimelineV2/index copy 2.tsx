import service from '@/axios';
import { ArcGISOptions, getLayers } from '@/config';
import { usePageContext } from '@/store';
import { useRequest } from 'ahooks';
import { Cascader, message, Timeline } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import TileLayer from '@arcgis/core/layers/TileLayer';

import './index.less';
import _ from 'lodash';
import { useLayerContext } from '@/store/layer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import { authKey } from '@/utils/encrypy';
import { mapProxy } from '@/utils/mapProxy';

export default function LayerTimelineV2() {
  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers), {
    formatResult: (res) => res.data.data.slice(3, res.data.data.length)
  });

  const { dispatch } = useLayerContext();
  const { state } = usePageContext();
  const data = useMemo(() => {
    let obj: any[] = [];

    if (LayerData) {
      LayerData.forEach((item: any) => {
        item.title = item.title.replace(item.year + '年', '');
        const temp = item.year.split('-');
        if (temp.length === 1) {
          item.years = temp[0];
        }
        if (temp.length === 2) {
          item.years = Number(temp[0]);
          item.month = Number(temp[1]);
        }
      });

      let groupTitle = _.groupBy(LayerData, 'title');

      Object.keys(groupTitle).forEach((item) => {
        let arr = groupTitle[item];
        if (arr && arr.length) {
          let temp: any = {
            value: item,
            label: item,
            children: []
          };

          arr.forEach((item) => {
            const { year, id } = item;
            const yearArr = year.split('-');
            let o: any = {
              value: '',
              label: '',
              children: []
            };

            if (yearArr && yearArr.length) {
              if (yearArr.length === 1) {
                o.value = id;
                o.label = Number(yearArr[0]);
              }
              if (yearArr.length === 2) {
                o.value = id;
                o.label = Number(yearArr[0]);
                o.children.push({
                  value: id,
                  label: yearArr[1]
                });
              }
            }

            temp.children.push(o);
          });

          obj.push(temp);
        }
      });
    }
    console.log(obj, 'obj');

    obj.forEach((item) => {
      const { children } = item;
      if (children && children.length) {
        children.forEach((item: any) => {
          const filter = children.filter((f: any) => f.label === item.label);
        });
        children.sort((a: any, b: any) => b.label - a.label);
      }
    });

    return obj;
  }, [LayerData]);

  const onChange = (value: any[]) => {
    if (value.length <= 0) return;
    let length = value.length - 1;
    const last = value[length];

    if (state && state.view && data) {
      const { view } = state;
      const find = LayerData.find((f: any) => f.id === last);
      if (find) {
        dispatch({ type: 'clearLayer', data: { currentLayer: '' } });
        const findBaseMap = view.map.findLayerById('baseMaps');
        if (findBaseMap) {
          view.map.remove(findBaseMap);
        }
        const { title, testurl, onlineurl, name } = find;

        const url = window.isTest ? testurl : onlineurl;

        if (title === '北斗') {
          mapProxy.bd();
          const wmsLayer = new WMSLayer({
            url: url,
            id: 'baseMaps',
            sublayers: [{ name }],
            customLayerParameters: 'GetMap',
            customParameters: { authKey: authKey() },
            spatialReference: view.spatialReference,
            version: '1.3.0'
          });
          view.map.add(wmsLayer, -1);
        }
        if (title === '资规影像图' || title === '其他') {
          const baseLayer = new TileLayer({
            url: url,
            id: 'baseMaps'
          });
          view.map.add(baseLayer, -1);
        }
      } else {
        message.warning('根据id未找到数据');
      }
    }
  };

  return (
    <div className="LayerTimelineV2">
      <Cascader
        options={data}
        onChange={onChange}
        popupClassName="yx-drow"
        placeholder="请选择历年影像"
      />
    </div>
  );
}
