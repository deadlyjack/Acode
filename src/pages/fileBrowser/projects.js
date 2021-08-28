//jshint ignore:start

export default {
  angular: () => {
    return import(/* webpackChunkName: "angular" */ './projects/ng');
  },
  angularjs: () => {
    return import(/* webpackChunkName: "angularjs" */ './projects/ngjs');
  },
  html: () => {
    return import(/* webpackChunkName: "html" */ './projects/html');
  },
  react: () => {
    return import(/* webpackChunkName: "react" */ './projects/react');
  },
  vue: () => {
    return import(/* webpackChunkName: "vue" */ './projects/vue');
  },
};
