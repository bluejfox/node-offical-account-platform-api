'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const subRouter = router.namespace('/api');
  subRouter.get('/', controller.home.index);
  subRouter.post('/p', controller.home.postTest);
  subRouter.get('/auth', controller.auth.index);
  subRouter.get('/js-auth', controller.auth.getJsAuthConfig);
};
