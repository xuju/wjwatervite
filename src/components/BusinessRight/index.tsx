import service from '@/axios';
import { businessApi } from '@/config';
import { usePageContext } from '@/store';
import { useLayerContext } from '@/store/layer';
import { useSelectLayerTable } from '@/utils/hooks';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import { useRequest } from 'ahooks';

import { Tabs, Tooltip } from 'antd';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GroupTable from '../GroupTable';
import {
  LegendGSGW,
  LegendSSSQ,
  LegendSSYL,
  LegendSYGL,
  LegendTZCX,
  LegendWaterBase,
  LegendYLZD
} from '../LegendSSSQ';

import TableCom from '../TableCom';
import TableHSH from '../TableHSH';
import TableNCSTHD from '../TableNCSTHD';
import TableOnlyTowns from '../TableOnlyTowns';
import TablePumb from '../TablePumb';
import TableSSSQ from '../TableSSSQ';
import TableSSYL from '../TableSSYL';
import TableSupply from '../TableSupply';
import TableTowns from '../TableTowns';
import TableVideo from '../TableVideo';
import TableWaterBase from '../TableWaterBase';
import TableWaterEccect from '../TableWaterEccect';
import bg from './images/line.png';
import './index.less';
import TableHD from '../Business/TableHD';
import TableHP from '../Business/TableHP';
const { TabPane } = Tabs;
const defaultOptions = {
  beginTime: '2021-09-26T13:16:19.203Z',
  endTime: '2021-09-26T13:16:19.203Z'
};

const onlySend = ['水闸', '泵站'];

