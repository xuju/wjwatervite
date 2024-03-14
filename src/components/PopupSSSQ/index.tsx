import React, { ReactElement, useEffect, useState } from 'react';
import { message, Tabs, DatePicker, Tooltip, Button } from 'antd';
import EchartsBox from '@/components/EchartsBox';
import { useRequest } from 'ahooks';
import service from '@/axios';
import './index.less';
import moment from 'moment';
import DateFormat from '@/utils/dateFormat';
import { EChartsOption } from 'echarts';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
interface TableCustomProp {
  column: string[];
  data: any[][];
}

const TableCustom = (props: TableCustomProp) => {
  const { column, data } = props;

  return (
    <div className="tablecustom">
      <div className="header">
        <div className="row">
          {column.map((item, index) => (
            <div key={index} className="cell">
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="body">
        {data.map((ite, x) => (
          <div className="row" key={x}>
            {ite.map((it, y) => (
              <div className="cell" style={{}} key={y}>
                <Tooltip placement="top" title={it}>
                  {it}
                </Tooltip>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
interface PopupSSSQProp {
  id: string;
  smallType: Number;
  url: string;
}

const PopupSSSQ = (props: PopupSSSQProp) => {
  const [data, setData] = useState<any>();
  const [tcolumn, setTcolumn] = useState<any[]>([]);
  const [tdata, setTdata] = useState<any[][]>([]);
  const [eChartsOption, setEChartsOption] = useState<any>();
  const [pmDom, setPmDom] = useState<ReactElement>();
  const [selectDay, setSelectDay] = useState<number>();
  // const [timR, setTimeR] = useState<any>([moment("2021-04-01 00:00:00", "YYYY-MM-DD HH:mm"), moment(DateFormat.getDay(), "YYYY-MM-DD HH:mm")]);
  const [timR, setTimeR] = useState<any>([
    moment(DateFormat.getAfterDay(), 'YYYY-MM-DD HH:mm'),
    moment(DateFormat.getCurrIntTime(), 'YYYY-MM-DD HH:mm')
  ]);
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });
  let { id, smallType, url } = props;

  useEffect(() => {
    if (!timR) return;
    let o = {
      beginTime: timR[0].format('YYYY-MM-DD HH:mm:ss'),
      endTime: timR[1].format('YYYY-MM-DD HH:mm:ss')
    };
    props &&
      run(url, { id: id, bigtype: 1, smallType: smallType, ...o })
        .then((res) => {
          // console.log(res.data.data.popData);
          setData(res.data.data.popData);
        })
        .catch((err) => {
          message.error(err);
        });
    return () => {};
  }, [props, timR]);

  useEffect(() => {
    if (data) {
      console.log(data,'data111',smallType,'smallType');
      if (data.tableData.listdata.length <= 0) {
        message.info('当前查询条件没有数据');
        return;
      }
      const optionB: EChartsOption = {
        title: {
          top: 30,
          left: 30,
          text: '水位(m)',
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
              let value = params[i].value;

              if (Number(value) != 0) {
                relVal += `<br/>${params[i].seriesName} : ${params[i].value} m`;
              } else {
                relVal += '';
              }

              // relVal += `<br/>${params[i].seriesName} : ${params[i].value} m`;
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
          },
          min: 1
        }
      };
      // zz 闸泵站
      if (smallType === 1) {
        // let legendData = Object.values(data.echartsData.listColumn);
        let legendData = ['圩内水位', '圩外水位', '圩内警戒', '圩外警戒'];
        let xAxisData = data.tableData.listdata.map((e: any) => e['tm'].replace('T', ' '));
        let colors = ['#08cfff', '#31db63', '#ff0000', '#ff0000'];
        const option = {
          ...optionB,
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
            data: legendData
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
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
              name: legendData[0],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[0],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['down'])
            },
            {
              name: legendData[1],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[1],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['up'])
            },
            {
              name: legendData[2],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[2],
                width: 2
              },

              data: data.tableData.listdata.map((e: any) => e['wrz'])
            },
            {
              name: legendData[3],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[3],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['wrz']),
              markPoint: {
                data: [{ type: 'max', name: '圩外警戒值' }]
              }
            }
          ]
        };
        setEChartsOption(option);
        setTcolumn(['时间', '圩内水位(米)', '圩外水位(米)']);
        let tData: [][] = data.tableData.listdata
          .map((item: any) => {
            const up = item['up'] ?? '';
            const tm = item['tm'] ?? '';
            const down = item['down'] ?? '';
            let itA = [tm, down === 0 ? '' : down, up === 0 ? '' : up];
            // let itA = Object.values(item).splice(1,3);
            return itA.map((it: any) => it.toString());
          })
          .reverse();
        setTdata(tData);
        let indexD = data.tableData.listdata.length - 1;
        setPmDom(
          <div>
            <div className="tzbody" />
            <div
              className="swimg left"
              style={{ height: data.tableData.listdata[indexD].down * 60, maxHeight: ' 339px' }}
            />
            <div
              className="swimg right"
              style={{ height: data.tableData.listdata[indexD].up * 60, maxHeight: ' 339px' }}
            />
            <div
              className="swvalue left"
              style={{ bottom: data.tableData.listdata[indexD].down * 60 }}
            >
              {Number(data.tableData.listdata[indexD].down) != 0
                ? data.tableData.listdata[indexD].down + 'm(圩内水位)'
                : ''}
            </div>
            <div
              className="swvalue right"
              style={{ bottom: data.tableData.listdata[indexD].up * 60 }}
            >
              {Number(data.tableData.listdata[indexD].up) != 0
                ? data.tableData.listdata[indexD].up + 'm(圩外水位)'
                : ''}
            </div>
            <div
              className="swjjvalue left"
              style={{ bottom: data.tableData.listdata[indexD].wrz * 60 }}
            >
              {Number(data.tableData.listdata[indexD].wrz) != 0
                ? data.tableData.listdata[indexD].wrz + 'm(圩内警戒)'
                : ''}
            </div>
            <div
              className="swjjvalue right"
              style={{ bottom: data.tableData.listdata[indexD].wrz * 60 }}
            >
              {Number(data.tableData.listdata[indexD].wrz) != 0
                ? data.tableData.listdata[indexD].wrz + 'm(圩外警戒)'
                : ''}
            </div>
            <div className="swwz left" style={{ bottom: '70%' }}>
              圩 内
            </div>
            <div className="swwz right" style={{ bottom: '70%' }}>
              圩 外
            </div>
          </div>
        );
      }
      // hd 水位 
      if (smallType === 2) {
        let legendData = ['水位', '警戒水位', '保证水位'];
        let colors = ['#2dcc70', '#ff0000', '#ffff00'];
        let option = {
          ...optionB,
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
            data: legendData
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.tableData.listdata.map((e: any) => e['tm'].replace('T', ' ')),
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
              name: legendData[0],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[0],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['down']),
              markPoint: {
                data: [{ type: 'max', name: '水位' }]
              }
            },
            {
              name: legendData[1],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[1],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['wrz'])
            },
            {
              name: legendData[2],
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: {
                color: colors[2],
                width: 2
              },
              data: data.tableData.listdata.map((e: any) => e['grz']),
              markPoint: {
                data: [{ type: 'max', name: '保证水位' }]
              }
            }
          ]
        };
        setEChartsOption(option);
        setTcolumn(['时间', '水位(米)']);
        let indexD = data.tableData.listdata.length - 1;
        let tData: [][] = data.tableData.listdata
          .map((item: any) => {
            let it: any[] = [];
            it.push(item.tm.toString().replace('T', ' '));
            if (item.down == 0) {
              item.down = '';
            }
            it.push(item.down);
            return it;
          })
          .reverse();
        console.log(tData,'401');

        setTdata(tData);
        setPmDom(
          <div className='sqpopbody'>
            <div className="hdbody" />
            <div className="hdsw" style={{ height: data.tableData.listdata[indexD].down * 60 }} />
            <div
              className="hdswvalue"
              style={{ bottom: data.tableData.listdata[indexD].down * 60 }}
            >
              {data.tableData.listdata[indexD].down.toFixed(2)}m(水位)
            </div>
            <div className="hdbzvalue" style={{ bottom: data.tableData.listdata[indexD].grz * 60 }}>
              {data.tableData.listdata[indexD].grz}m(保证水位)
            </div>
            <div className="hdjjvalue" style={{ bottom: data.tableData.listdata[indexD].wrz * 60 }}>
              {data.tableData.listdata[indexD].wrz}m(警戒水位)
            </div>
          </div>
        );
      }
    }
    return () => {};
  }, [data, smallType]);
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
    <div className="sssqpopu">
      <Tabs defaultActiveKey="1" type="card" size="middle">
        <TabPane tab="剖面图" key="1">
          {pmDom}
        </TabPane>
        <TabPane tab="过程线(水位)" key="2">
          <div className="leftEchart">
            {data && eChartsOption && <EchartsBox options={eChartsOption} />}
          </div>
          <div className="rightTable">
            {' '}
            <div id="swtable" />
            <TableCustom column={tcolumn} data={tdata} />
          </div>
        </TabPane>
      </Tabs>
      <div className="datapart">
        <span className="label">时间: </span>
        <RangePicker showTime onChange={(val) => setTimeR(val)} value={timR} />

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
      </div>
    </div>
  );
};

export default PopupSSSQ;
