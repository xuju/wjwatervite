import service from '@/axios';
import { usePageContext } from '@/store';
import { popupWaterRender } from '@/utils';
import { useSelectLayerTable } from '@/utils/hooks';
import { useRequest } from 'ahooks';
import { Button, Col, Form, Input, Row, Table, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import './index.less';
const initParams = { name: '', pageIndex: 1, pageSize: 10, bigtype: 0, id: '' };
export default function TableWaterEccect() {
  const [params, setParams] = useState({ ...initParams });
  const [tabColum, setTabColum] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const curritem = useSelectLayerTable();
  const { dispatch, state } = usePageContext();

  const { run } = useRequest((url, param) => service.post(url, param), {
    manual: true
  });
  const onFinish = (value: any) => {
    setParams({ ...initParams, name: value.name });
  };
  useEffect(() => {
    if (curritem && curritem.url1) {
      const { pageIndex, pageSize } = params;
      run(curritem.url1, params).then((res) => {
        let data = res.data.data.listdata;
        let tabColum: any[] = [{ title: '序号', key: 'index', dataIndex: 'index', width: 50 }];
        Object.keys(data.listColumn).forEach((e) => {
          if (e != 'x' && e != 'y' && e != 'id') {
            if (e === 'name') {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                ellipsis: {
                  showTitle: false
                },
                render: (text: string) => {
                  if (text === 'null') {
                    return '';
                  } else {
                    return <Tooltip title={text}>{text}</Tooltip>;
                  }
                }
              });
            } else if (e === 'zad_data6') {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                ellipsis: {
                  showTitle: false
                },
                width: 50,
                render: (text: string) => {
                  if (text === 'null') {
                    return '';
                  } else {
                    return <Tooltip title={text}>{text}</Tooltip>;
                  }
                }
              });
            } else if (e === 'tstamp') {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                ellipsis: {
                  showTitle: false
                },
                width: 50,
                render: (text: string) => {
                  if (text === 'null' || !text) {
                    return '';
                  } else {
                    return (
                      <Tooltip title={moment(text).format('YYYY-MM-DD')}>
                        {moment(text).format('YYYY-MM-DD')}
                      </Tooltip>
                    );
                  }
                }
              });
            } else {
              tabColum.push({
                title: data.listColumn[e],
                dataIndex: e,
                key: e,
                render: (text: string) => {
                  if (text === 'null') {
                    return '';
                  } else {
                    return text;
                  }
                }
              });
            }
          }
        });

        setTabColum(tabColum);
        if (data.dataCount) {
          setTotal(data.dataCount);
        } else {
          setTotal(data.listdata.length);
        }

        let page = pageIndex - 1;

        if (page < 0) page = 0;

        const indexs = page * pageSize;
        let datakey = data.listdata.map((item: any, index: any) => {
          return { ...item, index: indexs + (index + 1) };
        });

        setData(datakey);
      });
    }
  }, [curritem, params]);

  useEffect(() => {
    if (data && state.view) {
      data.forEach((item) => (item.them = '水质在线监测'));
      popupWaterRender(data, state.view);
    }
  }, [data, state]);
  const tableClick = (record: any) => {
    dispatch({ type: 'point', data: record });
  };
  const onChange = (page: number) => {
    const tem = { ...params, pageIndex: page };

    setParams(tem);
  };
  return (
    <div className="TableWaterEccect">
      <div className="searchpanel">
        <Form name="search_form" onFinish={onFinish} form={form}>
          <Row>
            <Col span={18}>
              <Form.Item name="name" label="名称">
                <Input style={{ color: '#fff' }} />
              </Form.Item>
            </Col>
            <Col span={1} />
            <Col span={5}>
              <Button htmlType="submit" style={{ right: '0' }}>
                搜索
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <section className="tablecom">
        <div className="dw">{'总数：' + total}</div>
        <Table
          size="small"
          rowClassName={(r: any, indx: number) => {
            if (indx % 2 === 1) return 'bg-row';
            else return '';
          }}
          columns={tabColum}
          dataSource={data}
          rowKey="id"
          scroll={{ y: 350 }}
          onRow={(record: any) => {
            record.layerNames = curritem.layerzwmc;
            return {
              onClick: () => tableClick(record)
            };
          }}
          pagination={{
            total: total,
            hideOnSinglePage: true,
            pageSize: params.pageSize,
            showSizeChanger: false,
            onChange: onChange
          }}
        />
      </section>
    </div>
  );
}
