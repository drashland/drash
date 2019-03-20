// Webpack
let conf = process.env.conf; // This variable comes from webpack.config.js under `plugins`

// Vue
import Vue from "vue";
import VueRouter from "vue-router";

// Vue - Components
import CodeBlock from "/components/code_block.vue";
import CodeBlockForReference from "/components/code_block_for_reference.vue";
import HeadingH2 from "/components/heading_h2.vue";
import VueAppRoot from "/components/vue_app_root.vue";
import Page_ApiReference from "/components/page_api_reference.vue";

// Vue - Components - Pages
import * as AddingContentTypes from "/components/pages/tutorials/adding_content_types.vue";
import * as CreatingAServer from "/components/pages/tutorials/creating_a_server.vue";
import * as HandlingContentNegotiation from "/components/pages/tutorials/handling_content_negotiation.vue";
import * as Introduction from "/components/pages/introduction.vue";
import * as Logging from "/components/pages/tutorials/logging.vue";
import * as APIReference_Compilers from "/components/pages/api-reference/compilers.vue";
import Error404 from "/components/pages/error_404.vue";

// Vendor
import MarkdownIt from "markdown-it";
window.markdownIt = new MarkdownIt();

const routes = [];
const routeModules = [
  AddingContentTypes,
  APIReference_Compilers,
  CreatingAServer,
  HandlingContentNegotiation,
  Introduction,
  Logging
].forEach(component => {
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

// Vue - Global registration
Vue.use(VueRouter);
Vue.component("code-block", CodeBlock);
Vue.component("code-block-for-reference", CodeBlockForReference);
Vue.component("heading-h2", HeadingH2);
Vue.component("page-api-reference", Page_ApiReference);
Vue.filter('markdown-it', function(value) {
  if (value.indexOf("```") != -1) {
    return window.markdownIt.render(value);
  }

  return window.markdownIt.renderInline(value);
});
Vue.prototype.$conf = conf;
Vue.prototype.$app_data = window.app_data;

const router = new VueRouter({
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
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

// Vue app initialization
window.app = new Vue({
  el: "#vue_app_mount",
  components: {
    VueAppRoot
  },
  router: router,
  mounted() {
    fade_in_element($("#vue_app_mount"));
  }
});

// TODO: Convert code below to be imported by webpack; remove jQuery

$(document).ready(function documentReady() {
  toggleSidebar();
});

$(window).resize(function windowResize() {
  toggleSidebar();
});

$(window).scroll(function windowScroll() {
  toggleBackToTopButton();
});

/**
 * Fade in an element.
 *
 * @param {Object} jQueryObject The jQuery object version of the element.
 * @param {Number} duration
 */
function fade_in_element(jQueryObject, duration) {
  if (!duration) {
    duration = 300;
  }
  jQueryObject.fadeIn(duration);
}

/**
 * Fade out an element.
 *
 * @param {Object} jQueryObject The jQuery object version of the element.
 * @param {Number} duration
 */
function fade_out_element(jQueryObject, duration) {
  if (!duration) {
    duration = 300;
  }
  jQueryObject.fadeOut(duration);
}

/**
 * Toggle the "Back To Top" button
 */
function toggleBackToTopButton() {
  if ($(window).scrollTop() >= 90) {
    $(".c-btn-back-to-top").fadeIn(100);
  } else {
    $(".c-btn-back-to-top").fadeOut(100);
  }
}

/**
 * Toggle the sidebar
 *
 * TODO: Clean up... it works though.
 */
function toggleSidebar() {
  var mobileButton = $(".c-btn-mobile");
  if ($(window).width() >= 951) {
    $(".c-sidebar a").unbind("click");
    // Hide the button
    mobileButton.removeClass("open");
    mobileButton.find(".fa-bars").show();
    mobileButton.find(".fa-times").hide();
    // Show the sidebar
    $(".c-sidebar").removeClass("hide--soft");
  } else {
    $(".c-sidebar a").click(function() {
      $(".c-sidebar").addClass("hide--soft");
      mobileButton.removeClass("open");
      mobileButton.find(".fa-bars").show();
      mobileButton.find(".fa-times").hide();
    });
    // If the menu is NOT open, then hide the sidebar
    if (!mobileButton.hasClass("open")) {
      mobileButton.find(".fa-bars").show();
      mobileButton.find(".fa-times").hide();
      $(".c-sidebar").addClass("hide--soft");
    } else {
      mobileButton.find(".fa-times").show();
    }
  }
}

/**
 * Is the window mobile width?
 *
 * @return {Boolean}
 */
function window_is_at_mobile_width() {
  return $(window).width() <= 767;
}
