import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import moment from 'moment';
import { useRequest } from 'ahooks';
import { backUrl, base, CODE_NAME, getMenu, loginApi, outUrl, TOKEN_NAME } from '@/config';
import { Divider, Dropdown, Menu, message, Tooltip } from 'antd';
import { UserOutlined, RollbackOutlined, PoweroffOutlined } from '@ant-design/icons';
import logp from './images/icon-登出.png';
import back from './images/icon-返回.png';
import himg from './images/icon-首页.png';
import uimg from './images/icon-用户.png';
import zimg from './images/icon综合基础.png';
import zimg1 from './images/icon业务.png';
import zimg2 from './images/icon指挥决策.png';
import zimg3 from './images/icon水经济部署.png';
import zimg4 from './images/icon示范区.png';
import zimg_s from './images/icon综合基础2.png';
import zimg1_s from './images/icon业务2.png';
import zimg2_s from './images/icon指挥决策2.png';
import zimg3_s from './images/icon水经济部署2.png';
import zimg4_s from './images/icon示范区2.png';
import { usePageContext } from '@/store';
import { useHistory } from 'react-router';
import { MotionPathPlugin } from 'gsap/all';
import gsap from 'gsap';
import circle from './images/circle.png';
import bg from './images/bg.png';
import service from '@/axios';
import { Link } from 'react-router-dom';
import { getCode, loginOutFun } from '@/utils';
import { useCodeLogin } from '@/utils/hooks';
import { component } from '@/routes';
gsap.registerPlugin(MotionPathPlugin);

const menuIcon = [
  { name: '综合基础', icon: zimg, select_icon: zimg_s },
  { name: '业务专题', icon: zimg1, select_icon: zimg1_s },
  { name: '指挥决策', icon: zimg2, select_icon: zimg2_s },
  { name: '水经济部署', icon: zimg3, select_icon: zimg3_s },
  { name: '示范区专题', icon: zimg4, select_icon: zimg4_s },
  { name: '一张图', icon: zimg4, select_icon: zimg4_s }
];

const getCurrentTime = () => {
  var weekList = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  let hoursTime = moment().format('H:mm:ss');
  let monthTime = moment().format('YYYY-MM-DD');
  let week = weekList[moment().day() - 1];
  return { week, hours: hoursTime, month: monthTime };
};

const Time = () => {
  const [currentTime, setCurrentTime] = useState({
    hours: '',
    month: '',
    week: ''
  });
  useEffect(() => {
    const current = getCurrentTime();
    setCurrentTime(current);
    let timer = setInterval(() => {
      const current = getCurrentTime();
      setCurrentTime(current);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <div className="get-time">
      <div className="hours">{currentTime.hours}</div>
      <div className="date">
        {currentTime.month} {currentTime.week}
      </div>
    </div>
  );
};

const HeaderMneu = () => {
  const { run: getMenuRun } = useRequest(() => service.get(getMenu.getMneu), { manual: true });
  const { dispatch, state } = usePageContext();

  const getLogin = useCodeLogin();
  const history = useHistory();
  const pathname = history.location.pathname;
  const ref = useRef<any>();

  const svgRef = useRef<any>();
  const createPath = () => {
    let dom = document.getElementsByClassName('menu-svg')[0] as any;
    if (dom) {
      let wrapW = dom.clientWidth;
      let wrapH = dom.clientHeight;
      let halfHieght = wrapH / 2;
      let d = `M0,${halfHieght} L${halfHieght},0 L${
        wrapW - halfHieght
      },0 L${wrapW},${halfHieght} L${wrapW - halfHieght},${wrapH}  L${halfHieght},${wrapH} Z`;
      svgRef.current.setAttribute('d', d);
      gsap.to('#rect', {
        duration: 3,
        repeat: -1,
        repeatDelay: 0,
        ease: 'linear',
        motionPath: {
          path: '#path',
          align: '#path',
          autoRotate: true,
          alignOrigin: [0.5, 0.5]
        }
      });
    }
  };

  useEffect(() => {
    if (state && state.token && localStorage.getItem(TOKEN_NAME)) {
      getMenuRun().then((res) => {
        if (res && res.status == 200 && res.data.code == 200) {
          let menuData = res.data.data;
          // const find = component.find((f) => f.path === '/scene') as any;

          // if (find) {
          //   find.link = find.path;
          //   find.id = new Date().getTime();
          //   menuData.menu.push(find);
          // }

          dispatch({ type: 'setUserInfo', data: { userInfo: menuData } });
          createPath();
        } else {
          loginOutFun();
        }
      });
    }
  }, [state.token]);
  useEffect(() => {
    createPath();
  }, [history.location.pathname]);

  const menuClick = (item: any) => {
    // if (item.title === '水经济部署') {
    //   return false;
    // }

    history.replace(item.link);
  };

  const logout = () => {
    loginOutFun();
  };

  const backC = () => {
    window.location.href = backUrl;
  };
  return (
    <div className="header-menu">
      <div className="header-menu-wrap">
        {state.userInfo.menu &&
          state.userInfo.menu.map((item) => {
            const find = menuIcon.find((f) => f.name === item.title);
            //  console.log(pathname, item.link);

            const selectPath = pathname.includes(item.link);
            if (item.title === '指挥决策' && !(window as any).isTest) return;

            if (find) {
              return (
                <li
                  key={item.id}
                  onClick={() => menuClick(item)}
                  className={[selectPath ? 'select' : ''].join(' ')}
                >
                  <div className="item-wrap">
                    <img
                      src={selectPath ? find.select_icon : find.icon}
                      alt={item.title}
                      width="20"
                      height="20"
                    />
                    <span>{item.title}</span>
                  </div>
                  {selectPath && (
                    <div className="svg-wrap">
                      <svg width="150" height="30" viewBox="0 0 150 30" className="menu-svg">
                        <path
                          stroke="transparent"
                          id="path"
                          className="svg-path"
                          strokeWidth="1"
                          fill="none"
                          ref={svgRef}
                        ></path>
                        <g id="rect">
                          <image href={circle}></image>
                        </g>
                      </svg>
                    </div>
                  )}
                </li>
              );
            } else {
              return (
                <li key={item.id} onClick={() => menuClick(item)}>
                  <span>{item.title}</span>
                </li>
              );
            }
          })}
      </div>
      <div className="user-wrap">
        <Divider type="vertical" style={{ height: '30px' }} />
        <div className="userinfo-wrap">
          <img src={uimg} />
          <span>{state.userInfo.name}</span>
        </div>
        <Tooltip placement="bottom" title="返回引导页" arrowPointAtCenter>
          <img src={back} style={{ cursor: 'pointer' }} onClick={backC} />
        </Tooltip>
        <Tooltip placement="bottom" title="注销" arrowPointAtCenter>
          <img src={logp} style={{ cursor: 'pointer' }} onClick={logout} />
        </Tooltip>
      </div>
    </div>
  );
};
export default function Header() {
  return (
    <div className="header-g">
      <div className="title">吴江水务一张图</div>
      <Time />
      <HeaderMneu />
    </div>
  );
}
