import service from '@/axios';
import { PlayVideo } from '@/utils/playVideo';
import useRequest from '@ahooksjs/use-request';
import { Empty, message, Radio, RadioChangeEvent } from 'antd';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

const size = {
  width: 782,
  height: 508
};

interface Props {
  list: any[];
}
export default function PopupSP(props: Props) {
  const { list } = props;
  const [value, setValue] = useState('');
  const oWebControl = useRef<any>();
  const videoRef = useRef<PlayVideo | null>(null);
  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    if (list && list.length) {
      setValue(list[0].camerauuid);
    } else {
      setValue('');
    }
  }, [list]);
  useEffect(() => {
    videoRef.current = new PlayVideo({ size });
  }, []);

  useEffect(() => {
    if (value) {
      if (videoRef.current) {
        if (!videoRef.current.oWebControl) {
          videoRef.current.initPlugin().then((res) => {
            videoRef.current && videoRef.current.init(value);
            videoRef.current && videoRef.current.look(value);
          });
        } else {
          videoRef.current && videoRef.current.look(value);
        }
      }
    }
  }, [value]);
  useEffect(() => {
    return () => {
      message.destroy();
      if (videoRef.current) {
        videoRef.current.destory();
      }
    };
  }, []);
  return (
    <div className="QXWZVideo">
      <div className="q-left">
        <div id="playWnd" className="playWnd" />
      </div>
      <div className="q-right  global-scroll">
        <div className="q-title">视频列表</div>
        <div className="q-list-wrap">
          {list && list.length ? (
            <Radio.Group onChange={onChange} value={value}>
              {list.map((item) => {
                return (
                  <Radio value={item.camerauuid} key={item.camerauuid}>
                    {item.vname}
                  </Radio>
                );
              })}
            </Radio.Group>
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
}
