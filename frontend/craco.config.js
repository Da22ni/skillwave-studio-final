// Simple Craco configuration for Tailwind CSS
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize for production builds
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        };
      }
      
      // Reduce memory usage during builds
      webpackConfig.optimization.minimize = process.env.NODE_ENV === 'production';
      
      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};