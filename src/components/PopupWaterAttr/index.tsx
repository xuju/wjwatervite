import moment from 'moment';
import React, { useMemo } from 'react';
import './index.less';

const deleteNull = (str: string) => {
  if (!str || str == 'null') {
    return '';
  } else {
    return str;
  }
};
interface Props {
  data: any;
}
export default function PopupWaterAttr(props: Props) {
  const { data } = props;
  const formatTime = useMemo(() => {
    if (data && data.tstamp && data.tstamp != 'null') {
      return moment(data.tstamp).format('YYYY-MM-DD');
    } else {
      return '';
    }
  }, []);
  return (
    <div className="PopupWaterAttr">
      <div>{data?.name}</div>
      <div>ph:{deleteNull(data?.zad_data1)}</div>
      <div>高锰酸盐:{deleteNull(data?.zad_data6)}</div>
      <div>氨氮:{deleteNull(data?.zad_data7)}</div>

      <div>总磷:{deleteNull(data?.zad_data8)}</div>
      <div>总氨:{deleteNull(data?.zad_data9)}</div>
      <div>监测时间: {formatTime}</div>
    </div>
  );
}
