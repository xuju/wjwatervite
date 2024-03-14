import React, { useEffect, useRef, useState } from 'react';
import toolImg from './images/三维.png';
import './index.less';
import { useSetRecoilState } from 'recoil';
import { mapTypeAtom } from '@/store/scene';
import { IconFont, exitScreen, fullScreen } from '../Tools';
import SceneView from '@arcgis/core/views/SceneView';
import AreaMeasurement3D from '@arcgis/core/widgets/AreaMeasurement3D';
import DirectLineMeasurement3D from '@arcgis/core/widgets/DirectLineMeasurement3D';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import _ from 'lodash';
import pimg from './images/icon-坐标@2x.png';
import aimg from './images/icon-动画轨迹@2x.png';
import Measurement from '@/utils/measurement';
import Camera from '@arcgis/core/Camera';
// import Measurement from '@arcgis/core/widgets/Measurement';
import { message } from 'antd';
import MapView from '@arcgis/core/views/MapView';
interface ToolsProps {
  view: SceneView | MapView;
  type: string[];
  clickCallback: Function;
}

const animateobj = {
  state: true,
  code: 200,
  message: null,
  data: [
    {
      id: '519fc432-f55e-4a32-9699-1c47dbdf8421',
      dH_ID: '9f22d022-6bf5-49ad-9bf0-974603a592f2',
      sx: '0',
      cs: '{"position":{"spatialReference":{"latestWkid":4490,"wkid":4490},"x":120.57769974478659,"y":31.129195122399025,"z":294.1600466920063},"heading":45.48626341811335,"tilt":66.32194007309913}'
    },
    {
      id: 'e9d8cb85-30c5-45a7-8962-544f0250aa14',
      dH_ID: '9f22d022-6bf5-49ad-9bf0-974603a592f2',
      sx: '1',
      cs: '{"position":{"spatialReference":{"latestWkid":4490,"wkid":4490},"x":120.58031959805395,"y":31.127644781002996,"z":674.9522872939706},"heading":45.48761776419699,"tilt":66.31414138806088}'
    },
    {
      id: 'e152d520-d054-45e9-a047-04d7fd3fe457',
      dH_ID: '9f22d022-6bf5-49ad-9bf0-974603a592f2',
      sx: '2',
      cs: '{"position":{"spatialReference":{"latestWkid":4490,"wkid":4490},"x":120.59187362265367,"y":31.131266290219983,"z":674.9522872949019},"heading":45.49359088834336,"tilt":66.31414138805638}'
    },
    {
      id: 'd3a3b31a-d6da-420b-a8da-fbc6b80e620b',
      dH_ID: '9f22d022-6bf5-49ad-9bf0-974603a592f2',
      sx: '3',
      cs: '{"position":{"spatialReference":{"latestWkid":4490,"wkid":4490},"x":120.60516756438976,"y":31.13830057000093,"z":674.9522872949019},"heading":45.50046457685008,"tilt":66.3141413880461}'
    }
  ]
};
const barType = ['position', 'animate', 'ceju', 'cemian', 'clear'];
export default function SceneTools(props: ToolsProps) {
  const { view, type, clickCallback } = props;

  const measurement = useRef<AreaMeasurement3D>();
  const lineMeasurement = useRef<DirectLineMeasurement3D>();
  const [visible, setVisible] = useState(true);
  const pclickHandle = useRef<IHandle | null>();
  const setMapType = useSetRecoilState(mapTypeAtom);
  const markerGroup = useRef(new GraphicsLayer());
  const playParams = useRef({ index: 0, type: 'stop' });
  useEffect(() => {
    if (view) {
      // const measurement = new AreaMeasurement3D({ view });
      measurement.current = new AreaMeasurement3D({ view });
      lineMeasurement.current = new DirectLineMeasurement3D({ view });
      // setarcgismeasure(measurement);
      view.map.add(markerGroup.current);
    }
  }, [view]);
  const onClick = () => {
    setMapType({ type: '2D' });
  };
  const barClick = (clickType: string) => {
    //删除河道高亮
    let findHight = view.map.findLayerById('hightLayer') as GraphicsLayer;

    if (findHight) {
      findHight.removeAll();
    }

    if (type.includes(clickType)) {
      _.remove(type, (f) => f === clickType);
    } else {
      barType.forEach((item) => {
        _.remove(type, (f) => f === item);
      });
      type.push(clickType);
    }

    clickCallback([...type]);
  };
  const distanceHandle = () => {
    if (!type.includes('ceju')) {
      _.remove(type, (f) => f === 'position');
      _.remove(type, (f) => f === 'animate');
      _.remove(type, (f) => f === 'cemian');
      type.push('ceju');
    } else {
      _.remove(type, (f) => f === 'ceju');
    }

    clickCallback([...type]);
  };
  const areaHandle = () => {
    if (!type.includes('cemian')) {
      type.push('cemian');
      _.remove(type, (f) => f === 'position');
      _.remove(type, (f) => f === 'animate');
      _.remove(type, (f) => f === 'ceju');
    } else {
      _.remove(type, (f) => f === 'cemian');
    }
    clickCallback([...type]);
  };
  const deleteHandle = () => {
    _.remove(type, (f) => f === 'ceju');
    _.remove(type, (f) => f === 'cemian');
    _.remove(type, (f) => f === 'position');
    _.remove(type, (f) => f === 'animate');
    const markerGraphic = view.map.findLayerById('addClickMarker') as GraphicsLayer;
    if (markerGraphic) markerGraphic.removeAll();
    clickCallback([...type]);
  };
  const clerarClick = () => {
    if (pclickHandle.current) {
      pclickHandle.current.remove();
      pclickHandle.current = null;
    }
  };
  const play = () => {
    const data = animateobj.data;
    const { index, type } = playParams.current;

    if (index > data.length - 1) {
      playParams.current = { index: 0, type: 'stop' };
      return;
    } else {
      playParams.current.type = 'start';
    }

    const current = data[index];
    if (current) {
      const cs = current.cs ? JSON.parse(current.cs) : {};
      const camera = new Camera(cs);
      view.goTo(camera, { speedFactor: 1, easing: 'linear' }).then(() => {
        playParams.current.index++;
        play();
      });
    }
  };
  useEffect(() => {
    if (type.includes('fullscreen')) {
      fullScreen();
    } else {
      exitScreen();
    }
    clerarClick();
    if (type.includes('position')) {
      document.body.style.cursor = 'crosshair';
      pclickHandle.current = view.on('click', (event) => {
        const mapPoint = event.mapPoint;
        message.destroy();
        message.success(`经度：${mapPoint.y}，维度：${mapPoint.x}`);
      });
    } else {
      document.body.style.cursor = 'auto';
    }

    if (type.includes('ceju')) {
      lineMeasurement.current?.viewModel.start();
    } else if (type.includes('cemian')) {
      measurement.current!.viewModel.start();
    } else {
      lineMeasurement.current?.viewModel.clear();
      measurement.current?.viewModel.clear();
    }
    if (type.includes('animate') && playParams.current.type === 'stop') {
      play();
    } else {
    }
  }, [type]);

  return (
    <>
      <div className="SceneTools">
        <div className="img" onClick={onClick}>
          <img src={toolImg} alt="" />
        </div>
        {visible && (
          <div className="tools">
            <div className="tool-item-wrap">
              <div className="tools-one-map  tools-item" onClick={() => barClick('onemap')}>
                <IconFont style={{ fontSize: 20 }} type="icon-layers" />
                <span className={[type.includes('onemap') ? 'select' : ''].join(' ')}>一张图</span>
              </div>

              <div className="tools-one-map  tools-item" onClick={() => barClick('position')}>
                {/* <IconFont style={{ fontSize: 20 }} type="icon-Group-" /> */}
                <img src={pimg} alt="坐标" width={16} style={{ marginRight: '6px' }} />
                <span className={[type.includes('position') ? 'select' : ''].join('position')}>
                  坐标
                </span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('animate')}>
                <img src={aimg} alt="坐标" width={16} style={{ marginRight: '6px' }} />
                <span className={[type.includes('animate') ? 'select' : ''].join(' ')}>
                  动画导航
                </span>
              </div>

              <div className="tools-one-map  tools-item" onClick={distanceHandle}>
                <IconFont style={{ fontSize: 20 }} type="icon-ruler" />
                <span className={[type.includes('ceju') ? 'select' : ''].join(' ')}>测距</span>
              </div>

              <div className="tools-one-map  tools-item" onClick={() => areaHandle()}>
                <IconFont style={{ fontSize: 20 }} type="icon-ceju" />
                <span className={[type.includes('cemian') ? 'select' : ''].join(' ')}>测面</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => deleteHandle()}>
                <IconFont style={{ fontSize: 20 }} type="icon-qingkong" />
                <span>清空</span>
              </div>
              <div className="tools-one-map  tools-item" onClick={() => barClick('fullscreen')}>
                <IconFont style={{ fontSize: 20 }} type="icon-fullScreen" />
                <span className={[type.includes('fullscreen') ? 'select' : ''].join(' ')}>
                  {type.includes('fullscreen') ? '退出全屏' : '全屏'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
