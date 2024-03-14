import { Button, Checkbox, Col, Form, Input, Row, Table, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import './index.less';

import { usePageContext } from '@/store';
import { supply } from '@/config';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { useGetLastLayer, useLayerList } from '@/utils/hooks';
import { useLayerContext } from '@/store/layer';
const { TabPane } = Tabs;
const CheckboxGroup = Checkbox.Group;
export const supplyType = [
  { label: '变坡点', value: 0, color: '#E73324', searchName: '本点号' },
  { label: '变材点', value: 1, color: '#F8BE0F', searchName: '本点号' },
  { label: '变径点', value: 2, color: '#79F4AD', searchName: '本点号' },
  { label: '阀门', value: 3, color: '#286FF2', searchName: '编号' },
  { label: '节点', value: 4, color: '#9A28DC', searchName: '地理位置' },
  { label: '桥管', value: 5, color: '#349E9D', searchName: '本点号' },
  { label: '止回阀', value: 6, color: '#1D7100', searchName: '编号' },
  { label: '管段', value: 7, color: '#4CB4E9', searchName: '编号' }
];

const layerGroup = new GroupLayer({
  id: 'supplyLayer',
  visibilityMode: 'inherited',
  visible: true
});
const initParams = { name: '', pageIndex: 1, pageSize: 10, bigtype: 0, id: '' };
export default function TableSupply() {
  const currentLayer = useGetLastLayer();
  const [form] = Form.useForm();
  const [params, setParams] = useState({ ...initParams });
  const { dispatch: layerDispatch } = useLayerContext();
  const { state, dispatch } = usePageContext();
  const [key, setKey] = useState(supplyType[0].value.toString());
  const [value, setValue] = useState(['']);
  const layerList = useLayerList();
  const { loading, run, data } = useRequest((url, par) => service.post(url, par), {
    formatResult: (res) => res.data.data.listdata,
    manual: true
  });
  const searchName = useMemo(() => {
    return supplyType[key].searchName;
  }, [key]);

  useEffect(() => {
    if (params && currentLayer && key) {
      let tem = {
        name: params.name,
        bigtype: 0,
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        enumtype: Number(key)
      };

      run(currentLayer.url, tem);
    }
  }, [params, currentLayer, key]);
  const onChange = (val: any) => {
    if (state && state.view) {
      let { view } = state;
      const find = view.map.findLayerById('supplyLayer');
      if (find) {
        layerGroup.removeAll();
      } else {
        view.map.add(layerGroup);
      }
      const sublayers = val.map((item: any) => {
        return {
          id: item,
          visible: true
        };
      });
      let layer = new MapImageLayer({
        url: supply.url,
        sublayers
      });
      layerList &&
        layerList.forEach((item: any) => {
          if (item.layerzwmc === '供水管网') {
            item.layerid = sublayers;
          }
        });

      layerList && layerDispatch({ type: 'setList', data: { list: layerList } });
      layerGroup.add(layer); // adds the layer to the map
    }
    setValue(val);
  };
  const callback = (keys: any) => {
    setParams({ ...params, pageIndex: 1 });
    setKey(keys);
  };
  const result = useMemo(() => {
    if (data) {
      let columsArr = [];
      let colums = data.listColumn;
      let total = data.dataCount;
      let res = data.listdata;
      for (const key in colums) {
        if (key != 'x' && key != 'y') {
          columsArr.push({
            title: colums[key],
            dataIndex: key
          });
        }
      }
      return {
        columsArr,
        total,
        res
      };
    }
  }, [data]);
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
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
      <div className="TableSupply">
        <div className="equivalence">
          <CheckboxGroup options={supplyType} value={value} onChange={onChange} />
        </div>
        <div className="total">总数:{result?.total}</div>
        <div className="supply-tabs">
          <Tabs defaultActiveKey={key.toString()} onChange={callback}>
            {supplyType.map((item) => {
              return (
                <TabPane tab={item.label} key={item.value}>
                  <div className="cunstomtable">
                    <Table
                      size="small"
                      rowClassName={(r: any, indx: number) => {
                        if (indx % 2 === 1) return 'bg-row';
                        else return '';
                      }}
                      columns={result?.columsArr}
                      dataSource={result?.res}
                      pagination={{
                        total: result?.total,
                        pageSize: params?.pageSize,
                        current: params?.pageIndex,
                        showSizeChanger: false,
                        onChange: (page, pageSize) => {
                          setParams({ ...params, pageIndex: page });
                        }
                      }}
                      rowKey="stcd"
                      scroll={{ y: 296 }}
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
        </div>
      </div>
    </>
  );
}
