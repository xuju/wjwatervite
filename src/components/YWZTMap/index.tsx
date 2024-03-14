// 业务专题
import MapBox from '@/components/MapBox';
import Tools from '@/components/Tools';
import MapView from '@arcgis/core/views/MapView';
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import LayerControl from '@/components/LayerControl';
import BusinessRight from '@/components/BusinessRight';
import { useRequest } from 'ahooks';
import { basics, businessApi, popupAttrs, showModalLayer, supply } from '@/config';
import service from '@/axios';
import './index.less';
import { message, Modal } from 'antd';
import PopupSSSQ from '@/components/PopupSSSQ';
import LayerToggle from '@/components/LayerToggle';
import PopupSSYL from '@/components/PopupSSYL';
import PopupYLZD from '@/components/PopupYLZD';
import PopupSP from '@/components/PopupSP';
import ReactDOM from 'react-dom';
import PopupCom from '@/components/PopupCom';
import PopupQXWZ from '@/components/PopupQXWZ';
import PopupWatch from '@/components/PopupWatch';
import PopupHeader from '@/components/PopupHeader';
import PopupZJGC from '@/components/PopupZJGC';
import Point from '@arcgis/core/geometry/Point';
import BasicsPopup from '@/components/Basics/BasicsPopup';
import IdentifyTask from '@arcgis/core/tasks/IdentifyTask';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import { usePageContext } from '@/store';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import PopupSewage from '@/components/PopupSewage';
import MapImageList from '@/components/LayerTimeline';
import { hightLayer, locationGoto, renderPosition } from '@/utils';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import { useLayerContext } from '@/store/layer';
import { useLayerList, useView } from '@/utils/hooks';
import PopupModal from '@/components/PopupModal';
import FeaturePopup from '@/components/FeaturePopup';
import FeatureMousePopup from '@/components/FeatureMousePopup';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import LayerTimelineV2 from '@/components/LayerTimelineV2';
import PopupQSZL from '@/components/PopupQSZL';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import PopupVideos from '@/components/PopupVideos';

import Query from '@arcgis/core/rest/support/Query';
import AddLayer from '@/components/AddLayer';
import { useRecoilValue } from 'recoil';
import { mapTypeAtom } from '@/store/scene';
import SceneTools from '@/components/SceneTools';
import SceneView from '@arcgis/core/views/SceneView';
interface resultsType {
  // modalVisible: boolean;
  result: any[];
}

let clickHandel: IHandle | undefined;

const queryArr = [
  {
    url: businessApi.queryUrl,
    layer: ['水利工程', '圩区', '泵站', '水闸', '河道', '不达标圩堤', '三调水域情况']
  },
  {
    url: businessApi.queryUrl1,
    layer: ['排水泵站', '提质增效达标区']
  },
  {
    url: businessApi.queryUrl3,
    layer: ['已整治黑臭水体', '农村生态河道', '河道断面'] //水域管理范围线服务没有返回中文，暂不显示
  },
  {
    url: businessApi.queryUrl2,
    layer: ['市政污水管网', '市政雨水管网', '地块内部污水管网', '地块内部雨水管网']
  },
  {
    url: businessApi.queryUrl4,
    layer: ['水务基础设施空间布局规划']
  },
  {
    url: businessApi.queryUrl5,
    layer: ['湖泊', '堤防']
  },
  {
    url: supply.url,
    layer: ['供水管网']
  }
];

// 在建工程显示弹窗显示分类
const ccategory_zjgc = ['基础信息', '项目建设动态', '安全隐患'];
// 在抢险物资显示分类
const ccategory_qxwz = ['物资信息', '视频监控'];
//污水处理厂弹窗头部分类
const sewageType = ['基础信息', '监测信息'];
//feature显示小弹框
const featureShowSmallPopup = [
  '圩区',
  '已整治黑臭水体',
  '地块内部污水管网',
  '水务基础设施空间布局规划',
  '地块内部污水管段流向箭头',
  '地块内部污水管点',
  '地块内部污水管段',
  '市政雨水管段',
  '市政雨水管点',
  '市政雨水管段流向箭头',
  '市政污水管段流向箭头',
  '地块内部雨水管段流向箭头'
];
export const renderDom = (view: MapView | SceneView, attr: PointAttr, div: HTMLElement) => {
  if (!attr.point) return;

  let screenPoint = view?.toScreen(attr.point);
  if (!screenPoint) return;
  div.style.left = `${screenPoint?.x + 20}px`;
  div.style.top = `${screenPoint?.y - 50}px`;
  ReactDOM.render(<PopupCom data={attr} />, div);
  document.body.appendChild(div);
  view?.watch('extent', (e) => {
    let dom = document.getElementById('popupcom');
    let screenPoint = view?.toScreen(attr.point);
    if (!dom || !screenPoint) return;
    div.style.left = `${screenPoint?.x + 20}px`;
    div.style.top = `${screenPoint?.y - 50}px`;
  });
};

