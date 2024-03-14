import service from '@/axios';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Descriptions } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import './index.less';
interface Props {
  data: any;
  customAttr?: any;
}

export default function FeaturePopup(props: Props) {
  const { data, customAttr } = props;

  const { data: detailData, run } = useRequest((url, params) => service.post(url, params), {
    manual: true
  });
  const [attrObj, setAttrObj] = useState<any>();

  useEffect(() => {
    if (data && data.url) {
      const params: any = { id: data.OBJECTID, bigtype: 1 };
      if (data.layerzwmc === '提升泵站') {
        params.bzdl = data.bzdl;
      } else {
        delete params.bzdl;
      }
      run(data.url, params).then((result) => {
        if (result && result.data && result.data.code == 200) {
          let tem = result.data.data.popData.tableData;

          const { listColumn, listdata } = tem;
          setAttrObj({
            colums: listColumn,
            attr: listdata
          });
        }
      });
    }
  }, [data]);

  return (
    <div className="FeaturePopup">
      <div className="PopupModal">
        {customAttr && customAttr.attr && (
          <Descriptions bordered column={2} size="small">
            {attrObj &&
              Object.keys(attrObj.colums)?.map((item, idx) => {
                if (item != 'x' && item != 'y' && customAttr.attr.includes(attrObj.colums[item])) {
                  if (item === 'is_gate_station' || item === 'is_sleeve_gate') {
                    return (
                      <Descriptions.Item label={attrObj.colums[item]} key={idx}>
                        {attrObj.attr[item] === '0' ? '否' : '是'}
                      </Descriptions.Item>
                    );
                  } else {
                    return (
                      <Descriptions.Item label={attrObj.colums[item]} key={idx}>
                        {attrObj.attr[item]}
                      </Descriptions.Item>
                    );
                  }
                }
              })}
          </Descriptions>
        )}
        {!customAttr && (
          <Descriptions bordered column={2} size="small">
            {attrObj &&
              Object.keys(attrObj.colums)?.map((item, idx) => {
                if (item != 'x' && item != 'y') {
                  return (
                    <Descriptions.Item label={attrObj.colums[item]} key={idx}>
                      {attrObj.attr[item]}
                    </Descriptions.Item>
                  );
                }
              })}
          </Descriptions>
        )}
      </div>
    </div>
  );
}
