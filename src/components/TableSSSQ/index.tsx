import service from '@/axios';
import groupBy from '@/utils/groupBy';
import { useRequest } from 'ahooks';
import { Button, Col, DatePicker, Form, Input, message, Radio, Row, Table, Tabs } from 'antd';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { usePageContext } from '@/store';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';
import { generateUUID, popupRender } from '@/utils';
import { useLayerContext } from '@/store/layer';
import { useGetLastLayer, useView } from '@/utils/hooks';
import moment from 'moment';
import DateFormat from '@/utils/dateFormat';
import './index.less';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const tabList = [
  {
    title: '超警站点',
    key: 'cjj',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'zm', key: 'zm', width: 90 },
      { title: '水位', dataIndex: 'sw', key: 'sw' },
      {
        title: '警戒/汛限',
        dataIndex: 'jj',
        key: 'jj',
        width: 80,
        render: (val: any) => {
          if (val == 0) {
            return '';
          } else {
            return val;
          }
        }
      },
      { title: '超警', dataIndex: 'cjj', key: 'cjj' },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '区镇街道',
    key: 'zz',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh' },
      { title: '站名', dataIndex: 'zm', key: 'zm' },
      {
        title: '圩内水位',
        dataIndex: 'wnsw',
        key: 'wnsw',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      },
      {
        title: '圩外水位',
        dataIndex: 'wwsw',
        key: 'wwsw',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      },
      {
        title: '圩内警戒',
        dataIndex: 'wrz',
        key: 'wrz',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      },
      {
        title: '圩外警戒',
        dataIndex: 'wrz',
        key: 'wrz',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      },

      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '代表站点',
    key: 'hd',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'zm', key: 'zm', width: 120 },

      {
        title: '警戒',
        dataIndex: 'jj',
        key: 'jj',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      },
      {
        title: '水位',
        dataIndex: 'down',
        key: 'down',
        render: (val: any, r: any) =>
          Number(val) != 0 && (
            <span style={{ color: r.jj && r.jj != '0' && val > r.jj ? '#ff0000' : '#fff' }}>
              {val > 0 ? `${val}` : ''}
            </span>
          )
      },
      {
        title: '保证水位',
        dataIndex: 'grz',
        key: 'grz',
        render: (text: string) => <span>{Number(text) === 0 ? '' : text}</span>
      }
    ]
  }
];

