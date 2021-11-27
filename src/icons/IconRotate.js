var h = require('virtual-dom/h')

module.exports = function IconRotate (direction) {
  // Thanks https://www.svgrepo.com/svg/218176/rotate
  return h('svg',
    {
      namespace: 'http://www.w3.org/2000/svg',
      attributes: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '100%',
        height: '100%',
        fill: 'currentColor',
        viewBox: '0 0 492 492'
      }
    },
    h('g',
      {
        namespace: 'http://www.w3.org/2000/svg',
        attributes: {
          transform: direction === 'right'
            ? 'rotate(180) translate(0 -492) scale(-1 1)'
            : direction === 'left' ? 'rotate(180) translate(-492 -492)'
              : undefined

        }
      },
      h('path', {
        namespace: 'http://www.w3.org/2000/svg',
        attributes: {
          d: 'M484.004 292.48c-5.063-5.086-11.821-8.025-18.947-8.068H330.468c-14.824 0-26.676 12.3-26.676 27.12v22.78c0 7.156 2.7 13.9 7.788 18.992 5.088 5.092 11.784 7.896 18.94 7.896l39.052.008c-32.06 34.332-76.68 53.864-123.672 53.864-93.22 0-169.072-75.844-169.072-169.072s75.84-169.072 169.064-169.072c69.796 0 133.336 43.82 158.108 109.04 5.632 14.816 20.068 24.776 35.916 24.776 4.66 0 9.248-.848 13.632-2.52 19.8-7.516 29.784-29.748 22.26-49.544C439.772 63.84 347.376.112 245.888.112 110.308.112 0 110.416 0 246s110.236 245.888 245.816 245.888c62.584 0 123.272-24.632 169.364-67.872v21.788c0 14.824 12.208 26.812 27.032 26.812h22.78c14.824 0 27.008-11.988 27.008-26.812v-134.18c0-7.18-2.884-14.06-7.996-19.144z'
        }
      })
    )
  )
}
