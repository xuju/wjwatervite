import Title from '@/components/Title';
import { typeList } from '@/pages/Demon/fun';
import React, { useState } from 'react';

import './index.less';

interface IProps {
  setPointType: Function;
  pointType: string | undefined;
  selectType: any;
}
export default function ConomyLeft(props: IProps) {
  const { pointType, setPointType, selectType } = props;

  const onClick = (item: { name: string }) => {
    if (pointType === item.name) {
      setPointType('');
    } else {
      setPointType(item);
    }
  };

  if (!selectType) return null;
  return (
    <div className="comomy-left-wrap left-bg">
      <Title text={`${selectType.name}简介`} />
      <div className="desc-wrap">
        <div className="desc-bg ">
          <img src={selectType.img} alt={selectType.name} />
        </div>
        <div
          className="desc-text global-scroll"
          dangerouslySetInnerHTML={{ __html: selectType.desc }}
        ></div>
      </div>
      <div className="line"></div>
      <div className="conomy-type-wrap">
        {typeList.map((item, index) => {
          return (
            <li
              key={index}
              className={[item.name === pointType ? 'select' : ''].join(' ')}
              onClick={() => onClick(item)}
            >
              <img src={item.name === pointType ? item.selectIcon : item.icon} alt="" />
              <span>{item.name}</span>
            </li>
          );
        })}
      </div>
    </div>
  );
}
