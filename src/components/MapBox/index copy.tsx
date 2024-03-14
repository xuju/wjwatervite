import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import BaseMap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';
import MapView from '@arcgis/core/views/MapView';
import { ArcGISOptions, getLayers } from '@/config';
import * as urlUtils from '@arcgis/core/core/urlUtils';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Point from '@arcgis/core/geometry/Point';
import { useRequest } from 'ahooks';
import service from '@/axios';
import './index.less';
import { message } from 'antd';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { memo } from 'react';
import { usePageContext } from '@/store';
import ReactDOM from 'react-dom';
import AnchorPonint from '../AnchorPonint';
import { bzAndsz, levelWater, locationGoto, popupRenderOne } from '@/utils';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import { useLayerContext } from '@/store/layer';
import { useLayerListContext } from '@/store/LayerList';
import ylImg1 from '@/assets/images/蓝色.png';
import ylImg2 from '@/assets/images/黄色.png';
import ylImg3 from '@/assets/images/橙色.png';
import ylImg4 from '@/assets/images/红色.png';
import { mapProxy } from '@/utils/mapProxy';
import SceneView from '@arcgis/core/views/SceneView';
interface Props {
  getView?: Function;
  selectedLayers?: any[];
  allLayers?: any[];
  onClick?: Function;
  showPosition?: boolean;
}

