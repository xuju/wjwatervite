import React, { memo, useEffect, useMemo, useState } from 'react';
import service from '@/axios';
import { usePageContext } from '@/store';
import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, Row, Table } from 'antd';
import _ from 'lodash';
import './index.less';
import { useSelectLayerTable } from '@/utils/hooks';
import { groupLayer1 } from '../BusinessRight';
import { generateUUID } from '@/utils';

const townsJH = (data: any[], config: any) => {
  const { layerzwmc } = config;
  const find = groupLayer1.find((f) => f.name === layerzwmc);
  if (find) {
    let datas = _.groupBy(data, find?.group ?? '');

    const result = [];
    let id = 0;
    for (const key in datas) {
      const item = datas[key];
      let keys = find.group;
      if (layerzwmc === '重点排水户') {
        keys = 'name';
      }
      id++;
      result.push({
        [keys]: key + `(${item.length})`,
        ids: id,
        key: generateUUID(),
        children: item.map((item, index) => {
          item.key = index;
          item.ids = index + 1;
          item.key = generateUUID();
          item.geoType = config.geoType;
          item.layerIds = config.layerIds;
          item.queryUrl = config.queryUrl;

          return item;
        })
      });
    }

    return result;
  }
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
const unFiles = ['id', '经度', '维度', 'x', 'y', '编号', '纬度'];
function GroupTable() {
  const [form] = Form.useForm();
  const [column, setColumn] = useState<any[]>();

  const [params, setParams] = useState({ ...initParams });
  const { dispatch } = usePageContext();

  const lastLayer = useSelectLayerTable();

  const searchName = useMemo(() => {
    if (lastLayer && lastLayer.layerzwmc === '提质增效达标区') {
      return '编码';
    } else {
      return '名称';
    }
  }, [lastLayer]);

  const [total, setTotal] = useState(0);
  const { data, loading } = useRequest(() => service.post(lastLayer.url1, params), {
    ready: lastLayer && lastLayer.url1 ? true : false,
    refreshDeps: [params, lastLayer?.url1],
    formatResult: (res) => {
      console.log(res, 'res');

      const result = res.data.data.listdata;
      const datas = result.listdata;
      const listColumn = result.listColumn;
      const newColums: any[] = [{ title: '编号', dataIndex: 'ids', width: 50 }];
      Object.entries(listColumn).map((item) => {
        const key = item[0] as string;
        const value = item[1] as string;
        if (!unFiles.includes(value)) {
          let temp: any = {
            title: value,
            dataIndex: key
          };

          if (value === '名称') {
            temp.width = 100;
          }
          newColums.push(temp);
        }
      });

      setColumn(newColums);

      setTotal(result.dataCount);
      const temp = townsJH(datas, geoType);
      console.log(temp, 'temp');

      return {
        datas: temp
      } as any;
    },
    onError: (e) => {
      console.log(e, 'e');
    }
  });

  const geoType = useMemo(() => {
    if (lastLayer && lastLayer.opconfig) {
      return {
        queryUrl: lastLayer.url,

        layerzwmc: lastLayer.layerzwmc
      };
    } else {
      return {};
    }
    return {};
  }, [lastLayer]);
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
  };

  const tableClick = async (record: any) => {
    dispatch({ type: 'point', data: record });
  };
  return (
    <>
      <div className="TableTowns">
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
        <div className="cunstomtable">
          <div className="total">总数：{total}</div>
          <Table
            size="small"
            rowClassName={rowClassName}
            loading={loading}
            dataSource={data?.datas}
            columns={column}
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
            scroll={{ y: 500 }}
            onRow={(record: any) => {
              record.layerNames = lastLayer.layerzwmc;

              return {
                onClick: () => tableClick(record)
              };
            }}
          />
        </div>
      </div>
    </>
  );
}
export default memo(GroupTable);
