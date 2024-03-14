import { Checkbox, Table, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import './index.less';

import { usePageContext } from '@/store';
import { supply } from '@/config';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import { useRequest } from 'ahooks';
import service from '@/axios';
const { TabPane } = Tabs;
const CheckboxGroup = Checkbox.Group;
export const supplyType = [
  { label: '变坡点', value: 0, color: '#E73324' },
  { label: '变材点', value: 1, color: '#F8BE0F' },
  { label: '变径点', value: 2, color: '#79F4AD' },
  { label: '阀门', value: 3, color: '#286FF2' },
  { label: '节点', value: 4, color: '#9A28DC' },
  { label: '桥管', value: 5, color: '#349E9D' },
  { label: '止回阀', value: 6, color: '#1D7100' },
  { label: '管段', value: 7, color: '#4CB4E9' }
];

interface Props {
  url: string;
  params: any;
  setparams: Function;
  setSelectedLayers: Function; //根据选中的设置查询图层id，
  selectLayer: any; //选中的图层
}

const layerGroup = new GroupLayer({
  id: 'supplyLayer',
  visibilityMode: 'inherited',
  visible: true
});
const initParams = { name: '', pageIndex: 1, pageSize: 100000, bigtype: 0, id: '' };
export default function TableSupply(props: Props) {
  const { url, params, setparams, selectLayer, setSelectedLayers } = props;

  const { state, dispatch } = usePageContext();
  const [key, setKey] = useState(supplyType[0].value.toString());
  const [value, setValue] = useState(['']);

  const { loading, run, data } = useRequest((url, par) => service.post(url, par), {
    formatResult: (res) => res.data.data.listdata,
    manual: true
  });

  useEffect(() => {
    if (params && url && key) {
      let tem = {
        name: params.name,
        bigtype: 0,
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        enumtype: Number(key)
      };

      run(url, tem);
    }
  }, [params, url, key]);
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
      selectLayer.forEach((item: any) => {
        if (item.layerzwmc === '供水管网') {
          item.layerid = sublayers;
        }
      });
      setSelectedLayers(selectLayer);
      layerGroup.add(layer); // adds the layer to the map
    }
    setValue(val);
  };
  const callback = (keys: any) => {
    setparams({ ...params, pageIndex: 1 });
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

  return (
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
                        setparams({ ...params, pageIndex: page });
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
  );
}