const MapBox = (props: Props) => {
  const [view, setView] = useState<MapView>();
  const [hoverLocation, setHoverLocation] = useState<Point>();
  const { run } = useRequest((url, param) => service.post(url, param), { manual: true });
  const { data: LayerData } = useRequest(() => service.get(getLayers.getLayers));
  const { getView, allLayers, onClick, showPosition = false } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { state, dispatch } = usePageContext();
  const { state: layerListData, dispatch: layerListDispatch } = useLayerListContext();
  const { state: layerData } = useLayerContext();
  const selectedLayers = useMemo(() => {
    if (layerData && layerData.list) {
      return layerData.list;
    } else {
      return [];
    }
  }, [layerData]);
  const initMap = (layerArr: any[]) => {
    // urlUtils.addProxyRule({
    //   urlPrefix: ArcGISOptions.urlPrefix,
    //   proxyUrl: ArcGISOptions.proxy
    // });
    mapProxy.other();
    // 新建基础地图
    const findLayer = layerArr.find((f) => f.title === '午夜蓝');
    // const wy = new TileLayer({
    //     url: mapurl.wyl,
    //     id: 'dianzi'
    // });
    const baseLayers: __esri.CollectionProperties<__esri.LayerProperties> = [];
    if (findLayer) {
      const url = (window as any).isTest ? findLayer.testurl : findLayer.onlineurl;

      const baseLayer = new TileLayer({
        url: url,
        id: findLayer.title,
        visible: true,
        maxScale: 70.53107352157943
      });
      baseLayers.push(baseLayer);
    }

    const basemap = new BaseMap({
      baseLayers,
      title: 'Custom Basemap',
      id: 'wyl'
    });
    const map = new Map({
      basemap
    });
    const view = new MapView({
      map,
      container: ref.current as HTMLDivElement,
      center: new Point({
        x: 120.62395924265776,
        y: 31.001418599360157,
        spatialReference: new SpatialReference({ wkid: 4490 })
      }),
      zoom: 3,
      spatialReference: new SpatialReference({ wkid: 4490 })
    });

    const pointGroupLayer = new GroupLayer({
      id: 'pointGroup',
      visibilityMode: 'inherited',
      visible: true
    });
    const lineGroupLayer = new GroupLayer({
      id: 'lineGroup',
      visibilityMode: 'inherited',
      visible: true
    });
    const polyonGroupLayer = new GroupLayer({
      id: 'polyonGroup',
      visibilityMode: 'inherited',
      visible: true
    });
    view.map.addMany([polyonGroupLayer, lineGroupLayer, pointGroupLayer], 100);
    view.when(() => {
      if (view) dispatch({ type: 'setView', data: { view } });
    });
    view.on('click', function (event) {
      // //删除河道高亮
      // let findHight = view.map.findLayerById('hightLayer') as GraphicsLayer;
      // if (findHight) {
      //   findHight.removeAll();
      // }
      if (props.onClick) {
        view.hitTest(event).then((response) => {
          if (response.results.length) {
            let data = {
              // modalVisible: true,
              result: { ...response.results }
            };

            return props.onClick!(data);
          } else {
            dispatch({ type: 'point', data: {} });
            if (document.getElementById('currPoint'))
              document
                .getElementById('currPoint')
                ?.parentNode?.removeChild(document.getElementById('currPoint')!);
          }
        });
      }
    });
    view.on('pointer-move', (event) => {
      const { x, y } = event;
      const location = view.toMap({ x, y });
      setHoverLocation(location);
    });

    view.ui.remove('zoom');
    view.ui.remove('attribution');
    getView && getView(view);
    setView(view);

    var scaleBar = new ScaleBar({
      view: view,
      unit: 'metric'
    });

    view.ui.add(scaleBar, {
      position: 'bottom-right'
    });
  };
  useEffect(() => {
    if (LayerData && LayerData.data && LayerData.data.code == 200) {
      const result = LayerData.data.data;

      initMap(result);
    }
  }, [LayerData]);

  useEffect(() => {
    let { x, y } = state.pointData;
    if (x && y && view) {
      let currP = new Point({ x, y, spatialReference: new SpatialReference({ wkid: 4490 }) });
      let div = document.getElementById('currPoint');
      if (!div) {
        div = document.createElement('div');
        div.id = 'currPoint';
        div.style.position = 'absolute';
        div.style.pointerEvents = 'none';
        ref.current!.appendChild(div);
      }

      view.watch('extent', function () {
        let screenPoint = view.toScreen(currP);
        if (div) {
          div.style.left = `${screenPoint.x - 28}px`;
          div.style.top = `${screenPoint.y - 28}px`;
          ReactDOM.render(<AnchorPonint />, div);
        } else {
          div!.style.left = `${screenPoint.x}px`;
          div!.style.top = `${screenPoint.y}px`;
        }
      });
      locationGoto(view, currP).then(() => {
        dispatch({ type: 'point', data: {} });
      });
    }
    return () => {};
  }, [state.pointData]);

  useEffect(() => {
    if (view) {
      const popupdom = document.getElementById('popupcom');
      popupdom && popupdom.remove();
      let pointGroup = view.map.allLayers.find((layer) => layer.id === 'pointGroup') as GroupLayer;
      let lineGroup = view.map.allLayers.find((layer) => layer.id === 'lineGroup') as GroupLayer;
      let polyonGroup = view.map.allLayers.find(
        (layer) => layer.id === 'polyonGroup'
      ) as GroupLayer;
      // 取消选中图层

      let unSelectedLayers =
        allLayers && selectedLayers && allLayers.filter((item) => selectedLayers.indexOf(item) < 0);

      unSelectedLayers &&
        unSelectedLayers.forEach((item: { id: string; layerzwmc: string }) => {
          if (pointGroup.findLayerById(item.id)) {
            pointGroup.remove(pointGroup.findLayerById(item.id));
          }
          if (lineGroup.findLayerById(item.id)) {
            lineGroup.remove(lineGroup.findLayerById(item.id));
          }
          if (polyonGroup.findLayerById(item.id)) {
            polyonGroup.remove(polyonGroup.findLayerById(item.id));
          }
        });
      // 选择图层

      selectedLayers &&
        selectedLayers.forEach(
          (item: {
            layertype: string;
            url: string;
            id: string;
            opconfig: string;
            layerid: string;
            icon: string;
            layerzwmc: string;
          }) => {
            if (item.layerzwmc === '水务基础设施空间布局规划') return; //选择子图层加载，而不是加载所有的图层)
            let opconfigJ = JSON.parse(item.opconfig);
            let lyr = null;
            let popupTemplate: any = null;

            if (item.layertype === 'MapServer') {
              lyr = new MapImageLayer({
                url: item.url,
                id: item.id,
                title: item.layerzwmc,
                sublayers: JSON.parse(item.layerid)
              });
            }
            if (item.layertype === 'Tile') {
              lyr = new TileLayer({
                url: item.url,
                id: item.id,
                title: item.layerzwmc,
                maxScale: 70.53107352157943
              });
            }
            if (item.layertype === 'Feature') {
              lyr = new FeatureLayer({
                url: `${item.url}/${item.layerid}`,
                id: item.id,
                title: item.layerzwmc,
                renderer: new SimpleRenderer({
                  symbol: new PictureMarkerSymbol({
                    url: item.icon.replace('.png', '_1.png'),
                    width: '20px',
                    height: '20px'
                  })
                })
              });
            }
            //不需要加载图层
            if (
              item.layertype === 'Api' &&
              item.layerzwmc !== '实时水情' &&
              item.layerzwmc !== '供水管网' &&
              item.layerzwmc != '提升泵站'
            ) {
              const params = { ...opconfigJ };
              delete params.modalVisible;
              // 业务类图层
              run(item.url, opconfigJ).then((res) => {
                let { data } = res;
                if (data && data.code === '200') {
                  let { listdata } = data.data;

                  if (layerListData.list.length > 0) {
                    const isFindLayerData = layerListData.list.find(
                      (f) => f.name === item.layerzwmc
                    );

                    if (!isFindLayerData) {
                      layerListDispatch({
                        type: 'setList',
                        data: {
                          name: item.layerzwmc,
                          list: data.data
                        }
                      });
                    }
                  } else {
                    layerListDispatch({
                      type: 'setList',
                      data: {
                        name: item.layerzwmc,
                        list: data.data
                      }
                    });
                  }

                  if (!pointGroup.findLayerById(item.id)) {
                    let lyrtmp = new GraphicsLayer({ id: item.id, title: item.layerzwmc });
                    let Iconurl = item.icon.replace('.png', '_1.png');

                    listdata.listdata.forEach((it: any) => {
                      let point = new Point({
                        x: it.x * 1,
                        y: it.y * 1,
                        spatialReference: new SpatialReference({ wkid: 4490 })
                      });

                      let attributes: any = {
                        OBJECTID: it.id,
                        url: item.url,
                        type: it.type,
                        name: it.name,
                        them: item.layerzwmc,
                        point: point,
                        iscjj: it.iscjj,
                        x: it.x * 1,
                        y: it.y * 1
                      };

                      if (item.layerzwmc === '实时雨量') {
                        const { drp } = it;
                        let iconName = levelWater(drp);

                        Iconurl = `${item.icon.substring(
                          0,
                          item.icon.lastIndexOf('/')
                        )}/${iconName}.png`;

                        attributes = {
                          ...it,
                          OBJECTID: it.stcd,
                          url: item.url,
                          type: it.drp,
                          name: it.stnm,
                          them: item.layerzwmc
                        };
                        if (attributes.systemid === 1) {
                          popupRenderOne(attributes, view);
                        }
                      }
                      if (item.layerzwmc === '易涝站点') {
                        attributes = { ...attributes, ...it };
                        if (attributes.status === '正常') {
                          Iconurl = ylImg1;
                        }
                        if (attributes.status === '蓝') {
                          Iconurl = ylImg1;
                        }
                        if (attributes.status === '黄') {
                          Iconurl = ylImg2;
                        }
                        if (attributes.status === '橙') {
                          Iconurl = ylImg3;
                        }
                        if (attributes.status === '红') {
                          Iconurl = ylImg4;
                        }

                        popupRenderOne(attributes, view);
                      }
                      if (
                        item.layerzwmc === '泵站' ||
                        item.layerzwmc === '水闸' ||
                        item.layerzwmc === '流量监测'
                      ) {
                        bzAndsz(attributes, view);
                      }
                      if (item.layerzwmc === '液位监测') {
                        const { iswarn, isoverwarn } = it;
                        if (isoverwarn) {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_2`);
                        } else if (iswarn) {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_3`);
                        } else {
                          Iconurl = item.icon.replace(`${item.layerzwmc}`, `${item.layerzwmc}_1`);
                        }
                      }
                      if (opconfigJ.modalVisible === true)
                        // 大弹窗
                        attributes = { ...attributes, modalVisible: true };

                      let symbol = new PictureMarkerSymbol({
                        url: Iconurl,
                        width: 18,
                        height: 18,
                        xoffset: 2,
                        yoffset: -2
                      });

                      let pointGraphic = new Graphic({
                        geometry: point,
                        symbol: symbol,
                        attributes: attributes,
                        popupTemplate: popupTemplate
                      });

                      lyrtmp.add(pointGraphic);
                    });

                    pointGroup.add(lyrtmp);
                  }
                } else {
                  message.error(data);
                }
              });
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPolygon' &&
              lyr &&
              !polyonGroup.findLayerById(item.id)
            ) {
              polyonGroup.add(lyr);
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPolyline' &&
              lyr &&
              !lineGroup.findLayerById(item.id)
            ) {
              lineGroup.add(lyr);
            }
            if (
              opconfigJ &&
              opconfigJ.lyrtype === 'esriGeometryPoint' &&
              lyr &&
              !pointGroup.findLayerById(item.id)
            ) {
              pointGroup.add(lyr);
            }
          }
        );
    }
  }, [selectedLayers]);

  return (
    <>
      <div ref={ref} style={{ width: '100%', height: '100%' }} id="viewDiv" className="viewDiv" />
      {showPosition && hoverLocation && (
        <div className="position-wrap">
          x:{hoverLocation?.x.toFixed(6)} y:{hoverLocation?.y.toFixed(6)}
        </div>
      )}
    </>
  );
};
export default memo(MapBox);
