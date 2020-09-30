'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const uid = require('uid');

module.exports = {
  /**
   * 设置redis的指定值
   * @param {string} key 键
   * @param {*} value 值
   */
  setRedisValue(key, value) {
    const { app } = this;
    app.redis.set(key, JSON.stringify(value));
  },
  /**
   * 取得redis中的指定值
   * @param {string} key 键
   */
  getRedisValue(key) {
    const { app } = this;
    const value = app.redis.get(key);
    if (_.isEmpty(value)) {
      return null;
    }
    return JSON.parse(value);
  },
  getCurrentTimeMillisecond() {
    return new Date().getTime();
  },
  getUid(length) {
    return uid(length);
  },
  // 生成配置签名
  createConfigSign(ticket, url) {
    const { getCurrentTimeMillisecond, getUid } = this;
    const timestamp = parseInt(getCurrentTimeMillisecond() / 1000) + '';
    const params = {
      jsapi_ticket: ticket,
      url,
      timestamp,
      noncestr: getUid(32),
    };
    // !FIXME 使用解构的方式定义函数并执行时，在函数内部的this作用域与调用时的作用域不一致
    params.signature = this.getConfigSign(params); // 配置签名，用于Web端调用接口
    return {
      nonceStr: params.noncestr,
      signature: params.signature,
      timestamp: params.timestamp,
    };
  },
  // 序列化字符串
  raw(args) {
    const keys = Object.keys(args).sort(); // 参数名ASCII码从小到大排序（字典序）；
    let string = '';
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === 'sign' || !args[k]) {
        continue; // 如果参数的值为空不参与签名
      }
      if (typeof args[k] === 'array') {
        // 兼容xml场景，值为数组
        args[k] = args[k][0];
      }
      string += '&' + k + '=' + args[k];
    }
    string = string.substr(1);
    return string;
  },
  // 生成加密SHA1字符串
  sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
  },
  // 生成配置签名
  getConfigSign(args) {
    const { raw, sha1 } = this.ctx.helper;
    const rawStr = raw(args);
    const shaStr = sha1(rawStr);
    return shaStr.toLocaleLowerCase();
  },
};
