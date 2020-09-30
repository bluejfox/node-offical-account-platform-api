'use strict';

const Service = require('egg').Service;
const _ = require('lodash');

async function callWechatService(ctx, url, options) {
  return new Promise((resolve, reject) => {
    ctx.curl(url, options)
      .then(res => {
        const data = res.data;
        console.log('微信接口返回数据', data);
        if (data.errcode && data.errcode !== '0') {
          ctx.throwError('MB001E', [ data.errcode, data.errmsg || '未知错误' ]);
        }
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

class WechatService extends Service {
  /**
   * 取得全局AccessToken
   */
  async getWechatGlobalAccessToken() {
    const { ctx } = this;
    const { REDIS_ACCESS_TOKEN } = this.app.config.key;
    // 从redis中取得指定的值
    const currentAccessToken = ctx.helper.getRedisValue(REDIS_ACCESS_TOKEN) || {};
    // 检查有效期
    if (!_.isEmpty(currentAccessToken.expiresIn)) {
      // access_token处于有效期内
      if (
        new Date().getTime() - currentAccessToken.createTime <
        currentAccessToken.expiresIn * 1000
      ) {
        // 直接使用既有的access_token
        if (!_.isEmpty(currentAccessToken.value)) {
          return currentAccessToken.value;
        }
      }
    }
    // 取得新的access_token
    const { appId, appSecret } = this.app.config.wechatOpa;
    const { WECHAT_OAP_URL } = this.app.config.thirdPartySystem;
    const url = `${WECHAT_OAP_URL}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const result = await callWechatService(this.ctx, url, {
      method: 'get',
      dataType: 'json',
    });
    ctx.helper.setRedisValue(REDIS_ACCESS_TOKEN, {
      value: result.access_token,
      expiresIn: result.expires_in,
      createTime: new Date().getTime(),
    });
    ctx.logger.debug('getWechatGlobalAccessToken', result);
    return result.access_token;
  }

  /**
   * 取得全局JsTicket
   * @param {string} url 页面url
   */
  async getJsTicket(url) {
    const { ctx } = this;
    const { appId } = this.app.config.wechatOpa;
    const { WECHAT_OAP_URL } = this.app.config.thirdPartySystem;
    const { REDIS_JS_TICKET } = this.app.config.key;
    const currentJsTicket = ctx.helper.getRedisValue(REDIS_JS_TICKET) || {};
    // 检查有效期
    if (!_.isEmpty(currentJsTicket.expiresIn)) {
      // access_token处于有效期内
      if (new Date().getTime() - currentJsTicket.createTime < currentJsTicket.expiresIn * 1000) {
        // 直接使用既有的access_token
        if (!_.isEmpty(currentJsTicket.value)) {
          return currentJsTicket.value;
        }
      }
    }
    // 取得新的access_token
    const global_access_token = await this.getWechatGlobalAccessToken();
    const wechatUrl = `${WECHAT_OAP_URL}/cgi-bin/ticket/getticket?access_token=${global_access_token}&type=jsapi`;
    const result = await ctx.curl(wechatUrl, {
      dataType: 'json',
    });
    ctx.helper.setRedisValue(REDIS_JS_TICKET, {
      value: result.data.ticket,
      expiresIn: result.data.expires_in,
      createTime: new Date().getTime(),
    });
    const res = _.assign({ appId }, ctx.helper.createConfigSign(result.data.ticket, url));
    ctx.logger.debug('getWechatJsTicket', res);
    return res;
  }

  /**
   * 取得用户所属AccessToken，一般用于调用用户相关wechat api
   * @param {string} code 进入公众号时颁发的一次性code
   */
  async getUserAccessToken(code) {
    const { appId, appSecret } = this.app.config.wechatOpa;
    const { WECHAT_OAP_URL } = this.app.config.thirdPartySystem;
    const url = `${WECHAT_OAP_URL}/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
    const result = await callWechatService(this.ctx, url, {
      method: 'get',
      dataType: 'json',
    });
    console.log('getUserAccessToken', result);
    return result;
  }

  /**
   * 取得指定用户信息
   * @param {string} accessToken 用户所属AccessToken
   * @param {string} openId 用户在此公众号内的openId
   */
  async getUserInfo(accessToken, openId) {
    const { WECHAT_OAP_URL } = this.app.config.thirdPartySystem;
    const url = `${WECHAT_OAP_URL}/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;
    const result = await callWechatService(this.ctx, url, {
      method: 'get',
      dataType: 'json',
    });
    console.log('getUserInfo', result);
    return result;
  }
}

module.exports = WechatService;
