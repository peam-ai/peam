module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-prefix-selector': {
      prefix: '.peam-root',
      transform: function (prefix, selector, prefixedSelector) {
        // For .dark selector, make it .peam-root.dark (same element, not descendant)
        if (selector === '.dark') {
          return `${prefix}${selector}`;
        }
        return prefixedSelector;
      },
    },
  },
};
