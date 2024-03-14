import service from '@/axios';
import { usePageContext } from '@/store';
import { useGetLastLayer, useSelectLayerTable } from '@/utils/hooks';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { useRequest } from 'ahooks';
import { Form, Row, Col, Input, Button, Checkbox, Table, Tooltip } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import form from 'antd/lib/form';
import React, { useEffect, useState } from 'react';

import './index.less';
const CheckboxGroup = Checkbox.Group;
const initParams = { name: '', pageIndex: 1, pageSize: 1000000, bigtype: 0, id: '' };
const type = [
  { label: '雨水', value: 1 },
  { label: '污水', value: 2 },
  { label: '合流', value: 3 },
  { label: '其他', value: 4 }
];

interface ResultType {
  url: string;
  icon: string;
  bts: number;
  bzdl: string;
  bzdz: string;
  bzxl: string;
  id: string;
  index: number;
  name: string;
  x: string;
  y: string;
}

const addLayer = (arr: any, layers: GraphicsLayer) => {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    const filter = arr.filter((item: ResultType) => item.x === element.x && item.y === element.y);

    let Iconurl = element.icon.replace('.png', '_1.png');

    //重复数据  icon偏移一点
    if (filter.length > 1) {
      filter.forEach((f: ResultType, i: number) => {
        const point = new Point({
          x: Number(f.x),
          y: Number(f.y),
          spatialReference: new SpatialReference({ wkid: 4490 })
        });

        let symbol = new PictureMarkerSymbol({
          url: Iconurl,
          width: 18,
          height: 18,
          xoffset: 2 + i * 9,
          yoffset: -2
        });
        let graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: { ...f, OBJECTID: f.id }
        });
        layers.add(graphic);
      });

      continue;
    } else {
      const point = new Point({
        x: Number(element.x),
        y: Number(element.y),
        spatialReference: new SpatialReference({ wkid: 4490 })
      });
      let symbol = new PictureMarkerSymbol({
        url: Iconurl,
        width: 18,
        height: 18,
        xoffset: 2,
        yoffset: -2
      });
      let graphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: { ...element, OBJECTID: element.id }
      });
      layers.add(graphic);
    }
  }
};
export default function TablePumb() {
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const { dispatch, state } = usePageContext();
  const [params, setParams] = useState({ ...initParams });
  const [value, setValue] = useState<any[]>(type.map((item) => item.value));
  const curritem = useSelectLayerTable();
  const [result, setResult] = useState<any[]>([]);
  const [data, setData] = useState<any>();

  const [copyData, setCopyData] = useState<any>();
  const [layers] = useState<GraphicsLayer>(new GraphicsLayer({ id: 'pumdLayer' }));
  const { run } = useRequest((url) => service.post(url, params), {
    manual: true
  });
  useEffect(() => {
    if (state && state.view) {
      state.view.map.add(layers);
    }
  }, [state]);
  useEffect(() => {}, [data]);
  useEffect(() => {
    return () => layers.removeAll();
  }, []);
  useEffect(() => {
    setPage(1);
    layers.removeAll();

    if (result) {
      if (value.length > 0) {
        const filter = result.filter((f: any) => {
          return value.includes(Number(f.bzdl));
        });
        filter.forEach((item, index) => {
          item.index = index + 1;
        });

        setData({ ...data, listdata: [...filter] });
        addLayer(filter, layers);
      } else {
        setData({ ...data, listdata: [] });
      }
    }
  }, [value]);
  useEffect(() => {
    if (curritem && curritem.url1) {
      const config = JSON.parse(curritem.opconfig);

      run(curritem.url1).then((res) => {
        const temp = res.data.data.listdata;

        const { listColumn, listdata } = temp;
        setResult(listdata);
        listdata.forEach((item: any, index: number) => {
          item.index = index + 1;
          item.layerzwmc = curritem.layerzwmc;
          item.url = curritem.url1;
          item.icon = curritem.icon;
          item.modalVisible = config?.modalVisible ?? false;
          item.lyrtype = config?.lyrtype ?? '';
          item.listUrl = config?.listUrl ?? '';
          item.them = curritem?.layerzwmc ?? '';
        });
        addLayer(listdata, layers);

        let columns: any[] = [
          {
            title: '序号',
            dataIndex: 'index',
            width: 50
          }
        ];
        Object.keys(listColumn).forEach((keys) => {
          if (keys != 'x' && keys != 'y') {
            columns.push({
              title: listColumn[keys],
              dataIndex: keys,

              ellipsis: {
                showTitle: false
              },
              render: (text: any) => {
                return (
                  <Tooltip placement="left" title={text}>
                    {text}
                  </Tooltip>
                );
              }
            });
          }
        });

        temp.colums = columns;

        setData(temp);
        setCopyData(temp);
      });
    }
  }, [curritem, params]);

  const onFinish = (val: any) => {
    const { name } = val;
    setParams({ ...initParams, name });
  };
  const onChange = (val: CheckboxValueType[]) => {
    setValue(val);
  };
  return (
    <div className="TablePumb">
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
      <div className="pumb-type">
        <CheckboxGroup options={type} value={value} onChange={onChange} />
      </div>
      <div className="table-wrap">
        <div className="cunstomtable">
          <Table
            size="small"
            rowClassName={(r: any, indx: number) => {
              if (indx % 2 === 1) return 'bg-row';
              else return '';
            }}
            columns={data?.colums}
            dataSource={data?.listdata}
            pagination={{
              current: page,
              showSizeChanger: false,
              showTotal: (total) => `共${total}条数据`,
              onChange: (pages) => {
                setPage(pages);
              }
            }}
            rowKey="index"
            onRow={(record: any) => {
              return {
                onClick: (event) => {
                  dispatch({ type: 'point', data: record });
                }
              };
            }}
          />
        </div>
      </div>
    </div>
  );
}