//区镇列表聚合
// const groupLayer = ['河道', '湖泊', '地表取水口', '生活污水处理设施'];
const groupLayer = ['地表取水口', '生活污水处理设施'];
export const groupLayer1 = [
  { name: '重点排水户', group: 'pname' },
  { name: '提质增效达标区', group: 'year' }
];
function BusinessRight() {
  const [show, setShow] = useState(false);
  const curritem = useSelectLayerTable();
  const paneToggle = () => {
    setShow(!show);
  };
  const { state, dispatch } = useLayerContext();
  const selectedLayers = useMemo(() => {
    if (state && state.list) {
      return state.list;
    } else {
      return [];
    }
  }, [state]);
  const currentLayer = useMemo(() => {
    if (state && state.current) {
      setShow(true);
      return state.current;
    } else {
      setShow(false);
    }
  }, [state]);

  const close = (item: { id: string }, e: any) => {
    e.stopPropagation();
    if (!selectedLayers) return false;
    const { id } = item;
    const findIndex = selectedLayers?.findIndex((f) => f.id === id);
    if (findIndex != null) {
      selectedLayers.splice(findIndex, 1);
      let arr = [...selectedLayers];
      dispatch({ type: 'setList', data: { list: arr } });
      if (arr && arr.length > 0) {
        let tem = [...arr];
        dispatch({ type: 'setCurrent', data: { current: tem.pop() } });
      } else {
        dispatch({ type: 'setCurrent', data: { current: null } });
      }
    }
  };

  const childDom = useMemo(() => {
    if (currentLayer) {
      const { layerzwmc } = currentLayer;

      if (layerzwmc === '实时水情') {
        return <TableSSSQ />;
      } else if (layerzwmc === '实时雨量') {
        return <TableSSYL />;
      } else if (layerzwmc === '视频监控') {
        return <TableVideo />;
      } else if (groupLayer.includes(layerzwmc)) {
        return <TableTowns />;
      } else if (onlySend.includes(layerzwmc)) {
        return <TableOnlyTowns />;
      } else if (groupLayer1.find((f) => f.name === layerzwmc)) {
        return <GroupTable />;
      } else if (layerzwmc === '供水管网') {
        return <TableSupply />;
      } else if (layerzwmc === '水务基础设施空间布局规划') {
        return <TableWaterBase />;
      } else if (layerzwmc === '水质在线监测') {
        return <TableWaterEccect />;
      } else if (layerzwmc === '提升泵站') {
        return <TablePumb />;
      } else if (layerzwmc === '农村生态河道') {
        return <TableNCSTHD />;
      } else if (layerzwmc === '已整治黑臭水体') {
        return <TableHSH />;
      } else if (layerzwmc === '河道') {
        return <TableHD />;
      } else if (layerzwmc === '湖泊') {
        return <TableHP />;
      } else {
        return <TableCom />;
      }
    }
  }, [currentLayer]);

  const isSSYL = useMemo(() => {
    if (selectedLayers && selectedLayers.length) {
      const find = selectedLayers.find((f) => f.layerzwmc === '实时雨量');
      if (find) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }, [selectedLayers]);
  const { data: SSYLData } = useRequest(
    () => service.post(businessApi.getSSYLLegend, defaultOptions),
    { ready: isSSYL }
  );
  const isSSSQ = useMemo(() => {
    if (selectedLayers && selectedLayers.length) {
      const find = selectedLayers.find((f) => f.layerzwmc === '实时水情');
      if (find) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }, [selectedLayers]);
  const isYLZD = useMemo(
    () => selectedLayers && selectedLayers.find((f) => f.layerzwmc === '易涝站点'),
    [selectedLayers]
  );
  const isSYXGL = useMemo(
    () => selectedLayers && selectedLayers.find((f) => f.layerzwmc === '水域管理范围线'),
    [selectedLayers]
  );
  const isTZCX = useMemo(
    () => selectedLayers && selectedLayers.find((f) => f.layerzwmc === '提质增效达标区'),
    [selectedLayers]
  );
  const isGSGW = useMemo(
    () => selectedLayers && selectedLayers.find((f) => f.layerzwmc === '供水管网'),
    [selectedLayers]
  );
  let legnedShow = isSSSQ || isSSYL || isYLZD || isSYXGL || isTZCX || isGSGW;
  const selectChange = (items: any, e: any) => {
    // 阻止合成事件的冒泡
    e.stopPropagation();

    dispatch({ type: 'setCurrent', data: { current: items } });
  };
  //隐藏左侧面板
  const hiddenPanle = ['水域管理范围线', '河湖管理范围线(临时)', '河湖管理范围线'];
  const isSYX = useMemo(() => {
    if (curritem) {
      if (curritem.layertype === 'Api') {
        return false;
      }
      if (curritem.opconfig) {
        const opconfig = JSON.parse(curritem.opconfig);
        if (opconfig && opconfig.listUrl) {
          return false;
        } else {
          return true;
        }
      }
    }
    if (curritem && hiddenPanle.includes(curritem.layerzwmc)) {
      return true;
    } else {
      return false;
    }
  }, [curritem]);

  return (
    !isSYX && (
      <div className="business-right" style={{ right: show ? '-0px' : '-456px' }}>
        <div className="type-wrap">
          <div className="coll" onClick={() => paneToggle()}>
            {show ? (
              <RightOutlined style={{ fontSize: 16 }} />
            ) : (
              <LeftOutlined style={{ fontSize: 16 }} />
            )}
          </div>
          <div className="type-item-wrap">
            {selectedLayers.map((item, index) => {
              return (
                <div
                  className={[
                    'tabitem',
                    item.layerzwmc === currentLayer?.layerzwmc ? 'select' : ''
                  ].join(' ')}
                  key={index}
                  onClick={(e) => selectChange(item, e)}
                >
                  <div className="tabitemclose" onClick={(e) => close(item, e)} />
                  <div className="tabitemimg">
                    {item.icon && (
                      <div className="colors" style={{ backgroundImage: `url(${item.icon})` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="business-right-params">
          <div className="right-wrap">
            <div className="animateimage">
              <img src={bg} alt="" />
            </div>

            <>
              <div className="currTitle">{currentLayer ? currentLayer?.layerzwmc : ''}</div>
              {childDom}
              {/* {currentLayer && <div className="tablePanel">
                {currentLayer.layerzwmc === '河道' && <TableHD />}
              </div>} */}
            </>
          </div>
        </div>
        {legnedShow && (
          <div className="business-right-legend">
            <div className="legend-title">图 例</div>

            <div className="legend-wrap global-scroll">
              {isSSYL && <LegendSSYL data={SSYLData?.data.data} />}
              {isSSSQ && <LegendSSSQ />}

              {isYLZD && <LegendYLZD />}
              {isTZCX && <LegendTZCX />}
              {isSYXGL && <LegendSYGL />}
              {isGSGW && <LegendGSGW />}
            </div>
            <div />
          </div>
        )}
      </div>
    )
  );
}

export default memo(BusinessRight as any);
