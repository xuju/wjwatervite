import React from 'react';
import ReactDOM from 'react-dom';
import { RouterContainer } from './routes';
import zhCN from 'antd/lib/locale/zh_CN';
import { StateProvider } from './store';
import '@/assets/css/index.less';
import '@arcgis/core/assets/esri/themes/light/main.css';
import { ConfigProvider } from 'antd';
import { RecoilRoot } from 'recoil';
import 'moment/dist/locale/zh-cn';
import Providers from './store/provider';
import esriConfig from '@arcgis/core/config.js';
import { BASENAME } from './config';
import Test from './pages/Test';

esriConfig.assetsPath = BASENAME + 'gisstatic';
ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <RecoilRoot>
      <Providers>
        <RouterContainer />
      </Providers>
    </RecoilRoot>
  </ConfigProvider>,
  document.getElementById('root')
);

// ReactDOM.render(<Test />, document.getElementById('root'));
