/**
 * 接口域名的管理
 * @param {string} apiServer [api服务器]
 * @param {string} knobbleServer [小节内容上传服务器]
 */
const baseLsit = [
  {
    // apiServer: 'http://10.0.30.194:3001/api',
    apiServer: 'https://test.wktest.cn:3001/api',
    knobbleServer: 'http://10.0.30.117/section',
    websocket: 'ws://localhost:3003',
  },
  {
    apiServer: 'https://test.wktest.cn:3001/api',
    knobbleServer: 'http://10.0.30.109/section',
    websocket: 'ws://test.wktest.cn:3003',
  },
]

const ServerNumber = import.meta.env.VITE_APP_SERVER_ID
  ? import.meta.env.VITE_APP_SERVER_ID
  : 0
// const ServerNumber = 1;
export const baseUrl = baseLsit[ServerNumber]

export default baseUrl
