'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    // throw new Error('异常信息');
    const { code } = this.ctx.query;
    if (code === '1') {
      this.ctx.throwError('MC001E', [ 'aabbcc' ]);
    }
    console.log('1');
    this.ctx.rotateCsrfSecret();
    return { foo: 'bar' };
  }

  async postTest() {
    const params = this.ctx.request.body;
    return params;
  }
}

module.exports = HomeController;
