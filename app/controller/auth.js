'use strict';
const _ = require('lodash');
const Controller = require('egg').Controller;

class AuthController extends Controller {
  /**
   * 微信公众号用户登录，返回用户信息
   */
  async index() {
    let res = {};
    const { ctx, service } = this;
    const { code } = ctx.request.query;
    const wechatBasicUserInfo = await service.wechatService.getUserAccessToken(code) || {};
    // 没有取得用户信息的场合
    if (_.isEmpty(wechatBasicUserInfo.openid)) {
      return wechatBasicUserInfo;
    }
    const dbWechatUserInfo = await service.userService.getUserByOpenId(wechatBasicUserInfo.openid);
    // 用户第一次登录的场合
    if (_.isEmpty(dbWechatUserInfo)) {
      // eslint-disable-next-line dot-notation
      const wechatUserInfo = await service.wechatService.getUserInfo(wechatBasicUserInfo['access_token'], wechatBasicUserInfo.openid);
      if (!_.isEmpty(wechatUserInfo)) {
        res = await service.userService.createUser(wechatBasicUserInfo.openid, wechatUserInfo);
      }
    } else {
      res = dbWechatUserInfo;
    }
    // 保存用户信息至session
    ctx.session.user = res;
    // eslint-disable-next-line dot-notation
    ctx.session.userAccessToken = wechatBasicUserInfo['access_token'];
    return res;
  }

  /**
   * 取得JS权限验证配置信息
   */
  async getJsAuthConfig() {
    const { ctx, service } = this;
    const { url } = ctx.request.query;
    return await service.wechatService.getJsTicket(url);
  }
}

module.exports = AuthController;
