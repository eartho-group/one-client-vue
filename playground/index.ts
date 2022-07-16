import { createApp } from 'vue';
// Fix for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129#issuecomment-454558185
// @ts-ignore
import Playground from './App.vue';
import { createRouter } from './router';
import { eartho } from './eartho';

const defaultClientId = 'x5wNs5h7EiyhxzODBe1X';

const res = JSON.parse(localStorage.getItem('vue-playground-data'));
const client_id = res?.client_id || defaultClientId;


createApp(Playground)
  .use(
    createRouter({
      client_id,
    })
  )
  .use(eartho)
  .mount('#app');
