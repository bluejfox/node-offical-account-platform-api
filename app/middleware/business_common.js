'use strict';

module.exports = options => {
  return async function contextExtend(ctx, next) {
    console.log('before', ctx.traceId, options, ctx.status);
    const res = await next();
    // 404错误不会被onerror捕获
    console.log(ctx.status, ctx.body);
    if (ctx.status === 404 && !res) {
      ctx.throwError('SYSMSG-SERVICE-STATUS-404');
    }
    ctx.response.body = {
      success: true,
      data: res,
      traceId: ctx.traceId,
    };
    console.log('after', res);
  };
};
