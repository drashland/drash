<template lang="pug">
div#vue_app
    button.c-btn.c-btn-mobile.hide--soft(type="button", @click="openSidebar()")
        i.fa.fa-bars
        i.fa.fa-times
    button.c-btn.c-btn-back-to-top.hide--soft(type="button", @click="scrollToTop()")
        i.fa.fa-arrow-up
    sidebar
    main#top.c-main
        //-
          PURPOSE
          TYPE
          PARAMETERS
          THROWS
          RETURNS
          EXAMPLE USAGE
          NOTES
        div.c-misc-date-last-updated-bar
            div.row.text-align--right
                div.col
                    p Last updated: {{ date_last_updated }}
        div.container.c-container--docs
            transition
                keep-alive
                    router-view
</template>

<script>
import Sidebar from "./sidebar.vue";

export default {
    components: {
        Sidebar
    },
    data() {
        return {
            date_last_updated: "271641R022019",
        };
    },
    methods: {
        scrollToTop: function scrollToTop() {
            $('html, body').animate({
                scrollTop: $("body").offset().top - 0
            }, 0);
        },
        openSidebar: function openSidebar() {
            if($(".c-btn-mobile").hasClass("open")) {
                $(".c-btn-mobile").removeClass("open");
                $(".c-btn-mobile .fa-bars").show();
                $(".c-btn-mobile .fa-times").hide();
                $(".c-sidebar").addClass("hide--soft");
            } else {
                $(".c-btn-mobile").addClass("open");
                $(".c-btn-mobile .fa-bars").hide();
                $(".c-btn-mobile .fa-times").show();
                $(".c-sidebar").removeClass("hide--soft");
            }
        }
    },
}
</script>
