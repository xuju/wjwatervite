import React, { useEffect, useState } from 'react';
import { message, DatePicker, Row, Col, Radio, Table } from 'antd';
import EchartsBox from '@/components/EchartsBox';
import { useRequest } from 'ahooks';
import service from '@/axios';
import './index.less';
import moment from 'moment';
import DateFormat from '@/utils/dateFormat';
const { RangePicker } = DatePicker;

const PopupSSYL = (props: { id: string; url: string; attr: any }) => {
  const [type, setType] = useState<string>('hour');
  const [dataSource, setDataSource] = useState<{ key: number; tm: any; value: any }[]>([]);
  const [eChartsOption, setEChartsOption] = useState<any>({});
  const [timR, setTimeR] = useState<any>([
    moment(DateFormat.getAfterDay(), 'YYYY-MM-DD HH:mm'),
    moment(DateFormat.getCurrIntTime(), 'YYYY-MM-DD HH:mm')
  ]);
  const [selectDay, setSelectDay] = useState<number>();
  let { id, url } = props;
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });
  useEffect(() => {
    if (!timR) return;

    let o = {
      beginTime: timR[0].format('YYYY-MM-DD HH:mm:ss'),
      endTime: timR[1].format('YYYY-MM-DD HH:mm:ss')
    };
    props &&
      run(url, { id: id, bigtype: 1, ...o })
        .then((res) => {
          let reData = res.data.data.popData.tableData.listdata;

          let tData: { key: number; tm: any; value: any }[] = [];
          reData
            .filter((el: { type: string }) => el.type === type)
            .forEach((e: any, index: number) => {
              let timer;
              if (type === 'month') timer = moment(e.tm).format('YYYY-MM');
              if (type === 'day') timer = moment(e.tm).format('YYYY-MM-DD');
              if (type === 'hour') timer = moment(e.tm).format('YYYY-MM-DD HH:mm:ss');
              tData.push({ key: index, tm: timer, value: e.value });
            });
          tData = tData.reverse();

          setDataSource(tData);
          const optionsData = [...tData].reverse();
          const option = {
            title: {
              top: 30,
              left: 30,
              text: '雨量(mm)',
              textStyle: {
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 'normal'
              }
            },
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(0,40,82,0.5)',
              borderColor: 'rgba(0,40,82,0.5)',
              textStyle: {
                color: '#fff'
              },
              axisPointer: {
                type: 'cross',
                lineStyle: {
                  color: 'rgba(255,255,255,0.5)',
                  type: 'dotted'
                }
              },
              formatter: (params: any) => {
                let relVal = params[0].name;
                for (let i = 0, l = params.length; i < l; i++) {
                  relVal += `<br/>${params[i].seriesName} : ${params[i].value} mm`;
                }
                return relVal;
              }
            },
            grid: {
              left: 60,
              right: 60,
              top: 60,
              bottom: 60
            },
            yAxis: {
              type: 'value',
              max: function (value: { max: number }) {
                // eslint-disable-next-line radix
                return parseInt(`${value.max * 1.5}`);
              },
              axisTick: {
                show: false
              },
              axisLine: {
                show: true
              },
              splitLine: {
                lineStyle: {
                  color: '#102c42',
                  type: 'dotted'
                }
              }
            },
            legend: {
              top: 20,
              show: true,
              orient: 'horizontal',
              textStyle: {
                color: '#ffffff',
                fontSize: 12
              },
              itemStyle: {
                opacity: 0
              },
              data: ['雨量']
            },
            xAxis: {
              type: 'category',
              boundaryGap: true,
              data: optionsData.map((e: any) => e['tm'].replace('T', ' ')),
              axisLabel: {
                formatter: function (val: string) {
                  return val.split(' ').join('\n');
                }
              },
              axisTick: {
                inside: true
              }
            },
            series: [
              {
                name: '雨量',
                type: 'bar',
                smooth: true,
                symbol: 'none',
                lineStyle: {
                  color: '#00f3ffe0',
                  width: 2
                },
                barWidth: 5,
                data: optionsData.map((e: any) => e['value'])
              }
            ]
          };

          setEChartsOption(option);
        })
        .catch((err) => {
          message.error(err);
        });
    return () => {};
  }, [props, timR, type]);

  const columns = [
    {
      title: '时间',
      dataIndex: 'tm',
      key: 'tm'
    },
    {
      title: '雨量/预报雨量(mm)',
      dataIndex: 'value',
      key: 'value'
    }
  ];

  const onChange = (e: any) => {
    setType(e.target.value);
  };
  const changeTime = (day: string) => {
    let last3 = moment(moment().subtract('days', 3), 'YYYY-MM-DD 08:00:00');
    let last7 = moment(moment().subtract('days', 7), 'YYYY-MM-DD 08:00:00');
    let lart30 = moment(moment().subtract('days', 29), 'YYYY-MM-DD 08:00:00');

    let endTime = timR[1];
    if (day === '三天') {
      setTimeR([last3, endTime]);
      setSelectDay(0);
    }
    if (day === '七天') {
      setTimeR([last7, endTime]);
      setSelectDay(1);
    }
    if (day === '一月') {
      setTimeR([lart30, endTime]);
      setSelectDay(2);
    }
  };
  return (
    <div className="ssylpopu">
      <Row style={{ borderBottom: '1px solid #0092979e', height: '40px', lineHeight: '40px' }}>
        <Col span={13}>
          <span className="label">时间: </span>
          <RangePicker showTime value={timR} onChange={(val) => setTimeR(val)} />
        </Col>
        <Col span={3}>
          <div className="select-btn-day">
            <div
              className={['btn-item', selectDay === 0 ? 'select-day' : ''].join(' ')}
              onClick={() => changeTime('三天')}
            >
              三天
            </div>
            <div
              className={['btn-item', selectDay === 1 ? 'select-day' : ''].join(' ')}
              onClick={() => changeTime('七天')}
            >
              七天
            </div>
            <div
              className={['btn-item', selectDay === 2 ? 'select-day' : ''].join(' ')}
              onClick={() => changeTime('一月')}
            >
              一月
            </div>
          </div>
        </Col>
        <Col span={7} offset={1}>
          <Radio.Group defaultValue="hour" buttonStyle="solid" onChange={onChange}>
            <Radio.Button value="hour">小时雨量</Radio.Button>
            <Radio.Button value="day">日雨量</Radio.Button>
            <Radio.Button value="month">月雨量</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      <Row style={{ flexGrow: 1 }}>
        <Col span={16} style={{ borderRight: '1px solid #0092979e' }}>
          <EchartsBox options={eChartsOption} />
        </Col>
        <Col span={8}>
          <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ y: 415 }} />
        </Col>
      </Row>
    </div>
  );
};

export default PopupSSYL;
