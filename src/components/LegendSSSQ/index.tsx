import React from 'react';
import './index.less';
import cj from './images/超警_1.png';
import hd from './images/河道_1.png';
import sz from './images/水闸_1.png';
import hdcj from './images/河道超警_1.png';
import tzzx1 from '@/assets/images/提质增效达标区_1.png';
import { ylList } from '../CommandLegend';
import { supplyType } from '../TableSupply';
import { waterBaselistType } from '../TableWaterBase';
import { Tooltip } from 'antd';
const LegendSSSQ = () => {
  return (
    <div className="legendsssq">
      <li className="title">水情图例</li>
      <ul>
        <li>
          <img src={cj} /> 闸泵超警
        </li>
        <li>
          <img src={hdcj} /> 河道超警
        </li>
        <li>
          <img src={sz} /> 闸泵站
        </li>
        <li>
          <img src={hd} /> 河道站
        </li>
      </ul>
    </div>
  );
};

const LegendYLZD = () => {
  return (
    <div className="legendYLZD">
      <li className="title">易涝站点</li>
      <ul>
        {ylList.map((item, index) => {
          return (
            <li key={index}>
              <span className="circle-color" style={{ backgroundColor: `${item.color}` }}></span>
              <span className="legend-name" style={{ marginRight: '20px', marginLeft: '10px' }}>
                {item.name}
              </span>
              <span>{item.range}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const LegendSSYL = (props: { data?: any[] }) => {
  const { data } = props;

  if (!data) return null;
  return (
    <div className="legendssyl">
      <li>雨情图例</li>
      <ul>
        {/* <li><img src={cj} /> 闸泵超警</li>
            <li><img src={hdcj} /> 河道超警</li>
            <li><img src={sz} /> 闸泵站</li>
            <li><img src={hd} /> 河道站</li> */}
        {data.map((item, index) => {
          return (
            <li key={index}>
              <span style={{ backgroundColor: `rgb${item.color}` }}></span>
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
const LegendSYGL = () => {
  return (
    <div className="legendsygl">
      <li>水域管理范围线图例</li>
      <ul>
        <li>
          <span className="line"></span>
          <span className="name">基准线</span>
        </li>
        <li>
          <span className="line-manger"></span>
          <span className="name">管理范围线</span>
        </li>
      </ul>
    </div>
  );
};

const LegendTZCX = () => {
  const data = [
    { name: '2020', color: '#00FEFE' },
    { name: '2021', color: '#FF01FE' },
    { name: '2022', color: '#FFFF02' },
    { name: '2023', color: '#00FE01' }
  ];
  return (
    <div className="LegendBDBYD">
      <li>提质增效达标区</li>
      <ul>
        {data.map((item) => {
          return (
            <li>
              <span className="bg" style={{ background: item.color }}></span>
              <span className="name">{item.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
const LegendGSGW = () => {
  return (
    <div className=" LegendGSGW">
      <li>供水管网图例</li>
      <ul>
        {supplyType.map((item) => {
          return (
            <li>
              <span className="bg" style={{ background: item.color }}></span>
              <span className="name">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const LegendWaterBase = () => {
  return (
    <div className="LegendWaterBase">
      <li>水务基础设施空间布局规划</li>
      <ul>
        {waterBaselistType.map((item) => {
          return (
            <li>
              <span className="bg" style={{ background: item.color }}></span>
              <span className="name">
                <Tooltip title={item.label}>{item.label}</Tooltip>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export { LegendSSSQ, LegendSSYL, LegendYLZD, LegendSYGL, LegendTZCX, LegendGSGW, LegendWaterBase };
