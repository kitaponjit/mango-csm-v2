<script type="text/javascript">
  import { h } from 'vue'

  /*
   * Replacement for the `vue-icon` package (registered in the legacy app as
   * `Vue.use(feather, 'v-icon')`), which has no Vue 3 build.
   *
   * vue-icon ships the whole Feather set in a compact encoding and decodes it at
   * render time. Only 7 icons are used across the 41 call sites and every `name`
   * is a static literal — there is not one dynamic `:name` binding — so the
   * definitions for just those are inlined here, copied verbatim from
   * `vue-icon/lib/vue-feather.esm.js` rather than retyped from memory.
   *
   * The decoder, the SVG attributes and the `icon` / `icon-<name>` classes below
   * all mirror that package, so the rendered markup is identical.
   */

  // Compact form: [shape, values, shape, values, ...]
  const ICONS = {
    'arrow-up-circle': ['c', '12 12 10', 'b', '16 12 12 8 8 12', 'l', '12 12 16 8'],
    'copy': ['r', '9 9 13 13 2 2', 'p', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
    'download': ['p', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'b', '7 10 12 15 17 10', 'l', '12 12 15 3'],
    'edit': ['p', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'p', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
    'printer': ['b', '6 9 6 2 18 2 18 9', 'p', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'r', '6 14 12 8'],
    'trash-2': ['b', '3 6 5 6 21 6', 'p', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'l', '10 10 11 17', 'l', '14 14 11 17'],
    'x': ['l', '18 6 6 18', 'l', '6 18 6 18']
  }

  const SHAPE = { p: 'path', r: 'rect', c: 'circle', e: 'ellipse', l: 'line', g: 'polygon', b: 'polyline' }

  // Note the `l` ordering — vue-icon stores lines as x1 x2 y1 y2, not x1 y1 x2 y2.
  function attrsFor(shape, raw) {
    const v = raw.split(' ')
    switch (shape) {
      case 'p': return { d: raw }
      case 'r': {
        const a = { x: v[0], y: v[1], width: v[2], height: v[3] }
        if (v[4] !== undefined) { a.rx = v[4]; a.ry = v[5] }
        return a
      }
      case 'c': return { cx: v[0], cy: v[1], r: v[2] }
      case 'e': return { cx: v[0], cy: v[1], rx: v[2], ry: v[3] }
      case 'l': return { x1: v[0], x2: v[1], y1: v[2], y2: v[3] }
      case 'g':
      case 'b': return { points: raw }
      default: return {}
    }
  }

  export default {
    name: 'VIcon',
    props: {
      name: { type: String, required: true },
      baseClass: { type: String, default: 'icon' },
      classPrefix: { type: String, default: 'icon-' }
    },
    render() {
      const icon = ICONS[this.name]
      if (!icon) {
        console.warn(`[v-icon] "${this.name}" is not one of the inlined Feather icons — add it from vue-icon/lib/vue-feather.esm.js`)
        return null
      }
      const children = []
      for (let i = 0; i < icon.length; i += 2) {
        const tag = SHAPE[icon[i]]
        if (tag) children.push(h(tag, attrsFor(icon[i], icon[i + 1])))
      }
      return h('svg', {
        class: [this.baseClass, this.classPrefix + this.name],
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }, children)
    }
  }
</script>
