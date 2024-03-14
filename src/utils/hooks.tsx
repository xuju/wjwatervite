import service from '@/axios';
import { base, CODE_NAME, loginApi, TOKEN_NAME } from '@/config';
import { usePageContext } from '@/store';
import { useLayerContext } from '@/store/layer';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';
import { getCode, loginOutFun } from '.';
import { useRecoilValue } from 'recoil';
import { mapTypeAtom, sceneAtom } from '@/store/scene';
export const useGetLastLayer = () => {
  const { state } = useLayerContext();

  const current = useMemo(() => {
    if (state && state.list) {
      let tem = _.cloneDeep(state.list);
      return tem.pop();
    } else {
      return null;
    }
  }, [state]);

  return current;
};

export const useView = () => {
  const { type } = useRecoilValue(mapTypeAtom);
  const { state } = usePageContext();
  const views = useRecoilValue(sceneAtom);

  const view = useMemo(() => {
    if (type === '2D') {
      if (state && state.view) {
        return state.view;
      }
    }
    if (type === '3D') {
      return views;
    }
  }, [state, type, views]);
  return view;
};
export const useLayerList = () => {
  const { state } = useLayerContext();

  const current = useMemo(() => {
    if (state && state.list) {
      return state.list;
    } else {
      return null;
    }
  }, [state]);

  return current;
};

export const useSelectLayerTable = () => {
  const { state } = useLayerContext();
  const current = useMemo(() => {
    if (state && state.current) {
      return state.current;
    } else {
      return null;
    }
  }, [state]);

  return current;
};

export const useCodeLogin = () => {
  const { dispatch, state } = usePageContext();
  const location = useLocation();
  const { run } = useRequest(
    (code: string) =>
      service.post(
        loginApi.login,
        { userName: 'string', passwords: 'string' },
        {
          headers: {
            Authorization: code
          }
        }
      ),
    {
      manual: true
    }
  );
  const history = useHistory();
  useEffect(() => {
    const code = getCode();

    if (code) {
      localStorage.removeItem(TOKEN_NAME);

      run(code).then((res) => {
        if (res && res.data && res.data.code == 200) {
          let token = res.data.data.token ?? '';

          localStorage.setItem(TOKEN_NAME, token);
          history.replace(location.pathname);
          dispatch({ type: 'setToken', data: { token } });

          return token;
        } else {
          message.warning(res.data.message ?? 'code请求出错');
          // loginOutFun();
        }
      });
    }
  }, []);
};
