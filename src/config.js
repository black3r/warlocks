require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Warlocks',
    description: 'Online multi-player arena game.',
    head: {
      titleTemplate: 'Warlocks | %s',
      meta: [
        {name: 'description', content: 'An online multi-player arena game.'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Warlocks'},
        {property: 'og:image', content: 'https://warlocks.black3r.net/logo.png'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Warlocks'},
        {property: 'og:description', content: 'An online multi-player arena game.'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@black3r'},
        {property: 'og:creator', content: '@black3r'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  },

}, environment);
