import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react';
import { Button, message, Radio, RadioChangeEvent, Table, Tabs, Tooltip, Checkbox } from 'antd';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { usePageContext } from '@/store';
const { TabPane } = Tabs;
import './index.less';
import { clipPolygon, requestLine } from './fun';
import MapView from '@arcgis/core/views/MapView';
import _ from 'lodash';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import jsonData from '@/assets/js/wjqjson.json';
import Polygon from '@arcgis/core/geometry/Polygon';
import { intersect } from '@turf/turf';
import * as turf from '@turf/turf';
import * as geometryEngineAsync from '@arcgis/core/geometry/geometryEngineAsync';
import { useLayerContext } from '@/store/layer';

const fillSymbol = {
  type: 'simple-fill', // autocasts as new SimpleFillSymbol()
  color: 'transparent',
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [255, 255, 255],
    width: 1
  }
};
const fillSymbol1 = {
  type: 'simple-fill', // autocasts as new SimpleFillSymbol()
  color: [227, 139, 79, 0.8],
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [255, 255, 255],
    width: 1
  }
};
const CheckboxGroup = Checkbox.Group;
const tabList = [
  {
    title: '全部测站',
    key: 'qbcz',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'stnm', key: 'stnm', width: 150 },
      { title: '雨量', dataIndex: 'drp', key: 'drp' },
      { title: '所属乡镇', dataIndex: 'nodename', key: 'nodename', width: 100 },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '量级统计',
    key: 'ljtj',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'name', key: 'name', width: 180 },
      { title: '雨量', dataIndex: 'value', key: 'value' },
      { title: '所属乡镇', dataIndex: 'nodename', key: 'nodename', width: 80 },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '极值统计',
    key: 'jztj',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'name', key: 'name', width: 150 },
      { title: '雨量', dataIndex: 'value', key: 'value' },
      { title: '所属乡镇', dataIndex: 'nodename', key: 'nodename', width: 100 },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '区域降雨',
    key: 'qyjy',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '区域名称', dataIndex: 'nodename', key: 'nodename' },
      { title: '平均雨量', dataIndex: 'avgValue', key: 'avgValue' },
      {
        title: '极值站名',
        dataIndex: 'stname',
        key: 'stname',
        width: 120,
        ellipsis: { showTitle: false },
        render: (val: any) => <Tooltip title={val}>{val}</Tooltip>
      },
      { title: '极值雨量', dataIndex: 'stValue', key: 'stValue' },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  },
  {
    title: '雨情预警',
    key: 'yqyj',
    dataC: [
      { title: '序号', dataIndex: 'xh', key: 'xh', width: 60 },
      { title: '站名', dataIndex: 'name', key: 'name', width: 150 },
      { title: '雨量', dataIndex: 'value', key: 'value' },
      { title: '所属乡镇', dataIndex: 'nodename', key: 'nodename', width: 100 },
      { title: 'x', dataIndex: 'x', key: 'x', width: 0.1, render: (val: any) => <span /> },
      { title: 'y', dataIndex: 'y', key: 'y', width: 0.1, render: (val: any) => <span /> }
    ]
  }
];

