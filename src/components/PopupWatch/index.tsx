import service from '@/axios';
import { useRequest } from 'ahooks';
import { Button, DatePicker, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import DateFormat from '@/utils/dateFormat';
import './index.less';
import EchartsBox from '../EchartsBox';
import { EChartsOption } from 'echarts';

const { RangePicker } = DatePicker;

const lengend = [
  { name: '液位', color: 'rgb(10,207,255)', filed: 'q' },
  { name: '警戒液位', color: 'rgb(254,175,18)', filed: 'wrz' },
  { name: '冒溢警戒液位', color: 'red', filed: 'wrz_over' }

  // { name: '上限流量', color: 'rgb(234,255,120)', filed: 'ulq' },
  // { name: '下限流量', color: 'rgb(234,255,122)', filed: 'llq' }
];

//液位
const optionsFun = (data: any[]) => {
  const options: EChartsOption = {
    // 参考点位置及样式
    title: [
      {
        top: 30,
        left: 30,
        text: '液位(m)',
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'normal'
        }
      }
    ],
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 60
    },

    legend: {
      icon: 'circle',
      bottom: '0%',
      textStyle: {
        color: '#fff'
      }
    },
    // 设置游标提示
    tooltip: {
      trigger: 'axis',
      // 设置指示器样式
      axisPointer: {
        type: 'cross'
      },
      textStyle: {
        color: '#5c6c7c' // 文字颜色
      },
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // 背景颜色
      extraCssText: 'width: 170px', // 宽度
      formatter: (params: any) => {
        var res = `${params[0].name} <br/>`;
        for (const item of params) {
          if (item.value !== 0) {
            res += `<span style="background: ${item.color}; height:10px; width: 10px; border-radius: 50%;display: inline-block;margin-right:10px;"></span> ${item.seriesName} ：${item.value}<br/>`;
          }
        }
        return res;
      }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        // 设置 X 轴竖线颜色
        lineStyle: {
          color: '#DCE2E8'
        }
      },
      // 设置刻度样式
      axisTick: {
        show: false
      },
      axisLabel: {
        // 设置 X 轴文字颜色
        color: '#fff',
        formatter: (params: any) => {
          const day = moment(params).format('MM-DD');
          const hours = moment(params).format('HH:MM');

          return `${day}\n${hours}`;
        }
      },
      boundaryGap: false, // 两边是否留白
      data: data.map((m) => m.tm)
    },
    yAxis: [
      // 左边 Y 轴样式
      {
        type: 'value',
        // 设置刻度样式
        axisTick: {
          show: false
        },
        axisLine: {
          show: true, // 是否展示
          // 设置 Y 轴竖线颜色
          lineStyle: {
            color: '#102c42'
          }
        },
        axisLabel: {
          // 设置 Y 轴文字颜色
          color: '#fff'
        },
        //网格线
        splitLine: {
          lineStyle: {
            type: 'dashed', //设置网格线类型 dotted：虚线; solid:实线
            color: '#102c42'
          }
        },
        axisPointer: {
          // 取消 Y 轴辅助线
          show: false
        },
        // min: 1
      }
    ],
    series: lengend.map((item) => {
      return {
        name: item.name,
        data: data.map((m) => m[item.filed]),
        type: 'line',
        smooth: false, // 平滑，开启曲线
        hoverAnimation: false, // 取消鼠标经过圆点动画
        animation: false, // 圆点取消动画
        color: item.color,
        connectNulls: true
      };
    })
  };

  return options;
};

