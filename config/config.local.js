'use strict';

module.exports = () => {
  const config = {};
  config.security = {
    csrf: {
      enable: false,
    },
  };
  return config;
};
