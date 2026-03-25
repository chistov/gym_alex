import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import App from './App';

dayjs.locale('ru');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#fa541c',
          colorLink: '#fa541c',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
