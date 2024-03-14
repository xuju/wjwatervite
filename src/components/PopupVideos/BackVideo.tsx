import { Button, DatePicker } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import './index.less';
import { RangePickerProps } from 'antd/lib/date-picker';
import { BackVideo } from '@/utils/backVideo';

const { RangePicker } = DatePicker;
interface Props {
  id: string;
}
let startTime = moment().startOf('days');
export default function BackVideos(props: Props) {
  const { id } = props;
  const videoRef = useRef<BackVideo>(new BackVideo());
  const [backTime, setBackTime] = useState<any>([
    moment(startTime, 'YYYY-MM-DD HH:mm'),
    moment(new Date(), 'YYYY-MM-DD HH:mm')
  ]);
  // useEffect(() => {
  //   if (id && backTime.length >= 2) {
  //     const start = backTime[0].valueOf();
  //     const end = backTime[1].valueOf();
  //     if (!videoRef.current.oWebControl) {
  //       videoRef.current.initPlugin().then((res) => {
  //         videoRef.current.init(id, start, end);
  //         videoRef.current.look(id, start, end);
  //       });
  //     } else {
  //       // videoRef.current.look(id, start, end);
  //     }
  //   }
  // }, [id]);
  useEffect(() => {
    if (id && backTime.length >= 2) {
      const start = backTime[0].valueOf();
      const end = backTime[1].valueOf();
      videoRef.current.initPlugin().then((res) => {
        videoRef.current.init(id, start, end);
       
      });
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (!videoRef.current.oWebControl) return;
      videoRef.current.destory();
    };
  }, []);
  const timeChange = (val: any) => {
    if (val) {
      console.log(val, 'val');

      setBackTime(val);
    }
  };
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current >= moment().endOf('day');
  };
  const backClick = () => {
    const start = backTime[0].valueOf();
    const end = backTime[1].valueOf();
    videoRef.current.look(id, start, end);
  };
  const onOpenChange = (open: any) => {
    if (open) {
      videoRef.current.destory();
    } else {
      const start = backTime[0].valueOf();
      const end = backTime[1].valueOf();
      videoRef.current.initPlugin().then((res) => {
        videoRef.current.init(id, start, end);
      });
    }
  };
  return (
    <>
      <RangePicker
        showTime
        value={backTime}
        onOpenChange={onOpenChange}
        onChange={timeChange}
        format="MM-DD HH:mm:ss"
        className="cutsom-picker  "
        placement="topLeft"
        disabledDate={disabledDate}
      />
      {/* <Button onClick={backClick}>回放</Button> */}
      <div className="BackVideo" id="BackVideo"></div>
    </>
  );
}
