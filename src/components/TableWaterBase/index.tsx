import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Col, Form, Input, Row, Table, Tabs, Tooltip } from 'antd';
import './index.less';
import { usePageContext } from '@/store';

import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { useRequest } from 'ahooks';
import service from '@/axios';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import Query from '@arcgis/core/rest/support/Query';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

import { useGetLastLayer, useLayerList } from '@/utils/hooks';
import { useLayerContext } from '@/store/layer';
import { attributeObj } from '@/config';
import { locationGoto, renderPosition } from '@/utils';

const CheckboxGroup = Checkbox.Group;
const { TabPane } = Tabs;
export const waterBaseType = [
  { label: '河湖规划范围', value: 0 },
  { label: '河流管理范围', value: 1 },
  { label: '湖泊管理范围', value: 2 },
  { label: '水利工程管理范围', value: 3 },
  { label: '水利工程规划范围', value: 4 },
  { label: '水务工程管理范围', value: 5 },
  { label: '水务工程规划范围', value: 6 }
];
export const waterBaselistType = [
  { label: '河湖规划范围', value: 0, color: '#ABE1FA' },

  { label: '水利工程规划范围', value: 4, color: '#00FFC5' },

  { label: '水务工程规划范围', value: 6, color: '#FFFF00' }
];

interface Props {
  select: any;
  params: any;
  setparams: Function;
}

