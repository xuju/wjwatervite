import { backLogin, TOKEN_NAME } from './../config/index';
import { base } from '@/config';
import axios from 'axios';
import { loginOutFun } from '@/utils';
const service = axios.create({
  baseURL: '/wjswapi/api',
  // baseURL: '/api',
  timeout: 60000
});

// http request 拦截器
service.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem(TOKEN_NAME);
    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// http response 拦截器
service.interceptors.response.use(
  (response) => {
    let authorization = response.headers.authorization;
    let tokentimeout = response.headers.tokentimeout;

    if (tokentimeout) {
      localStorage.setItem('token', authorization);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      let response = error.response;

      switch (response.status) {
        case 401:
          loginOutFun();

          break;
      }
    }

    return Promise.reject(error);
  }
);

export default service;
