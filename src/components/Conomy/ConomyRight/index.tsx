import Title from '@/components/Title';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import './index.less';
import EchartsBox from '@/components/EchartsBox';
import { EChartsOption } from 'echarts';
import _ from 'lodash';
import { Spin } from 'antd';

const companyOption = (data: any[]): EChartsOption => {
  data = _.sortBy(data, (s) => {
    return -s.value;
  });

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },

    grid: {
      top: '15%',
      right: '8%',
      left: '0%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map((m) => m.name),
        axisLine: {
          lineStyle: {
            color: '#FFFFFF'
          }
        },
        axisLabel: {
          margin: 10,
          color: '#e2e9ff',
          fontSize: 14,
          interval: 0,
          rotate: 40
        },
        axisTick: {
          show: false
        }
      }
    ],
    yAxis: [
      {
        axisLabel: {
          formatter: '{value}',
          color: '#e2e9ff'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)'
          }
        }
      },
      {
        name: '单位(家)',
        position: 'right',

        nameTextStyle: {
          color: '#fff',
          fontSize: 12
        }
      }
    ],
    series: [
      {
        type: 'bar',
        data: data,
        barWidth: '14px',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 1,
                color: '#ED8B35' // 0% 处的颜色
              },
              {
                offset: 0,
                color: '#F7D37F' // 100% 处的颜色
              }
            ],
            false
          )
        },
        label: {
          show: true,
          lineHeight: 30,
          formatter: '{c}',
          position: 'top',
          color: '#74EDFC'
        }
      }
    ]
  };
};

const generateDotted: any = (color = lineColor) => {
  let dataArr = [];
  for (var i = 0; i < 100; i++) {
    if (i % 2 === 0) {
      dataArr.push({
        name: (i + 1).toString(),
        value: 25,
        itemStyle: {
          normal: {
            color: color,
            borderWidth: 0,
            borderColor: 'rgba(0,0,0,0)'
          }
        }
      });
    } else {
      dataArr.push({
        name: (i + 1).toString(),
        value: 20,
        itemStyle: {
          normal: {
            color: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: 'rgba(0,0,0,0)'
          }
        }
      });
    }
  }

  return dataArr;
};
const indeustryOption = (data: any): EChartsOption => {
  data = _.sortBy(data, function (n) {
    return -n.value;
  });
  const maxArr: number[] = [];
  let max = Math.max.apply(
    Math,
    data.map(function (o: any) {
      return o.value;
    })
  );
  data.forEach(() => maxArr.push(max));
  const unit = '家';

  return {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item'
    },
    color: '#8A45E9',
    grid: {
      borderWidth: 0,
      top: '10%',
      left: '5%',
      right: '15%',
      bottom: '3%'
    },
    yAxis: [
      {
        type: 'category',

        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: false,
          inside: false
        },
        data: data
      },
      {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          inside: false,
          color: '#fff',
          fontSize: '14',
          fontFamily: 'PingFangSC-Regular',
          formatter: (val: any) => {
            return `${val}${unit}`;
          }
        },
        splitArea: {
          show: false
        },
        splitLine: {
          show: false
        },
        data: data
      }
    ],
    xAxis: {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    series: [
      {
        // 辅助系列
        type: 'bar',
        barGap: '-100%',
        silent: true,
        itemStyle: {
          color: 'rgba(255, 255, 254, 0.2)'
        },
        barWidth: '10px',
        data: maxArr
      },
      {
        name: '',
        type: 'bar',
        zlevel: 2,
        barWidth: '10px',
        data: data,
        animationDuration: 1500,
        label: {
          color: '#fff',
          show: true,
          position: [0, '-24px'],
          fontSize: 16,
          formatter: function (a: { name: string }) {
            return a.name;
          }
        }
      }
    ]
  };
};

