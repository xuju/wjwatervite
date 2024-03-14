import service from '@/axios';
import { useRequest } from 'ahooks';
import React, { useMemo } from 'react';
import { Descriptions, Spin } from 'antd';
import './index.less';
import QXWZVideo from './Video';

export default function PopupQXWZ(prop: ModelAttrType) {
  const { attr, type } = prop;
  const { data } = useRequest(() => service.post(attr.url, { bigtype: 1, id: attr.OBJECTID }), {
    formatResult: (f) => f.data.data.popData.tableData
  });
  const videoList = useMemo(() => {
    if (data) {
      return data.listdata.videoList;
    } else {
      return [];
    }
  }, [data]);

  if (!data) return <Spin />;
  const { listColumn, listdata } = data;
  if (type === '视频监控') {
    return <QXWZVideo list={videoList} />;
  } else {
    return (
      <div className="popup-qxwz global-scroll">
        <div className="title">物资点基础信息</div>
        <Descriptions bordered size="small" className="popup-qxwz-desc">
          <Descriptions.Item label={listColumn.wzdname} span={2}>
            {listdata.baseInfo.wzdname ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={listColumn.loc} span={2}>
            {listdata.baseInfo.loc ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={listColumn.fzr} span={2}>
            {listdata.baseInfo.fzr ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={listColumn.phone} span={2}>
            {listdata.baseInfo.phone ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={listColumn.address} span={2}>
            {listdata.baseInfo.address ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={listColumn.updatetime} span={2}>
            {listdata.baseInfo.updatetime ?? '-'}
          </Descriptions.Item>
        </Descriptions>
        <div className="title  list-title">物资列表</div>
        <div className="list-wrap ">
          <div className="list-header">
            <div className="list-header-title">物资名称</div>
            <div className="list-header-title">数量</div>
            <div className="list-header-title">单位</div>
          </div>
          {listdata.baseList.map(
            (item: { wzname: string; num: number; unit: string }, index: number) => {
              return (
                <div className="list-table-wrap" key={index}>
                  <div className="list-table-item">{item.wzname}</div>
                  <div className="list-table-item">{item.num}</div>
                  <div className="list-table-item">{item.unit}</div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  }
}
