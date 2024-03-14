import loadable from '@loadable/component';
import { RouteConfig } from 'react-router-config';
import { Button } from 'antd';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useHistory
} from 'react-router-dom';
import React, { useEffect } from 'react';
import Login from '@/pages/Login';
import Layout from '../Layout';
import { usePageContext } from '@/store';
import Watereconomy from '@/pages/Watereconomy';
import Business from '@/pages/Business';

import Demon from '@/pages/Demon';
import Basics from '@/pages/Basics';
import WaterDisaster from '@/pages/Command/WaterDisaster';
import WaterProtect from '@/pages/Command/WaterProtect';
import WaterManger from '@/pages/Command/WaterManger';
import RiverManger from '@/pages/Command/RiverManger';
import { backLogin, BASENAME, TOKEN_NAME } from '@/config';
import service from '@/axios';
import { getCode } from '@/utils';
import LoadLayer from '@/pages/LoadLayer';

export const component = [
  {
    title: '综合基础',
    component: Basics,
    path: '/base'
  },
  {
    title: '业务专题',
    component: Business,
    path: '/ywzt'
  },

  {
    title: '指挥决策',
    path: '/command',
    component: WaterDisaster
  },

  {
    title: '水经济部署',
    // component: Watereconomy,
    component: LoadLayer,
    path: '/sjjbs'
  },
  {
    title: '示范区专题',
    component: Demon,
    path: '/sfqzt'
  }
];

export const RouterContainer = () => {
  const { state, dispatch } = usePageContext();

  const authRoute1 = (props: any) => {
    let token = localStorage.getItem(TOKEN_NAME);
    const code = getCode();
    if (code) {
      return <Layout />;
    }
    if (!token) {
      return <Redirect to="/login" />;
    } else {
      return <Layout />;
    }
  };

  return (
    <Router basename={BASENAME}>
      <Switch>
        <Route
          path="/login"
          render={(props) => {
            let token = localStorage.getItem(TOKEN_NAME);
            if (!token) {
              if (window.isTest) {
                return <Login {...props} />;
              } else {
                window.location.href = backLogin;
              }
            } else {
              return <Redirect to="/base" />;
            }
          }}
        />
        <Route path="/commands" component={WaterDisaster} />

        <Route path="/" render={authRoute1} />
      </Switch>
    </Router>
  );
};
