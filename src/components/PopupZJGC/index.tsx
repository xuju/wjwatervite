import service from '@/axios';
import { useRequest } from 'ahooks';
import React from 'react';
import Base from './Base';
import ProjectDynamic from './ProjectDynamic';
import Security from './Security';
import './index.less';
import { Spin } from 'antd';
export default function PopupZJGC(props: ModelAttrType) {
  const { attr, type } = props;
  const { data } = useRequest(() => service.post(attr.url, { bigtype: 1, id: attr.OBJECTID }), {
    formatResult: (f) => f.data.data.popData.tableData
  });
  if (!data) return <Spin />;

  return (
    <div className="popup-zjgc">
      {type === '基础信息' && <Base data={data.listdata.baseinfo} />}
      {type === '项目建设动态' && <ProjectDynamic />}
      {type === '安全隐患' && <Security />}
    </div>
  );
}
