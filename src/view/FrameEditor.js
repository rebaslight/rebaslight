var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('./styles')
var svg = require('virtual-dom/virtual-hyperscript/svg')
var bus = require('../event-bus')
var diff = require('virtual-dom/diff')
var jsCSS = require('js-managed-css')
var patch = require('virtual-dom/patch')
var flatInt = require('../flatInt')
var getIn = require('get-in')
var Effects = require('../effects')
var getPoints = require('../getPoints')
var Magnifier = require('./FrameEditor/Magnifier')
var renderFrame = require('../renderFrame')
var mkWidget = require('virtual-dom-closure-widget')
var createElement = require('virtual-dom/create-element')
var onMouseDownMoveUp = require('./on-mouse-down-move-up')

var PointBox_size = 20
var border_width = 1

var css_vars = jsCSS({
  '.$PointBox': {
    'fill': 'black',
    'fill-opacity': 0, // hack to ensure hovering works
    'stroke': 'yellow',
    'stroke-width': 2,
    'width': PointBox_size + 'px',
    'height': PointBox_size + 'px',
    ':hover': {
      'cursor': 'pointer',
      'stroke': '#0FF'
    },
    '&.$Active': {
      'stroke': '#0DD'
    }
  },
  '.$Polygon': {
    'fill': 'black',
    'fill-opacity': 0.5,
    'stroke': 'red',
    'stroke-width': 2,
    ':hover': {
      'cursor': 'pointer',
      'stroke': '#0FF'
    }
  }
})

function isFrameLayerWithLastSelectedPoint (state, mouse_state) {
  if (mouse_state && !state.preview_mode) {
    var sss = mouse_state.state_snap_shot
    if (sss && sss.layer_id === state.open_layer_id && sss.frame_n === state.frame) {
      if (mouse_state.payload && mouse_state.payload.type === 'point' && mouse_state.payload.i >= 0) {
        return true
      }
    }
  }
  return false
}

var getMaxNPointsForEffectID = function (effect_id) {
  if (_.has(Effects, effect_id)) {
    var effect = Effects[effect_id]
    if (_.isNumber(effect.max_n_points) && !_.isNaN(effect.max_n_points) && effect.max_n_points > 0) {
      return effect.max_n_points
    }
  }
  return -1
}

var SVGTracer = function () {
  var render = function (canvas_rect, points, outline_points, highLightI) {
    return svg('svg', {
      id: 'RLDATAID-svg',
      width: canvas_rect.w,
      height: canvas_rect.h,
      style: {
        position: 'absolute',
        top: flatInt(canvas_rect.marginTop + border_width) + 'px',
        left: flatInt(canvas_rect.marginLeft + border_width) + 'px'
      }
    }, [
      svg('polygon', {
        id: 'RLDATAID-shape',
        'class': css_vars.Polygon,
        points: _.map(outline_points, function (p) {
          return p.x + ',' + p.y
        }).join(' ')
      }),
      _.map(points, function (p, i) {
        var classes = css_vars.PointBox
        if (highLightI === i) {
          classes += ' ' + css_vars.Active
        }
        return svg('rect', {
          id: 'RLDATAID-point-' + i,
          'class': classes,
          x: flatInt(p.x - PointBox_size / 2),
          y: flatInt(p.y - PointBox_size / 2)
        })
      })
    ])
  }

  var tree, container
  return function () {
    var newTree = render.apply(null, arguments)
    if (!container) {
      container = createElement(newTree)
    } else {
      container = patch(container, diff(tree, newTree))
    }
    tree = newTree
    return container
  }
}

var changePoint = function (points, i, x, y) {
  var new_points = []
  var found_it = false
  var pi
  for (pi = 0; pi < points.length; pi += 2) {
    if (pi === i * 2) {
      found_it = true
      new_points.push(x)
      new_points.push(y)
    } else {
      new_points.push(points[pi])
      new_points.push(points[pi + 1])
    }
  }
  if (!found_it) {
    new_points.push(x)
    new_points.push(y)
  }
  return new_points
}

var translatePoints = function (points, x1, y1, x2, y2, w, h) {
  var dx = x2 - x1
  var dy = y2 - y1
  var new_points = []
  var i, x, y
  // adjust dx, dy so no point goes out of bounds
  for (i = 0; i < points.length; i += 2) {
    x = points[i + 0]
    y = points[i + 1]
    if ((x + dx) < 0) {
      dx = -x
    }
    if ((x + dx) > w) {
      dx = w - x
    }
    if ((y + dy) < 0) {
      dy = -y
    }
    if ((y + dy) > h) {
      dy = h - y
    }
  }
  // translate dx,dy
  for (i = 0; i < points.length; i += 1) {
    new_points.push(points[i] + (i % 2 === 0 ? dx : dy))
  }
  return new_points
}
var withoutPointI = function (points, pi) {
  var new_points = []
  var i
  for (i = 0; i < points.length; i += 1) {
    if ((pi * 2) !== (i - (i % 2 === 0 ? 0 : 1))) {
      new_points.push(points[i])
    }
  }
  return new_points
}
var getPointsForMouseState = function (mouse_state) {
  var sss = mouse_state.state_snap_shot
  var points = sss.original_points
  if (mouse_state.payload.type === 'point') {
    points = changePoint(points, mouse_state.payload.i, mouse_state.x, mouse_state.y)
  } else if (mouse_state.payload.type === 'translate') {
    points = translatePoints(points, mouse_state.startX, mouse_state.startY, mouse_state.x, mouse_state.y, sss.frame_w, sss.frame_h)
  }
  if (sss.max_n_points > 0) {
    points = points.slice(0, sss.max_n_points * 2)
  }
  return points
}

