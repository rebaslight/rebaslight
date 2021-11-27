var h = require('virtual-dom/h')

module.exports = function IconTrash () {
  // Thanks https://www.svgrepo.com/svg/75733/trash
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
    },
    h('path', {
      namespace: 'http://www.w3.org/2000/svg',
      attributes: {
        d: 'M432 96h-48V32c0-17.672-14.328-32-32-32H160c-17.672 0-32 14.328-32 32v64H80c-17.672 0-32 14.328-32 32v32h416v-32c0-17.672-14.328-32-32-32zm-240 0V64h128v32H192zM80 480.004C80 497.676 94.324 512 111.996 512h288.012C417.676 512 432 497.676 432 480.008V192H80v288.004zM320 272c0-8.836 7.164-16 16-16s16 7.164 16 16v160c0 8.836-7.164 16-16 16s-16-7.164-16-16V272zm-80 0c0-8.836 7.164-16 16-16s16 7.164 16 16v160c0 8.836-7.164 16-16 16s-16-7.164-16-16V272zm-80 0c0-8.836 7.164-16 16-16s16 7.164 16 16v160c0 8.836-7.164 16-16 16s-16-7.164-16-16V272z'
      }
    })
  )
}
