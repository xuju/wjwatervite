import service from '@/axios';
import CommandLeft from '@/components/CommandLeft';
import CommandRight from '@/components/CommandRight';
import LeafletBox from '@/components/LeafletBox';
import { commandApi, commandTargetUrl, getLayers, wjqzhqu } from '@/config';
import { useRequest } from 'ahooks';
import React, { useEffect, useState } from 'react';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import redImg from './images/红色.png';
import blueImg from './images/蓝色.png';
import orangeImg from './images/橙色.png';
import yellowImg from './images/黄色.png';
import _ from 'lodash';
import LeafletToggle from '@/components/LeafletToggle';
import { useHistory, useParams } from 'react-router-dom';
import CommandLayer from '@/components/CommandLayer';
import './index.less';
import ReactDOM from 'react-dom';
import PopupBox from '@/components/PopupBox';
import CommandContrast from '@/components/CommandContrast';
import Footer from '@/components/Footer';
import { CreateMapv, legendList } from './fun';
import { usePageContext } from '@/store';
import { Switch, message } from 'antd';
import { TiledMapLayer, tiledMapLayer, dynamicMapLayer } from 'esri-leaflet';
import XQModal from './XQModal';
import ylImg0 from '@/assets/images/绿色.png';
const pointType = [
  { color: '绿', img: ylImg0 },
  { color: '红', img: redImg },
  { color: '蓝', img: blueImg },
  { color: '橙', img: orangeImg },
  { color: '黄', img: yellowImg }
];
const xzqyLayer = dynamicMapLayer({
  url: wjqzhqu
});
export default function WaterDisaster() {
  const [map, setMap] = useState<L.Map>();
  const [typeParams, setTypeParams] = useState({ name: '', type: legendList[0].type, r: 0 });

  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers), {
    formatResult: (data) => {
      let arr = data.data.data.slice(0, 3);

      return arr;
    }
  });

  const history = useHistory();
  const { data } = useRequest(() => service.post(commandApi.getCommandList)); //获取左侧列表
  const [bufferParams, setBufferParams] = useState({ id: '', r: 2000 });
  const { data: commandTypeData } = useRequest(
    () => service.post(commandApi.getTabsType, { ...typeParams, ...bufferParams }),
    { refreshDeps: [typeParams, bufferParams] }
  ); //获取右侧数据
  const { run: bufferRun } = useRequest(
    (params) => service.post(commandApi.getRadiusData, params),
    { manual: true }
  ); //获取缓冲区数据;
  const { run: getDetailRun } = useRequest((params) => service.post(commandApi.getDetail, params), {
    manual: true
  });
  const [circleGroup] = useState<L.FeatureGroup>(L.featureGroup());
  const [markerGroup] = useState(L.featureGroup());

  const [mapvObj, setMapvObj] = useState<CreateMapv>();
  const [layerVisible, setLayerVisible] = useState(true);
  const [xzqh, setXZQU] = useState(false);
  const [xqData, setXQData] = useState<any>();
  useEffect(() => {
    // window.document.oncontextmenu = function () {
    //   return false;
    // };
    // return
    if (map) {
      map.getContainer().oncontextmenu = () => {
        return false;
      };
    }
  }, [map]);
  // useEffect(() => {
  //   const host = window.location.href;
  //   const url = new URL(host);
  //   let getUrlToken = url.searchParams.get('code');
  //   if (getUrlToken) {
  //     const auth = getUrlToken.indexOf('Bearer ');
  //     if (auth === -1) {
  //       getUrlToken = 'Bearer ' + getUrlToken;
  //     }
  //     dispatch({ type: 'setToken', data: { token: getUrlToken } });
  //     localStorage.setItem('token', getUrlToken);
  //     history.replace('/commands');
  //   } else {
  //     if (!state.token) {
  //       history.replace('/login');
  //     }
  //   }
  // }, [params]);

  //迁徙图点击事件
  const clickCallback = async (e: any) => {
    if (e && map) {
      const { data } = e;
      const { x, y, type, id } = data;

      const result = await getDetailRun({ type, id });
      let res = result.data.data[type];
      const resData = res.data[0];
      const resColums = res.col;

      const div = document.createElement('div');
      let latlng = L.latLng(y, x);
      let datas = {
        data: resData,
        colums: resColums,
        type: legendList.find((f) => f.type === type)?.title
      };

      ReactDOM.render(<PopupBox data={datas} />, div);
      const popup = L.popup({ minWidth: 318, maxHeight: 220, className: 'command-popup' })
        .setLatLng(latlng)
        .setContent(div)
        .openOn(map);
    }
  };

  const pointLayer = (options: any) => {
    if (map) {
      circleGroup.clearLayers();
      const { latlng, id } = options;

      let cir = L.circle(latlng, { radius: bufferParams.r });

      circleGroup.addLayer(cir);

      map.addLayer(circleGroup);

      cir.pm.enable();
      (cir as any).pm._markers[0].remove();
      let params = { ...bufferParams, id };
      setBufferParams(params);
      let showRadiusPosition = (cir as any).pm._markers[1]._latlng;

      let obj = new CreateMapv({ map, centerPoint: latlng, clickCallback: clickCallback });
      obj.showRadius(showRadiusPosition, bufferParams.r.toFixed(2) + '米');
      setMapvObj(obj);

      cir.on('pm:edit', (e: any) => {
        let showRadiusPosition = (cir as any).pm._markers[1]._latlng;

        const radius = cir.getRadius();
        let params = { ...bufferParams, id, r: radius };
        setBufferParams(params);
        obj.showRadius(showRadiusPosition, radius.toFixed(2) + '米');
      });

      cir.on('contextmenu', (e: any) => {
        let { latlng } = e;
        let dom = document.getElementsByClassName('delete-wrap')[0];
        if (dom) {
          dom.remove();
        }
        let div = document.createElement('div');
        div.className = 'delete-wrap';
        div.innerHTML = '删除';
        let divIcon = L.divIcon({ html: div, className: 'delete-wrap', iconSize: [50, 30] });
        let marker = L.marker(latlng, { icon: divIcon });
        circleGroup.addLayer(marker);
        marker.on('click', (e) => {
          circleGroup.clearLayers();
          obj.removeLayer();

          obj.removeRadius();
        });
      });
    }
  };
  //左侧列表点击事件
  const leftTableClick = (val: any) => {
    map &&
      map.eachLayer((layer: any) => {
        if (layer.options.data && layer.options.data.name === val.name) {
          const latlng = layer._latlng;
          map.flyTo(latlng, 5, { duration: 0.5 });
          const data = layer.options.data;
          pointLayer({ latlng, ...data });
        }
      });
  };
  useEffect(() => {
    if (map && data) {
      let yldALL = data.data.data;

      yldALL.forEach((item: any) => {
        const { x, y, color } = item;
        let findColorImg = pointType.find((f) => f.color === color);
        if (findColorImg) {
          let icon = L.icon({
            iconUrl: findColorImg.img,
            iconSize: [26, 26],
            iconAnchor: [13, 26]
          });
          let marker = (L as any).marker([y, x], { icon: icon, data: item });
          markerGroup.addLayer(marker);
        }
      });
      map.addLayer(markerGroup);
      markerGroup.on('click', (e: any) => {
        const { latlng, layer } = e;

        map.flyTo(latlng, 5, { duration: 0.5 });
        pointLayer({ latlng, ...layer.options.data });
      });
    }
  }, [map, data]);
  useEffect(() => {
    if (bufferParams.id && bufferParams.r && mapvObj) {
      (async function () {
        let result = await bufferRun(bufferParams);
        if (result && result.data.data) {
          let res = result.data.data;
          mapvObj.init(res);
        }
      })();
    }
  }, [bufferParams, mapvObj]);

  const typeClick = (name: string) => {
    if (name === '指挥决策') {
      window.history.go(0);
    } else {
      window.open(commandTargetUrl);
    }
  };
  useEffect(() => {
    if (layerVisible) {
      markerGroup.eachLayer((layer: any) => {
        layer.setOpacity(1);
      });
    } else {
      markerGroup.eachLayer((layer: any) => {
        layer.setOpacity(0);
      });
    }
  }, [layerVisible]);
  const layerChange = (val: boolean) => {
    setLayerVisible(val);
  };
  useEffect(() => {
    if (map) {
      if (xzqh) {
        map.addLayer(xzqyLayer);
      } else {
        map.removeLayer(xzqyLayer);
      }
    }
  }, [xzqh, map]);
  const xqClick = async (record: any) => {
    const result = await service.post(commandApi.getFloodReportDetail + `?fr_id=${record.id}`);
    if (result.status === 200 && result.data.code == 200) {
      const data = result.data.data;

      setXQData(data);
    } else {
      setXQData(null);
      message.warning(result.data.message);
    }
  };
  const xqcolse = () => {
    setXQData(null);
  };
  return (
    <>
      <div className="layer-switch">
        <Switch
          checkedChildren="易涝点加载"
          unCheckedChildren="易涝点关闭"
          checked={layerVisible}
          onChange={layerChange}
        />
        <Switch
          checkedChildren="行政区划图层加载"
          unCheckedChildren="行政区划图层关闭"
          checked={xzqh}
          onChange={(val) => setXZQU(val)}
          style={{ marginLeft: '20px' }}
        />
      </div>
      <LeafletBox setMap={setMap} LayerData={LayerData?.find((f: any) => f.title === '午夜蓝')} />
      <CommandLeft data={data?.data?.data} clickCallBack={leftTableClick} />
      <CommandRight
        typeData={commandTypeData?.data.data}
        typeParams={typeParams}
        setTypeParams={setTypeParams}
        map={map}
        xqClick={xqClick}
      />
      {map && <LeafletToggle map={map} LayerData={LayerData} />}
      {map && <CommandLayer map={map} xqClick={xqClick} />}
      <CommandContrast />
      <Footer />
      <XQModal data={xqData} close={xqcolse} title="汛情信息" />
    </>
  );
}