interface TableSSYLProp {
  url: string;
  param?: any;
  view?: MapView;
}
let slsymbol = {
  type: 'simple-line', // autocasts as new SimpleLineSymbol()
  color: 'red',
  width: '3px',
  style: 'short-dot'
};
const TableSSYL = (props: TableSSYLProp) => {
  const [smallType, setSmallType] = useState<string>('qbcz');
  const [data, setData] = useState<any[]>([]);
  const { dispatch } = usePageContext();
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });

  const [equivalenceLine] = useState(new GraphicsLayer({ id: 'equivalenceline' }));
  const [equivalencePolygon] = useState(new GraphicsLayer({ id: 'equivalencePolygon' }));
  const [lineData, setLineData] = useState<Graphic[]>();
  const [polygonData, setPolygonData] = useState<Graphic[]>();
  const [result, setResult] = useState([]);
  const [value, setValue] = useState(['']);
  const { view, url } = props;
  const { state: LayerData } = useLayerContext();
  const params = useMemo(() => {
    if (LayerData) {
      return LayerData.params;
    } else {
      return {};
    }
  }, [LayerData]);
  useEffect(() => {
    if (view) {
      view.map.add(equivalenceLine, 1);
      view.map.add(equivalencePolygon, 1);
    }
  }, [view]);
  useEffect(() => {
    let queryparam = {
      ...props.param,
      bigtype: 0,
      smallType: smallType
    };

    url &&
      run(props.url, queryparam).then((res) => {
        let listdata = res.data.data.listdata.listdata;

        setResult(listdata);
        let tData: any[] = [];
        switch (smallType) {
          case 'qbcz':
            listdata.forEach((it: any, i: number) => {
              tData.push({
                x: it.x,
                y: it.y,
                xh: `${i + 1}`,
                drp: it.drp,
                stnm: it.stnm,
                nodename: it.nodename
              });
            });
            break;
          case 'ljtj':
            listdata.forEach((it: any, i: number) => {
              tData.push({
                x: it.x,
                y: it.y,
                xh: `${i + 1}`,
                name: it.name,
                value: '',
                nodename: it.nodename,
                // eslint-disable-next-line max-nested-callbacks
                children: it.childs
                  ? it.childs.map((itc: any, y: any) => {
                      return {
                        x: itc.x,
                        y: itc.y,
                        xh: `${i + 1}${y + 1}`,
                        name: itc.name,
                        value: itc.value,
                        nodename: itc.nodename
                      };
                    })
                  : []
              });
            });
            break;
          case 'jztj':
            listdata.forEach((it: any, i: number) => {
              tData.push({
                x: it.x,
                y: it.y,
                xh: `${i + 1}`,
                name: it.name,
                value: '',
                nodename: it.nodename,
                // eslint-disable-next-line max-nested-callbacks
                children: it.childs
                  ? it.childs.map((itc: any, y: any) => {
                      return {
                        x: itc.x,
                        y: itc.y,
                        xh: `${i + 1}${y + 1}`,
                        name: itc.name,
                        value: itc.value,
                        nodename: itc.nodename
                      };
                    })
                  : []
              });
            });
            break;
          case 'qyjy':
            listdata.forEach((it: any, i: number) => {
              tData.push({
                x: it.x,
                y: it.y,
                xh: `${i + 1}`,
                nodename: it.nodename,
                avgValue: it.avgValue,
                stname: it.stname,
                stValue: it.stValue
              });
            });
            break;
          case 'yqyj':
            listdata.forEach((it: any, i: number) => {
              tData.push({
                x: it.x,
                y: it.y,
                xh: `${i + 1}`,
                name: it.name,
                value: '',
                nodename: it.nodename,
                // eslint-disable-next-line max-nested-callbacks
                children: it.childs
                  ? it.childs.map((itc: any, y: any) => {
                      return {
                        x: itc.x,
                        y: itc.y,
                        xh: `${i + 1}${y + 1}`,
                        name: itc.name,
                        value: itc.value,
                        nodename: itc.nodename
                      };
                    })
                  : []
              });
            });
            break;
          default:
            break;
        }

        setData(tData);
      });
  }, [params, smallType, url]);

  function callback(key: any) {
    setSmallType(key);
  }

  const onChange = (val: any) => {
    setValue(val);
  };
  useEffect(() => {
    message.destroy();
    if (value.includes('等值线')) {
      if (!lineData) {
        result &&
          view &&
          requestLine(view, '等值线', result).then((result: any) => {
            if (result.length <= 0) {
              message.warning('等值线暂无数据');

              return;
            }
            const polygon = new Polygon({
              rings: jsonData.features[0].geometry.coordinates
            });

            setLineData(result);
            result.forEach((item: any) => {
              geometryEngineAsync.intersect(item.geometry, polygon).then((res) => {
                const polygonGraphic = new Graphic({
                  geometry: res,
                  symbol: slsymbol
                });
                equivalenceLine.add(polygonGraphic);
              });
            });

            equivalenceLine.visible = true;
          });
      } else {
        if (lineData.length <= 0) {
          message.warning('等值线暂无数据');
        } else {
          equivalenceLine.visible = true;
        }
      }
    } else {
      equivalenceLine.visible = false;
    }
    if (value.includes('等值面')) {
      if (!polygonData) {
        result &&
          view &&
          requestLine(view, '等值面', result).then((result: any) => {
            if (result.length <= 0) {
              message.warning('等值面暂无数据');
              setPolygonData([]);
              return;
            }

            const res = clipPolygon(result);
            equivalencePolygon.addMany(res);
            equivalencePolygon.visible = true;
            setPolygonData(res);
          });
      } else {
        if (polygonData && polygonData.length > 0) {
          equivalencePolygon.visible = true;
        } else if (polygonData && polygonData.length <= 0) {
          message.warning('等值面暂无数据');
        }
      }
    } else {
      equivalencePolygon.visible = false;
    }
  }, [value]);
  return (
    <section className="tablessyl">
      <div className="dw">
        <span>单位：mm</span>
        <div className="equivalence">
          <CheckboxGroup options={['等值线', '等值面']} value={value} onChange={onChange} />
        </div>
      </div>
      <Tabs defaultActiveKey="qbcz" onChange={callback}>
        {tabList.map((item) => {
          return (
            <TabPane tab={item.title} key={item.key}>
              <div className="cunstomtable">
                <Table
                  size="small"
                  rowClassName={(r: any, indx: number) => {
                    if (indx % 2 === 1) return 'bg-row';
                    else return '';
                  }}
                  columns={item.dataC}
                  dataSource={data}
                  pagination={false}
                  rowKey="xh"
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
    </section>
  );
};
export default TableSSYL;
