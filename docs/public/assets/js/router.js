// Webpack
let conf = process.env.conf; // This variable comes from webpack.config.js under `plugins`

// Vue Router
import VueRouter from "vue-router";

import compiledRoutes from "/public/assets/js/compiled_routes.js"

let routes = [];
let routesForErrors = {};
compiledRoutes.forEach(component => {
  if (component.resource.meta && component.resource.meta.error_code) {
    routesForErrors[component.resource.meta.error_code] = component.default;
    return;
  }
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
  component: routesForErrors['404']
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
  if (!to.meta) {
    to.meta = {
      title: "404 (Not Found)"
    };
  }
  if (!to.meta.title) {
    to.meta.title = "404 (Not Found)";
  }
  document.title = conf.module_name + " - " + to.meta.title;
  next();
});

router.afterEach((to, from) => {
  window.scrollTo(0, 0);
});

export default router;
