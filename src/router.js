import Vue from 'vue';
import Router from 'vue-router';
import test from './components/test.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'test',
      component: test,
    },
  ],
});
