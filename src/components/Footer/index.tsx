import React from 'react';
import './index.less';
const arr = [0, 1, 2, 3];
export default function Footer() {
  return (
    <div className="footer-wrap">
      <div className="f-left-line f-line"></div>
      <div className="f-right-line f-line"></div>
      <div className="f-img-linear"></div>
      <div className="f-circle circle-left">
        {arr.map((item, index) => {
          return (
            <span key={item} style={{ animation: ` ciecle ${index + 3}s infinite linear` }}></span>
          );
        })}
      </div>
      <div className="f-circle circle-right">
        {arr.map((item, index) => {
          return (
            <span
              key={item}
              style={{ animation: ` ciecle 0.${index + 1}s infinite linear` }}
            ></span>
          );
        })}
      </div>
    </div>
  );
}
