import service from '@/axios';
import { basics, commandApi, projectID } from '@/config';
import { useLayerContext } from '@/store/layer';
import { useRequest } from 'ahooks';
import { Checkbox, Spin } from 'antd';
import React, { memo, useState } from 'react';
import './index.less';

interface Props {
  data: any[];
}
function BasicsLayer(props: Props) {
  const { data } = props;
  const { state, dispatch } = useLayerContext();
  const onChange = (checkedValues: any) => {
    dispatch({ type: 'setList', data: { list: checkedValues } });
  };

  return (
    <div className="basic-layer">
      <Checkbox.Group onChange={onChange}>
        <Spin spinning={data ? false : true}>
          {data &&
            data.map((item, index) => {
              return (
                <Checkbox value={item} key={index}>
                  <div className="check-right-wrap">
                    <img src={item.icon} alt="" width={14} height={14} />
                    {item.layerzwmc}
                  </div>
                </Checkbox>
              );
            })}
        </Spin>
      </Checkbox.Group>
    </div>
  );
}
export default memo(BasicsLayer);
