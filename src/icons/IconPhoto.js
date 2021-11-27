var h = require('virtual-dom/h')

module.exports = function IconPhoto () {
  // Thanks https://www.svgrepo.com/svg/158771/photo
  return h(
    'svg', {
      namespace: 'http://www.w3.org/2000/svg',
      attributes: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '100%',
        height: '100%',
        fill: 'currentColor',
        viewBox: '0 0 313 313'
      }
    }, [
      h('path', {
        namespace: 'http://www.w3.org/2000/svg',
        attributes: {
          d: 'M283 3H30C13.458 3 0 16.458 0 33v247c0 16.542 13.458 30 30 30h253c16.542 0 30-13.458 30-30V33c0-16.542-13.458-30-30-30zm0 30 .01 131.228-50.683-47.598c-3.544-3.327-8.083-5.159-12.78-5.159-5.715 0-11.063 2.681-14.673 7.354l-59.663 77.256c-1.934 2.504-5.036 3.999-8.299 3.999-2.223 0-4.324-.676-6.076-1.956l-38.773-28.316c-3.862-2.821-8.865-4.374-14.085-4.374-5.945 0-11.504 1.938-15.65 5.456L30 198.31V33h253z'
        }
      }),
      h('path', {
        namespace: 'http://www.w3.org/2000/svg',
        attributes: {
          d: 'M115 122c17.093 0 31-13.907 31-31s-13.907-31-31-31-31 13.907-31 31 13.907 31 31 31z'
        }
      })
    ]
  )
}
