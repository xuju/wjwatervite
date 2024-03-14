import service from '@/axios';
import { usePageContext } from '@/store';
import { steamroller, popupRenderOne, totlaChildren } from '@/utils';
import { useGetLastLayer, useView } from '@/utils/hooks';
import useRequest from '@ahooksjs/use-request';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Query from '@arcgis/core/rest/support/Query';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import { Button, Col, Form, Input, Row, Spin, Table, Tabs } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
const { TabPane } = Tabs;

interface PointType {
  x: number;
  y: number;
  id: string;
  name: string;
  them: string;
}

const deleteEmptyChildren = (arr: any[]) => {
  arr.forEach((item: any) => {
    if (item.children) {
      if (item.children.length <= 0) {
        item.children = null;
      } else {
        item.children = deleteEmptyChildren(item.children);
      }
    }
  });
  return arr;
};

const getPointAll = (arr: any[], result: any[] = []) => {
  arr.forEach((item) => {
    const { x, y, id, name } = item;
    if (x && y) {
      result.push({ x: Number(x), y: Number(y), name, id, them: '视频监控' });
    }
    if (item.children) {
      getPointAll(item.children, result);
    }
  });

  return result;
};
const initParams = { name: '', pageIndex: 1, pageSize: 100000, bigtype: 0, id: '' };

export default function TableVideo() {
  const groupLayer = useRef(new GroupLayer({ id: 'watchvideo' }));
  const [param, setParams] = useState({ ...initParams });
  const curritem = useGetLastLayer();
  const view = useView();
  const [total, setTotal] = useState(0);
  const { data } = useRequest(() => service.post(curritem.url1, param), {
    ready: curritem.url1 ? true : false,
    formatResult: (res) => {
      const result = res.data.data.listdata.listdata;
      // const result = data1.listdata.listdata;
      const t = res.data.data.listdata.dataCount;

      setTotal(t);
      const findTownsName = result.find((f: any) => f.name === '吴江区');

      let temp;
      if (findTownsName) {
        temp = findTownsName.children;
      } else {
        temp = result;
      }
      let arr = deleteEmptyChildren(temp);

      return arr;
      return [];
    },
    refreshDeps: [param, curritem]
  });

  const [form] = Form.useForm();
  const { dispatch } = usePageContext();
  useEffect(() => {
    if (view) {
      view.map.add(groupLayer.current);
    }
  }, [view]);

  useEffect(() => {
    if (data && view) {
      if (data && view && curritem) {
        let opconfig = JSON.parse(curritem.opconfig);
        let Iconurl = curritem.icon.replace('.png', '_1.png');

        let symbol = new PictureMarkerSymbol({
          url: Iconurl,
          width: 18,
          height: 18,
          xoffset: 2,
          yoffset: -2
        });
        const point = getPointAll(data);

        point.forEach((item) => {
          popupRenderOne(item, view);
        });
        // setTotal(point.length);
        let features: any[] = point.map((item: any) => {
          const { x, y } = item;
          let obj = new Graphic({
            geometry: new Point({
              x,
              y,
              spatialReference: view.spatialReference
            }),
            attributes: {
              ...item,
              ...curritem,
              modalVisible: opconfig.modalVisible,
              them: curritem.layerzwmc,
              id: item.id,
              ObjectID: item.id
            }
          });
          return obj;
        });
        let featureLayer = new FeatureLayer({
          source: features, // autocast as a Collection of new Graphic()
          objectIdField: 'ObjectID',
          id: 'videoFeatureLayer',
          geometryType: 'point',
          outFields: ['*'],

          fields: [
            {
              name: 'cdid',
              type: 'string',
              alias: '视频id'
            },
            {
              name: 'icon',
              type: 'string',
              alias: '图标'
            },
            {
              name: 'layerzwmc',
              type: 'string',
              alias: '图层名称'
            },
            {
              name: 'opconfig',
              type: 'string',
              alias: '配置'
            },
            {
              name: 'them',
              type: 'string',
              alias: '图层名称'
            },
            {
              name: 'layerzwmc',
              type: 'string',
              alias: '图层名称'
            },
            {
              name: 'url',
              type: 'string',
              alias: '地址'
            },
            {
              name: 'url1',
              type: 'string',
              alias: '地址1'
            },
            {
              name: 'id',
              type: 'string',
              alias: 'id'
            },
            {
              name: 'name',
              type: 'string',
              alias: 'name'
            }
          ],
          renderer: {
            type: 'simple', // autocasts as new SimpleRenderer()
            symbol: symbol
          } as any
        });
        groupLayer.current.add(featureLayer);
      }
    }
  }, [data]);

  const columns = [
    {
      title: '序号',

      dataIndex: 'id',
      width: 100,
      render: (text: string, r: any, index: number) => {
        return index + 1;
      }
    },
    {
      title: '站名',
      dataIndex: 'name',
      render: (text: string, r: any) => {
        const { children } = r;
        if (children) {
          const flat = steamroller(children).filter((f) => f.is_video === '1');
          const filter = flat.filter((f: any) => f.is_online === '1');

          return `${text}(${filter.length}/${flat.length})`;
          // return `${text}(${oneLineTotal}/${total})`;
        } else {
          if (r.is_online === '1') {
            return text;
          } else {
            return <span style={{ color: '#838383' }}>{text}</span>;
          }
        }
      }
    }
  ];

  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name.trim() });
  };

  return (
    <>
      <div className="searchpanel">
        <Form name="search_form" onFinish={onFinish} form={form}>
          <Row>
            <Col span={18}>
              <Form.Item name="name" label="名称">
                <Input style={{ color: '#fff' }} />
              </Form.Item>
            </Col>
            <Col span={1} />
            <Col span={5}>
              <Button htmlType="submit" style={{ right: '0' }}>
                搜索
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="TableVideo">
        <div className="total">总数：{total}</div>
        <div className="cunstomtable">
          <Table
            size="small"
            rowClassName={(r: any, indx: number) => {
              if (indx % 2 === 1) return 'bg-row';
              else return '';
            }}
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey="id"
            scroll={{ y: 400 }}
            onRow={(record: any) => {
              return {
                onClick: () => {
                  const { x, y } = record;
                  if (x && y) {
                    dispatch({ type: 'point', data: record });
                  }
                }
              };
            }}
          />
        </div>
      </div>
    </>
  );
}
