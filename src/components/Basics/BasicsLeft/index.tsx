import { Modal, Spin, Table, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import hdimg from './images/不规则装饰.png';
import Title from '@/components/Title';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { basics } from '@/config';
import moment from 'moment';
import circleImg from './images/圆.png';
import lingImg from './images/菱形.png';
import { queryHPPolygon, queryRiverPolygon } from '@/utils/queryTask';
import { useView } from '@/utils/hooks';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
const initParams = {
  name: 'string',
  bigtype: 0,
  pageIndex: 1,
  pageSize: 10
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
    if (item === 'comp_date') {
      column.push({
        title: listColumn[item],
        dataIndex: item,
        render: (text: string) => {
          if (text) {
            return moment(text).format('YYYY');
          } else {
            return '';
          }
        }
      });
    } else if (item === 'rv_name') {
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
    } else if (item === 'rv_len' || item === 'mea_ann_wat_area' || item == 'rv_bas_area') {
      column.push({
        title: listColumn[item],
        dataIndex: item,
        width: 150,
        render: (text: string) => {
          if (text) {
            return Number(text).toFixed(3);
          } else {
            return '';
          }
        }
      });
    } else {
      if (item != 'objectid') {
        column.push({
          title: listColumn[item],
          dataIndex: item,
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

export default function BasicsLeft(props: { data: any[] }) {
  const { data } = props;
  const [category, setCategory] = useState('');
  const view = useView();
  const [params, setParams] = useState(initParams);
  const [type, setType] = useState('');
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const { run: triverRun } = useRequest((par) => service.post(basics.GetriverList, par), {
    manual: true
  });
  const { run: lakeRun } = useRequest((par) => service.post(basics.GetLakeList, par), {
    manual: true
  });
  const { run: waterRun } = useRequest((par) => service.post(basics.GetWaterProjectList, par), {
    manual: true
  });
  const [result, setRes] = useState<any>();

  useEffect(() => {
    if (type === '河道') {
      if (category) {
        triverRun({ ...params, name: category }).then((res) => {
          if (res.data && res.data.data) {
            let result = formateData(res, params);

            setRes(result);
          }
        });
      }
    }
    if (type === '湖泊') {
      if (category) {
        lakeRun({ ...params, name: category }).then((res) => {
          if (res.data && res.data.data) {
            let result = formateData(res, params);

            setRes(result);
          }
        });
      }
    }
    if (type === '水利工程') {
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
  const triverClick = (datas: any, type: string) => {
    const { title } = datas;
    let temp = [...data[1].childs];
    let slice = temp.slice(0, 6);
    const find = slice.find((f) => f.title === title);

    if (find && view) {
      //删除底图点击查询出来的polygon
      let find = view.map.findLayerById('hightLayer') as GraphicsLayer;
      if (find) find.removeAll();
      queryRiverPolygon(title, view);
    }



    setType(type);
    setVisible(true);

    setCategory(title);
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

  const lakeClick = (r: any, type: string) => {


    setType(type);
    setVisible(true);
    const { title } = r;
    setCategory(title);
    if (view) {
      //删除底图点击查询出来的polygon
      let find = view.map.findLayerById('hightLayer') as GraphicsLayer;
      if (find) find.removeAll();
      queryHPPolygon(title, view);
    }
  };
  const waterClick = (r: any, type: string) => {
    setType(type);
    setVisible(true);
    const { title } = r;
    setCategory(title);
  };

  const onCancel = () => {
    setVisible(false);
    setParams({ ...initParams });
  };
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
  if (!data || data.length <= 0) {
    return <div></div>;
  }
  return (
    <>
      <div className="basics-left">
        {data ? (
          <>
            <div className="basics-desc-wrap basics-left-wrap">
              <Title text={data[0]?.title} />

              <div className="basics-desc-text global-scroll hidden-scroll">{data[0].value}</div>
            </div>

            <div className="new-hd basics-left-wrap">
              <Title text={data[1]?.title} />
              <div className="new-hd-c-wrap">
                {data[1].childs.map((item: any) => {
                  return (
                    <div
                      className="new-hd-item"
                      key={item.name}
                      onClick={() => triverClick(item, '河道')}
                    >
                      <img width={94} height={80} src={circleImg} alt={item.name} />
                      <div className="new-hd-count">{item.value}</div>
                      <div className="new-hd-name">{item.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hp-wrap basics-left-wrap">
              <Title text={data[2]?.title} />
              <div className="new-list-wrap">
                {data[2].childs.map((item: any, index: number) => {
                  return (
                    <li key={item.id} onClick={() => lakeClick(item, '湖泊')}>
                      <span className="hp-value">{item.value}</span>
                      <span className="hp-name">{item.title}</span>
                    </li>
                  );
                })}
              </div>
            </div>

            <div className="sl-wrap basics-left-wrap">
              <Title text={data[3]?.title} />
              <div className="sl-wrap-list">
                {data[3].childs.map((item: any, index: number) => {
                  return (
                    <li key={item.id} onClick={() => waterClick(item, '水利工程')}>
                      <div className={`number-wrap`}>
                        <span className="number">{item.value}</span>
                        <span className="nuit">{item.title === '堤防' ? '段' : '个'}</span>
                      </div>
                      <span className={`text`}>{item.title}</span>
                    </li>
                  );
                })}
              </div>
              {/* <div className="list">
                {data[3].childs.map((item: any, index: number) => {
                  return (
                    <li key={item.id} onClick={() => waterClick(item, '水利工程')}>
                      <span className={`number`}>{item.value}</span>
                      <span className={`text`}>{item.title}</span>
                    </li>
                  );
                })}
              </div> */}
            </div>
          </>
        ) : (
          <Spin />
        )}
      </div>
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
    </>
  );
}