var Widget = mkWidget(function (initial_hb_state) {
  var state = initial_hb_state

  var getCurrentLayer = function () {
    return _.find(state.current_project && state.current_project.layers, function (layer) {
      return layer.id === (state.open_layer_id)
    })
  }

  var getCurrentPoints = function () {
    var layer = getCurrentLayer() || {}
    return getPoints(layer, state.frame)
  }

  var mouse_state = {}
  var canvas_rect = { x: 0, y: 0, w: 0, h: 0, marginLeft: 0, marginTop: 0, zoom: 0 }

  var pointsSVGPoints = function (points) {
    return _.map(_.chunk(points, 2), function (p) {
      var px = p[0]
      var py = p[1]
      return {
        x: flatInt(px * canvas_rect.zoom),
        y: flatInt(py * canvas_rect.zoom)
      }
    })
  }

  var renderSVG = (function () {
    var t = SVGTracer()
    var getOutlinePoints = function (points) {
      var layer = getCurrentLayer()
      var effect = Effects[layer && layer.effect_id]
      if (_.has(effect, 'getOutlinePoints')) {
        var settings = effect.normalizeSettings(layer.settings)
        return effect.getOutlinePoints(points, settings)
      }
      return points
    }
    return function () {
      var points
      if (state.preview_mode) {
        points = []// don't show the points during preview mode
      } else if (mouse_state.is_down) {
        points = getPointsForMouseState(mouse_state)
      } else {
        points = getCurrentPoints()
      }
      var outline_points = getOutlinePoints(points)
      var highLightI = -1
      if (isFrameLayerWithLastSelectedPoint(state, mouse_state)) {
        highLightI = mouse_state.payload.i
      }
      return t(canvas_rect, pointsSVGPoints(points), pointsSVGPoints(outline_points), highLightI)
    }
  }())

  var container = createElement(h('div', {
    style: S.xstyle.absolute(S.xstyle.noselect({
      color: S.color.text,
      background: S.color.dark_bg
    }))
  }))
  var canvas = createElement(h('canvas', {
    id: 'RLDATAID-canvas',
    width: state.current_project.main_source.frame_w,
    height: state.current_project.main_source.frame_h,
    style: {
      border: border_width + 'px solid ' + S.color.border_highlight,
      background: '#000000'
    }
  }))
  var magnifier = Magnifier(canvas)

  container.appendChild(canvas)
  container.appendChild(renderSVG())
  container.appendChild(magnifier.canvas)
  var ctx = canvas.getContext('2d')

  var renderImage = function () {
    var layers = state.preview_mode
      ? state.current_project.layers
      : []
    renderFrame(ctx, state.current_project.main_source, layers, state.frame, state.unlocked)

    let showMagnifier = state.showMagnifier && isFrameLayerWithLastSelectedPoint(state, mouse_state)

    magnifier.render(mouse_state, showMagnifier)

    renderSVG()// always call this, in effects mode it just does nothing
  }
  var centerTheCanvas = function () {
    var fw = state.current_project.main_source.frame_w + 2 * border_width
    var fh = state.current_project.main_source.frame_h + 2 * border_width
    var ww = container.clientWidth
    var wh = container.clientHeight

    var zoom = Math.min(ww / fw, wh / fh)

    var new_rect = {
      x: canvas_rect.x,
      y: canvas_rect.y,
      w: Math.max(0, flatInt(zoom * fw - 2 * border_width)),
      h: Math.max(0, flatInt(zoom * fh - 2 * border_width)),
      marginTop: flatInt((wh - (zoom * fh)) / 2),
      marginLeft: flatInt((ww - (zoom * fw)) / 2),
      zoom: zoom
    }

    var change_made = false
    if (canvas_rect.w !== new_rect.w) {
      canvas.style.width = new_rect.w + 'px'
      change_made = true
    }
    if (canvas_rect.h !== new_rect.h) {
      canvas.style.height = new_rect.h + 'px'
      change_made = true
    }
    if (canvas_rect.marginTop !== new_rect.marginTop) {
      canvas.style.marginTop = new_rect.marginTop + 'px'
      change_made = true
    }
    if (canvas_rect.marginLeft !== new_rect.marginLeft) {
      canvas.style.marginLeft = new_rect.marginLeft + 'px'
      change_made = true
    }
    if (change_made) {
      var bcr = canvas.getBoundingClientRect()
      new_rect.x = bcr.left
      new_rect.y = bcr.top
    }
    canvas_rect = new_rect
  }

  var setMouseXY = function (ev) {
    var cx = canvas_rect.x
    var cy = canvas_rect.y
    var cw = canvas_rect.w
    var ch = canvas_rect.h
    mouse_state.x = flatInt(Math.min(cw, Math.max(0, ev.pageX - cx)) / canvas_rect.zoom)
    mouse_state.y = flatInt(Math.min(ch, Math.max(0, ev.pageY - cy)) / canvas_rect.zoom)
  }

  var saveMousePoints = function (points) {
    var sss = mouse_state.state_snap_shot
    bus.emit('save-points', sss.project_id, sss.layer_id, sss.frame_n, points)
  }

  var unlistenMouse = onMouseDownMoveUp(function (ev) {
    if (state.preview_mode) {
      // Don't take any mouse events in preview_mode
      return
    }
    var payload
    var target_id = (ev.target && ev.target.getAttribute ? ev.target.getAttribute('id') : '') || ''
    if (/^RLDATAID-point-[0-9]+$/.test(target_id)) {
      payload = { type: 'point', i: parseInt(target_id.replace(/^RLDATAID-point-/, ''), 10) || 0 }
    } else if (/^RLDATAID-shape.*$/.test(target_id)) {
      payload = { type: 'translate', i: 'body' }
    } else if (/^RLDATAID-(svg|canvas)$/.test(target_id)) {
      payload = { type: 'point', i: -1 }
    } else {
      return
    }

    var layer = getCurrentLayer()
    if (!layer) {
      return
    }

    setMouseXY(ev)
    mouse_state.state_snap_shot = {
      project_id: state.current_project.id,
      layer_id: layer.id,
      max_n_points: getMaxNPointsForEffectID(layer.effect_id),
      frame_n: state.frame,
      frame_w: state.current_project.main_source.frame_w,
      frame_h: state.current_project.main_source.frame_h,
      original_points: _.cloneDeep(getPoints(layer, state.frame))
    }
    mouse_state.payload = payload
    mouse_state.startX = mouse_state.x
    mouse_state.startY = mouse_state.y
    mouse_state.is_down = true

    if (ev.ctrlKey || ev.altKey || ev.metaKey || ((ev.which === 3) || (ev.button === 2))) {
      if (payload.type === 'point') {
        saveMousePoints(withoutPointI(getPointsForMouseState(mouse_state), mouse_state.payload.i))
        mouse_state.is_down = false
        bus.emit('set-mouse_state', mouse_state)
        return
      } else if (payload.type === 'translate') {
        saveMousePoints([])// delete them all
        mouse_state.is_down = false
        bus.emit('set-mouse_state', mouse_state)
        return
      }
    }
    bus.emit('set-mouse_state', mouse_state)
    renderImage()
  }, function (ev) {
    if (!mouse_state.is_down) {
      return
    }
    setMouseXY(ev)
    bus.emit('set-mouse_state', mouse_state)
    renderImage()
  }, function (ev) {
    if (!mouse_state.is_down) {
      return
    }
    mouse_state.is_down = false
    setMouseXY(ev)
    bus.emit('set-mouse_state', mouse_state)

    saveMousePoints(getPointsForMouseState(mouse_state))
  })

  setTimeout(centerTheCanvas, 0)

  return {
    element: container,
    update: function () {
      var old_w = state.current_project.main_source.frame_w
      var new_w = this.props.current_project.main_source.frame_w
      if (old_w !== new_w) {
        canvas.width = new_w
      }
      var old_h = state.current_project.main_source.frame_h
      var new_h = this.props.current_project.main_source.frame_h
      if (old_h !== new_h) {
        canvas.height = new_h
      }

      state = this.props
      centerTheCanvas()
      renderImage()
    },
    destroy: function () {
      unlistenMouse()
    }
  }
})

var toInt = function (n) {
  return parseInt(n, 10) || 0
}
var hasCompleteMainSource = function (project) {
  var parts = [
    '' + getIn(project, ['main_source', 'url']),
    '' + getIn(project, ['main_source', 'type']),
    toInt(getIn(project, ['main_source', 'frame_w'])),
    toInt(getIn(project, ['main_source', 'frame_h'])),
    toInt(getIn(project, ['main_source', 'n_frames']))
  ]
  return _.every(parts, function (p) {
    if (_.isString(p)) {
      return p.trim().length > 0
    }
    return _.isNumber(p) && (p < 1)
  })
}

module.exports = function (state) {
  if (hasCompleteMainSource(state.current_project)) {
    return h('div', {
      style: S.xstyle.absolute({
        background: S.color.dark_bg
      })
    })
  }
  return Widget(state)
}
module.exports.changePoint = changePoint
module.exports.getPointsForMouseState = getPointsForMouseState
module.exports.isFrameLayerWithLastSelectedPoint = isFrameLayerWithLastSelectedPoint
