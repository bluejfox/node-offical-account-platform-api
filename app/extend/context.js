// app/extend/context.js
'use strict';
const _ = require('lodash');
const TRACE_ID = Symbol('Context#traceId');

function formatMessage(message, params) {
  let ret = (message === null || message === undefined) ? '' : message;
  if (!_.isEmpty(ret) && !_.isEmpty(params)) {
    params.forEach((item, index) => {
      const replaceString = `{${index}}`;
      // 存在要替换的字符串的场合
      if (ret.indexOf(replaceString) !== -1) {
        const str = (typeof item === 'number') ? item.toString() : item;
        ret = ret.split(replaceString).join(str);
      }
    });
  }
  return ret;
}

module.exports = {
  getMessage(id, params) {
    const { app } = this;
    const { MESSAGE_PREFIX, MESSAGE_CODE_MESSAGE_SEPERATOR } = app.config.key;
    const message = app.config.message[id];
    return `${MESSAGE_PREFIX}${id}${MESSAGE_CODE_MESSAGE_SEPERATOR}${formatMessage(message, params)}`;
  },
  throwError(id, params) {
    const message = this.getMessage(id, params);
    throw new Error(message);
  },
  get traceId() {
    // this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
    if (!this[TRACE_ID]) {
      // 例如，从 header 中获取，实际情况肯定更复杂
      this[TRACE_ID] = this.helper.getUid(32);
    }
    return this[TRACE_ID];
  },
};
