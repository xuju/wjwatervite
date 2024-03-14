import { popupAttrs, videourl } from '@/config';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal } from 'antd';
import React, { useMemo, useState } from 'react';
import './index.less';
interface Props {
  data: any[];
  setResponse: Function;
}
const toFixed = ['河道长度（km）', '水域面积（k㎡）', '已建成生态河道（公里）', '总长度（公里）'];
const getValue = (data: any, attr: string) => {
  if (data && attr && data[attr]) {
    if (data[attr] === 'Null') {
      return '-';
    } else {
      if (toFixed.includes(attr) && data[attr]) {
        return (data[attr] * 1).toFixed(2);
      } else {
        return data[attr];
      }
    }
  } else {
    if (data[attr] === 0) return 0;
    return '';
  }
};
export default function PopupModal(props: Props) {
  const { data, setResponse } = props;
  const [index, setIndex] = useState(0);
  const [videoShow, setVideoShow] = useState<any>();
  const layerName = useMemo(() => {
    if (data && data.length > 0) {
      return data[index]?.layerName;
    } else {
      return '';
    }
  }, [index, data]);

  const attrs = useMemo(() => {
    const find = popupAttrs.find((f) => f.name === layerName);

    if (find) return find.attr;
    return [];
  }, [layerName]);

  const titleAttr = useMemo(() => {
    const find = popupAttrs.find((f) => f.name === layerName);
    if (find && find.title) {
      return find.title;
    }
  }, [layerName]);

  const title = useMemo(() => {
    if (data && data.length > 0 && titleAttr) {
      const current = data[index];

      if (current[titleAttr]) {
        return current[titleAttr];
      } else {
        return '';
      }
    }
  }, [index, data, titleAttr]);
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
  const onCancel = () => {
    setResponse([]);
    setIndex(0);
    setVideoShow(null);
  };
  const seeVideo = () => {
    const name = data[index]['湖泊名称'];

    const url = `${videourl}/${name}/视频/${name}.mp4`;

    setVideoShow({
      url,
      name
    });
  };
  return (
    <>
      <Modal
        title={title === 'Null' ? '-' : title}
        className="popup-modal"
        centered
        footer={null}
        visible={data && data.length > 0}
        onCancel={onCancel}
        width={904}
      >
        <div className="PopupModal">
          <Descriptions bordered column={2} size="small">
            {attrs?.map((item, idx) => {
              return (
                <Descriptions.Item label={item} key={idx}>
                  {getValue(data[index], item)}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
          <div className="PopupModal-btn-wrap">
            {layerName === '湖泊' && (
              <Button size="small" onClick={seeVideo}>
                湖泊视频
              </Button>
            )}
            <div className="right-pagation">
              <LeftOutlined className="popup-prev" onClick={prev} />
              {index + 1}/{data.length}
              <RightOutlined className="popup-next" onClick={next} />
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title={videoShow?.name}
        className="popup-modal"
        centered
        footer={null}
        visible={videoShow ? true : false}
        onCancel={() => setVideoShow(null)}
        width={904}
        zIndex={10000}
        destroyOnClose
      >
        <div className="video-wraps">
          <video controls autoPlay muted>
            <source src={videoShow?.url} type="video/mp4" />
          </video>
        </div>
      </Modal>
    </>
  );
}
