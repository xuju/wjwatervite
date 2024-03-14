// 地图地址
export const mapurl = [
  {
    layerName: '午夜蓝',
    url: 'http://172.16.9.114:6080/arcgis/rest/services/BaseMap/BlueMap2019_2000/MapServer',
    visible: true
  },
  {
    layerName: '电子',
    url: 'http://172.16.9.114:6080/arcgis/rest/services/BaseMap/szdzdt2019_2000/MapServer',
    visible: false
  },
  {
    layerName: '影像',
    url: 'http://172.16.9.114:6080/arcgis/rest/services/BaseMap/SZDOM2017_2000/MapServer',
    visible: false
  }
];
export const BASENAME = import.meta.env.BASE_URL;
export const MAP_TOKNE = 'MAP_TOKNE';
export const development = {
  domain: 'http://172.16.9.115:6080'
};
export const production = {
  domain: 'http://2.37.106.209:6080'
};
const queryUrlThis = window.isTest ? development.domain : production.domain;
const queryUrlPT = window.isTest ? development.domain : 'http://172.16.102.117:1143/';
const arcgisApiRoot = window.isTest ? 'http://172.16.9.155' : 'http://2.37.106.209:8081';
export const backUrl = 'http://2.37.106.209:9852/0j1t?sysId=e0a5&tenantId=1b5f';
export const outUrl = 'http://2.37.106.209:9852/login';
export const videourl = window.isTest
  ? 'http://172.16.9.155:83/wjswapi/static/PondVideo'
  : 'http://2.37.106.209:8081/static/PondVideo';
export const ArcGISOptions = {
  urlPrefix: window.isTest ? 'http://172.16.9.114:6080' : 'http://10.70.0.43:6080', // 'http://2.37.106.187:8001',172.16.102.117:1143
  // 代理地址
  proxy: arcgisApiRoot + '/arcgis_js_api/proxy/DotNet/proxy.ashx',
  // 字体地址
  fontUrl: arcgisApiRoot + '/arcgis_js_api/font'
};

export const projectID = '4350392d-5e1a-4993-a6a9-7ccd0f87c2b9';
export const loginApi = {
  login: '/Security/Login'
};

export const getLayers = {
  getLayers: '/Baselayer/GetBaseUrlLayer',
  Get3DBaseUrlLayer: '/Baselayer/Get3DBaseUrlLayer'
};

export const getMenu = {
  getMneu: '/SysMenus/GetUserRoleMenuList?xmid=4350392d-5e1a-4993-a6a9-7ccd0f87c2b9'
};

export const businessApi = {
  getLayers: '/Map/getLayerbyName',
  getSSYLLegend: '/BusinessThemV1/getSsylRightLjtjlegend',
  queryUrl: queryUrlThis + '/arcgis/rest/services/WJWATER/SGC/MapServer',
  queryUrl1: queryUrlThis + '/arcgis/rest/services/WJWATER/CSPS/MapServer',
  queryUrl2: queryUrlThis + '/arcgis/rest/services/WJWATER/WJGW/MapServer',
  queryUrl3: queryUrlThis + '/arcgis/rest/services/WJWATER/HHBH/MapServer',
  queryUrl4: queryUrlThis + '/arcgis/rest/services/WJWATER/KJBJGH_SWJCSS/MapServer', //水务基础设施空间布局规划查询图层
  queryUrl5: queryUrlThis + '/arcgis/rest/services/WJWATER/BASICDATA/MapServer',
  get3DLayer: '/Map/get3DLayer'
};

export const commandApi = {
  getCommandList: '/CommandV1/getCommandYld',
  getFloodList: '/CommandV1/getfloodList',
  getTabsType: '/CommandV1/getCommandRight',
  getRadiusData: '/CommandV1/getCommandScopeByRandId',
  getDetail: '/CommandV1/getCommandDetail',
  getPointType: '/CommandV1/getCommandDevAllbytype',
  getCommandContrast: '/CommandV1/getCommandContrast',
  getLayer: '/Map/getLayerbyName',
  getFloodReportDetail: '/CommandV1/getFloodReportDetail'
};
export const commandTargetUrl = 'http://2.37.106.209:9852/64ig?sysId=e0a5&tenantId=1b5f';
// 综合基础
export const basics = {
  getLayers: '/Map/getLayerbyName',
  getStatis: '/SysMenus/getShowIndicators?MenuID=b1754c56-08a5-49b6-8f2a-c6da8bdac99f',
  clickQueryUrl: queryUrlThis + '/arcgis/rest/services/WJWATER/BASICDATA/MapServer',
  GetriverList: 'SynthesisBase/GetriverList',
  GetLakeList: 'SynthesisBase/GetLakeList',
  GetWaterProjectList: 'SynthesisBase/GetWaterProjectList'
};
// 吴江行政区划图
export const wjqzhqu = queryUrlThis + '/arcgis/rest/services/WJWATER/WJXZQH/MapServer';
const waterConomyDev = {
  zbqy: {
    url: queryUrlThis + '/arcgis/rest/services/WJWATER/QYSJ_TEST/MapServer',
    layerIds: []
  },
  zbrk: {
    url: queryUrlThis + '/arcgis/rest/services/WJWATER/RKSJ_TEST/MapServer',
    layerIds: Array.from({ length: 2 }, (v, k) => k)
  },
  zbcy: {
    url: queryUrlThis + '/arcgis/rest/services/WJWATER/RKSJ_TEST/MapServer',
    layerIds: [3, 4]
  }
};

