import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import service from '@/axios';

import { usePageContext } from '@/store';

import { generateUUID, hightLayer, returnClickQuery, tableClickQuery } from '@/utils';

import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, Modal, Row, Table } from 'antd';
import _ from 'lodash';

import './index.less';
import { useGetLastLayer, useSelectLayerTable, useView } from '@/utils/hooks';
import Point from '@arcgis/core/geometry/Point';

import PopupModal from '../PopupModal';
import FeaturePopup from '../FeaturePopup';
import { popupAttrs } from '@/config';
const townsJH = (data: any[], config: any) => {
  let datas = _.groupBy(data, 'townname');
  const result = [];
  let id = 0;
  for (const key in datas) {
    const item = datas[key];
    id++;
    result.push({
      name: key + `(${item.length})`,
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
function TableOnlyTowns() {
  const [form] = Form.useForm();
  const view = useView();
  const [attr, setAttr] = useState<any>();
  const [params, setParams] = useState({ ...initParams });
  const { dispatch } = usePageContext();
  const [attrList, setAttrList] = useState<any>(); //根据前端定义的字段展示
  const lastLayer = useSelectLayerTable();
  const [ready, setReady] = useState(false);
  const timer = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (timer && timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      if (lastLayer && lastLayer.url1) {
        setReady(true);
      } else {
        setReady(false);
      }
    }, 1000);
    return () => {
      if (timer && timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [lastLayer]);
  const [total, setTotal] = useState(0);
  const { data, loading } = useRequest(() => service.post(lastLayer.url1, params), {
    ready: ready,

    refreshDeps: [params, lastLayer?.url1],
    formatResult: (res) => {
      const result = res.data.data.listdata;
      const datas = result.listdata;

      setTotal(result.dataCount);
      return {
        datas: townsJH(datas, geoType)
      } as any;
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
    const { layerNames, x, y, geoType, id, queryUrl, name } = record;

    dispatch({ type: 'point', data: record });
    // //显示大弹窗
    // if (showModalLayer.includes(layerNames)) {
    //   setAttr({
    //     url: queryUrl,
    //     OBJECTID: id,
    //     name,
    //     layerNames
    //   });
    //   const findLayerAttr = popupAttrs.find((f) => f.name === layerNames);

    //   if (findLayerAttr) {
    //     setAttrList(findLayerAttr);
    //   }
    // }
  };

  const onCancel = () => {
    setAttr(null);
  };
  return (
    <>
      <div className="TableOnlyTowns">
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
        <div className="cunstomtable">
          <div className="total">总数：{total}</div>
          <Table
            size="small"
            rowClassName={rowClassName}
            loading={loading}
            dataSource={data?.datas}
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

      <Modal
        title={attr ? attr.name : ''}
        className="popup-modal"
        centered
        footer={null}
        visible={attr ? true : false}
        onCancel={onCancel}
        width={904}
      >
        <div className="PopupModal  TableOnlyTowns-wrap  global-scroll">
          <FeaturePopup data={{ ...attr }} customAttr={attrList} />
        </div>
      </Modal>
    </>
  );
}
export default memo(TableOnlyTowns);