const formatData = (data: any, select: any, layerId: number) => {
  let colums = [];
  const { listColumn } = data;
  for (const key in listColumn) {
    if (listColumn[key] != '编号') {
      colums.push({
        title: listColumn[key],
        dataIndex: key,
        width: 100,
        ellipsis: {
          showTitle: false
        },
        render: (text: any) => {
          return (
            <Tooltip title={text} placement="leftTop">
              {text}
            </Tooltip>
          );
        }
      });
    }
  }

  return {
    total: data.dataCount,
    list: data.listdata.map((item: any) => {
      item.queryUrl = select?.url + '/' + layerId;

      return item;
    }),
    colums: colums
  };
};
const layer = new GraphicsLayer({ id: 'waterBaseHightLayer' });
const initParams = { name: '', pageIndex: 1, pageSize: 100000, bigtype: 0, id: '' };
export default function TableWaterBase() {
  const [params, setParams] = useState({ ...initParams });
  const { state } = usePageContext();
  const [value, setValue] = useState<any[]>(['']);
  const [key, setKey] = useState(waterBaselistType[0].value);
  const select = useGetLastLayer();
  const layerList = useLayerList();
  const { dispatch: layerDispatch } = useLayerContext();
  const { data, run, cancel } = useRequest((url, params) => service.post(url, params), {
    manual: true,
    formatResult: (res) => formatData(res.data.data.listdata, select, key)
  });
  const [form] = Form.useForm();
  useEffect(() => {
    if (select) {
      run(select.url1, { ...params, enumtype: key });
    }
  }, [select, params, key]);
  useEffect(() => {
    return layer.removeAll();
  }, []);
  useEffect(() => {
    if (state && state.view) {
      const layers = state.view.map.findLayerById('waterBase') as MapImageLayer;
      if (!layers) {
        let layer = new MapImageLayer({
          url: select.url,
          id: 'waterBase',
          visible: false
        });
        state.view.map.add(layer);
      }
    }
  }, [state]);
  const onChange = (val: CheckboxValueType[]) => {
    layer.removeAll();
    let dom = document.getElementById('basics-coustom-popup-wrap');
    if (dom) dom.remove();
    const unSelect = waterBaseType.filter((item) => !val.includes(item.value));
    if (state && state.view) {
      let { view } = state;
      const layer = view.map.findLayerById('waterBase') as MapImageLayer;
      if (!layer) return;
      layer.visible = true;
      unSelect.forEach((p) => {
        let find = layer.findSublayerById(p.value);
        find.visible = false;
      });
      val.forEach((p: any) => {
        let find = layer.findSublayerById(p);
        find.visible = true;
      });
    }
    const sublayers = val.map((item: any) => {
      return {
        id: item,
        visible: true
      };
    });
    layerList &&
      layerList.forEach((item: any) => {
        if (item.layerzwmc === '水务基础设施空间布局规划') {
          item.layerid = sublayers;
        }
      });

    layerList && layerDispatch({ type: 'setList', data: { list: layerList } });
    setValue(val);
  };
  const callback = (data: any) => {
    setKey(data);
  };

  const query = async (data: any) => {
    let view = state?.view;
    if (!view) return;
    const { queryUrl, objectid } = data;

    let symbol;
    let layers: GraphicsLayer;
    let find = view.map.findLayerById('waterBaseHightLayer');
    if (find) {
      layers = find as any;
    } else {
      view.map.add(layer);
      layers = layer;
    }
    layers.removeAll();
    const queryTask = new QueryTask({
      //在任务中使用的ArcGIS Server REST服务URL（通常是要素服务层或地图服务层）
      url: queryUrl
    });
    const query = new Query();
    query.returnGeometry = true;
    query.outFields = ['*'];
    query.where = `OBJECTID = ${objectid.toString()}`; //这里是就是查询语句

    const result: any = await queryTask.execute(query);
    if (result) {
      let attr: any[] = [];
      let mapPoint: any;
      const featuresArr = result.features;
      const fields = result.fields;

      featuresArr.forEach((item: any) => {
        const { geometry, attributes } = item;

        mapPoint = geometry.centroid;
        attributes.mapPoint = geometry.centroid;
        attributes.layerName = '水务基础设施空间布局规划';
        attributes.them = '水务基础设施空间布局规划';
        let temp: any = {};
        fields.forEach((item: any) => {
          attributes[item.alias] = attributes[item.name];
        });

        attr.push(attributes);

        if (result.geometryType === 'polygon') {
          symbol = {
            type: 'simple-line',
            color: [0, 227, 255, 0.8],
            width: 2
          } as any;
          item.symbol = symbol;

          layers.add(item);
        }
        if (result.geometryType === 'polyline') {
          symbol = {
            type: 'simple-fill',
            color: [0, 227, 255, 0.1],
            outline: {
              color: [0, 227, 255, 1],
              width: 2
            }
          };
          item.symbol = symbol;

          layers.add(item);
        }
        //显示弹窗
        if (attr && attr.length > 0 && mapPoint) {
          view && locationGoto(view, mapPoint);
          let dom = document.getElementById('basics-coustom-popup-wrap');
          if (!dom) {
            let div = document.createElement('div');
            div.id = 'basics-coustom-popup-wrap';
            view && view.container.appendChild(div);
            dom = div;
          }
          let temp = [];

          view && renderPosition(view, mapPoint, attr, dom);
          view &&
            view.watch('extent', () => {
              view && dom && renderPosition(view, mapPoint, attr, dom);
            });
        } else {
          // message.warning('暂无数据');
        }
      });
    }
  };
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
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
      <div className="TableWaterBase">
        <div className="equivalence">
          <CheckboxGroup options={waterBaseType} value={value} onChange={onChange} />
        </div>
        <div className="waterbase-tabs">
          <Tabs defaultActiveKey={key.toString()} onChange={callback}>
            {waterBaselistType.map((item) => {
              return (
                <TabPane tab={item.label} key={item.value}>
                  <div className="cunstomtable">
                    <Table
                      size="small"
                      rowClassName={(r: any, indx: number) => {
                        if (indx % 2 === 1) return 'bg-row';
                        else return '';
                      }}
                      columns={data?.colums}
                      dataSource={data?.list}
                      pagination={{
                        total: data?.total,
                        pageSize: params?.pageSize,
                        current: params?.pageIndex,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                          setParams({ ...params, pageIndex: page });
                        },
                        showTotal: (total) => `共${total}条数据`
                      }}
                      rowKey="objectid"
                      scroll={{ y: 296 }}
                      onRow={(record: any) => {
                        return {
                          onClick: (event) => {
                            query(record);
                          }
                        };
                      }}
                    />
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        </div>
      </div>
    </>
  );
}
