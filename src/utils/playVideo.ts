import { message, Modal, Pagination } from 'antd';
let WebControl = (window as any).WebControl;
let JSEncrypt = (window as any).JSEncrypt;
interface IPlayVideo {
  size: {
    width: number;
    height: number;
  };
}

var appkey = '22051429'; //综合安防管理平台提供的appkey，必填

var ip = '2.37.51.68'; //综合安防管理平台IP地址，必填
var playMode = 0; //初始播放模式：0-预览，1-回放
var port = 9091; //综合安防管理平台端口，若启用HTTPS协议，默认443
var snapDir = 'D:\\SnapDir'; //抓图存储路径
var videoDir = 'D:\\VideoDir'; //紧急录像或录像剪辑存储路径
var layout = '1x1'; //playMode指定模式的布局
var enableHTTPS = 1; //是否启用HTTPS协议与综合安防管理平台交互，这里总是填1
var encryptedFields = 'secret'; //加密字段，默认加密领域为secret
var showToolbar = 1; //是否显示工具栏，0-不显示，非0-显示
var showSmart = 0; //是否显示智能信息（如配置移动侦测后画面上的线框），0-不显示，非0-显示
var buttonIDs = '0,16,256,257,258,259,260,512,513,514,515,516,517,768,769'; //自定义工具条按钮
const size = { width: 1000, height: 550 };
export class PlayVideo {
  oWebControl: any;
  size: { width: number; height: number };
  timer: any;
  initCount: number;
  pubKey: string;
  secret: string;
  playMode: number;
  constructor(options?: IPlayVideo) {
    this.oWebControl = null;
    this.size = options ? options.size : size;
    this.timer = null;
    this.initCount = 0;
    this.pubKey = '';
    this.secret = '';
    this.playMode = playMode;
  }
  initPlugin() {
    return new Promise((resolve, reject) => {
      let initCount = this.initCount;
      this.oWebControl = new WebControl({
        szPluginContainer: 'playWnd',
        iServicePortStart: 15900,
        iServicePortEnd: 15909,
        szClassId: '23BF3B0A-2C56-4D97-9C03-0CB103AA8F11', // 用于IE10使用ActiveX的clsid
        cbConnectSuccess: () => {
          initCount = 0;

          this.oWebControl
            .JS_StartService('window', {
              dllPath: './VideoPluginConnect.dll'
            })
            .then(
              () => {
                this.oWebControl
                  .JS_CreateWnd('playWnd', this.size.width, this.size.height)
                  .then(() => {
                    resolve('success');
                    console.log('JS_CreateWnd success');
                  });
              },
              () => { }
            );
        },
        cbConnectError: () => {
          console.log('cbConnectError');
          this.oWebControl = null;
          message.destroy();
          message.warning('插件未启动，正在尝试启动，请稍候...');

          WebControl.JS_WakeUp('VideoWebPlugin://');
          initCount++;
          if (initCount < 3) {
            this.timer = setTimeout(() => {
              this.initPlugin();
            }, 3000);
          } else {
            message.destroy();
            message.warning('插件启动失败，请检查插件是否安装！');
          }
        },
        cbConnectClose: (bNormalClose: any) => {
          // 异常断开：bNormalClose = false
          // JS_Disconnect正常断开：bNormalClose = true
          console.log('cbConnectClose');
          reject('JS_Disconnect正常断开：bNormalClose = true');
          this.oWebControl = null;
        }
      });
    });
  }

  init(id: string) {
    this.getPubKey(() => {
      ////////////////////////////////// 请自行修改以下变量值	////////////////////////////////////
      this.secret = this.setEncrypt('00IPgyk8IcPkSTkTBTzP'); //综合安防管理平台提供的secret，必填
      ////////////////////////////////// 请自行修改以上变量值	////////////////////////////////////
      this.oWebControl
        .JS_RequestInterface({
          funcName: 'init',
          argument: JSON.stringify({
            appkey: appkey, //API网关提供的appkey
            secret: this.secret, //API网关提供的secret
            ip: ip, //API网关IP地址
            playMode: playMode, //播放模式（决定显示预览还是回放界面）
            port: port, //端口
            snapDir: snapDir, //抓图存储路径
            videoDir: videoDir, //紧急录像或录像剪辑存储路径
            layout: layout, //布局
            enableHTTPS: enableHTTPS, //是否启用HTTPS协议
            encryptedFields: encryptedFields, //加密字段
            showToolbar: showToolbar, //是否显示工具栏
            showSmart: showSmart, //是否显示智能信息
            buttonIDs: buttonIDs //自定义工具条按钮
          })
        })
        .then((oData: any) => {
          console.log(oData, '初始化');
          this.look(id);
          this.oWebControl.JS_Resize(this.size.width, this.size.height); // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
          window.onreset = () => {
            this.oWebControl.JS_Resize(this.size.width, this.size.height);
          };
        })
        .catch((e: any) => {
          console.log(e);
        });
    });
  }
  getPubKey(callback: any) {
    if (!this.oWebControl) return;
    this.oWebControl
      .JS_RequestInterface({
        funcName: 'getRSAPubKey',
        argument: JSON.stringify({
          keyLength: 1024
        })
      })
      .then((oData: any) => {
        console.log(oData, '获取公钥');
        if (oData.responseMsg.data) {
          this.pubKey = oData.responseMsg.data;
          callback();
        }
      })
      .catch((e: any) => {
        console.log(e, '获取公钥错误');
      });
  }
  setEncrypt(value: any) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(this.pubKey);
    return encrypt.encrypt(value);
  }
  look(id: string) {
    // var cameraIndexCode = "b311ca7e8a4144feb80ee7341ba0252f";
    let cameraIndexCode = id;
    let streamMode = 0;
    let transMode = 1;
    let gpuMode = 0;
    let wndId = -1; //默认为空闲窗口预览
    let isDirectEzviz = 0;

    this.oWebControl
      .JS_RequestInterface({
        funcName: 'startPreview',
        argument: JSON.stringify({
          cameraIndexCode: cameraIndexCode, //监控点编号
          streamMode: streamMode, //主子码流标识
          transMode: transMode, //传输协议
          gpuMode: gpuMode, //是否开启GPU硬解
          wndId: wndId
        })
      })
      .then((oData: any) => {
        console.log(oData, '预览');

        // showCBInfo(JSON.stringify(oData ? oData.responseMsg : ''));
      });
  }
  destory() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.oWebControl
      .JS_RequestInterface({
        funcName: 'stopAllPreview'
      })
      .then(function (oData: any) {
        console.log('销毁成功');
      });
    this.oWebControl
      .JS_RequestInterface({
        funcName: 'uninit'
      })
      .then(function () {
        console.log('销毁成功111');
      });
    this.oWebControl.JS_HideWnd(); // 先让窗口隐藏，规避可能的插件窗口滞后于浏览器消失问题
    this.oWebControl.JS_Disconnect().then(
      function () { },
      function () { }
    );
  }
}
