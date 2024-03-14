import { legendList } from '@/pages/Command/WaterDisaster/fun';
import React from 'react';
import './index.less';

export const ylList = [
  // { name: '轻微积水', color: '#41B3F5', range: '(5cm≤Z<15cm)' },
  // { name: '一般积水', color: '#E4D04B', range: '(15cm≤Z<30cm)' },
  // { name: '较大积水', color: '#E77B24', range: '(30cm≤Z<50cm)' },
  // { name: '严重积水', color: '#D72626', range: '(Z≥50cm)' }
  { name: '轻微积水', color: '#0abe06', range: '(0cm<Z<15cm)' },
  { name: '低风险', color: '#41B3F5', range: '(15cm≤Z<27cm)' },
  { name: '中风险', color: '#E4D04B', range: '(27cm≤Z<40cm)' },
  { name: '较高风险', color: '#E77B24', range: '(40cm≤Z<60cm)' },
  { name: '高风险', color: '#D72626', range: '(Z≥60cm)' }
];

export default function CommandLegend() {
  return (
    <div className="command-legend">
      <div className="legend-wrap">
        <div className="legend-title">图例</div>
        <div className="ylpoint-wrap ">
          <div className="yl-title">易涝点图例</div>
          <div className="yl-legend-wrap">
            {ylList.map((item, index) => {
              return (
                <li key={index}>
                  <span className="circle" style={{ backgroundColor: item.color }}></span>
                  <span className="y-title">{item.name}</span>
                </li>
              );
            })}
          </div>
        </div>
        <div className="ylpoint-wrap fearture">
          <div className="yl-title">周边相关要素图例</div>
          <div className="yl-legend-wrap">
            {legendList.map((item, index) => {
              if (item.hidden) return;
              return (
                <li key={index}>
                  <span className="circle" style={{ backgroundColor: item.color }}></span>
                  <span className="y-title">{item.title}</span>
                </li>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
