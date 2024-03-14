import service from '@/axios';
import { commandApi } from '@/config';
import { useRequest } from 'ahooks';
import { Table, Tooltip, Tabs, Button, Col, Input, Row, message, DatePicker } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment, { Moment } from 'moment';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import CommandLegend from '../CommandLegend';
import Title from '../Title';
import L from 'leaflet'
import './index.less';
const { RangePicker } = DatePicker;
import { legendList } from '@/pages/Command/WaterDisaster/fun';
const { TabPane } = Tabs;
const columns: ColumnsType<any> = [
  {
    title: '上报类型',
    dataIndex: 'fr_type',
    key: 'fr_type',
    ellipsis: {
      showTitle: false
    },
    width: 85,
    render: (text) => (
      <Tooltip placement="topLeft" title={text === 'warn' ? '预警' : '值班情况上报'}>
        {text === 'warn' ? '预警' : '值班情况上报'}
      </Tooltip>
    )
  },
  {
    title: '记录人',
    dataIndex: 'fr_process_person',
    key: 'fr_process_person',
    width: 70,
    ellipsis: {
      showTitle: false
    },
    render: (text) => (
      <Tooltip placement="topLeft" title={text}>
        {text}
      </Tooltip>
    )
  },
  {
    title: '记录时间',
    dataIndex: 'fr_record_time',
    key: 'fr_record_time',
    width: 78,
    ellipsis: {
      showTitle: false
    },
    render: (text) => (
      <Tooltip placement="topLeft" title={moment(text).format('YYYY-MM-DD HH:mm:ss')}>
        {moment(text).format('YYYY-MM-DD HH:mm:ss')}
      </Tooltip>
    )
  },
  {
    title: '上报内容',
    dataIndex: 'fr_content',
    key: 'fr_content',
    width: 100,
    ellipsis: {
      showTitle: false
    },
    render: (text) => (
      <Tooltip placement="topLeft" title={text}>
        {text}
      </Tooltip>
    )
  }
];
const createColums = (col: any) => {
  let colums = [];
  for (let key in col) {
    if (key === 'id') {
      colums.push({
        title: col[key],
        dataIndex: key,
        key: key,
        width: 85,
        ellipsis: {
          showTitle: false
        },
        render: (text: string) => <Tooltip title={text}>{text}</Tooltip>
      });
    } else if (key != 'x' && key != 'y') {
      colums.push({
        title: col[key],
        dataIndex: key,
        key: key,
        width: 85,
        ellipsis: {
          showTitle: false
        },
        render: (text: string) => <Tooltip title={text}>{text}</Tooltip>
      });
    }
  }

  return colums;
};

interface Props {
  typeData: any;
  setTypeParams?: Function;
  typeParams?: CommandType;
  map?: L.Map;
  xqClick?: Function;
}

export default function CommandRight(props: Props) {
  const { typeData, typeParams, setTypeParams, map, xqClick } = props;
  const [searchVal, setSearchVal] = useState('');
  const [scrollH, setScrollH] = useState(150);
  const [defaultKey, setDefaultKey] = useState('');
  const [floodParams, setFloodParams] = useState({
    record_time_start: "",
    record_time_end: ""
  })
  const { data: floodData, loading } = useRequest(() => service.post(`${commandApi.getFloodList}?record_time_start=${floodParams.record_time_start}&record_time_end=${floodParams.record_time_end}`), { refreshDeps: [floodParams] });

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (
        document.body.scrollHeight === window.screen.height &&
        document.body.scrollWidth === window.screen.width
      ) {
        setScrollH(220);
      } else {
        setScrollH(150);
      }
    });
  }, []);
  useEffect(() => {
    setDefaultKey(legendList[0].title);
  }, []);

  const typeDataList = useMemo(() => {
    if (typeData) {
      const find = legendList.find((f) => f.title === defaultKey);
      if (find) {
        const filed = find.type;
        if (typeData[filed]) {
          let dataAll = [...typeData[filed].data];

          if (searchVal) {
            let filter = dataAll.filter((f) => f.name.includes(searchVal));
            filter.forEach((f, i) => (f.id = i + 1));
            return {
              data: filter ?? [],
              colums: createColums(typeData[filed].col)
            };
          } else {
            let temp: any[] = typeData[filed].data;
            temp.forEach((f, i) => (f.id = i + 1));
            return {
              data: temp,
              colums: createColums(typeData[filed].col)
            };
          }
        }
      }
    }
  }, [typeData, defaultKey, searchVal]);
  const callback = async (key: string) => {
    setSearchVal('');
    setDefaultKey(key);
    const find = legendList.find((f) => f.title === key);
    let params = { ...typeParams };
    params.type = find?.type;
    setTypeParams && setTypeParams(params);
  };

  const onSearch = () => { };
  const searchOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };
  const onChange = (time: any) => {
    const times = { ...floodParams }
    if (time && time.length) {
      const [start, end] = time;
      times.record_time_start = (start as Moment).format('YYYY-MM-DD')
      times.record_time_end = (end as Moment).format('YYYY-MM-DD')
    } else {
      times.record_time_start = ''
      times.record_time_end = ''

    }
    setFloodParams(times)
  }
  return (
    <div className="command-right">
      <div className="flood-wrap">
        <Title text="汛情信息" />
        <div className="time-wrap">
          <RangePicker format="YYYY-MM-DD" onChange={onChange} />
        </div>
        <div className="table">
          <Table
            dataSource={floodData?.data.data}
            columns={columns}
            pagination={false}
            loading={loading}
            scroll={{ y: scrollH }}
            rowKey="fr_id"
            onRow={(record) => {
              return {
                onClick: () => {
                  message.destroy();
                  const { lgtd, lttd } = record;
                  if (lgtd && lttd) {
                    const lat = Number(lgtd)
                    const lon = Number(lttd)
                    const position = new L.LatLng(lon, lat);
                    map?.flyTo(position, map.getZoom())
                    record.id = record.fr_id;
                    xqClick && xqClick(record)
                  } else {
                    message.warning('经纬度不存在')
                  }

                }
              }
            }}
          />
        </div>
      </div>

      <div className="feature-wrap">
        <Title text="周边相关要素" />
        <div className="search-wrap">
          <Row>
            <Col span={16}>
              <Input placeholder="请输入关键字" onChange={searchOnChange} value={searchVal} />
            </Col>
            <Col offset={1} span={7}>
              <Button onClick={onSearch}>搜索</Button>
            </Col>
          </Row>
        </div>
        <Tabs defaultActiveKey={defaultKey} onChange={callback}>
          {legendList.map((item) => {
            if (item.hidden) return;
            return (
              <TabPane tab={item.title} key={item.title}>
                <div className="table">
                  <Table
                    dataSource={typeDataList?.data}
                    columns={typeDataList?.colums}
                    pagination={false}
                    loading={typeDataList ? false : true}
                    scroll={{ y: scrollH }}
                    rowKey="id"
                  />
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
      <CommandLegend />
    </div>
  );
}
