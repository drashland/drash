/**
 * Tailwind v4 runs as a PostCSS plugin — there is no `tailwind.config.js` and
 * no `content` globs. Everything else (theme tokens, the dark variant) is
 * declared in app/globals.css.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
