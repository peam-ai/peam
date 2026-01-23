module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '.peam-root',
      transform: function (prefix, selector, prefixedSelector) {
        if (selector === ':root') {
          return `${prefix}`;
        }
        // For .dark selector, make it .peam-root.dark
        if (selector === '.dark') {
          return `${prefix}${selector}`;
        }
        return prefixedSelector;
      },
    },
  },
};