// const waterConomyPorduction = {
//   zbqy: {
//     url: queryUrlPT + '/13372DCC0AD5910616BF39B37BF372B6/arcgis/rest/services/GGZT/QYSJ/MapServer',
//     layerIds: [6, 10, 11, 20]
//   },
//   zbrk: {
//     url: queryUrlPT + '/13372DCC0AD5910616BF39B37BF372B6/arcgis/rest/services/GGZT/RKSJ/MapServer',
//     layerIds: [0, 1]
//   },
//   zbcy: {
//     url: queryUrlPT + '/13372DCC0AD5910616BF39B37BF372B6/arcgis/rest/services/GGZT/QYSJ/MapServer',
//     layerIds: [21, 25, 26]
//   }
// };

const waterConomyPorduction = {
  zbqy: {
    url: 'http://2.37.106.187:8013/22d2c9e1d20e4235ac55659089350f45/sicp/QYSJ/MapServer',
    layerIds: [0, 1, 2, 3]
  },
  zbrk: {
    url: 'http://2.37.106.187:8013/22d2c9e1d20e4235ac55659089350f45/sicp/RKSJ/MapServer',
    layerIds: [0, 1]
  },
  zbcy: {
    url: 'http://2.37.106.187:8013/22d2c9e1d20e4235ac55659089350f45/sicp/QYSJ/MapServer',
    layerIds: [4, 5, 6]
  }
};
export const waterConomy = {
  queryPolygon: queryUrlThis + '/arcgis/rest/services/WJWATER/SFQZT/MapServer/',
  bufferUrl: queryUrlThis + '/arcgis/rest/services/Utilities/Geometry/GeometryServer/buffer',
  getFullScreen: '/Demonstration_Area/GetPanoramaList',
  layerService: window.isTest ? waterConomyDev : waterConomyPorduction
};
export const demonApi = {
  GetYuanDangWaterPoint: '/Demonstration_Area/GetYuanDangWaterPoint',
  GetYuanDangWaterData: '/Demonstration_Area/GetYuanDangWaterData'
};
export const backLogin = 'http://2.37.106.209:9852/login';

export const base = '/wjsw';

