import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

export default function PopupsAttrs({ data }: { data: any }) {
  const unit = useMemo(() => {
    if (data.them === '实时水情') {
      return 'm';
    } else if (data.them === '易涝站点') {
      return 'cm';
    } else if (data.them === '实时雨量') {
      return 'mm';
    } else {
      return '';
    }
  }, [data]);

  if (data?.them === '视频监控') {
    return (
      <div className={['PopupsAttrs', data.them].join(' ')}>
        <div>{data?.name}</div>
      </div>
    );
  }
  if (data?.them === '实时水情') {
    return (
      <div className="PopupsAttrs">
        <div>
          {data.stnm ?? data.name}&nbsp;{data.down ?? data.drp ?? data.z}
          {unit}
        </div>
      </div>
    );
  }
  return (
    <div className="PopupsAttrs">
      <div>
        {data.stnm ?? data.name}&nbsp;{data.down ?? data.drp ?? data.z}
        {unit}
      </div>
      <div>{moment(data.tm).format('YYYY-MM-DD HH:DD:SS')}</div>
    </div>
  );
}
