'use strict';

const uid = require('uid');
const Service = require('egg').Service;

class UserService extends Service {
  async getUserByOpenId(openId) {
    const userWehatInfo = await this.app.mysql.get('USER_WECHAT', {
      openid: openId,
    });
    console.log(userWehatInfo);
    return userWehatInfo;
  }

  async createUser(openId, wechatUserInfo) {
    const inputDTO = {
      USER_ID: uid(16),
      NICK_NAME: wechatUserInfo.nickname,
      OPENID: openId,
      CITY: wechatUserInfo.city,
      COUNTRY: wechatUserInfo.country,
    };
    await this.app.mysql.insert('USER_WECHAT', inputDTO);
    return inputDTO;
  }
}

module.exports = UserService;
