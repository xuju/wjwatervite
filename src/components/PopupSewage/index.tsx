import service from '@/axios';
import useRequest from '@ahooksjs/use-request';
import { Badge, Col, Descriptions, Row, DatePicker } from 'antd';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
const { RangePicker } = DatePicker;
import './index.less';
export default function PopupSewage(props: any) {
  const { attr, type } = props;
  const { url, OBJECTID: id } = attr;

  const [params, setParams] = useState({
    beginTime: moment(new Date()).format('YYYY-MM-DD HH:00:00'),
    name: '',
    id: '',
    bigtype: 1
  });
  const { data } = useRequest(
    () =>
      service.post(url, {
        ...params,
        id
      }),
    {
      ready: url && id,
      formatResult: (data) => data.data.data.popData.tableData,
      refreshDeps: [params]
    }
  );

  if (data) {
    {
      data &&
        data.listdata &&
        Object.entries(data.listdata.indata).map(([key, value]: any) => {
          return (
            <Descriptions.Item label={data.listColumn[key]} span={2}>
              {value}
            </Descriptions.Item>
          );
        });
    }
  }
  const listdata = useMemo(() => {
    if (data) {
      return data.listdata;
    }
  }, [data]);

  const onChange = (value: any) => {
    const time = moment(value).format('YYYY-MM-DD HH:00:00');
    setParams({ ...params, beginTime: time });
  };
  const format = 'YYYY-MM-DD HH:00:00';
  return (
    <div className="PopupSewage  global-scroll">
      {type === '基础信息' && (
        <Descriptions bordered size="small">
          {data &&
            data.listdata &&
            Object.entries(data.listdata.basicdata).map(([key, value]: any) => {
              if (data.listColumn[key] === '建成时间' || data.listColumn[key] === '投产时间') {
                value = moment(value).format('YYYY-MM-DD');
              }
              return (
                <Descriptions.Item label={data.listColumn[key]} span={2}>
                  {value}
                </Descriptions.Item>
              );
            })}
        </Descriptions>
      )}
      {type === '监测信息' && (
        <Row gutter={16}>
          <Col span={24}>
            <div className="search">
              <DatePicker
                showTime
                value={moment(params.beginTime)}
                format={format}
                onChange={onChange}
              />
            </div>
            <div className="sewage">
              <div className="sewage-left">
                <div className="sewage-title">进水参数:</div>
                <Descriptions bordered size="small">
                  {listdata &&
                    Object.entries(listdata.indata).map(([key, value]: any) => {
                      return (
                        <Descriptions.Item label={data.listColumn[key]} span={2}>
                          {value === '0001-01-01 00:00:00' ? '-' : value}
                        </Descriptions.Item>
                      );
                    })}
                  {(!listdata || !listdata.indata) && <div>暂无数据</div>}
                </Descriptions>
              </div>

              <div className="sewage-right">
                <div className="sewage-title">出水参数:</div>
                <Descriptions bordered size="small">
                  {listdata &&
                    listdata.outdata &&
                    Object.entries(listdata.outdata).map(([key, value]: any) => {
                      return (
                        <Descriptions.Item label={data.listColumn[key]} span={2}>
                          {value === '0001-01-01 00:00:00' ? '-' : value}
                        </Descriptions.Item>
                      );
                    })}
                  {(!listdata || !listdata.outdata) && <div>暂无数据</div>}
                </Descriptions>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}
