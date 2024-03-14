import service from '@/axios';
import useRequest from '@ahooksjs/use-request';
import { message } from 'antd';

import React, { useEffect, useMemo } from 'react';
import './index.less';

let WebControl = (window as any).WebControl;
let JSEncrypt = (window as any).JSEncrypt;
let oWebControl: any;
function getPubKey(callback: () => void) {
  (window as any).oWebControl &&
    (window as any).oWebControl
      .JS_RequestInterface({
        funcName: 'getRSAPubKey',
        argument: JSON.stringify({
          keyLength: 1024
        })
      })
      .then(function (oData: any) {
        console.log(oData);
        if (oData.responseMsg.data) {
          pubKey = oData.responseMsg.data;
          callback();
        }
      });
}
// 格式化时间
var pubKey = '';

let timer: any;

// 显示回调信息

// RSA加密
function setEncrypt(value: any) {
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubKey);
  return encrypt.encrypt(value);
}
const initPlugin = () => {
  return new Promise((resolve, reject) => {
    let initCount = 0;
    oWebControl = new WebControl({
      szPluginContainer: 'playWnd',
      iServicePortStart: 15900,
      iServicePortEnd: 15909,
      szClassId: '23BF3B0A-2C56-4D97-9C03-0CB103AA8F11', // 用于IE10使用ActiveX的clsid
      cbConnectSuccess: function () {
        initCount = 0;

        oWebControl
          .JS_StartService('window', {
            dllPath: './VideoPluginConnect.dll'
          })
          .then(
            function () {
              oWebControl.JS_CreateWnd('playWnd', 1000, 600).then(function () {
                resolve('success');
                console.log('JS_CreateWnd success');
              });
            },
            function () { }
          );
      },
      cbConnectError: function () {
        console.log('cbConnectError');
        oWebControl = null;
        message.destroy();
        message.warning('插件未启动，正在尝试启动，请稍候...');

        WebControl.JS_WakeUp('VideoWebPlugin://');
        initCount++;
        if (initCount < 3) {
          timer = setTimeout(function () {
            initPlugin();
          }, 3000);
        } else {
          message.destroy();
          message.warning('插件启动失败，请检查插件是否安装！');
        }
      },
      cbConnectClose: function (bNormalClose: any) {
        // 异常断开：bNormalClose = false
        // JS_Disconnect正常断开：bNormalClose = true
        console.log('cbConnectClose');
        reject('JS_Disconnect正常断开：bNormalClose = true');
        oWebControl = null;
      }
    });
  });
};

export default function PopupSP(props: any) {
  const { attr } = props;

  const { id, url, name, vid } = attr;
  const isReady = attr ? (attr.url ? true : false) : false;

  const { run } = useRequest(() => service.post(attr.url, { bigtype: 1, id: attr.id }), {
    manual: true
  });
  // console.log(data, isReady);

  // 获取公钥
  const getPubKey = (callback: any) => {
    oWebControl
      .JS_RequestInterface({
        funcName: 'getRSAPubKey',
        argument: JSON.stringify({
          keyLength: 1024
        })
      })
      .then(function (oData: any) {
        console.log(oData, '获取公钥');
        if (oData.responseMsg.data) {
          pubKey = oData.responseMsg.data;
          callback();
        }
      })
      .catch((e: any) => {
        console.log(e, '获取公钥错误');
      });
  };

  const look = (id: string) => {
    // var cameraIndexCode = "b311ca7e8a4144feb80ee7341ba0252f";
    let cameraIndexCode = id;
    let streamMode = 0;
    let transMode = 1;
    let gpuMode = 0;
    let wndId = -1; //默认为空闲窗口预览
    let isDirectEzviz = 0;

    oWebControl
      .JS_RequestInterface({
        funcName: 'startPreview',
        argument: JSON.stringify({
          cameraIndexCode: cameraIndexCode,
          streamMode: streamMode,
          transMode: transMode,
          gpuMode: gpuMode,
          wndId: wndId,
          ezvizDirect: isDirectEzviz
        })
      })
      .then(function (oData: any) {
        console.log(oData, '预览');

        // showCBInfo(JSON.stringify(oData ? oData.responseMsg : ''));
      });
  };
  const init = (id: string) => {
    getPubKey(function () {
      var secret = setEncrypt('00IPgyk8IcPkSTkTBTzP');
      oWebControl
        .JS_RequestInterface({
          funcName: 'init',
          argument: JSON.stringify({
            appkey: '22051429',
            secret: secret,
            ip: '2.37.51.68',
            playMode: 0, // 预览
            port: 9091,
            snapDir: 'D:SnapDir',
            videoDir: 'D:VideoDir',
            layout: '1x1',
            enableHTTPS: 1,
            showToolbar: 1,
            showSmart: 0,
            buttonIDs: '1,0,16,256,257,258,259,260,512,513,514,515,516,517,768,769',
            encryptedFields: 'secret',
            language: 'zh_CN',
            reconnectTimes: 5,
            reconnectDuration: 5
          })
        })
        .then(function (oData: any) {
          console.log(oData, '初始化');
          look(id);
          oWebControl.JS_Resize(1000, 600); // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
          window.onreset = () => {
            oWebControl.JS_Resize(1000, 600);
          };
        })
        .catch((e: any) => {
          console.log(e);
        });
    });
  };

  useEffect(() => {
    if (vid) {
      initPlugin().then((res) => {
        init(vid);
      });
    }

    if (url && id) {
      run()
        .then((res) => {
          if (res && res.data && res.data.code == 200) {
            let camerauuid = res.data.data.popData.tableData.listdata.camerauuid;
            if (camerauuid) {
              console.log(camerauuid);

              initPlugin().then((res) => {
                init(camerauuid);
              });
            } else {
              message.destroy();
              message.warning('视频点位暂无ID');
            }
          }
        })
        .catch((e) => {
          console.log(e);
          message.destroy();
          message.warning('获取视频ID出错');
        });
    }

    return () => {
      timer && clearInterval(timer);
      oWebControl
        .JS_RequestInterface({
          funcName: 'stopAllPreview'
        })
        .then(function (oData: any) {
          console.log('销毁成功');
        });
      oWebControl
        .JS_RequestInterface({
          funcName: 'uninit'
        })
        .then(function () {
          console.log('销毁成功111');
        });
      oWebControl.JS_HideWnd(); // 先让窗口隐藏，规避可能的插件窗口滞后于浏览器消失问题
      oWebControl.JS_Disconnect().then(
        function () { },
        function () { }
      );
    };
  }, []);

  return (
    <div className="popupsp">
      <div id="playWnd" className="playWnd" />
      {/* <Button onClick={init}>初始化</Button>
            <Button onClick={look}>预览</Button> */}
    </div>
  );
}
