import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import service from '@/axios';

import { usePageContext } from '@/store';

import {
  generateUUID,
  hightLayer,
  locationGoto,
  replactToken,
  returnClickQuery,
  tableClickQuery
} from '@/utils';

import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, message, Row, Table } from 'antd';
import _ from 'lodash';

import './index.less';
import { useGetLastLayer, useSelectLayerTable, useView } from '@/utils/hooks';
import Point from '@arcgis/core/geometry/Point';

import PopupModal from '../PopupModal';
import { findByIdTask } from '@/utils/queryTask';
import { showModalLayer, symbolObj } from '@/config';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
const typeList = [
  { name: '全部', value: '全部' },
  { name: '已完成', value: '已完成' },
  { name: '未完成', value: '未完成' }
];
const townsJH = (data: any[], config: any) => {
  let datas = _.groupBy(data, 'townname');
  const result = [];
  let id = 0;
  for (const key in datas) {
    const item = datas[key];
    id++;
    result.push({
      name: key + `(${item.length})`,
      ids: id,
      key: generateUUID(),
      children: item.map((item, index) => {
        item.key = index;
        item.ids = index + 1;
        item.geoType = config.geoType;
        item.layerIds = config.layerIds;
        item.queryUrl = config.queryUrl;
        item.key = generateUUID();
        return item;
      })
    });
  }

  return result;
};

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
const initParams = { name: '', pageIndex: 1, pageSize: 100000, bigtype: 0, id: '' };
function TableNCSTHD() {
  const [form] = Form.useForm();
  const view = useView();
  const { state: mapState } = usePageContext();
  const [isBigAttrPopup, setIsBigAttrPopup] = useState<any[]>([]); //存储字段大弹窗
  const [params, setParams] = useState({ ...initParams });
  const { dispatch } = usePageContext();
  // const lastLayer = useGetLastLayer();
  const layers = useRef<GraphicsLayer>();
  const lastLayer = useSelectLayerTable();
  const [ready, setReady] = useState(false);
  const [type, setType] = useState('全部');
  useEffect(() => {
    if (view) {
      let find = view.map.findLayerById('hightLayer');
      if (find) {
        layers.current = find as any;
      } else {
        const layer = new GraphicsLayer({ id: 'hightLayer' });

        view.map.add(layer);
        layers.current = layer;
      }
    }
  }, [mapState]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lastLayer && lastLayer.url1) {
        setReady(true);
      } else {
        setReady(false);
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  });
  const [total, setTotal] = useState(0);
  const { data, loading } = useRequest(() => service.post(lastLayer.url1, params), {
    ready: ready,

    refreshDeps: [params, lastLayer?.url1],
    formatResult: (res) => {
      const result = res.data.data.listdata;
      const datas = result.listdata;

      setTotal(result.dataCount);
      return datas;
      //   return {
      //     datas: townsJH(datas, geoType)
      //   } as any;
    }
  });

  const colums: any[] = [
    { title: '编号', dataIndex: 'ids', width: 100 },

    { title: '名称', dataIndex: 'name' }
  ];
  const geoType = useMemo(() => {
    if (lastLayer && lastLayer.opconfig) {
      return {
        queryUrl: lastLayer.url,
        geoType: JSON.parse(lastLayer.opconfig ?? '{}')?.lyrtype,
        layerIds: JSON.parse(lastLayer?.layerid ?? '[]')
      };
    } else {
      return {};
    }
  }, [lastLayer]);
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
  };

  const tableClick = async (record: any) => {
    if (!view) return;

    let arr: any[] = [];
    const { layerNames, x, y, geoType, children, queryUrl, layerIds, id } = record;

    if (layerNames === '农村生态河道' && layerIds && layerIds.length > 0) {
      const qur = await replactToken(queryUrl);
      const layerId = layerIds[0].id;
      const url = qur + '/' + layerId;
      const result = await findByIdTask(url, id);

      var center;
      if (result) {
        const { features, geometryType, fields } = result;
        const symbol = symbolObj[geometryType];
        features.forEach((item: any) => {
          const { geometry, attributes } = item;
          attributes.layerName = layerNames;
          Object.keys(attributes).forEach((item) => {
            const find = fields.find((f: any) => f.name === item);
            if (find) {
              attributes[find.alias] = attributes[item];
            }
          });

          center = geometry.extent.center;
          item.symbol = symbol;

          layers.current && layers.current.add(item);
        });
      }
      if (center) {
        locationGoto(view, center);
      }
      return;
    }
    if (!children) {
      if (!x || !y) {
        message.warning('暂无经纬度信息');
        return;
      }
    }

    const mapPoint = new Point({
      x: Number(x),
      y: Number(y),
      spatialReference: view.spatialReference
    });

    //显示大弹窗
    if (showModalLayer.includes(layerNames)) {
      const result = (await returnClickQuery(view, record)) as any;
      if (result) {
        result.results.forEach((item: any) => {
          const atts = item.feature.attributes;
          const { layerName } = item;

          arr.push({
            ...atts,
            layerName: layerName
          });
        });
        // setIsBigAttrPopup(arr);
        if (geoType === 'esriGeometryPoint') {
          dispatch({ type: 'point', data: record });
        } else {
          locationGoto(view, center);
        }
      }
    } else {
      if (record.geoType === 'esriGeometryPolygon' || record.geoType === 'esriGeometryPolyline') {
        if (view) {
          console.log(record, 'record');
          tableClickQuery(view, record);
        }
      } else {
        dispatch({ type: 'point', data: record });
      }
    }
  };

  const filterData = useMemo(() => {
    if (data) {
      let temp = [...data];
      if (type === '全部') {
        return {
          data: townsJH(temp, geoType),
          total: temp.length
        };
      }
      if (type === '已完成') {
        let filter = temp.filter((f) => f.sfwc === '已完成');

        return {
          data: townsJH(filter, geoType),
          total: filter.length
        };
      }
      if (type === '未完成') {
        let filter = temp.filter((f) => f.sfwc === '未完成');
        return {
          data: townsJH(filter, geoType),
          total: filter.length
        };
      }
    }
  }, [type, data, geoType]);
  return (
    <>
      <div className="TableNCSTHD">
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
        <div className="btn-wrap">
          {typeList.map((item) => {
            return (
              <Button
                key={item.name}
                type={type === item.name ? 'primary' : 'text'}
                onClick={() => {
                  setType(item.name);
                }}
              >
                {item.name}
              </Button>
            );
          })}
        </div>
        <div className="cunstomtable">
          <div className="total">总数：{filterData?.total ?? 0}</div>
          <Table
            size="small"
            rowClassName={rowClassName}
            loading={loading}
            dataSource={filterData?.data}
            columns={colums}
            pagination={{
              total: total,
              pageSize: params?.pageSize,
              current: params?.pageIndex,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: (page, pageSize) => {
                setParams({ ...params, pageIndex: page });
              }
            }}
            rowKey="key"
            scroll={{ y: 420 }}
            onRow={(record: any) => {
              record.layerNames = lastLayer.layerzwmc;

              return {
                onClick: () => tableClick(record)
              };
            }}
          />
        </div>
      </div>
      <PopupModal data={isBigAttrPopup} setResponse={setIsBigAttrPopup} />
    </>
  );
}
export default memo(TableNCSTHD);
