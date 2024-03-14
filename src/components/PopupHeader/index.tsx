import { Tooltip } from 'antd';
import React from 'react';
import './index.less';
interface IProps {
  title: string;
  list: string[];
  setSelectTypeList: Function;
  selectTypeList: string;
}
export default function PopupHeader(props: IProps) {
  const { title, list, selectTypeList, setSelectTypeList } = props;

  return (
    <div className="popup-header">
      <div className="popup-header-title">
        <Tooltip title={title}>{title}</Tooltip>
      </div>
      {list && list.length > 0 && (
        <div className="popup-header-list">
          {list.map((item, index) => {
            return (
              <div
                className={['popup-header-item', item === selectTypeList ? 'select' : ''].join(' ')}
                key={index}
                onClick={() => setSelectTypeList(item)}
              >
                {item}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
