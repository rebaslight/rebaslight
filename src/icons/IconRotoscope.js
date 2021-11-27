var h = require('virtual-dom/h')

module.exports = function IconRotoscope () {
  // Thanks https://www.svgrepo.com/svg/293637/nodes-shapes-and-symbols
  return h('svg',
    {
      namespace: 'http://www.w3.org/2000/svg',
      attributes: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '100%',
        height: '100%',
        fill: 'currentColor',
        viewBox: '0 0 512 512'
      }
    }, [
      Path('#f00', 'M433.096 462.136 76.864 256 433.096 49.864v412.272zM108.8 256l308.296 178.4V77.6L108.8 256z'),
      Path('transparent', 'M39.888 214.456h83.096v83.096H39.888z'),
      Path('#ff0', 'M114.984 222.448v67.096H47.888v-67.096h67.096m16-16H31.888v99.104h99.096v-99.104z'),
      Path('transparent', 'M389.016 8h83.096v83.096h-83.096z'),
      Path('#ff0', 'M464.112 16v67.096h-67.096V16h67.096m16-16h-99.096v99.096h99.096V0z'),
      Path('transparent', 'M389.016 420.904h83.096V504h-83.096z'),
      Path('#ff0', 'M464.112 428.904V496h-67.096v-67.096h67.096m16-16h-99.096V512h99.096v-99.096z')
    ]
  )
}

function Path (fill, d) {
  return h('path', {
    namespace: 'http://www.w3.org/2000/svg',
    attributes: { fill, d }
  })
}
