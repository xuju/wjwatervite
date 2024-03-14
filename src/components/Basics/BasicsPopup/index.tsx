import React, { useMemo, useState } from 'react';

import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import './index.less';
import { popupAttrs } from '@/config';
import { usePageContext } from '@/store';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
interface IProps {
  data: any[];
  colseCallback?: Function;
}
export default function BasicsPopup(props: IProps) {
  const { data, colseCallback } = props;
  const [index, setIndex] = useState(0);

  const layerName = useMemo(() => {
    if (data) {
      return data[index].layerName;
    }
  }, [index, data]);

  const attrs = useMemo(() => {
    const find = popupAttrs.find((f) => f.name === layerName);

    if (find) return find.attr;
    return null;
  }, [layerName]);

  if (!data) return null;
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
    const length = data.length - 1;
    if (idx >= length) {
      idx = length;
    } else {
      idx++;
    }
    setIndex(idx);
  };
  const close = () => {
    colseCallback && colseCallback();
    let dom = document.getElementById('basics-coustom-popup-wrap');
    let dom1 = document.getElementById('demon-coustom-popup-wrap');
    if (dom) dom.remove();
    if (dom1) dom1.remove();
  };
  return (
    <div className="basics-coustom-popup  ">
      <div className="basics-coustom-wrap global-scroll">
        <div className="close">
          <CloseOutlined onClick={close} />
        </div>
        {data && data.length > 1 && (
          <div className="basics-btn-wrap">
            <LeftOutlined className="popup-prev" onClick={prev} />
            {index + 1}/{data.length}
            <RightOutlined className="popup-next" onClick={next} />
          </div>
        )}
        <div className="title">{data[index].layerName}</div>
        <div className="basics-popup-context">
          {!attrs &&
            Object.entries(data[index]).map((result: any[], ids: number) => {
              let includeChina: boolean = window.escape(result[0]).indexOf('%u') < 0;
              if (!includeChina) {
                return (
                  <li key={ids}>
                    {result[0]}：{result[1] === 'Null' ? '-' : result[1]}
                  </li>
                );
              }
            })}
          {attrs &&
            Object.entries(data[index]).map((result: any[], ids: number) => {
              const keys = result[0];

              if (attrs.includes(keys)) {
                return (
                  <li key={ids}>
                    {result[0]}：{result[1] === 'Null' ? '-' : result[1]}
                  </li>
                );
              }
            })}
        </div>
      </div>
    </div>
  );
}
