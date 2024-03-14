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

export default function PopupQSZL(props: Props) {
  const { data } = props;
  const [index, setIndex] = useState(0);
  const { run } = useRequest((url, params) => service.post(url, params), {
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
      console.log(data, 'data');

      run(data.url, params).then((result) => {
        console.log(result);

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
  const prev = () => {
    let idx = index;
    if (idx <= 0) {
      idx = 0;
    } else {
      idx--;
    }

    setIndex(idx);
  };
  const next = () => {
    let idx = index;

    const length = attrObj.attr.length - 1;
    if (idx >= length) {
      idx = length;
    } else {
      idx++;
    }

    setIndex(idx);
  };
  return (
    <div className="PopupQSZL">
      <div className="PopupModal">
        <Descriptions bordered column={2} size="small">
          {attrObj &&
            Object.keys(attrObj.colums)?.map((item, idx) => {
              console.log(attrObj.attr, 'attrObj.attr[item]');

              if (item != 'x' && item != 'y') {
                return (
                  <Descriptions.Item label={attrObj.colums[item]} key={idx}>
                    {attrObj.attr[index][item]}
                  </Descriptions.Item>
                );
              }
            })}
        </Descriptions>
        <div className="PopupModal-btn-wrap">
          <LeftOutlined className="popup-prev" onClick={prev} />
          {index + 1}/{attrObj?.attr.length ?? 0}
          <RightOutlined className="popup-next" onClick={next} />
        </div>
      </div>
    </div>
  );
}
