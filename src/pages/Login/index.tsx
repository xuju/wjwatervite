import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import logo from './images/logo.png';
import bridge from './images/bridge.png';
import { message } from 'antd';
import { useHistory } from 'react-router';
import { useRequest } from 'ahooks';
import { loginApi, TOKEN_NAME } from '@/config';
import catchError from '@/utils';
import { usePageContext } from '@/store';
import service from '@/axios';
import './index.less';

function Login(props: any) {
  const [account, setAccount] = useState({ userName: '', passwords: '' });
  const { run } = useRequest((data) => service.post(loginApi.login, data), { manual: true });
  const history = useHistory();
  const store = usePageContext();
  useEffect(() => {
    let feTurb = document.querySelector('#feturbulence');
    gsap.to(feTurb, {
      duration: 40,
      repeat: -1,
      yoyo: true,
      onUpdateParams: [feTurb],
      onUpdate: function (fe) {
        // eslint-disable-next-line react/no-this-in-sfc
        let bfX = this.progress() * 0.005 + 0.015;
        // eslint-disable-next-line react/no-this-in-sfc
        let bfY = this.progress() * 0.05 + 0.1;
        let bfStr = bfX.toString() + ' ' + bfY.toString();
        fe.setAttribute('baseFrequency', bfStr);
      }
    });
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    let tem: any = { ...account };
    let value = e.target.value;
    tem[type] = value;
    setAccount(tem);
  };

  const submitHandle = async () => {
    const { userName, passwords } = account;
    if (!userName || !passwords) {
      message.warning('账户或者密码不能为空');
      return false;
    }
    const [err, result] = await catchError(run(account));

    if (result && result.status === 200 && result.data.code === '200') {
      let res = result.data.data;
      let token = res.token;
      localStorage.setItem(TOKEN_NAME, token);
      store.dispatch({ type: 'setToken', data: { token } });
      history.replace('/base'); // 待优化
    } else {
      message.error('账户或者密码错误');
      console.log(err);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      submitHandle();
    }
  };
  return (
    <div id="login">
      <img className="logo" src={logo} />
      <div className="panel">
        <input
          type="text"
          placeholder="用户名"
          name="userName"
          className="username"
          onChange={(e) => onChange(e, 'userName')}
        />
        <input
          type="password"
          placeholder="密码"
          name="passwords"
          className="password"
          onChange={(e) => onChange(e, 'passwords')}
          onKeyDown={onKeyDown}
        />
        <div className="oprateGroup">
          <div className="login-btn" onClick={submitHandle}>
            登录
          </div>
          <div className="rest-btn">重置</div>
        </div>
      </div>
      <div className="waterbg">
        <div className="water" />
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <filter
            id="turbulence"
            filterUnits="objectBoundingBox"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <feTurbulence id="feturbulence" type="fractalNoise" numOctaves="3" seed="2" />
            <feDisplacementMap
              xChannelSelector="G"
              yChannelSelector="B"
              scale="20"
              in="SourceGraphic"
            />
          </filter>
        </svg>
      </div>
      <img className="bridge" src={bridge} />
    </div>
  );
}
export default Login;
