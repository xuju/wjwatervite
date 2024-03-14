// 综合基础
import service from '@/axios';
import BasicsLayer from '@/components/Basics/BasicsLayer';
import BasicsLeft from '@/components/Basics/BasicsLeft';
import BasicsRight from '@/components/Basics/BasicsRight';
import Footer from '@/components/Footer';
import LayerToggle from '@/components/LayerToggle';
import MapBox from '@/components/MapBox';
import { basics, CODE_NAME, loginApi, projectID, TOKEN_NAME } from '@/config';
import MapView from '@arcgis/core/views/MapView';
import { useRequest } from 'ahooks';
import { Descriptions, message, Modal } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import ReactDOM from 'react-dom';
import './index.less';
import BasicsPopup from '@/components/Basics/BasicsPopup';
import Point from '@arcgis/core/geometry/Point';
import { getCode, hightLayer } from '@/utils';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { useLayerList, useView } from '@/utils/hooks';
import PopupModal from '@/components/PopupModal';
import { useLayerContext } from '@/store/layer';
import AddLayer from '@/components/AddLayer';

let clickHandel: IHandle | undefined;

function Comprehensive() {
  // 选择的图层

  const selectedLayers = useLayerList();
  const { dispatch } = useLayerContext();
  const { data } = useRequest(() => service.get(basics.getStatis));
  const view = useView();
  const { data: allLyaerData } = useRequest(
    () => service.post(basics.getLayers, { xmid: projectID, mapname: '综合基础' }),
    {
      formatResult: (data: any) => {
        return dealTreeData(data.data.data);
      }
    }
  );

  const [response, setResponse] = useState<any[]>([]);
  const { dispatch: layerDispatch } = useLayerContext();
  let aLyrList: any[] = [];
  const dealTreeData = (data: any[]) => {
    data.map((e: any) => {
      aLyrList.push(e);
      if (e.childs && e.childs.length > 0) dealTreeData(e.childs);
    });
    return aLyrList;
  };
  useEffect(() => {
    layerDispatch({ type: 'setCurrentLayer', data: { currentLayer: '午夜蓝' } });
    return () => {
      dispatch({ type: 'setList', data: { list: [] } });
    };
  }, []);

  useEffect(() => {
    if (selectedLayers && view) {
      let find = view.map.findLayerById('hightLayer') as GraphicsLayer;
      if (find) find.removeAll();
    }
  }, [selectedLayers, view]);

  const layerIds = useMemo(() => {
    let arr: number[] = [];
    if (selectedLayers) {
      selectedLayers.forEach((item: any) => {
        const layerid = eval(item.layerid);
        if (layerid && layerid.length > 0) {
          arr.push(layerid[0].id);
        }
      });
    }
    return arr;
  }, [selectedLayers]);
  useEffect(() => {
    if (view) {
      view.on('click', (e) => {
        view.hitTest(e).then((response) => {
          if (response) {
            const results = response.results;

            let temp = results.map((item) => {
              const { graphic } = item;
              const { attributes } = graphic;
              return attributes;
            });

            setResponse(temp);
          }
        });
      });
    }
  }, [view]);
  useEffect(() => {
    if (clickHandel) clickHandel.remove();
    if (selectedLayers && selectedLayers.length > 0) {
      clickHandel = view?.on('click', (event: any) => {
        let { mapPoint } = event;
        let find = view.map.findLayerById('baseRiverLayer') as GraphicsLayer;

        if (find) find.removeAll();
        var identifyTask = new IdentifyTask({ url: basics.clickQueryUrl });
        var params = new IdentifyParameters();
        //容差
        params.tolerance = 6;
        //是否返回几何信息
        params.returnGeometry = true;
        //空间查询的图层
        params.layerIds = layerIds;
        //指定使用“标识”时要使用的图层。
        params.layerOption = 'all';
        params.geometry = mapPoint;
        params.width = view.width;
        params.height = view.height;
        params.mapExtent = view.extent;
        params.spatialReference = view.spatialReference;

        identifyTask
          .execute(params)
          .then((response) => {
            hightLayer(view, [response], mapPoint, false);
            const results = response.results;

            return results.map((result: any) => {
              let feature = result.feature;
              let layerName = result.layerName;
              const { attributes } = feature;
              attributes.layerName = layerName;
              return attributes;
            });
          })
          .then((response: any) => {
            if (response && response.length > 0) {
              setResponse(response);
            } else {
              message.destroy();
              message.warn('暂无数据');
            }
          });
      });
    }
  }, [selectedLayers, view]);
  const rightData = useMemo(() => {
    if (data && data) return data?.data?.data?.data.slice(4, 8);
  }, [data]);
  const leftData = useMemo(() => {
    if (data) return data?.data?.data?.data.slice(0, 4);
  }, [data]);

  return (
    <>
      <MapBox />
      {view && <AddLayer view={view} allLayers={allLyaerData} />}
      {leftData && <BasicsLeft data={leftData} />}
      {rightData && <BasicsRight data={rightData} />}
      <Footer />
      {allLyaerData && <BasicsLayer data={allLyaerData} />}
      {view && <LayerToggle view={view} />}
      <PopupModal data={response} setResponse={setResponse} />
    </>
  );
}
export default Comprehensive;
