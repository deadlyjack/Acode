//jshint ignore:start

export default {
  html: () => {
    return import(/* webpackChunkName: "html" */ './projects/html');
  },
};
