import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import vitePluginImp from 'vite-plugin-imp';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name: any) => `antd/es/${name}/style`,
          libDirectory: 'es'
        }
      ]
    })
  ],
  base: 'wjsw', // 设置打包路径 ///wjsw
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/common': path.resolve(__dirname, './src/common'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/axios': path.resolve(__dirname, './src/axios')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // 更改主题在这里
          'primary-color': '#048da1',
          'link-color': '#1DA57A',
          'border-radius-base': '2px',
          color: '#ffffff'
        },
        // 支持内联 JavaScript
        javascriptEnabled: true
      }
    },
    modules: {
      // 样式小驼峰转化,  css: goods-list => tsx: goodsList
      localsConvention: 'camelCase'
    }
  },
  build: {
    // 去除console
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4000, // 设置服务启动端口号
    open: true, // 设置服务启动时是否自动打开浏览器
    https: false,
    cors: true, // 允许跨域

    // 设置代理，根据我们项目实际情况配置
    proxy: {
      '/wjswapi': {
        target: 'http://172.16.9.155:83',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('^/wjswapi/', '/wjswapi')
      }
    }
  }
});
