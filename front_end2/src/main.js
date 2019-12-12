// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import auth from '../src/core/base/Authenticator';
import socketio from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';

export const SocketInstance = socketio(`${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}`);

Vue.use(new VueSocketIO({
  connection: SocketInstance
}))
// import io from 'socket.io';
Vue.use(BootstrapVue)

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth === true) && (!auth._user || !auth._user.isAdmin)) {
    return router.push({ path: '/admin/login' });
  }
  if (to.matched.some((record) => record.meta.requiresGuest === true)) {
    if (auth.getPlayer())
    return router.push({ path: '/' });
  }  
  return next();
});

window.vueRouter = router;

/* eslint-disable no-new */
window.vueApp = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
