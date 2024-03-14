import service from '@/axios';
import { demonApi } from '@/config';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import { useRequest } from 'ahooks';
import { Modal, message } from 'antd';
import pointImg from '@/assets/images/watchpoint.png';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import React, { useEffect, useRef, useState } from 'react';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import MarkerWrap from '@/components/MarkerWrap';
import './index.less';
import EchartsBox from '@/components/EchartsBox';
import { EChartsOption } from 'echarts';
interface Props {
  view: MapView;
  check: boolean;
}
const symbol = new PictureMarkerSymbol({
  url: pointImg,
  width: 20,
  height: 20
});
const hiddenPopupZoom = 5;

const options = (data: IWatchInfo[]) => {
  const gmsy = data.map((item) => Number(item.gmsy));
  const ad = data.map((item) => Number(item.ad));
  const zl = data.map((item) => Number(item.zl));
  const arr = ad.concat(zl);
  const leftY = {
    min: Math.floor(Math.min.apply(Math, arr.concat(gmsy))),
    max: Math.ceil(Math.max.apply(Math, arr))
  };
  const rightY = {
    min: Math.floor(Math.min.apply(Math, gmsy)),
    max: Math.ceil(Math.max.apply(Math, gmsy))
  };

  const option: EChartsOption = {
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      bottom: '20%',
      left: '5%',
      right: '8%'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return `${params[0].marker}${params[0].name}<br/>
        ${params[0].seriesName}:</strong><span class="number">${params[0].value}<br/>
        ${params[1].seriesName}:</strong><span class="number">${params[1].value}<br/>
        ${params[2].seriesName}:</strong><span class="number">${params[2].value}<br/>
        `;
      }
    },
    color: ['#5F8CC2', '#C25E5C', '#A4C169'],
    yAxis: [
      {
        name: 'mg/L',
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,.2)'
          }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: '14'
        },
        axisTick: {
          show: false
        },
        min: leftY.min,
        max: leftY.max
      },
      {
        name: 'mg/L',
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: 'rgba(255,255,255,.2)'
          }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: '14'
        },
        axisTick: {
          show: false
        },
        min: rightY.min,
        max: rightY.max
      }
    ],
    xAxis: [
      {
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,.2)'
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: '14',
          rotate: 90
        },
        axisTick: {
          show: false
        },
        data: data.map((item) => item.monitordate)
      }
    ],
    series: [
      {
        name: '氨氮',
        type: 'line',
        symbol: 'none',
        data: ad,
        yAxisIndex: 0
      },
      {
        name: '总磷',
        type: 'line',
        symbol: 'none',
        data: zl,
        yAxisIndex: 0
      },
      {
        name: '高锰酸盐指数',
        type: 'line',
        symbol: 'none',
        data: gmsy,
        yAxisIndex: 1
      }
    ]
  };
  return option;
};
export default function WatchPoint(props: Props) {
  const { view, check } = props;
  const [zoom, setZoom] = useState(Math.ceil(view.zoom));
  const watchHandle = useRef<IHandle | null>();
  const pointWatchLayerRef = useRef(new GraphicsLayer());
  const [select, setSelect] = useState<IWatchPoint | null>();
  const clickHandel = useRef<IHandle | null>();
  const { data } = useRequest(async () => {
    const result = await service.get(demonApi.GetYuanDangWaterPoint);
    const data = result.data as IResult<IWatchPoint[]>;
    if (data.code == '200') {
      return data.data;
    } else {
      message.warning(data.message);
      return [];
    }
  });
  const { run, data: infoData } = useRequest(
    async () => {
      const result: any = await service.get(demonApi.GetYuanDangWaterData, {
        params: { name: select?.name }
      });
      const res = result.data as unknown as IResult<IWatchInfo[]>;

      if (res.code == '200') {
        return res.data;
      } else {
        message.warning(res.message);
        return [];
      }
    },
    { refreshDeps: [select], ready: select ? true : false }
  );
  const clearClick = () => {
    if (clickHandel.current) {
      clickHandel.current.remove();
      clickHandel.current = null;
    }
  };
  useEffect(() => {
    clearClick();
    if (view) {
      clickHandel.current = view.on('click', async (event) => {
        const result = await view.hitTest(event, { include: pointWatchLayerRef.current });
        const results = result.results;
        if (results.length) {
          const current = results[0].graphic.attributes;
          setSelect(current);
        }
      });
    }
  }, [view]);
  const clearWatch = () => {
    if (watchHandle.current) {
      watchHandle.current.remove();
      watchHandle.current = null;
    }
  };
  useEffect(() => {
    if (view) {
      clearWatch();
      view.map.add(pointWatchLayerRef.current, 1000);
      watchHandle.current = view.watch('zoom', (event) => {
        setZoom(Math.ceil(event));
      });
    }
  }, [view]);
  useEffect(() => {
    if (data && data.length) {
      const graphics = data
        .filter((f) => f.x && f.y)
        .map((item) => {
          const point = new Point({
            x: Number(item.x),
            y: Number(item.y),
            spatialReference: view.spatialReference
          });
          return new Graphic({
            geometry: point,
            attributes: item,
            symbol
          });
        });
      pointWatchLayerRef.current.addMany(graphics);
    }
  }, [data]);

  useEffect(() => {
    pointWatchLayerRef.current.visible = check;
  }, [check]);
  const pointClick = async (record: IWatchPoint) => {
    setSelect(record);
  };
  return (
    <>
      {data &&
        data.length > 0 &&
        zoom > hiddenPopupZoom &&
        check &&
        data.map((item) => {
          if (item.x && item.y) {
            return (
              <MarkerWrap
                key={item.id}
                view={view}
                position={{ x: Number(item.x), y: Number(item.y) }}
              >
                <div className="watch-point-name" onClick={() => pointClick(item)}>
                  {item.name}
                </div>
              </MarkerWrap>
            );
          }
        })}
      <Modal
        open={select ? true : false}
        centered
        footer={null}
        onCancel={() => setSelect(null)}
        className="businesspopup  watch-modal"
        destroyOnClose
        title={select?.name}
      >
        <div style={{ height: '100%' }}>
          {infoData && <EchartsBox options={options(infoData)} />}
        </div>
      </Modal>
    </>
  );
}
