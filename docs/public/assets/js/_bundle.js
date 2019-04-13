// Webpack
let conf = process.env.conf; // This variable comes from webpack.config.js under `plugins`

// Vue
import Vue from "vue";
import VueRouter from "vue-router";

// Vue - Components
import VueAppRoot from "/components/vue_app_root.vue";
import Sidebar from "/components/sidebar.vue";
import GlobalComponents from "/public/assets/js/compiled_vue_global_components.js";

// Vendor
import MarkdownIt from "markdown-it";
window.markdownIt = new MarkdownIt();

// Vue - Global registration
Vue.use(VueRouter);
Vue.filter('markdown-it', function(value) {
  return window.markdownIt.render(value);
});
Vue.prototype.$app_data = window.app_data; // The `app_data` variable comes from response_service.ts
Vue.prototype.$conf = conf;
Vue.prototype.$store = window.app_data.store;

// Vue Router
import router from "/public/assets/js/router.js";

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