const lineColor = '#0042FF';
const circleOptions = (data: any[]): EChartsOption => {
  const numArr = data.map((item) => item.value);
  const maxNum = Math.max(...numArr);
  const maxArr: number[] = [];
  data.forEach((item) => {
    maxArr.push(maxNum);
  });

  const color = [
    new echarts.graphic.LinearGradient(0, 1, 0, 0, [
      {
        offset: 0,
        color: '#50A459'
      },
      {
        offset: 1,
        color: '#D3FD91'
      }
    ]),
    new echarts.graphic.LinearGradient(0, 1, 0, 0, [
      {
        offset: 0,
        color: '#0056FF'
      },
      {
        offset: 1,
        color: '#01A1FF'
      }
    ])
  ];
  return {
    color: color,
    title: {
      text: '人口\n占比',
      left: 'center',
      top: 'center',
      textStyle: {
        fontWeight: 'bold',
        color: '#F7DC8D',
        fontSize: 18
      }
    },
    grid: {
      top: '15%',
      left: 0,
      right: '1%',
      bottom: 5,
      containLabel: true
    },
    tooltip: {
      show: true,
      formatter: '{a}<br/>{b}:{c}人'
    },
    series: [
      {
        name: '周边人口占比',
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['45%', '65%'],

        label: {
          // padding: [0, -50, 0, -50],
          formatter: function (params) {
            let total = 0;
            data.forEach((item) => {
              total += item.value;
            });
            let percen = ((Number(params.value) / total) * 100).toFixed(0) + '%';
            if (params.name !== '') {
              return '{name|' + params.name + '}' + '\n\n{value|' + percen + '}';
            } else {
              return '';
            }
          },

          rich: {
            name: {
              fontSize: 14,
              color: '#fff'
            },
            value: {
              fontSize: 14,
              color: '#fff'
            }
          }
        },
        labelLine: {
          show: true,
          // length: 30,
          length2: 30
        },
        data: data
      },
      {
        name: '內园1',
        type: 'pie',

        silent: true,
        radius: ['30%', '31%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          color: lineColor
        },
        data: maxArr
      },
      {
        name: '內园虚线',
        type: 'pie',

        silent: true,
        radius: ['35%', '36%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          color: '#0042FF'
        },
        data: generateDotted()
      },
      {
        name: '外圆1',
        type: 'pie',

        silent: true,
        radius: ['75%', '76%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          color: lineColor
        },
        data: maxArr
      },
      {
        name: '外圆虚线',
        type: 'pie',
        startAngle: 50,
        silent: true,
        radius: ['85%', '86%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          color: lineColor
        },
        data: generateDotted()
      },
      {
        name: '外圆虚线1',
        type: 'pie',
        startAngle: 50,
        silent: true,
        radius: ['95%', '96%'],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          color: lineColor
        },
        data: generateDotted('rgba(0,66,255,0.5)')
      }
    ]
  };
};
function ConomyRight(props: { echartData: any }) {
  const { echartData } = props;

 

  const options1 = useMemo(() => {
    return echartData && companyOption(echartData.filter((f: any) => f.type === '周边企业'));
  }, [echartData]);
  const options2 = useMemo(() => {
    return echartData && circleOptions(echartData.filter((f: any) => f.type === '周边人口'));
  }, [echartData]);
  const options3 = useMemo(() => {
    return echartData && indeustryOption(echartData.filter((f: any) => f.type === '周边产业'));
  }, [echartData]);
  return (
    <div className="conomy-right-wrap right-bg">
      {echartData ? (
        <>
          <div className="company-wrap">
            <Title text="周边企业" />
            <div className="echarts-wrap">
              <EchartsBox options={options1} />
            </div>
          </div>
          <div className="people-wwrap">
            <Title text="周边人口" />
            <EchartsBox options={options2}  />
          </div>
          <div className="cy-wrap">
            <Title text="周边产业" />
            <EchartsBox options={options3} />
          </div>
        </>
      ) : (
        <Spin />
      )}
    </div>
  );
}
export default memo(ConomyRight);
