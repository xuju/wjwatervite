import service from '@/axios';
import { ArcGISOptions, getLayers } from '@/config';
import { usePageContext } from '@/store';
import { useRequest } from 'ahooks';
import { Cascader, message, Timeline } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import TileLayer from '@arcgis/core/layers/TileLayer';
import * as urlUtils from '@arcgis/core/core/urlUtils';
import './index.less';
import _ from 'lodash';
import { useLayerContext } from '@/store/layer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import { authKey } from '@/utils/encrypy';
import { mapProxy } from '@/utils/mapProxy';

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export default function LayerTimelineV2() {
  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers), {
    formatResult: (res) => res.data.data.slice(3, res.data.data.length)
  });

  const { dispatch } = useLayerContext();
  const { state } = usePageContext();
  const data = useMemo(() => {
    let temp: any = [];
    //资规年份

    let zgyear: any = [];
    //北斗年份
    let bdYear: any[] = [];
    //北斗月份
    let bdMonth: any[] = [];
    //其他年份
    const otherYear: any[] = [];
    //其他月份
    const otherMonth: any[] = [];
    if (LayerData) {
      LayerData.forEach((item: any) => {
        item.title = item.title.replace(item.year + '年', '');
      });

      let groupTitle = _.groupBy(LayerData, 'title');
      let groupYear = _.groupBy(LayerData, 'year');
      console.log(groupTitle, 'groupTitle');

      Object.keys(groupYear).forEach((item) => {
        let t = groupYear[item];
        if (t && t.length > 0) {
          const { id, year, title } = t[0];
          if (title === '资规影像图') {
            zgyear.push({
              value: id,
              label: year
            });
          } else if (title === '北斗') {
            const split = item.split('-');
            if (split.length > 1) {
              const find = bdYear.find((f) => {
                if (f && f.label && f.label === split[0]) {
                  return f;
                }
              });
              const findMonth = bdMonth.find((f) => {
                if (f && f.label && f.label === split[1]) {
                  return f;
                }
              });
              if (!findMonth) {
                bdMonth.push({
                  value: id,
                  label: split[1]
                });
              }
              bdMonth.sort((a, b) => a.label - b.label);
              if (!find) {
                bdYear.push({
                  value: id,
                  label: split[0],

                  children: bdMonth
                });
              }
            }
          } else if (title === '其他') {
            const split = item.split('-');
            if (split.length > 1) {
              const find = otherYear.find((f) => {
                if (f && f.label && f.label === split[0]) {
                  return f;
                }
              });
              const findMonth = otherMonth.find((f) => {
                if (f && f.label && f.label === split[1]) {
                  return f;
                }
              });
              if (!findMonth) {
                otherMonth.push({
                  value: id,
                  label: split[1]
                });
              }
              otherMonth.sort((a, b) => a.label - b.label);
              if (!find) {
                otherYear.push({
                  value: id,
                  label: split[0],

                  children: otherMonth
                });
              }
            }
          }
        }
      });

      Object.keys(groupTitle).forEach((item) => {
        if (item === '资规影像图') {
          zgyear.sort((a: any, b: any) => b.label - a.label);

          temp.push({
            value: item,
            label: item,
            children: zgyear
          });
        }
        if (item === '北斗') {
          bdYear.sort((a, b) => b.label - a.label);

          temp.push({
            value: item,
            label: item,
            children: bdYear
          });
        }
        if (item === '其他') {
          otherYear.sort((a, b) => b.label - a.label);

          temp.push({
            value: item,
            label: item,
            children: otherYear
          });
        }
      });
    }

    return temp;
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
          if (find.title === '资规影像图' && find.year == 2022) {
            const baseLayer = new TileLayer({
              url: url,
              id: 'baseMaps',
              // maxScale: 540.6646728537
              maxScale: 70.53107352157943
            });
            view.map.add(baseLayer, -1);
          } else {
            const baseLayer = new TileLayer({
              url: url,
              id: 'baseMaps'
            });
            view.map.add(baseLayer, -1);
          }
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
