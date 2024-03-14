import { isNull } from '@/utils';
import { useView } from '@/utils/hooks';
import { Button, Modal } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import './index.less';
import service from '@/axios';
import { demonLayer } from '@/config';
interface Props {
  data: any[];
}
const isShowBtn = ['北府港清淤疏浚', '北府港闸改造', '夹港里整治'];
const render = (dom: HTMLDivElement, x: number, y: number) => {
  if (!dom) return;
  const { clientWidth, clientHeight } = dom;
  dom.style.left = x - clientWidth / 2 + 'px';
  dom.style.top = y - clientHeight - 20 + 'px';
};
export default function DemonPopup(props: Props) {
  const { data } = props;
  const view = useView();
  const [index, setIndex] = useState(0);
  const [modalData, setModalData] = useState<any>(null);
  const current = useMemo(() => {
    if (data) {
      return data[index];
    }
  }, [index, data]);
  useEffect(() => {
    if (data && view) {
      const current = data[index];
      const { mapPoint } = current;
      const screen = view.toScreen(mapPoint);
      let dom = document.getElementById('DemonPopup') as HTMLDivElement;
      render(dom, screen.x, screen.y);
      view.watch('extent', () => {
        const screen = view.toScreen(mapPoint);
        render(dom, screen.x, screen.y);
      });
    }
  }, [data, view, index]);
  const iconClick = (type: string) => {
    let temp = index;
    if (type === 'left') {
      if (temp <= 0) {
        temp = 0;
      } else {
        temp--;
      }
    } else {
      if (temp >= data.length - 1) {
        temp = data.length - 1;
      } else {
        temp++;
      }
    }
    setIndex(temp);
  };
  const onClick = async () => {
    const result = await service.post(`${demonLayer.queryDetail}?id=${current['名称']}`);
    if (result && result.status == 200 && result.data) {
      let res = result.data.data;
      setModalData(res);
    }
  };
  const onCancel = () => {
    setModalData(null);
  };
  return (
    <>
      <div className="DemonPopup" id="DemonPopup">
        <div className="title">{isNull(current['名称'])}</div>
        <div className="content">{isNull(current['工程内容'])}</div>
        {isShowBtn.includes(current['名称']) && (
          <div className="Btn" onClick={onClick}>
            查看成果
          </div>
        )}
        <div className="icon">
          <div className="left" onClick={() => iconClick('left')}>
            <LeftOutlined />
          </div>
          <div className="num">
            {index + 1}/{data.length}
          </div>
          <div className="right" onClick={() => iconClick('right')}>
            <RightOutlined />
          </div>
        </div>
      </div>
      {modalData && (
        <Modal
          title={modalData.name}
          className="popup-modal  demon-popup"
          centered
          footer={null}
          visible={modalData ? true : false}
          onCancel={onCancel}
          width={904}
        >
          <div className="demon-popup-content">
            <div className="img-wrap">
              {modalData.pic &&
                modalData.pic.map((item: any) => {
                  return (
                    <div className="img-item" key={item.url}>
                      <img src={item.url} alt={item.name} />
                      <div className="title">{item.name}</div>
                    </div>
                  );
                })}
            </div>
            <div className="desc">{modalData.des}</div>
          </div>
        </Modal>
      )}
    </>
  );
}
