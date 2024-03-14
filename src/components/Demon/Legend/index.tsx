import React from 'react';
import img1 from './images/1.png';
import img2 from './images/2.png';
import './index.less';

const legendList = [
  { name: '清淤疏浚', type: 'line', color: '#D02C25' },
  { name: '近岸湿地带', type: 'image', icon: img1 },
  { name: '岸坡整治', type: 'line', color: '#44DA09' },
  { name: '河湖清障', type: 'circle', color: '#9000FF' },
  { name: '堤防建设', type: 'line', color: '#EAB119' },
  { name: '河湖管护', type: 'circle', color: '#00B5F6' },
  { name: '一级步道', type: 'image', icon: img2 },
  { name: '人工浮床', type: 'circle', color: '#44DA09' }
];
export default function DemonLegend() {
  return (
    <div className="DemonLegend">
      <div className="title">图例</div>
      {legendList.map((item) => {
        return (
          <div className="legend-item">
            {item.type === 'line' && (
              <div className="baseleft  line" style={{ background: item.color }}></div>
            )}
            {item.type === 'circle' && (
              <div className="baseleft">
                <div className="circle" style={{ backgroundColor: item.color }}></div>
              </div>
            )}
            {item.type === 'image' && (
              <div className="baseleft  image">
                <img src={item.icon} alt="" />
              </div>
            )}

            <div className="name">{item.name}</div>
          </div>
        );
      })}
    </div>
  );
}