export const popupAttrs = [
  {
    name: '河道',
    attr: [
      '河流名称',
      '行政区划',
      '河道（段）起点',
      '河道（段）终点',
      '河道长度（km）',
      '跨界类型',
      '主要功能',
      '管理级别'
    ],
    title: '河流名称'
  },
  {
    name: '农村生态河道',
    attr: ['河道名称', '级别（县或镇）', '总长度（公里）', '已建成生态河道（公里）', '所在乡镇'],
    title: '河道名称'
  },
  {
    name: '湖泊',
    attr: [
      '湖泊名称',
      '行政区划',
      '最高允许蓄水位（m）',
      '水域面积（k㎡）',
      '跨界类型',
      '主要功能'
    ],
    title: '湖泊名称'
  },
  { name: '圩区', attr: ['圩区名称', '圩区所在位置'] },
  {
    name: '泵站',
    attr: [
      '泵站名称',
      '行政区划',
      '所在河道名称',
      '泵站类型',
      '是否为闸站工程',
      '工程等别',
      '主要建筑物级别',
      '装机流量(立方米/秒)',
      '装机功率(kW)',
      '设计扬程(m)',
      '水泵数量(台)',
      '泵站管理单位名称',
      '归口管理部门',
      '建成时间'
    ],
    title: '泵站名称'
  },
  {
    name: '水闸',
    attr: [
      '水闸名称',
      '行政区划',
      '所在河道名称',
      '是否为闸站工程',
      '是否为套闸工程',
      '工程等别',
      '主要建筑物级别',
      '闸孔数量（孔）',
      '闸孔总净宽（米）',
      '副闸闸孔数量（孔）',
      '副闸闸孔总净宽（米）',
      '水闸类型',
      '归口管理部门',
      '水闸管理单位代码',
      '建成时间',
      '设计闸门顶高程 （m）'
    ],
    title: '水闸名称'
  },
  {
    name: '堤防',
    attr: [
      '堤防名称',
      '所在河流名称',
      '堤防跨界情况',
      '堤防型式',
      '堤防长度(m)',
      '堤防级别',
      '规划防洪(潮)标准［重现期］（年）',
      '达到规划防洪（潮）标准的长度(m)',
      '设计水（高潮）位(m)',
      '堤防高度(m)（最大值）',
      '堤防高度(m)（最小值）',
      '水闸数量(个)',
      '管涵数量(个)',
      '泵站数量(处)',
      '堤防工程管理单位名称',
      '建成时间'
    ],
    title: '堤防名称'
  },

  {
    name: '不达标圩堤',
    attr: [
      '堤防名称',
      '堤防所在圩区名称',
      '所在区域',
      '未达标堤防长度（单位：m）',
      '现状堤防宽度（单位：m）',
      '未达标堤防现状高程（单位：m）',
      '达标高程（单位：m）'
    ]
  },
  { name: '排水泵站', attr: ['泵站名称', '行政区划'] },
  { name: '污水管点', attr: ['上点号', '地理位置', '窨井类型', '井盖形状', '窨井规格'] },
  { name: '污水管段', attr: ['上点号', '地理位置', '窨井类型', '井盖形状', '窨井规格'] },
  { name: '污水管段流向箭头', attr: ['上点号', '地理位置', '窨井类型', '井盖形状', '窨井规格'] },
  { name: '污水管网', attr: ['上点号', '地理位置', '窨井类型', '井盖形状', '窨井规格'] },

  {
    name: '雨水管点',
    attr: [
      '本点号',
      '乡镇',
      '井底标高',
      '井框尺寸',
      '井框材质',
      '井深',
      '井盖尺寸',
      '井盖材质',
      '口径',
      '地面标高',
      '埋深',
      '埋设日期',
      '所在位置',
      '类型'
    ]
  }
];

export const equivalence = {
  line: queryUrlThis + '/arcgis/rest/services/WJWATER/Model_dengzhixian/GPServer/Model_dengzhixian',
  polygon:
    queryUrlThis + '/arcgis/rest/services/WJWATER/Model_dengzhimian/GPServer/Model_dengzhimian'
};

// 供水管网
export const supply = {
  url: queryUrlThis + '/arcgis/rest/services/WJWATER/WJ_GSGW/MapServer'
};

//水务基础设施空间布局规划字段
export const attributeObj = {
  name: '河道名称',
  ghnx: '规划年限',
  name_new: '新名称',
  name_wq: '圩区名称',

  szqh: '所在行政区',
  type: '类型'
};
//示范区专题  水利工程
export const demonLayer = {
  url: window.isTest
    ? development.domain + '/arcgis/rest/services/WJWATER/YDSLGC/MapServer'
    : production.domain + '/arcgis/rest/services/WJWATER/YDSLGC/MapServer',
  queryDetail: '/Demonstration_Area/GetAchievements'
};

export const symbolObj = {
  point: {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2
    }
  },
  polyline: {
    type: 'simple-line', // autocasts as SimpleLineSymbol()
    color: [0, 227, 255, 0.8],
    width: 2
  },
  polygon: {
    type: 'simple-fill', // autocasts as new SimpleFillSymbol()
    color: [0, 227, 255, 0.1],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [0, 227, 255, 1],
      width: 2
    }
  }
};
export const CODE_NAME = 'SSO_CODE';
export const TOKEN_NAME = 'WJSW_TOKEN';
(window as any).BDParams = {
  assetsPath: 'http://172.16.9.155/arcgis_js_api/library/4.22/@arcgis/core/assets',
  urlPrefix: 'http://58.210.51.74:20008',
  arcgisfont: 'http://172.16.9.155/arcgis_js_api/font',
  proxyUrl: 'http://172.16.9.155/arcgis_js_api/proxy/DotNet/proxy.ashx'
};
export const showModalLayer = ['河道', '湖泊', '泵站', '水闸', '堤防', '农村生态河道']; //显示大弹框