const YWZTMap = () => {
  const view = useView();
  const { dispatch } = usePageContext();
  const [selectToolBar, setSelectToolBar] = useState<string[]>(['onemap']);
  const [layerVisible, setLayerVisible] = useState(true);
  const [ztParam, setZtParam] = useState({ ztname: '', zztnames: '' });
  const [layers, setLayers] = useState([]);
  const [listLayers, setListLayers] = useState<any[]>([]);
  const [visible, setVisible] = useState(false); // 弹框
  const [results, setResults] = useState<resultsType>(); // 单击地图之间传递数据
  const [typeList, setTypeList] = useState<string[]>([]);
  const [selectTypeList, setSelectTypeList] = useState('');
  const [isBigAttrPopup, setIsBigAttrPopup] = useState<any[]>([]); //存储字段大弹窗
  const [selectAttr, setSelectAttr] = useState<PointAttr>();
  const [videos, setVideos] = useState<any[]>([]); //针对视频监控点位重复，分页
  const moveHandleRef = useRef<IHandle>();
  const mapType = useRecoilValue(mapTypeAtom);
  const { state: layerData, dispatch: layerDispatch } = useLayerContext();
  // 选择的图层
  const selectedLayers = useLayerList();
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
    layerDispatch({ type: 'setCurrentLayer', data: { currentLayer: '午夜蓝' } });
  }, []);
  //水闸泵站鼠标移入事件
  useEffect(() => {
    if (view) dispatch({ type: 'setView', data: { view } });

    view?.watch('scale', (...rest) => {
      const zoom = parseInt(rest.pop().zoom);

      if (zoom >= 8) {
        if (moveHandleRef.current) {
          let doms = document.getElementById('feature-mouse-wrap');
          doms && doms?.remove();
          moveHandleRef.current.remove();
          moveHandleRef.current = null as any;
        }
      } else {
        if (!moveHandleRef.current) {
          moveHandleRef.current = view?.on('pointer-move', moveFun);
        }
      }
    });
    const moveFun = function (event: any) {
      view?.hitTest(event).then(function (response) {
        if (response.results.length) {
          var graphic = response.results.find(function (result) {
            // check if the graphic belongs to the layer of interest
            if (result.graphic && result.graphic.layer) {
              if (
                result.graphic.layer.title === '水闸' ||
                result.graphic.layer.title === '泵站' ||
                result.graphic.layer.title === '流量监测'
              )
                return result;
            }
            return;
          });
          if (graphic) {
            const { mapPoint, graphic: graphics } = graphic;
            const { attributes } = graphics;
            const { name } = attributes;
            const screenPoint = view.toScreen(mapPoint);

            let doms = document.getElementById('feature-mouse-wrap');
            if (!doms) {
              const dom = document.createElement('div');
              dom.id = 'feature-mouse-wrap';

              doms = dom;
              document.body.append(doms);
            }
            doms.style.left = `${screenPoint.x + 20}px`;
            doms.style.top = `${screenPoint.y}px`;
            if (doms) {
              ReactDOM.render(<FeatureMousePopup name={name} />, doms);
            }
          }
        } else {
          let doms = document.getElementById('feature-mouse-wrap');
          if (doms) doms.remove();
        }
      });
    };
    moveHandleRef.current = view?.on('pointer-move', moveFun);
  }, [view]);
  //mapserver点击事件
  useEffect(() => {
    if (clickHandel) clickHandel.remove();
    let dom = document.getElementById('basics-coustom-popup-wrap');
    if (dom) dom.remove();

    if (selectedLayers) {
      clickHandel = view?.on('click', (event) => {
        let { mapPoint } = event;
        let promiseAll: any[] = [];

        view.hitTest(event).then((res) => {
          if (res.results.length) {
            let data = {
              modalVisible: true,
              result: { ...res.results }
            };
            setResults(data);
            return;
          } else {
            dispatch({ type: 'point', data: {} });
            const dom = document.getElementById('currPoint');
            if (dom) dom.remove();
          }
          let graphic = res.results;
          console.log(graphic, 'graphic');
          if (graphic.length <= 0) {
            let find = view.map.findLayerById('queryHightLayer') as GraphicsLayer;
            if (find) find.removeAll();
            for (let index = 0; index < queryArr.length; index++) {
              const layer = queryArr[index].layer;
              let layerIds: number[] = [];
              selectedLayers.forEach((item) => {
                if (layer.includes(item.layerzwmc)) {
                  if (item.layerid) {
                    const layerid = eval(item.layerid);
                    console.log(layerid, 'layerid');

                    layerIds = layerid.map((item: any) => item.id);
                  } else {
                    console.log('没有图层id');
                  }
                }
              });

              if (layerIds.length > 0) {
                let identifyTask = new IdentifyTask({ url: queryArr[index].url });
                let params = new IdentifyParameters();
                // 容差
                params.tolerance = 6;
                // 是否返回几何信息
                params.returnGeometry = true;
                // 空间查询的图层
                params.layerIds = layerIds;
                // 指定使用“标识”时要使用的图层。
                params.layerOption = 'all';
                params.geometry = mapPoint;
                params.width = view.width;
                params.height = view.height;
                params.mapExtent = view.extent;
                params.spatialReference = view.spatialReference;
                let query = identifyTask.execute(params);
                promiseAll.push(query);
              }
            }
            Promise.all(promiseAll).then((res) => {
              if (res && res.length > 0) {
                const data: any[] = [];
                let layerNames = '';
                res.forEach((item) => {
                  item.results.forEach((f: any) => {
                    const { layerName, feature } = f;
                    const { attributes } = feature;
                    layerNames = layerName;
                    attributes.mapPoint = mapPoint;
                    attributes.layerName = layerName.trim();
                    data.push(attributes);
                  });
                });
                if (layerNames === '提质增效达标区') return;
                //判断显示大的字段弹框还是小的
                if (showModalLayer.includes(layerNames)) {
                  hightLayer(view, res, mapPoint, false);

                  setIsBigAttrPopup(data);
                } else {
                  hightLayer(view, res, mapPoint, true);
                }
                return data;
              }
            });
          }
        });
      });
    }
  }, [selectedLayers]);
  useEffect(() => {
    // 待拓展
    setZtParam({ ztname: '', zztnames: '' });
  }, []);

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
    if (selectToolBar.includes('onemap')) {
      setLayerVisible(true);
    } else {
      setLayerVisible(false);
    }
  }, [selectToolBar]);
  const imagesFlag = useMemo(() => {
    if (selectToolBar.includes('yx')) {
      return true;
    } else {
      return false;
    }
  }, [selectToolBar]);
  //feature要素点击事件
  useEffect(() => {
    if (results) {
      let attr = results.result[0].graphic.attributes;

      if (!attr) return; // 防止测距测面失效

      const { layerName, mapPoint } = attr;
      dispatch({ type: 'point', data: attr });
      setSelectAttr(attr);
      if (attr.them === '水质在线监测') {
        return;
      }
      if (attr.them === '视频监控' && view) {
        const findLayer = view.map.findLayerById('watchvideo') as GroupLayer;
        let mapPoint: any = results.result[0].mapPoint;
        if (findLayer) {
          const videoFeatureLayer = findLayer.findLayerById('videoFeatureLayer') as FeatureLayer;
          if (videoFeatureLayer) {
            let query = videoFeatureLayer.createQuery();

            query.geometry = {
              type: 'point',
              longitude: mapPoint.x,
              latitude: mapPoint.y
            } as any;
            query.distance = 60;
            query.spatialRelationship = 'intersects';
            // videoFeatureLayer.queryFeatures(query).then((results) => {
            //   console.log(results.features);
            // });

            videoFeatureLayer
              .queryFeatures(query)
              .then((results) => {
                console.log(results, 'results');

                let arr: any[] = [];
                results.features.forEach((item) => {
                  arr.push(item.attributes);
                });

                setVideos(arr);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }

        return;
      }

      if (attr.them === '实时水情') {
        attr.name = attr.stnm ?? '';
      }

      if (attr.them === '在建工程') {
        setTypeList(ccategory_zjgc);
        setSelectTypeList(ccategory_zjgc[0]);
      } else if (attr.them === '抢险物资') {
        setTypeList(ccategory_qxwz);
        setSelectTypeList(ccategory_qxwz[0]);
      } else if (attr.them === '污水处理厂') {
        setTypeList(sewageType);
        setSelectTypeList(sewageType[0]);
      } else {
        setTypeList([]);
        setSelectTypeList('');
      }
      if (layerName && showModalLayer.includes(layerName)) {
        setIsBigAttrPopup([attr]);
        return;
      }

      if (featureShowSmallPopup.includes(layerName)) {
        view && locationGoto(view, mapPoint);
        let dom = document.getElementById('basics-coustom-popup-wrap');
        if (!dom) {
          let div = document.createElement('div');
          div.id = 'basics-coustom-popup-wrap';
          view && view.container.appendChild(div);
          dom = div;
        }

        view && renderPosition(view, mapPoint, [attr], dom);
        view &&
          view.watch('extent', () => {
            view && dom && renderPosition(view, mapPoint, [attr], dom);
          });
        return;
      }
      // showModalLayer
      if (attr.modalVisible) {
        setVisible(attr.modalVisible);
      } else {
        let dom = document.getElementById('popupcom');
        if (!dom) {
          let div = document.createElement('div');
          div.id = 'popupcom';
          document.body.appendChild(div);

          view && renderDom(view, attr, div);
        } else {
          view && renderDom(view, attr, dom);
        }
      }
    }
  }, [results]);

  useEffect(() => {
    if (selectedLayers && view) {
      let selectPointAnimate = document.getElementById('currPoint');
      if (selectPointAnimate) selectPointAnimate.remove();
      // //删除河道高亮
      let findHight = view.map.findLayerById('hightLayer') as GraphicsLayer;
      if (findHight) {
        findHight.removeAll();
      }
      //删除水务基础设施高亮
      let waterBaseHight = view.map.findLayerById('waterBaseHightLayer') as GraphicsLayer;
      if (waterBaseHight) {
        waterBaseHight.removeAll();
      }
      //删除查询高亮
      let queryHight = view.map.findLayerById('queryHightLayer') as GraphicsLayer;
      if (queryHight) queryHight.removeAll();
      const find = selectedLayers.find((f) => f.layerzwmc === '实时水情');
      if (!find) {
        let dom = document.getElementsByClassName('实时水情');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());

        const findLayer = view.map.findLayerById('sssq') as GraphicsLayer;
        findLayer && findLayer.removeAll();
        dispatch({ type: 'setTbas', data: { selectTabs: 'hd' } });
      }

      const find1 = selectedLayers.find((f) => f.layerzwmc === '实时雨量');
      if (!find1) {
        let dom = document.getElementsByClassName('实时雨量');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());

        view.map.remove(view.map.findLayerById('equivalenceline'));
        view.map.remove(view.map.findLayerById('equivalencePolygon'));
      }
      const find2 = selectedLayers.find((f) => f.layerzwmc === '易涝站点');
      if (!find2) {
        let dom = document.getElementsByClassName('易涝站点');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());
      }
      const find3 = selectedLayers.find((f) => f.layerzwmc === '视频监控');
      if (!find3) {
        const findLayer = view.map.findLayerById('watchvideo') as GroupLayer;
        findLayer && findLayer.removeAll();
      }
      const find4 = selectedLayers.find((f) => f.layerzwmc === '供水管网');
      if (!find4) {
        const findLayer = view.map.findLayerById('supplyLayer') as GraphicsLayer;
        findLayer && findLayer.removeAll();
      }
      const find5 = selectedLayers.find((f) => f.layerzwmc === '水务基础设施空间布局规划');
      if (!find5) {
        const findLayer = view.map.findLayerById('waterBase') as MapImageLayer;
        view.map.remove(findLayer);
      }
      const find6 = selectedLayers.find((f) => f.layerzwmc === '水质在线监测');
      if (!find6) {
        let dom = document.getElementsByClassName('水质在线监测');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());
      }
      const find7 = selectedLayers.find((f) => f.layerzwmc === '提升泵站');
      if (!find7) {
        const findLayer = view.map.findLayerById('pumdLayer') as GraphicsLayer;
        findLayer && findLayer.removeAll();
      }
      const find8 = selectedLayers.find((f) => f.layerzwmc === '视频监控');
      if (!find8) {
        let dom = document.getElementsByClassName('视频监控');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());
      }
      const find9 = selectedLayers.find((f) => f.layerzwmc === '泵站');
      if (!find9) {
        let dom = document.getElementsByClassName('泵站');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());
      }
      const find10 = selectedLayers.find((f) => f.layerzwmc === '水闸');
      if (!find10) {
        let dom = document.getElementsByClassName('水闸');
        let arr = Array.from(dom);
        arr.forEach((item) => item && item.remove());
      }
    }
  }, [selectedLayers]);
  const onCancel = () => {
    setVisible(false);
    setVideos([]);
  };

  const autoHeightArr = [
    '雨水排口',
    '截流设施',
    '提升泵站',
    '水闸',
    '泵站',
    '农污设施',
    '取水量监测'
  ];
  const autoHeight = useMemo(() => {
    if (selectAttr) {
      if (autoHeightArr.includes(selectAttr.them)) {
        return 'modal-auto-height';
      } else {
        return 'modal-height';
      }
    }
  }, [selectAttr]);
  useEffect(() => {
    return () => {
      layerDispatch({ type: 'setList', data: { list: [] } });
      layerDispatch({ type: 'setCurrent', data: { current: null } });
      setSelectToolBar(['onemap']);

      view?.graphics.removeAll();
      view?.map.destroy();
      view?.destroy();
      dispatch({ type: 'setView', data: { view: null } });
    };
  }, []);

  return (
    <div className="YWZTMap">
      <MapBox onClick={setResults} showPosition={true} />
      {view && <AddLayer view={view} allLayers={listLayers} />}
      {view && <Tools view={view} clickCallback={setSelectToolBar} type={selectToolBar} />}

      {layerVisible && <LayerControl layerList={layers} />}
      {/* {imagesFlag && <MapImageList />} */}
      {imagesFlag && <LayerTimelineV2 />}
      {view && <BusinessRight />}
      {view && <LayerToggle view={view} />}
      <PopupModal data={isBigAttrPopup} setResponse={setIsBigAttrPopup} />

      {visible && selectAttr && (
        <Modal
          title={
            <PopupHeader
              title={selectAttr.name}
              list={typeList}
              setSelectTypeList={setSelectTypeList}
              selectTypeList={selectTypeList}
            />
          }
          className={['businesspopup', autoHeight].join(' ')}
          footer={null}
          visible={visible}
          onCancel={onCancel}
          width={904}
          centered
        >
          {selectAttr.them === '实时水情' && (
            <PopupSSSQ
              url={`${selectAttr.url}`}
              smallType={Number(selectAttr.type)}
              id={`${selectAttr.stcd}`}
            />
          )}
          {selectAttr.them === '实时雨量' && (
            <PopupSSYL id={selectAttr.OBJECTID} url={selectAttr.url} attr={selectAttr} />
          )}
          {selectAttr.them === '易涝站点' && (
            <PopupYLZD id={selectAttr.OBJECTID} url={selectAttr.url} attr={selectAttr} />
          )}

          {selectAttr.them === '抢险物资' && <PopupQXWZ attr={selectAttr} type={selectTypeList} />}
          {selectAttr.them === '污水处理厂' && (
            <PopupSewage attr={selectAttr} type={selectTypeList} />
          )}
          {selectAttr.them === '流量监测' && <PopupWatch attr={selectAttr} type={selectTypeList} />}
          {selectAttr.them == '液位监测' && <PopupWatch attr={selectAttr} type={selectTypeList} />}
          {selectAttr.them == '在建工程' && <PopupZJGC attr={selectAttr} type={selectTypeList} />}
          {selectAttr.them === '雨水排口' && <FeaturePopup data={{ ...selectAttr }} />}
          {selectAttr.them === '截流设施' && <FeaturePopup data={{ ...selectAttr }} />}
          {selectAttr.them === '提升泵站' && <FeaturePopup data={{ ...selectAttr }} />}
          {selectAttr.them === '水闸' && (
            <FeaturePopup
              data={{ ...selectAttr }}
              customAttr={popupAttrs.find((f) => f.name === '水闸')}
            />
          )}

          {selectAttr.them === '泵站' && (
            <FeaturePopup
              data={{ ...selectAttr }}
              customAttr={popupAttrs.find((f) => f.name === '泵站')}
            />
          )}
          {selectAttr.them === '农污设施' && <FeaturePopup data={{ ...selectAttr }} />}
          {selectAttr.them === '取水量监测' && <PopupQSZL data={{ ...selectAttr }} />}
        </Modal>
      )}

      {selectAttr && selectAttr.them === '视频监控' && videos && (
        <PopupVideos attr={videos} setAttr={setVideos} />
      )}
    </div>
  );
};

export default YWZTMap;
