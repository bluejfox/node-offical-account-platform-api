'use strict';

module.exports = {
  json(err, ctx) {
    console.log('json error', ctx.status);
    let code = '';
    let { message } = err;
    const { MESSAGE_PREFIX, MESSAGE_CODE_MESSAGE_SEPERATOR } = ctx.app.config.key;
    // 自定义业务异常
    if (err.message.indexOf(MESSAGE_PREFIX) === 0) {
      // 解析消息
      message = message.replace(MESSAGE_PREFIX, '');
      if (message.indexOf(MESSAGE_CODE_MESSAGE_SEPERATOR) !== -1) {
        const arr = message.split(MESSAGE_CODE_MESSAGE_SEPERATOR);
        code = arr[0];
        message = arr[1];
      }
    // 执行器异常
    } else {
      code = '00099';
      // 生产环境隐藏代码信息
      if (ctx.app.config.env === 'prod') {
        message = '服务端发生未知错误';
      }
    }
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code,
      message,
      traceId: ctx.traceId,
    };
  },
};
