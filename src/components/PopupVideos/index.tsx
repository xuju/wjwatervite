import service from '@/axios';
import { PlayVideo } from '@/utils/playVideo';
import useRequest from '@ahooksjs/use-request';
import { message, Modal, Pagination } from 'antd';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import BackVideos from './BackVideo';
import './index.less';
import Video from './Video';

export default function PopupVideos(props: { attr: any[]; setAttr: any }) {
  const { attr, setAttr } = props;
  const [type, setType] = useState<'视频监控' | '视频回放'>('视频监控');
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(1);

  const [cameraID, setCamearId] = useState('');
  const current = useMemo(() => {
    if (attr && attr.length) {
      setVisible(true);
      const num = index - 1;
      if (attr[num]) {
        return attr[num];
      }
    } else {
      setVisible(false);
    }
  }, [attr, index]);

  const { run } = useRequest(() => service.post(current.url, { bigtype: 1, id: current.id }), {
    manual: true
  });

  const CustomHeader = (props: any) => {
    const { title } = props;
    return (
      <div className="CustomHeader">
        <div className="title">{title}</div>
        <div className="c-type-wrap">
          <div
            className={['c-type-item', type === '视频监控' ? 'select' : ''].join(' ')}
            onClick={() => {
              setType('视频监控');
              setIndex(1);
            }}
          >
            视频监控
          </div>
          <div
            className={['c-type-item', type === '视频回放' ? 'select' : ''].join(' ')}
            onClick={() => {
              setType('视频回放');
              setIndex(1);
            }}
          >
            视频回放
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    if (current && current.url && current.id) {
      run()
        .then((res) => {
          if (res && res.data && res.data.code == 200) {
            let camerauuid = res.data.data.popData.tableData.listdata.camerauuid;

            if (camerauuid) {
              setCamearId(camerauuid);
            } else {
              message.destroy();
              message.warning('视频点位暂无ID');
            }
          }
        })
        .catch((e) => {
          console.log(e);
          message.destroy();
          message.warning('获取视频ID出错');
        });
    }

    return () => {
      message.destroy();
    };
  }, [current]);

  const onChange = (page: number) => {
    setIndex(page);
  };
  const onCancel = () => {
    setVisible(false);
    setType('视频监控');
    setAttr([]);
  };
  return (
    <Modal
      destroyOnClose={true}
      title={current && current.name && <CustomHeader />}
      className={['businesspopup   video-modal'].join(' ')}
      footer={null}
      visible={visible}
      onCancel={onCancel}
      width={904}
      centered
    >
      <div className="popupsp">
        {cameraID && type === '视频监控' && <Video id={cameraID} />}
        {cameraID && type === '视频回放' && <BackVideos id={cameraID} />}
        <div className="custom-pagation">
          <Pagination
            current={index}
            size="small"
            onChange={onChange}
            pageSize={1}
            total={attr.length}
          />
        </div>
      </div>
    </Modal>
  );
}
