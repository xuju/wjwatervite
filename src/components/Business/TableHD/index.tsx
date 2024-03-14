import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { Button, Col, Form, Input, Row, Table, Tabs, message } from 'antd';
import service from '@/axios';
import { basics, symbolObj } from '@/config';
import { useRequest } from 'ahooks';
import { useSelectLayerTable, useView } from '@/utils/hooks';
import _ from 'lodash';
import { usePageContext } from '@/store';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { findByIdTask } from '@/utils/queryTask';
import Point from '@arcgis/core/geometry/Point';

import {
  getMapToken,
  locationGoto,
  replactToken,
  returnClickQuery,
  tableClickQuery
} from '@/utils';
import PopupModal from '@/components/PopupModal';
const types = ['乡镇街道', '管理级别'];
const townsJH = (data: any[], config: any, groupName = 'townname') => {
  let datas = _.groupBy(data, groupName);
  const result = [];
  let id = 0;
  for (const key in datas) {
    const item = datas[key];
    id++;
    const obj = {
      name: key + `(${item.length})`,
      ids: id,
      id: Math.random(),
      order: 0,
      children: item.map((item, index) => {
        item.key = index;
        item.ids = index + 1;
        item.geoType = config.geoType;
        item.layerIds = config.layerIds;
        item.queryUrl = config.queryUrl;
        return item;
      })
    };
    if (key === '流域性河道') {
      obj.order = 1;
    }
    if (key === '区域性河道') {
      obj.order = 2;
    }
    if (key === '跨县重要河道') {
      obj.order = 3;
    }
    if (key === '县域重要河道') {
      obj.order = 4;
    }
    if (key === '县级河道') {
      obj.order = 5;
    }
    if (key === '乡级河道') {
      obj.order = 6;
    }
    if (key === '村级河道') {
      obj.order = 7;
    }

    result.push(obj);
  }

  return result;
};
export default function TableHD() {
  const [params, setParams] = useState({
    name: '',
    pageIndex: 1,
    pageSize: 100000,
    bigtype: 0,
    id: ''
  });
  const view = useView();
  const { state: mapState, dispatch } = usePageContext();
  const [isBigAttrPopup, setIsBigAttrPopup] = useState<any[]>([]); //存储字段大弹窗
  const layers = useRef<GraphicsLayer>();
  const [selectType, setSelectType] = useState(types[0]);
  const curritem = useSelectLayerTable();

  const {
    data: list,
    loading,
    run: runTable
  } = useRequest((url) => service.post(url, params), {
    formatResult: (res) => res.data.data.listdata,
    refreshDeps: [params],
    manual: true
  });

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
  }, [view]);
  const requestUrl = useMemo(() => {
    if (curritem && curritem.opconfig) {
      const opconfig = JSON.parse(curritem.opconfig);
      if (opconfig && opconfig.listUrl) {
        return opconfig.listUrl;
      }
    }
  }, [curritem]);
  useEffect(() => {
    if (requestUrl) {
      runTable(requestUrl);
    }
  }, [requestUrl, params]);

  const colums: any[] = [
    { title: '编号', dataIndex: 'ids', width: 100 },

    { title: '名称', dataIndex: 'name' }
  ];
  const geoType = useMemo(() => {
    if (curritem && curritem.opconfig) {
      return {
        queryUrl: curritem.url,
        geoType: JSON.parse(curritem.opconfig ?? '{}')?.lyrtype,
        layerIds: JSON.parse(curritem?.layerid ?? '[]')
      };
    } else {
      return {};
    }
  }, [curritem]);
  useEffect(() => {
    if (selectType === '乡镇街道') {
    }
  }, [selectType]);
  const tlist = useMemo(() => {
    let total = 0;
    if (list && geoType) {
      console.log(geoType, 'geoType');
      if (selectType === '乡镇街道') {
        const arr = townsJH((list as any).listdata, geoType);
        arr.forEach((item) => {
          total += item.children.length;
        });

        return {
          data: arr,
          total
        };
      } else {
        let arr = townsJH((list as any).listdata, geoType, 'management_level').sort(
          (a, b) => a.order - b.order
        );

        arr = arr.map((item) => {
          item.ids = item.order;
          return item;
        });

        arr.forEach((item) => {
          total += item.children.length;
        });

        return {
          data: arr,
          total
        };
      }
    } else {
      return {
        data: [],
        total
      };
    }
  }, [list, selectType, geoType]);

  const tableClick = async (record: any) => {
    record.layerNames = '河道';
    if (!view) return;

    layers.current?.removeAll();

    const { layerNames, x, y, geoType, children, queryUrl, layerIds, id } = record;
    console.log(queryUrl, 'queryUrl');
    const qur = await replactToken(queryUrl);
    console.log(qur, 'qur');
    const layerId = layerIds[0].id;
    const url = qur + '/' + layerId;

    const result = await findByIdTask(url, id);

    if (result) {
      const { features, geometryType, fields } = result;
      if (features.length) {
        const symbol = symbolObj[geometryType];
        let center;
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
        if (center) {
          locationGoto(view, center);
        }
      } else {
        message.warning('暂未查询到信息');
      }
    }
  };

  const onFinish = (value: any) => {
    const name = value.name ?? '';
    const obj = { ...params };
    obj.name = name;
    setParams(obj);
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
  return (
    <>
      <div className="TableHD searchpanel">
        <div className="form">
          <Form name="search_form" onFinish={onFinish}>
            <Row>
              <Col span={18}>
                <Form.Item label="名称" name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={5} offset={1}>
                <Button htmlType="submit" style={{ right: '0' }}>
                  搜索
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="button-wrap">
          {types.map((item) => {
            return (
              <Button
                className={[selectType === item ? 'select' : ''].join(' ')}
                key={item}
                onClick={() => setSelectType(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>
        <div className="tables cunstomtable">
          {tlist && <div className="total">总数：{tlist?.total}</div>}
          <Table
            size="small"
            rowClassName={rowClassName}
            loading={loading}
            dataSource={tlist?.data}
            columns={colums}
            pagination={{
              total: tlist?.total,
              pageSize: params?.pageSize,
              current: params?.pageIndex,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: (page, pageSize) => {
                setParams({ ...params, pageIndex: page });
              }
            }}
            rowKey="id"
            scroll={{ y: 420 }}
            onRow={(record: any) => {
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
