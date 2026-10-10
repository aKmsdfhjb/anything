const base = require('./app.json').expo;

const plugins = [...(base.plugins || [])];
if (process.env.GOOGLE_MAPS_API_KEY) {
  plugins.push([
    'react-native-maps',
    { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
  ]);
}

module.exports = {
  ...base,
  plugins,
};
