// Webpack
let conf = process.env.conf; // This variable comes from webpack.config.js under `plugins`

// Vue Router
import VueRouter from "vue-router";

import routesCompiled from "/public/assets/js/compiled_routes.js"
import Error404 from "/components/pages/error_404.vue";

let routes = [];
routesCompiled.forEach(component => {
  component.resource.paths.forEach(path => {
    routes.push({
      path: path,
      component: component.default,
      meta: component.resource.meta
    });
  });
});

routes.push({
  path: "*",
  component: Error404
});

const router = new VueRouter({
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // Make "#" anchor links work as expected
    if (to.hash) {
      return {
        selector: to.hash,
        offset: { x: 0, y: 10 }
      };
    }
  }
});

router.beforeEach((to, from, next) => {
  document.title = conf.module_name + " - " + to.meta.title;
  next();
});

router.afterEach((to, from) => {
  window.scrollTo(0, 0);
});

export default router;
