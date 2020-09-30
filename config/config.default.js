/* eslint valid-jsdoc: "off" */

'use strict';

const onerror = require('./error_handler');
const message = require('./message');
const passwordConfig = require('./password_config');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    onerror,
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1601022719731_756';

  // add your middleware config here
  config.middleware = [ 'businessCommon' ];

  // add your user config here
  const userConfig = {
    message,
    thirdPartySystem: {
      WECHAT_OAP_URL: 'https://api.weixin.qq.com',
    },
    key: {
      // 用于在onerror处解析业务异常
      MESSAGE_PREFIX: '$_message_key',
      MESSAGE_CODE_MESSAGE_SEPERATOR: '__:__',
      REDIS_ACCESS_TOKEN: '$_access_token',
      REDIS_JS_TICKET: '$_js_ticket',
    },
    // myAppName: 'egg',
    // 公众号配置信息
    wechatOpa: {
      appId: 'wxa27adefd5054039a',
      appSecret: passwordConfig.wechatAppSecret,
    },
    // 数据库配置信息
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: 'bluejfox.dscloud.mobi',
        // 端口号
        port: '43306',
        // 用户名
        user: 'root',
        // 密码
        password: passwordConfig.mysqlPassword,
        // 数据库名
        database: 'oap',
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false,
    },
    redis: {
      client: {
        port: 46379,
        host: 'bluejfox.dscloud.mobi',
        password: passwordConfig.redisPassword,
        db: 0,
      },
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
