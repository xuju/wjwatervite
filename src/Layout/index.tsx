import service from '@/axios';
import Header from '@/components/Header';
import { CODE_NAME, loginApi, TOKEN_NAME } from '@/config';
import { component } from '@/routes';

import { usePageContext } from '@/store';
import { useRequest } from 'ahooks';
import React, { useEffect, useMemo } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router';
import './index.less';
//根据接口返回的路由和本地路由进行匹配
const filter = (localRouterArr: any[], asyncRouteArr: any[]) => {
  const route = localRouterArr.map((item) => {
    const find = asyncRouteArr?.find((f) => f.title === item.title);
    if (find) return item;
  });

  return route;
};
const generateRouteComponent = (arr: any[]): any => {
  if (arr && arr[0]) {
    return arr.map((item) => {
      if (item && item.children) {
        return generateRouteComponent(item.children);
      }
      return <Route path={item.path} exact component={item.component} key={item.path}></Route>;
    });
  }
};

export default function Layout() {
  const { state } = usePageContext();

  const generateRoute = useMemo(() => {
    let arr: any[] = [];
    if (state) {
      const menu = state.userInfo.menu;

      if (menu && menu.length) {
        arr = menu.map((item: any) => {
          item.path = item.link;

          const find = component?.find((f) => f.title === item.title);
          if (find) {
            item.component = find.component;
            return item;
          }
          if (item && item.children) {
            item.children = filter(item.children, component) as any;
          }
        });
      } else {
        return [];
      }
    }

    return arr;
  }, [state]);

  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#00192e' }}>
        <Switch>
          {generateRouteComponent(generateRoute)}
          {/* <Redirect  to="/base"/> */}
        </Switch>
      </main>
    </>
  );
}
