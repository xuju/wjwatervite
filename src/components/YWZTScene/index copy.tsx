import React, { useEffect, useState } from 'react';
import './index.less';
import SceneMap from '../SceneMap';
import LayerToggle from '../LayerToggle';
import { useRecoilValue } from 'recoil';
import { sceneAtom } from '@/store/scene';
import SceneLayerToggle from '../LayerToggle/SceneLayerToggle';
import SceneTools from '../SceneTools';
import LayerControl from '../LayerControl';
import { useRequest } from 'ahooks';
import service from '@/axios';
import { businessApi } from '@/config';
import { message } from 'antd';

export default function YWZTScene() {
  const view = useRecoilValue(sceneAtom);
  const [selectToolBar, setSelectToolBar] = useState<string[]>(['onemap']);
  const [layerVisible, setLayerVisible] = useState(true);
  const [layers, setLayers] = useState([]);
  const [ztParam, setZtParam] = useState({ ztname: '', zztnames: '' });
  const [listLayers, setListLayers] = useState<any[]>([]);
  const { run: getLayersRun } = useRequest(() => service.post(businessApi.getLayers, ztParam), {
    manual: true
  });
  let aLyrList: any[] = [];
  const dealTreeData = (data: any[]) => {
    data.map((e: any) => {
      aLyrList.push(e);
      if (e.childs && e.childs.length > 0) dealTreeData(e.childs);
    });
    return aLyrList;
  };
  useEffect(() => {
    if (selectToolBar.includes('onemap')) {
      setLayerVisible(true);
    } else {
      setLayerVisible(false);
    }
  }, [selectToolBar]);
  useEffect(() => {
    getLayersRun()
      .then((res) => {
        if (res && res.status === 200 && res.data.code === '200') {
          setLayers(res.data.data);
          let list: any = dealTreeData(res.data.data);
          setListLayers(list);
        }
      })
      .catch((e: any) => {
        message.error(e);
      });
  }, [ztParam]);
  useEffect(() => {
    if (view) {
    }
  }, [view]);
  return (
    <div className="YWZTScene">
      {view && <SceneLayerToggle view={view} layerList={window.tokenConfig.layerList} />}
      <SceneMap />
      {view && <SceneTools view={view} clickCallback={setSelectToolBar} type={selectToolBar} />}
      {layerVisible && <LayerControl layerList={layers} />}
    </div>
  );
}
