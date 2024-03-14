import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Input, Row, Table, Tooltip } from 'antd';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { usePageContext } from '@/store';
import './index.less';
import moment from 'moment';
import { setPriority } from 'os';
import { returnClickQuery, tableClickQuery } from '@/utils';
import { useGetLastLayer, useSelectLayerTable, useView } from '@/utils/hooks';

import PopupModal from '../PopupModal';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { query } from '@/utils/queryTask';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
//控制是否显示分页
const showPagination = [
  '河道',
  '泵站',
  '圩区',
  '水闸',
  '污水管网',
  '雨水管网',
  '市政污水管网',
  '已整治黑臭水体',
  '农污设施',
  '取水总量监测',
  '三调水域情况',
  '河道断面'
];

const searchNames = {
  市政雨水管网: '位置',
  市政污水管网: '管段编号',
  污水厂排口: '入河排口',
  提质增效达标区: '编码'
};

const showPolygon = [
  { name: '圩区', queryStr: 'pold_name', filed: 'name' },
  { name: '已整治黑臭水体', queryStr: 'name', filed: 'name' },
  { name: '地块内部雨水管网', queryStr: 'objectid', filed: 'objectid' },
  { name: '地块内部污水管网', queryStr: 'objectid', filed: 'objectid' },
  { name: '市政雨水管网', queryStr: 'objectid', filed: 'objectid' },
  { name: '市政污水管网', queryStr: 'objectid', filed: 'objectid' }
];
const initParams = { name: '', pageIndex: 1, pageSize: 10, bigtype: 0, id: '' };
const TableCom = () => {
  const [params, setParams] = useState({ ...initParams });
  const view = useView();
  // const curritem = useGetLastLayer();
  const curritem = useSelectLayerTable();
  const [data, setData] = useState<any[]>([]);
  const [tabColum, setTabColum] = useState<any[]>([]);
  const { dispatch, state } = usePageContext();
  const [total, setTotal] = useState(0);
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });
  const [form] = Form.useForm();
  const geoType = useMemo(() => {
    if (curritem) {
      return {
        queryUrl: curritem.url,
        geoType: JSON.parse(curritem.opconfig)?.lyrtype ?? '',
        layerIds: JSON.parse(curritem.layerid) ?? []
      };
    } else {
      return {};
    }
  }, [curritem]);
  const searchName = useMemo(() => {
    if (curritem) {
      let name = searchNames[curritem.layerzwmc];
      if (name) {
        return name;
      } else {
        return '名称';
      }
    }
  }, [curritem]);
  useEffect(() => {
    const flag = showPagination.includes(curritem.layerzwmc);

    if (flag) params.pageSize = 10;
    else params.pageSize = 20;
    let queryparam = {
      ...params,
      bigtype: 0
    };

    const { pageIndex, pageSize } = queryparam;
    if (!curritem || curritem.url1) {
      setData([]);
    }

    if (curritem && curritem.url1) {
      run(curritem.url1, queryparam).then((res) => {
        let data = res.data.data.listdata;

        data.listdata.forEach((item: any) => {
          if (item.dam_date) {
            item.dam_date = moment(item.dam_date).format('YYYY-MM-DD');
          }
          if (item.updatetime) {
            item.updatetime = moment(item.updatetime).format('YYYY-MM-DD');
          }
          if (item.plan_dem_date) {
            item.plan_dem_date = moment(item.dam_date).format('YYYY-MM-DD');
          }
        });
        let tabColum: any[] = [];
        Object.keys(data.listColumn).forEach((e) => {
          if (e != 'x' && e != 'y') {
            if (e === 'id' || e === 'objectid') {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: 'id',
                width: 60,
                render: (text: string, r: any) => {
                  if (r.isoverwarn) {
                    return <span style={{ color: r.isoverwarn ? 'red' : '#fff' }}>{text}</span>;
                  } else if (r.iswarn) {
                    return <span style={{ color: r.iswarn ? 'orange' : '#fff' }}>{text}</span>;
                  } else {
                    return text;
                  }
                }
              });
            } else if (curritem.layerzwmc === '液位监测') {
              if (e === 'name') {
                tabColum.push({
                  title: data.listColumn[e],
                  dataIndex: e,
                  key: e,

                  ellipsis: {
                    showTitle: false
                  },
                  width: 100,
                  render: (text: string, r: any) => {
                    if (r.isoverwarn) {
                      return (
                        <Tooltip placement="left" title={text}>
                          <span style={{ color: r.isoverwarn ? 'red' : '#fff' }}>{text}</span>
                        </Tooltip>
                      );
                    } else if (r.iswarn) {
                      return (
                        <Tooltip placement="left" title={text}>
                          <span style={{ color: r.iswarn ? 'orange' : '#fff' }}>{text}</span>
                        </Tooltip>
                      );
                    } else {
                      return (
                        <Tooltip placement="left" title={text}>
                          {text}
                        </Tooltip>
                      );
                    }
                  }
                });
              } else {
                tabColum.push({
                  title: data.listColumn[e],
                  dataIndex: e,
                  key: e,
                  width: 50,
                  ellipsis: {
                    showTitle: true
                  },
                  render: (text: string, r: any) => {
                    if (r.isoverwarn) {
                      return <span style={{ color: r.isoverwarn ? 'red' : '#fff' }}>{text}</span>;
                    } else if (r.iswarn) {
                      return <span style={{ color: r.iswarn ? 'orange' : '#fff' }}>{text}</span>;
                    } else {
                      return text;
                    }
                  }
                });
              }
            } else if (e === 'belong_wqname') {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                width: 120,
                ellipsis: {
                  showTitle: false
                },
                render: (text: string) => {
                  if (text === 'null') {
                    return '';
                  } else {
                    return (
                      <Tooltip placement="left" title={text}>
                        {text}
                      </Tooltip>
                    );
                  }
                }
              });
            } else {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                ellipsis: {
                  showTitle: false
                },
                render: (text: string) => {
                  if (text === 'null') {
                    return '';
                  } else {
                    return (
                      <Tooltip placement="left" title={text}>
                        {text}
                      </Tooltip>
                    );
                  }
                }
              });
            }
          }
        });

        setTabColum(tabColum);

        if (data.dataCount) {
          setTotal(data.dataCount);
        } else {
          setTotal(data.listdata.length);
        }
        let datakey;
        if (flag) {
          let page = pageIndex - 1;

          if (page < 0) page = 0;

          const indexs = page * pageSize;

          datakey = data.listdata.map((item: any, index: any) => {
            return { ...item, id: indexs + (index + 1), ...geoType };
          });
        } else {
          datakey = data.listdata.map((item: any, index: any) => {
            return { ...item, id: index + 1, ...geoType };
          });
        }
        console.log(datakey, 'datakey');
        console.log(flag, 'flag');

        setData(datakey);
      });
    }
  }, [curritem, params]);

  const onChange = (page: number) => {
    const tem = { ...params, pageIndex: page };

    setParams(tem);
  };
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
  };
  const tableClick = async (record: any) => {
    console.log(record, 'record');
    if (record.f_longitude) {
      record.x = record.f_longitude;
    }
    if (record.f_latitude) {
      record.y = record.f_latitude;
    }

    const { layerzwmc } = curritem;
    const { x, y } = record;

    const { geoType: type = '' } = geoType;
    let mapPoint = new Point({ x, y, spatialReference: new SpatialReference({ wkid: 4490 }) });
    //删除查询高亮
    if (view) {
      let queryHight = view.map.findLayerById('queryHightLayer') as GraphicsLayer;
      if (queryHight) queryHight.removeAll();
    }

    record.layerzwmc = layerzwmc;
    record.them = layerzwmc;
    let find = showPolygon.find((f) => f.name === layerzwmc);

    if (find) {
      record.queryStr = find.queryStr;
      record.queryFiled = record[find.filed];
      state.view && query(record, state.view);
      state?.view?.goTo({ target: mapPoint, zoom: 9 });
      return;
    }

    if (type === 'esriGeometryPoint' || type === '' || !type) {
      dispatch({ type: 'point', data: record });
    } else {
      state?.view?.goTo({ target: mapPoint, zoom: 6 });
    }
  };

  return (
    <>
      <div className="searchpanel">
        <Form name="search_form" onFinish={onFinish} form={form}>
          <Row>
            <Col span={18}>
              <Form.Item name="name" label={searchName}>
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
      <section className="tablecom">
        <div className="dw">{'总数：' + total}</div>
        <Table
          size="small"
          rowClassName={(r: any, indx: number) => {
            if (indx % 2 === 1) return 'bg-row';
            else return '';
          }}
          columns={tabColum}
          dataSource={data}
          rowKey="xh"
          scroll={{ y: 370 }}
          onRow={(record: any) => {
            record.layerNames = curritem.layerzwmc;
            return {
              onClick: () => tableClick(record)
            };
          }}
          pagination={{
            total: total,
            hideOnSinglePage: true,
            pageSize: params.pageSize,
            showSizeChanger: false,
            onChange: onChange
          }}
        />
      </section>
    </>
  );
};
export default TableCom;