//流量
const optionsFun1 = (data: any[]) => {
  const options: EChartsOption = {
    // 参考点位置及样式
    title: [
      {
        top: 30,
        left: 30,
        text: '流量(m³/h)',
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'normal'
        }
      }
    ],
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 60
    },

    legend: {
      icon: 'circle',
      bottom: '0%',
      textStyle: {
        color: '#fff'
      }
    },
    // 设置游标提示
    tooltip: {
      trigger: 'axis',
      // 设置指示器样式
      axisPointer: {
        type: 'cross'
      },
      textStyle: {
        color: '#5c6c7c' // 文字颜色
      },
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // 背景颜色
      extraCssText: 'width: 170px' // 宽度
      // formatter: (params: any) => {
      //   var res = `${params[0].name} <br/>`;
      //   for (const item of params) {
      //     if (item.value !== 0) {
      //       res += `<span style="background: ${item.color}; height:10px; width: 10px; border-radius: 50%;display: inline-block;margin-right:10px;"></span> ${item.seriesName} ：${item.value}<br/>`;
      //     }
      //   }
      //   return res;
      // }
    },
    xAxis: {
      type: 'category',
      axisLine: {
        // 设置 X 轴竖线颜色
        lineStyle: {
          color: '#DCE2E8'
        }
      },
      // 设置刻度样式
      axisTick: {
        show: false
      },
      axisLabel: {
        // 设置 X 轴文字颜色
        color: '#fff',
        formatter: (params: any) => {
          const day = moment(params).format('MM-DD');
          const hours = moment(params).format('HH:MM');

          return `${day}\n${hours}`;
        }
      },
      boundaryGap: false, // 两边是否留白
      data: data.map((m) => m.tm)
    },
    yAxis: [
      // 左边 Y 轴样式
      {
        type: 'value',
        // 设置刻度样式
        axisTick: {
          show: false
        },
        axisLine: {
          show: true, // 是否展示
          // 设置 Y 轴竖线颜色
          lineStyle: {
            color: '#102c42'
          }
        },
        axisLabel: {
          // 设置 Y 轴文字颜色
          color: '#fff'
        },
        //网格线
        splitLine: {
          lineStyle: {
            type: 'dashed', //设置网格线类型 dotted：虚线; solid:实线
            color: '#102c42'
          }
        },
        axisPointer: {
          // 取消 Y 轴辅助线
          show: false
        },
        min: 1
      }
    ],

    series: [
      {
        name: '流量',
        type: 'line',
        color: 'rgb(72,255,119)',
        symbolSize: 9,
        smooth: false,

        data: data.map((m) => m.q)
      },

      {
        name: '上限流量',
        type: 'line',
        color: 'rgb(234,255,120)',
        symbolSize: 9,
        smooth: false,

        data: data.map((m) => {
          if (m.ulq === 0) {
            return '-';
          } else {
            return m.ulq;
          }
        })
      },
      {
        name: '下限流量',
        type: 'line',
        color: 'rgb(234,255,122)',
        symbolSize: 9,
        smooth: false,

        data: data.map((m) => {
          if (m.llq === 0) {
            return '-';
          } else {
            return m.llq;
          }
        })
      }
    ]
  };

  return options;
};

export default function PopupWatch(props: ModelAttrType) {
  const { attr } = props;
  const [timR, setTimeR] = useState<any>([
    moment(DateFormat.getAfterDay(), 'YYYY-MM-DD HH:mm'),
    moment(DateFormat.getCurrIntTime(), 'YYYY-MM-DD HH:mm')
  ]);

  const { run, data } = useRequest(
    () =>
      service.post(attr.url, {
        bigtype: 1,
        id: attr.OBJECTID,
        beginTime: timR ? moment(timR[0]).format('YYYY-MM-DD HH:mm:ss') : '',
        endTime: timR ? moment(timR[1]).format('YYYY-MM-DD HH:mm:ss') : ''
      }),
    { formatResult: (f) => f.data.data.popData.tableData }
  );
  const [options, setOptions] = useState<EChartsOption>();
  useEffect(() => {
    if (data && attr) {
      const { them } = attr;

      if (them === '液位监测') {
        let result = optionsFun(data.listdata) as unknown as EChartsOption;

        setOptions(result);
      } else if (them === '流量监测') {
        let result = optionsFun1(data.listdata) as unknown as EChartsOption;
        setOptions(result);
      }
    }
  }, [data]);

  const onclick = async () => {
    const result = await run();

    if (!result.listdata || result.listdata.length <= 0) {
      message.warning('暂无数据');
    }
    let options = optionsFun(result.listdata) as unknown as EChartsOption;

    setOptions(options);
  };
  return (
    <div className="popup-watch">
      <div className="search">
        <span className="label">时间: </span>
        <RangePicker showTime defaultValue={timR} onChange={(val) => setTimeR(val)} value={timR} />
        <Button style={{ marginLeft: '15px' }} onClick={onclick}>
          查询
        </Button>
      </div>
      <div className="popup-watch-echart-wrap">{options && <EchartsBox options={options} />}</div>
    </div>
  );
}
