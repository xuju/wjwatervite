import { useView } from '@/utils/hooks';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import { Button, Form, Input, InputNumber, Modal, Table, Typography } from 'antd';
import _ from 'lodash';
import React, { MouseEventHandler, useEffect, useImperativeHandle, useState } from 'react';
import markerImg from './images/地图定位.png';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
const symbol = new PictureMarkerSymbol({
  url: markerImg,
  width: 32,
  height: 32
});
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

interface CustomHeaderProps {
  handleSave: MouseEventHandler<HTMLElement>;
}
const CustomHeader = (props: CustomHeaderProps) => {
  const { handleSave } = props;

  return (
    <div className="CustomHeader">
      <Button size="small" onClick={handleSave}>
        新增打点
      </Button>
      <span className="tips">注意：输入的经纬度坐标系必须为2000国家大地坐标系</span>
    </div>
  );
};
interface Item {
  key: string;
  name: string;
  x: string;
  y: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入${title}!`
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
interface Props {
  mref: any;
}
let testData = [
  {
    name: '测试点位1',
    x: '120.6230184391583',
    y: '31.023255424334884',
    key: Date.now().toString()
  },
  {
    name: '测试点位2',
    x: '120.66481044584178',
    y: '31.049796321207506',
    key: Date.now().toString()
  },
  {
    name: '测试点位3',
    x: '120.62262229418992',
    y: '30.962052894473743',
    key: Date.now().toString()
  },
  {
    name: '测试点位4',
    x: '120.59588332483311',
    y: '30.988593791346364',
    key: Date.now().toString()
  },
  {
    name: '测试点位5',
    x: '120.58300901229842',
    y: '30.953536031522994',
    key: Date.now().toString()
  },
  {
    name: '测试点位6',
    x: '120.54913965111312',
    y: '30.998299052935195',
    key: Date.now().toString()
  },
  {
    name: '测试点位7',
    x: '120.589149077973',
    y: '31.069404898735833',
    key: Date.now().toString()
  },
  {
    name: '测试点位8',
    x: '120.69135136084792',
    y: ' 31.069801025570683',
    key: Date.now().toString()
  },
  {
    name: '测试点位9',
    x: '120.69709529968766',
    y: '31.014540488899947',
    key: Date.now().toString()
  },
  {
    name: '测试点位10',
    x: '120.56161783681297',
    y: ' 30.94838631013582',
    key: Date.now().toString()
  },
  {
    name: '测试点位11',
    x: ' 120.60717311189488',
    y: '31.055738314397907',
    key: Date.now().toString()
  }
];
export default function ModalMarker(props: Props) {
  const { mref } = props;
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [params, setParams] = useState({ page: 1, pageSize: 10 });
  const isEditing = (record: Item) => record.key === editingKey;
  const [graphicLayer] = useState(new GraphicsLayer({ id: 'addClickMarker' }));
  const view = useView();
  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', x: '', y: '', ...record });
    setEditingKey(record.key);
  };
  useEffect(() => {
    if (view) view.map.add(graphicLayer);
  }, [view]);

  const cancel = () => {
    setEditingKey('');
  };
  const deleteEmpty = () => {
    let temp = [...data].filter((f) => f.x && f.y && f.name);
    setData(temp);
    return temp;
  };
  const onChange = (page: number) => {
    deleteEmpty();
    setParams({ ...params, page });
    setEditingKey('');
  };
  useImperativeHandle(mref, () => ({
    setVisible
  }));
  const handleOk = () => {
    setVisible(false);
  };
  const handleAdd = async () => {
    let key = Date.now().toString();
    const obj = { key, x: '', y: '', name: '' };
    const { pageSize } = params;
    let temp = [...data, obj];
    const total = temp.length;

    form.resetFields();

    setEditingKey(key);
    setData(temp);
    const page = total / pageSize === 0 ? 1 : Math.ceil(total / pageSize);

    setParams({ ...params, page });
  };
  const save = async (key: string) => {
    try {
      const row = (await form.validateFields()) as Item;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (e) {}
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const deleteHandle = (record: Partial<Item>) => {
    const { key } = record;
    let temp = [...data];
    _.remove(temp, (r) => r.key === key);
    setData(temp);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '25%',
      editable: true
    },
    {
      title: '经度',
      dataIndex: 'x',
      width: '30%',
      editable: true
    },
    {
      title: '纬度',
      dataIndex: 'y',
      width: '30%',
      editable: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              确定
            </Typography.Link>
            <Typography.Link onClick={() => cancel()} style={{ marginRight: 8 }}>
              取消
            </Typography.Link>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingKey !== ''}
              style={{ marginRight: 8 }}
              onClick={() => edit(record)}
            >
              编辑
            </Typography.Link>
            <Typography.Link disabled={editingKey !== ''} onClick={() => deleteHandle(record)}>
              删除
            </Typography.Link>
          </span>
        );
      }
    }
  ];
  const submit = () => {
    let datas = deleteEmpty();
    const graphics = datas.map((item) => {
      const { name, x, y } = item;
      const point = new Point({ x, y, spatialReference: view?.spatialReference });
      const text = new TextSymbol({
        color: '#fff',
        text: name,
        yoffset: 26,
        font: {
          // autocasts as new Font()
          size: 12,
          weight: 'bold'
        }
      });
      const textGraphic = new Graphic({
        geometry: point,
        symbol: text
      });
      graphicLayer.add(textGraphic);
      const graphic = new Graphic({
        geometry: point,
        symbol
      });
      return graphic;
    });
    graphicLayer.addMany(graphics);
    setEditingKey('');
    setVisible(false);
  };
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });
  return (
    <Modal
      title={<CustomHeader handleSave={handleAdd} />}
      visible={visible}
      centered
      width="40%"
      onOk={handleOk}
      onCancel={handleCancel}
      className="marker-modal-wrap"
      footer={null}
    >
      <div className="wrap">
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell
              }
            }}
            size="small"
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName={rowClassName}
            pagination={{
              onChange: onChange,
              pageSize: params.pageSize,
              current: params.page
            }}
          />
        </Form>
        <Button className="modal-btn" onClick={submit}>
          确定
        </Button>
      </div>
    </Modal>
  );
}