export const addPopupPoint = (data: any[]) => {
  return data.map((item) => {
    let { x, y, roworder, sqtype, icon, wrz } = item;

    let point = new Point({
      x: Number(x),
      y: Number(y),
      spatialReference: new SpatialReference({ wkid: 4490 })
    });
    item.point = point;
    if (roworder == 0 && wrz != 0) {
      if (sqtype == 1) {
        icon = icon.replace('实时水情.png', '水闸超警_1.png');
      } else {
        icon = icon.replace('实时水情.png', '河道超警_1.png');
      }
    } else {
      if (sqtype == 1) {
        icon = icon.replace('实时水情.png', '水闸_1.png');
      } else {
        icon = icon.replace('实时水情.png', '实时水情_1.png');
      }
    }
    let symbol = new PictureMarkerSymbol({
      url: icon,
      width: 18,
      height: 18,
      xoffset: 2,
      yoffset: -2
    });
    let pointGraphic = new Graphic({
      geometry: point,
      symbol: symbol,
      attributes: item
    });

    return pointGraphic;
  });
};
const defaultOptions = {
  beginTime: '2021-09-26T13:16:19.203Z',
  endTime: '2021-09-26T13:16:19.203Z'
};
const initParams = { name: '', pageIndex: 1, pageSize: 10, bigtype: 0, id: '' };
const graphicLayer = new GraphicsLayer({ id: 'sssq' });
const TableSSSQ = () => {
  // const lastLayer = useGetLastLayer();
  const { state: layerSatte } = useLayerContext();
  const [data, setData] = useState<any[]>([]);
  const { state, dispatch } = usePageContext();
  const [smallType, setSmallType] = useState<string>(state.selectTabs);
  const [ovalue, setOvalue] = useState<string>('group');
  const view = useView();

  const [params, setParams] = useState({ ...initParams });
  const popData = useRef<any[]>([]);
  const { run, loading } = useRequest((url, param) => service.post(url, param), { manual: true });
  const [form] = Form.useForm();

  const currentLayer = useMemo(() => {
    if (layerSatte && layerSatte.current) {
      return layerSatte.current;
    }
  }, [layerSatte]);

  useEffect(() => {
    if (smallType && params) {
      let queryparam = {
        ...params,
        bigtype: 0,
        smallType: smallType
      };

      currentLayer &&
        currentLayer.url1 &&
        run(currentLayer.url1, queryparam)
          .then((res) => {
            let listdata = res.data.data.listdata.listdata;

            //区镇街道，筛选出超警的数据
            if (smallType === 'cjj') {
              listdata = listdata.filter((item: any) => item.roworder == 0 && item.wrz != 0);
            }

            const opconfig = JSON.parse(currentLayer.opconfig);
            popData.current = listdata;

            //映射点击后发送请求参数和请求地址
            listdata.forEach((item: any) => {
              item.them = '实时水情';
              item.url = currentLayer.url;
              item.modalVisible = opconfig.modalVisible;
              item.OBJECTID = item.id;
              item.type = item.sqtype;
              item.icon = currentLayer.icon;
            });
            if (view) {
              if (smallType === 'hd') {
                popupRender(listdata, view);
              }
              console.log(listdata, 'listdatasss');
              let graphic = view && addPopupPoint(listdata);

              graphicLayer.addMany(graphic);

              view.map.add(graphicLayer);
            }

            let tData: any[] = [];
            if (ovalue === 'group') {
              if (smallType === 'zz') {
                let sorted = groupBy(listdata, 'nodename');

                sorted.forEach((item: any, i) => {
                  tData.push({
                    x: '',
                    y: '',
                    xh: i + 1,
                    zm: `${item[0].nodename}(${item.length})`,
                    wnsw: '',
                    wwsw: '',
                    jj: '',
                    cjj: '',
                    key: generateUUID(),
                    children: item.map((it: any, y: any) => {
                      return {
                        ...it,
                        x: it.x,
                        y: it.y,
                        xh: `${y + 1}`,
                        zm: it.stnm,
                        wnsw: it.down,
                        wwsw: it.up,
                        jj: it.wrz,
                        cjj: it.full,
                        key: generateUUID()
                      };
                    })
                  });
                });
              }

              if (smallType === 'cjj') {
                let sorted = groupBy(listdata, 'nodename');

                sorted.forEach((item: any, i) => {
                  tData.push({
                    x: '',
                    y: '',
                    xh: i + 1,
                    zm: `${item[0].nodename}(${item.length})`,
                    sw: '',
                    jj: '',
                    cj: '',
                    cjj: '',
                    key: generateUUID(),
                    children: item.map((it: any, y: any) => {
                      return {
                        ...it,
                        x: it.x,
                        y: it.y,
                        xh: `${y + 1}`,
                        zm: it.stnm,
                        sw: it.down,
                        jj: it.wrz,
                        cj: it.full,
                        cjj: it.full,
                        key: generateUUID()
                      };
                    })
                  });
                });
              }
              if (smallType === 'hd') {
                let sorted = groupBy(listdata, 'nodename');

                sorted.forEach((item: any, i) => {
                  tData.push({
                    x: '',
                    y: '',
                    xh: i + 1,
                    zm: `${item[0].nodename}(${item.length})`,
                    sw: '',
                    jj: '',
                    cjj: '',
                    key: generateUUID(),
                    children: item.map((it: any, y: any) => {
                      return {
                        x: it.x,
                        y: it.y,
                        xh: `${y + 1}`,
                        zm: it.stnm,
                        sw: it.down,
                        jj: it.wrz,
                        cjj: it.full,
                        grz: it.grz,
                        down: it.down,
                        key: generateUUID()
                      };
                    })
                  });
                });
              }
              console.log(smallType, tData, 'tData');
              setData(tData);
            }
            if (ovalue === 'ungroup') {
              if (smallType === 'zz') {
                listdata.forEach((it: any, i: number) => {
                  tData.push({
                    x: it.x,
                    y: it.y,
                    xh: `${i + 1}`,
                    zm: it.stnm,
                    wnsw: it.down,
                    wwsw: it.up,
                    jj: it.wrz,
                    cjj: it.full,
                    key: generateUUID()
                  });
                });
              }
              if (smallType === 'cjj') {
                listdata.forEach((it: any, i: number) => {
                  tData.push({
                    x: it.x,
                    y: it.y,
                    xh: `${i + 1}`,
                    zm: it.stnm,
                    sw: it.down,
                    jj: it.wrz,
                    cjj: it.full,
                    key: generateUUID()
                  });
                });
              }
              if (smallType === 'hd') {
                listdata.forEach((it: any, i: number) => {
                  tData.push({
                    x: it.x,
                    y: it.y,
                    xh: `${i + 1}`,
                    zm: it.stnm,
                    sw: it.down,
                    jj: it.wrz,
                    cjj: it.full,
                    grz: it.grz,
                    key: generateUUID()
                  });
                });
              }

              setData(tData);
            }
          })
          .catch((err) => {
            message.error(err);
          });
    }

    return () => {};
  }, [params, smallType, ovalue, currentLayer]);

  useEffect(() => {
    setSmallType(state.selectTabs);
  }, [state]);

  function callback(key: any) {
    graphicLayer && graphicLayer.removeAll();

    let dom = document.getElementsByClassName('popupRender-wrap');
    let arr = Array.from(dom);
    arr.forEach((item) => item && item.remove());
    // setSmallType(key);
    dispatch({ type: 'setTbas', data: { selectTabs: key } });
  }

  const rowClassName = (r: any, indx: number) => {
    let className = '';

    if (indx % 2 === 1) {
      className += 'bg-row ';
    }
    if (r.roworder == 0 && r.wrz != 0) {
      className += ' danger-row';
    }
    return className;
  };
  const onFinish = (values: any) => {
    if (!values.sj) {
      values.sj = [
        moment(DateFormat.getYesterday8(), 'YYYY-MM-DD HH:mm'),
        moment(DateFormat.getDay8(), 'YYYY-MM-DD HH:mm')
      ];
    }
    let o = {
      beginTime: values.sj[0].format('YYYY-MM-DD HH:mm:ss'),
      endTime: values.sj[1].format('YYYY-MM-DD HH:mm:ss'),
      name: values.name,
      pageIndex: 0,
      pageSize: 10,
      bigtype: 0
    } as any;
    setParams(o);
  };
  return (
    <>
      <div className="searchpanel">
        <Form
          name="search_form"
          onFinish={onFinish}
          form={form}
          initialValues={{
            sj: [
              moment(DateFormat.getYesterday8(), 'YYYY-MM-DD HH:mm'),
              moment(DateFormat.getDay8(), 'YYYY-MM-DD HH:mm')
            ],
            name: ''
          }}
        >
          {/* <Row>
            <Form.Item name="sj" label="时间">
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
          </Row> */}

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
      <section className="tablesssq">
        <div className="dw">单位：米</div>
        <Tabs defaultActiveKey={smallType} onChange={callback}>
          {tabList.map((item) => {
            return (
              <TabPane tab={item.title} key={item.key}>
                <div className="cunstomtable">
                  <Table
                    loading={loading}
                    size="small"
                    rowClassName={rowClassName}
                    columns={item.dataC}
                    dataSource={data}
                    pagination={false}
                    rowKey="key"
                    scroll={{ y: 300 }}
                    onRow={(record: any) => {
                      return {
                        onClick: (event) => {
                          dispatch({ type: 'point', data: record });
                        }
                      };
                    }}
                  />
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </section>
    </>
  );
};
export default memo(TableSSSQ);
