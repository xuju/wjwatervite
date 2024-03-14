import EchartsBox from '@/components/EchartsBox';
import { Spin, Image, Modal, Table, Tooltip, Carousel, Empty } from 'antd';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import zoomImg from './images/zoom.png';
import './index.less';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import wsclimg from './images/污水处理厂.png';
import pwqyimg from './images/工业废水企业.png';
import pwkimg from './images/入河排污口.png';
import Title from '@/components/Title';
import { useRequest } from 'ahooks';
import { basics } from '@/config';
import service from '@/axios';
import moment from 'moment';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
const imgArr = [wsclimg, pwqyimg, pwkimg];
const ZoomImg = () => {
  return <img src={zoomImg} className="zoom-img" />;
};
const StationOptions = (data: any[]): EChartsOption => {
  let name: string[] = [];
  let number: number[] = [];
  let maxArr: number[] = [];
  data.forEach((item) => name.push(item.title));
  data.forEach((item) => number.push(item.value));
  let max = Math.max.apply(null, number);

  data.forEach((item) => maxArr.push(max));

  const option: EChartsOption = {
    grid: {
      left: '0%',
      right: '0%',
      bottom: '-10%',
      top: '0%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      formatter: function (params: any) {
        return `${params[0].axisValue}:${params[0].data}`;
      }
    },

    xAxis: {
      show: false,
      type: 'value'
    },
    yAxis: [
      {
        type: 'category',
        inverse: true,
        axisLabel: {
          show: true,
          color: '#fff',
          fontSize: 14
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        data: name
      },
      {
        type: 'category',
        inverse: true,
        axisTick: 'none',
        axisLine: {
          show: false
        },
        show: true,
        axisLabel: {
          color: '#ffffff',
          fontSize: '14',
          formatter: function (value: number) {
            return value + '个';
          }
        },
        data: number
      }
    ],
    series: [
      {
        name: '数量',
        type: 'bar',
        zlevel: 1,
        itemStyle: {
          borderRadius: 30,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: '#FFA422'
            },
            {
              offset: 1,
              color: '#FF7902'
            }
          ])
        },
        barWidth: 4,
        data: number
      },
      {
        name: '背景',
        type: 'bar',
        barWidth: 4,
        barGap: '-100%',
        data: maxArr,
        itemStyle: {
          color: '#0d1e2f',
          borderRadius: 30
        }
      }
    ]
  };

  return option;
};
const initParams = {
  name: 'string',
  bigtype: 0,
  pageIndex: 1,
  pageSize: 10
};
const rowClassName = (r: any, indx: number) => {
  let className = '';

  if (indx % 2 === 1) {
    className += 'bg-row ';
  }
  if (r.roworder == 0 && r.wrz != 0) {
    className += ' danger-row';
  }
  return className;
};
const formateData = (res: any, params: any) => {
  const temp = res.data.data.listdata;

  const { dataCount, listColumn, listdata } = temp;

  let column: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 50,
      render: (text: string, record: any, index: number) => {
        return <span>{(params.pageIndex - 1) * params.pageSize + (index + 1)}</span>;
      }
    }
  ];
  Object.keys(listColumn).forEach((item) => {
    if (item === 'jcsj' || item === 'tcsj') {
      column.push({
        title: listColumn[item],
        dataIndex: item,
        width: 100,
        render: (text: string) => {
          if (text) {
            return moment(text).format('YYYY-MM-DD');
          } else {
            return '';
          }
        }
      });
    } else if (item === 'iwd') {
      column.push({
        title: listColumn[item],
        dataIndex: item,
        width: 100,
        ellipsis: {
          showTitle: false
        },
        render: (text: string) => {
          if (text) {
            if (!Number.isNaN(Number(text))) {
              return <Tooltip title={text}>{Number(text).toFixed(3)}</Tooltip>;
            } else {
              return <Tooltip title={text}>{text}</Tooltip>;
            }
          } else {
            return '';
          }
        }
      });
    } else if (item === 'name') {
      column.push({
        title: listColumn[item],
        dataIndex: item,
        width: 230,
        ellipsis: {
          showTitle: false
        },
        render: (text: string) => {
          return <Tooltip title={text}>{text}</Tooltip>;
        }
      });
    } else {
      if (item != 'objectid' && item != 'lgtd' && item != 'lttd') {
        column.push({
          title: listColumn[item],
          dataIndex: item,
          width: 100,
          ellipsis: {
            showTitle: false
          },
          render: (text: string) => {
            return <Tooltip title={text}>{text}</Tooltip>;
          }
        });
      }
    }
  });
  return {
    total: dataCount,
    column,
    data: listdata
  };
};
function BasicsRight(props: { data: any }) {
  const { data } = props;
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [params, setParams] = useState(initParams);
  const [type, setType] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y)
    });
  };
  const scaleImg = (minImg: string) => {
    let img = minImg.replace('.png', '1.png');

    return img;
  };
  const { run: waterRun } = useRequest((par) => service.post(basics.GetWaterProjectList, par), {
    manual: true
  });
  const [result, setRes] = useState<any>();
  const options: any = useMemo(() => {
    if (data && data.length > 0) {
      return StationOptions(data[1].childs);
    }
  }, [data]);
  console.log(data, 'data');

  useEffect(() => {
    if (type) {
      if (category) {
        waterRun({ ...params, name: category }).then((res) => {
          if (res.data && res.data.data) {
            let result = formateData(res, params);

            setRes(result);
          }
        });
      }
    }
  }, [category, params, type]);
  const onClick = (r: any, clickType: string) => {
    setType(clickType);
    setVisible(true);
    const { title } = r;
    setCategory(title);
  };
  const onCancel = () => {
    setVisible(false);
    setType('');
    setCategory('');
    setParams({ ...initParams });
  };
  const positionImg = useMemo(() => {
    let arr: string[] = [];
    if (data && data.length) {
      const first = data[0].value;
      if (first) {
        arr = first.split(',');
      }
    }
    return arr;
  }, [data]);
  console.log(positionImg, 'positionImg');

  if (!data || data.length <= 0) {
    return <div></div>;
  }
  return (
    <div className="basics-right">
      {data ? (
        <>
          <div className="img-wrap  b-right-wrap">
            <Title text={data[0].title} />
            <div className="img">
              {positionImg.length == 0 && <Empty />}
              <Carousel>
                {positionImg.map((item) => {
                  return (
                    <div key={item}>
                      <Image
                        src={item}
                        preview={{
                          src: scaleImg(item),
                          mask: <ZoomImg />
                        }}
                      />
                    </div>
                  );
                })}
              </Carousel>
            </div>
          </div>
          <div className="test-info b-right-wrap">
            <Title text={data[1].title} />
            <div className="test-info-echart">
              <EchartsBox options={options} />
            </div>
          </div>
          <div className="water-wrap b-right-wrap">
            <Title text={data[2].title} />
            <div className="list">
              {data[2].childs.map((item: any) => {
                return (
                  <li key={item.id} onClick={() => onClick(item, data[2].title)}>
                    <span className="name">{item.title}</span>
                    <span className="number">{item.value}</span>
                  </li>
                );
              })}
            </div>
          </div>
          <div className="water1-wrap b-right-wrap">
            <Title text={data[3].title} />
            <div className="list">
              {data[3].childs.map((item: any, index: number) => {
                return (
                  <li key={item.id} onClick={() => onClick(item, data[3].title)}>
                    <img src={imgArr[index]} alt={item.title + item.value} />
                    <div className="bottom">
                      <span className="name">{item.title}</span>
                      <span className="number">{item.value}</span>
                    </div>
                  </li>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Spin />
      )}
      <Modal
        centered
        title={type + category + '列表'}
        visible={visible}
        footer={null}
        onCancel={onCancel}
        className="popup-modal BasicsLeft-modal drag-modal"
        width={1000}
        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => onStart(event, uiData)}
          >
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        {result && (
          <Table
            className="basucs-table cunstomtable"
            dataSource={result.data}
            rowClassName={rowClassName}
            rowKey={'objectid'}
            pagination={{
              total: result.total,
              current: params.pageIndex,
              hideOnSinglePage: true,
              showSizeChanger: false,
              showTotal: (total) => `共${result.total}条`,
              onChange: (page) => {
                setParams({ ...params, pageIndex: page });
              }
            }}
            columns={result.column}
            size="small"
          />
        )}
      </Modal>
    </div>
  );
}
export default memo(BasicsRight);
