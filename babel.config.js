module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-react-app',
        {
          absoluteRuntime: false,
          useESModules: false,
          typescript: true,
        },
      ],
    ],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ],
  };
};
