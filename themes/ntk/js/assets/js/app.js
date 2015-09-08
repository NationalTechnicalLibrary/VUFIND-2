/**
* app.js v0.0.1 by Martin Stanek
*/
/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
        .prop('checked', !this.$element.hasClass('active'))
        .trigger('change')
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#carousel
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  , wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    this.sliding = true

    isCycling && this.pause()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#collapse
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#dropdowns
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    var $el = $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      $parent.trigger(e = $.Event('show.bs.dropdown'))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown')

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var $items = $('[role=menu] li:not(.divider):visible a', $parent)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index=0

    $items.eq(index).focus()
  }

  function clearMenus() {
    $(backdrop).remove()
    $(toggle).each(function (e) {
      var $parent = getParent($(this))
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown'))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('dropdown')

      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#modals
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
    , image: false
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    if (this.options.remote) {
      // Check if the remote URL is an image
      if (this.options.image || (/\.(gif|jpg|jpeg|tiff|png)$/i).test(this.options.remote)) {
        var imageContainer = $('<img/>')
        imageContainer[0].src = this.options.remote

        this.$element.addClass('modal-image')
        this.$element.find('.modal-body').append(imageContainer)
        this.$element.find('.modal-header h4').text(this.options.title)
        this.$element.find('.modal-body img').load()
        imageContainer = null
      }
      else {
        // Else load remote URL
        this.$element.load(this.options.remote)
      }
    }

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()

    // empty prepared modal
    if (this.options.remote) {
      this.$element.find(".modal-body").empty()
      this.$element.find(".modal-header h4").empty()
      this.$element.removeClass('modal-image')
    }

    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) {
        $this.data('bs.modal', (data = new Modal(this, options)))
      }
      else {
        $this.data('bs.modal').options = options;
      }
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }

  function createModal () {
    return $('<div class="modal fade" id="modal-container" tabindex="-1" role="dialog" aria-hidden="true">' +
              '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                  '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title"></h4>' +
                  '</div>' +
                  '<div class="modal-body"></div>' +
                  '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Zavřít</button>' +
                    '<button type="button" class="btn btn-primary">Ok</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>').appendTo(document.body)
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    // create element from scratch if doesn't exist
    if($target.length === 0) $target = createModal()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal',  '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    $tip
      .offset(offset)
      .addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#popovers
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tabs
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);

/*global jQuery */
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {

      var div = document.createElement('div'),
          ref = document.getElementsByTagName('base')[0] || document.getElementsByTagName('script')[0],
          cssStyles = '&shy;<style>.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>';

      div.className = 'fit-vids-style';
      div.id = 'fit-vids-style';
      div.style.display = 'none';
      div.innerHTML = cssStyles;

      ref.parentNode.insertBefore(div,ref);

    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

// Modification of the original Foundation v2.1.4 http://foundation.zurb.com

(function($) {
  var switched = false;
  var updateTables = function() {
    if (($(window).width() < 991) && !switched ){
      switched = true;
      $(".table-responsive").each(function(i, element) {
        wrapTable($(element));
      });
      return true;
    }
    else if (switched && ($(window).width() > 991)) {
      switched = false;
      $(".table-responsive").each(function(i, element) {
        unwrapTable($(element));
      });
    }
  };

  $(window).load(updateTables);
  $(window).on("redraw",function(){switched=false;updateTables();}); // An event to listen for
  $(window).on("resize", updateTables);


	function wrapTable(original)	{
		original.wrap('<div class="table-wrapper"><div class="scrollable"></div></div>');
	}

	function unwrapTable(original) {
    original.unwrap();
    original.unwrap();
	}

})(jQuery);

//
// FILTERABLE LIST plugin
// Ad-hoc implementation

// List example

// <ul class="js-filterable-list">
//  <li data-category="books">...</li>
// </ul>

// Search filter
// Facet is identified by class and name. Checkbox name is the target scope.

// <ul class="js-facet" data-name="category">
//  <li>
//   <div class="checkbox">
//     <label>
//       <input data-all="true" type="checkbox" name="type">Vybrat vše
//    </label>
//    </div>
//  </li>
//  <li>
//   <div class="checkbox">
//     <label>
//       <input type="checkbox" name="books">Vybrat vše
//    </label>
//    </div>
//  </li>
// </ul>

(function($) {

  $.fn.facetFilter = function(options){

    // default configuration properties
    var defaults = {
      targetList:   ".js-filterable-list"
    };

    var options = $.extend(defaults, options);

    var list = $(options.targetList),
        listItems = list.find('li'),
        selectedFilters = {};

    this.each(function(){
      var facetName =  $(this).data('name'),
          facetItems = $(this).find('input[type="checkbox"]');

      selectedFilters[facetName] = [];

      facetItems.on('click', function(){
        var name = $(this).attr('name');

        // Handle checked and unchecked facets
        if($(this).prop('checked')) {

          if($(this).data('all')) {
            facetItems.each(function(){
              $(this).prop('checked', true);
              selectedFilters[facetName].push($(this).attr('name'));
            });
          }
          else {
            // Add to selected array
            selectedFilters[facetName].push($(this).attr('name'));
          }
        }
        else {

          if($(this).data('all')) {
            facetItems.each(function(){
              $(this).prop('checked', false);
              var removename = $(this).attr('name');
              selectedFilters[facetName] = jQuery.grep(selectedFilters[facetName], function(value) {
                return value != removename;
              });
            });
          }
          else {
            // Remove selected item
            selectedFilters[facetName] = jQuery.grep(selectedFilters[facetName], function(value) {
              return value != name;
            });
          }

        }

        // Go through all items and resolve filters
        var showItemsCount = 0;
        listItems.hide();

        listItems.each(function(){
          var _this = $(this),
              showItem = true;

          for (var i in selectedFilters) {
            var filters = selectedFilters[i],
                facet = i;

            for (var j in filters) {
              if(_this.data(facet) == filters[j]) {
                showItem = true;
                break;
              }
              else {
                showItem = false;
              }
            }
          }

          // Show item if applicable
          if(showItem) {
            $(this).show();
            showItemsCount++;
          }
        });

        $('.facet-list-current').text(showItemsCount);

      });

    });

  };

})(jQuery);
/*!
 * FullCalendar v1.6.4
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */
(function(t,e){function n(e){t.extend(!0,Ce,e)}function r(n,r,c){function u(t){ae?p()&&(S(),M(t)):f()}function f(){oe=r.theme?"ui":"fc",n.addClass("fc"),r.isRTL?n.addClass("fc-rtl"):n.addClass("fc-ltr"),r.theme&&n.addClass("ui-widget"),ae=t("<div class='fc-content' style='position:relative'/>").prependTo(n),ne=new a(ee,r),re=ne.render(),re&&n.prepend(re),y(r.defaultView),r.handleWindowResize&&t(window).resize(x),m()||v()}function v(){setTimeout(function(){!ie.start&&m()&&C()},0)}function h(){ie&&(te("viewDestroy",ie,ie,ie.element),ie.triggerEventDestroy()),t(window).unbind("resize",x),ne.destroy(),ae.remove(),n.removeClass("fc fc-rtl ui-widget")}function p(){return n.is(":visible")}function m(){return t("body").is(":visible")}function y(t){ie&&t==ie.name||D(t)}function D(e){he++,ie&&(te("viewDestroy",ie,ie,ie.element),Y(),ie.triggerEventDestroy(),G(),ie.element.remove(),ne.deactivateButton(ie.name)),ne.activateButton(e),ie=new Se[e](t("<div class='fc-view fc-view-"+e+"' style='position:relative'/>").appendTo(ae),ee),C(),$(),he--}function C(t){(!ie.start||t||ie.start>ge||ge>=ie.end)&&p()&&M(t)}function M(t){he++,ie.start&&(te("viewDestroy",ie,ie,ie.element),Y(),N()),G(),ie.render(ge,t||0),T(),$(),(ie.afterRender||A)(),_(),P(),te("viewRender",ie,ie,ie.element),ie.trigger("viewDisplay",de),he--,z()}function E(){p()&&(Y(),N(),S(),T(),F())}function S(){le=r.contentHeight?r.contentHeight:r.height?r.height-(re?re.height():0)-R(ae):Math.round(ae.width()/Math.max(r.aspectRatio,.5))}function T(){le===e&&S(),he++,ie.setHeight(le),ie.setWidth(ae.width()),he--,se=n.outerWidth()}function x(){if(!he)if(ie.start){var t=++ve;setTimeout(function(){t==ve&&!he&&p()&&se!=(se=n.outerWidth())&&(he++,E(),ie.trigger("windowResize",de),he--)},200)}else v()}function k(){N(),W()}function H(t){N(),F(t)}function F(t){p()&&(ie.setEventData(pe),ie.renderEvents(pe,t),ie.trigger("eventAfterAllRender"))}function N(){ie.triggerEventDestroy(),ie.clearEvents(),ie.clearEventData()}function z(){!r.lazyFetching||ue(ie.visStart,ie.visEnd)?W():F()}function W(){fe(ie.visStart,ie.visEnd)}function O(t){pe=t,F()}function L(t){H(t)}function _(){ne.updateTitle(ie.title)}function P(){var t=new Date;t>=ie.start&&ie.end>t?ne.disableButton("today"):ne.enableButton("today")}function q(t,n,r){ie.select(t,n,r===e?!0:r)}function Y(){ie&&ie.unselect()}function B(){C(-1)}function j(){C(1)}function I(){i(ge,-1),C()}function X(){i(ge,1),C()}function J(){ge=new Date,C()}function V(t,e,n){t instanceof Date?ge=d(t):g(ge,t,e,n),C()}function U(t,n,r){t!==e&&i(ge,t),n!==e&&s(ge,n),r!==e&&l(ge,r),C()}function Z(){return d(ge)}function G(){ae.css({width:"100%",height:ae.height(),overflow:"hidden"})}function $(){ae.css({width:"",height:"",overflow:""})}function Q(){return ie}function K(t,n){return n===e?r[t]:(("height"==t||"contentHeight"==t||"aspectRatio"==t)&&(r[t]=n,E()),e)}function te(t,n){return r[t]?r[t].apply(n||de,Array.prototype.slice.call(arguments,2)):e}var ee=this;ee.options=r,ee.render=u,ee.destroy=h,ee.refetchEvents=k,ee.reportEvents=O,ee.reportEventChange=L,ee.rerenderEvents=H,ee.changeView=y,ee.select=q,ee.unselect=Y,ee.prev=B,ee.next=j,ee.prevYear=I,ee.nextYear=X,ee.today=J,ee.gotoDate=V,ee.incrementDate=U,ee.formatDate=function(t,e){return w(t,e,r)},ee.formatDates=function(t,e,n){return b(t,e,n,r)},ee.getDate=Z,ee.getView=Q,ee.option=K,ee.trigger=te,o.call(ee,r,c);var ne,re,ae,oe,ie,se,le,ce,ue=ee.isFetchNeeded,fe=ee.fetchEvents,de=n[0],ve=0,he=0,ge=new Date,pe=[];g(ge,r.year,r.month,r.date),r.droppable&&t(document).bind("dragstart",function(e,n){var a=e.target,o=t(a);if(!o.parents(".fc").length){var i=r.dropAccept;(t.isFunction(i)?i.call(a,o):o.is(i))&&(ce=a,ie.dragStart(ce,e,n))}}).bind("dragstop",function(t,e){ce&&(ie.dragStop(ce,t,e),ce=null)})}function a(n,r){function a(){v=r.theme?"ui":"fc";var n=r.header;return n?h=t("<table class='fc-header' style='width:100%'/>").append(t("<tr/>").append(i("left")).append(i("center")).append(i("right"))):e}function o(){h.remove()}function i(e){var a=t("<td class='fc-header-"+e+"'/>"),o=r.header[e];return o&&t.each(o.split(" "),function(e){e>0&&a.append("<span class='fc-header-space'/>");var o;t.each(this.split(","),function(e,i){if("title"==i)a.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>"),o&&o.addClass(v+"-corner-right"),o=null;else{var s;if(n[i]?s=n[i]:Se[i]&&(s=function(){u.removeClass(v+"-state-hover"),n.changeView(i)}),s){var l=r.theme?P(r.buttonIcons,i):null,c=P(r.buttonText,i),u=t("<span class='fc-button fc-button-"+i+" "+v+"-state-default'>"+(l?"<span class='fc-icon-wrap'><span class='ui-icon ui-icon-"+l+"'/>"+"</span>":c)+"</span>").click(function(){u.hasClass(v+"-state-disabled")||s()}).mousedown(function(){u.not("."+v+"-state-active").not("."+v+"-state-disabled").addClass(v+"-state-down")}).mouseup(function(){u.removeClass(v+"-state-down")}).hover(function(){u.not("."+v+"-state-active").not("."+v+"-state-disabled").addClass(v+"-state-hover")},function(){u.removeClass(v+"-state-hover").removeClass(v+"-state-down")}).appendTo(a);Y(u),o||u.addClass(v+"-corner-left"),o=u}}}),o&&o.addClass(v+"-corner-right")}),a}function s(t){h.find("h2").html(t)}function l(t){h.find("span.fc-button-"+t).addClass(v+"-state-active")}function c(t){h.find("span.fc-button-"+t).removeClass(v+"-state-active")}function u(t){h.find("span.fc-button-"+t).addClass(v+"-state-disabled")}function f(t){h.find("span.fc-button-"+t).removeClass(v+"-state-disabled")}var d=this;d.render=a,d.destroy=o,d.updateTitle=s,d.activateButton=l,d.deactivateButton=c,d.disableButton=u,d.enableButton=f;var v,h=t([])}function o(n,r){function a(t,e){return!E||E>t||e>S}function o(t,e){E=t,S=e,W=[];var n=++R,r=F.length;N=r;for(var a=0;r>a;a++)i(F[a],n)}function i(e,r){s(e,function(a){if(r==R){if(a){n.eventDataTransform&&(a=t.map(a,n.eventDataTransform)),e.eventDataTransform&&(a=t.map(a,e.eventDataTransform));for(var o=0;a.length>o;o++)a[o].source=e,w(a[o]);W=W.concat(a)}N--,N||k(W)}})}function s(r,a){var o,i,l=Ee.sourceFetchers;for(o=0;l.length>o;o++){if(i=l[o](r,E,S,a),i===!0)return;if("object"==typeof i)return s(i,a),e}var c=r.events;if(c)t.isFunction(c)?(m(),c(d(E),d(S),function(t){a(t),y()})):t.isArray(c)?a(c):a();else{var u=r.url;if(u){var f,v=r.success,h=r.error,g=r.complete;f=t.isFunction(r.data)?r.data():r.data;var p=t.extend({},f||{}),w=X(r.startParam,n.startParam),b=X(r.endParam,n.endParam);w&&(p[w]=Math.round(+E/1e3)),b&&(p[b]=Math.round(+S/1e3)),m(),t.ajax(t.extend({},Te,r,{data:p,success:function(e){e=e||[];var n=I(v,this,arguments);t.isArray(n)&&(e=n),a(e)},error:function(){I(h,this,arguments),a()},complete:function(){I(g,this,arguments),y()}}))}else a()}}function l(t){t=c(t),t&&(N++,i(t,R))}function c(n){return t.isFunction(n)||t.isArray(n)?n={events:n}:"string"==typeof n&&(n={url:n}),"object"==typeof n?(b(n),F.push(n),n):e}function u(e){F=t.grep(F,function(t){return!D(t,e)}),W=t.grep(W,function(t){return!D(t.source,e)}),k(W)}function f(t){var e,n,r=W.length,a=x().defaultEventEnd,o=t.start-t._start,i=t.end?t.end-(t._end||a(t)):0;for(e=0;r>e;e++)n=W[e],n._id==t._id&&n!=t&&(n.start=new Date(+n.start+o),n.end=t.end?n.end?new Date(+n.end+i):new Date(+a(n)+i):null,n.title=t.title,n.url=t.url,n.allDay=t.allDay,n.className=t.className,n.editable=t.editable,n.color=t.color,n.backgroundColor=t.backgroundColor,n.borderColor=t.borderColor,n.textColor=t.textColor,w(n));w(t),k(W)}function v(t,e){w(t),t.source||(e&&(H.events.push(t),t.source=H),W.push(t)),k(W)}function h(e){if(e){if(!t.isFunction(e)){var n=e+"";e=function(t){return t._id==n}}W=t.grep(W,e,!0);for(var r=0;F.length>r;r++)t.isArray(F[r].events)&&(F[r].events=t.grep(F[r].events,e,!0))}else{W=[];for(var r=0;F.length>r;r++)t.isArray(F[r].events)&&(F[r].events=[])}k(W)}function g(e){return t.isFunction(e)?t.grep(W,e):e?(e+="",t.grep(W,function(t){return t._id==e})):W}function m(){z++||T("loading",null,!0,x())}function y(){--z||T("loading",null,!1,x())}function w(t){var r=t.source||{},a=X(r.ignoreTimezone,n.ignoreTimezone);t._id=t._id||(t.id===e?"_fc"+xe++:t.id+""),t.date&&(t.start||(t.start=t.date),delete t.date),t._start=d(t.start=p(t.start,a)),t.end=p(t.end,a),t.end&&t.end<=t.start&&(t.end=null),t._end=t.end?d(t.end):null,t.allDay===e&&(t.allDay=X(r.allDayDefault,n.allDayDefault)),t.className?"string"==typeof t.className&&(t.className=t.className.split(/\s+/)):t.className=[]}function b(t){t.className?"string"==typeof t.className&&(t.className=t.className.split(/\s+/)):t.className=[];for(var e=Ee.sourceNormalizers,n=0;e.length>n;n++)e[n](t)}function D(t,e){return t&&e&&C(t)==C(e)}function C(t){return("object"==typeof t?t.events||t.url:"")||t}var M=this;M.isFetchNeeded=a,M.fetchEvents=o,M.addEventSource=l,M.removeEventSource=u,M.updateEvent=f,M.renderEvent=v,M.removeEvents=h,M.clientEvents=g,M.normalizeEvent=w;for(var E,S,T=M.trigger,x=M.getView,k=M.reportEvents,H={events:[]},F=[H],R=0,N=0,z=0,W=[],A=0;r.length>A;A++)c(r[A])}function i(t,e,n){return t.setFullYear(t.getFullYear()+e),n||f(t),t}function s(t,e,n){if(+t){var r=t.getMonth()+e,a=d(t);for(a.setDate(1),a.setMonth(r),t.setMonth(r),n||f(t);t.getMonth()!=a.getMonth();)t.setDate(t.getDate()+(a>t?1:-1))}return t}function l(t,e,n){if(+t){var r=t.getDate()+e,a=d(t);a.setHours(9),a.setDate(r),t.setDate(r),n||f(t),c(t,a)}return t}function c(t,e){if(+t)for(;t.getDate()!=e.getDate();)t.setTime(+t+(e>t?1:-1)*Fe)}function u(t,e){return t.setMinutes(t.getMinutes()+e),t}function f(t){return t.setHours(0),t.setMinutes(0),t.setSeconds(0),t.setMilliseconds(0),t}function d(t,e){return e?f(new Date(+t)):new Date(+t)}function v(){var t,e=0;do t=new Date(1970,e++,1);while(t.getHours());return t}function h(t,e){return Math.round((d(t,!0)-d(e,!0))/He)}function g(t,n,r,a){n!==e&&n!=t.getFullYear()&&(t.setDate(1),t.setMonth(0),t.setFullYear(n)),r!==e&&r!=t.getMonth()&&(t.setDate(1),t.setMonth(r)),a!==e&&t.setDate(a)}function p(t,n){return"object"==typeof t?t:"number"==typeof t?new Date(1e3*t):"string"==typeof t?t.match(/^\d+(\.\d+)?$/)?new Date(1e3*parseFloat(t)):(n===e&&(n=!0),m(t,n)||(t?new Date(t):null)):null}function m(t,e){var n=t.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);if(!n)return null;var r=new Date(n[1],0,1);if(e||!n[13]){var a=new Date(n[1],0,1,9,0);n[3]&&(r.setMonth(n[3]-1),a.setMonth(n[3]-1)),n[5]&&(r.setDate(n[5]),a.setDate(n[5])),c(r,a),n[7]&&r.setHours(n[7]),n[8]&&r.setMinutes(n[8]),n[10]&&r.setSeconds(n[10]),n[12]&&r.setMilliseconds(1e3*Number("0."+n[12])),c(r,a)}else if(r.setUTCFullYear(n[1],n[3]?n[3]-1:0,n[5]||1),r.setUTCHours(n[7]||0,n[8]||0,n[10]||0,n[12]?1e3*Number("0."+n[12]):0),n[14]){var o=60*Number(n[16])+(n[18]?Number(n[18]):0);o*="-"==n[15]?1:-1,r=new Date(+r+1e3*60*o)}return r}function y(t){if("number"==typeof t)return 60*t;if("object"==typeof t)return 60*t.getHours()+t.getMinutes();var e=t.match(/(\d+)(?::(\d+))?\s*(\w+)?/);if(e){var n=parseInt(e[1],10);return e[3]&&(n%=12,"p"==e[3].toLowerCase().charAt(0)&&(n+=12)),60*n+(e[2]?parseInt(e[2],10):0)}}function w(t,e,n){return b(t,null,e,n)}function b(t,e,n,r){r=r||Ce;var a,o,i,s,l=t,c=e,u=n.length,f="";for(a=0;u>a;a++)if(o=n.charAt(a),"'"==o){for(i=a+1;u>i;i++)if("'"==n.charAt(i)){l&&(f+=i==a+1?"'":n.substring(a+1,i),a=i);break}}else if("("==o){for(i=a+1;u>i;i++)if(")"==n.charAt(i)){var d=w(l,n.substring(a+1,i),r);parseInt(d.replace(/\D/,""),10)&&(f+=d),a=i;break}}else if("["==o){for(i=a+1;u>i;i++)if("]"==n.charAt(i)){var v=n.substring(a+1,i),d=w(l,v,r);d!=w(c,v,r)&&(f+=d),a=i;break}}else if("{"==o)l=e,c=t;else if("}"==o)l=t,c=e;else{for(i=u;i>a;i--)if(s=Ne[n.substring(a,i)]){l&&(f+=s(l,r)),a=i-1;break}i==a&&l&&(f+=o)}return f}function D(t){var e,n=new Date(t.getTime());return n.setDate(n.getDate()+4-(n.getDay()||7)),e=n.getTime(),n.setMonth(0),n.setDate(1),Math.floor(Math.round((e-n)/864e5)/7)+1}function C(t){return t.end?M(t.end,t.allDay):l(d(t.start),1)}function M(t,e){return t=d(t),e||t.getHours()||t.getMinutes()?l(t,1):f(t)}function E(n,r,a){n.unbind("mouseover").mouseover(function(n){for(var o,i,s,l=n.target;l!=this;)o=l,l=l.parentNode;(i=o._fci)!==e&&(o._fci=e,s=r[i],a(s.event,s.element,s),t(n.target).trigger(n)),n.stopPropagation()})}function S(e,n,r){for(var a,o=0;e.length>o;o++)a=t(e[o]),a.width(Math.max(0,n-x(a,r)))}function T(e,n,r){for(var a,o=0;e.length>o;o++)a=t(e[o]),a.height(Math.max(0,n-R(a,r)))}function x(t,e){return k(t)+F(t)+(e?H(t):0)}function k(e){return(parseFloat(t.css(e[0],"paddingLeft",!0))||0)+(parseFloat(t.css(e[0],"paddingRight",!0))||0)}function H(e){return(parseFloat(t.css(e[0],"marginLeft",!0))||0)+(parseFloat(t.css(e[0],"marginRight",!0))||0)}function F(e){return(parseFloat(t.css(e[0],"borderLeftWidth",!0))||0)+(parseFloat(t.css(e[0],"borderRightWidth",!0))||0)}function R(t,e){return N(t)+W(t)+(e?z(t):0)}function N(e){return(parseFloat(t.css(e[0],"paddingTop",!0))||0)+(parseFloat(t.css(e[0],"paddingBottom",!0))||0)}function z(e){return(parseFloat(t.css(e[0],"marginTop",!0))||0)+(parseFloat(t.css(e[0],"marginBottom",!0))||0)}function W(e){return(parseFloat(t.css(e[0],"borderTopWidth",!0))||0)+(parseFloat(t.css(e[0],"borderBottomWidth",!0))||0)}function A(){}function O(t,e){return t-e}function L(t){return Math.max.apply(Math,t)}function _(t){return(10>t?"0":"")+t}function P(t,n){if(t[n]!==e)return t[n];for(var r,a=n.split(/(?=[A-Z])/),o=a.length-1;o>=0;o--)if(r=t[a[o].toLowerCase()],r!==e)return r;return t[""]}function q(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function Y(t){t.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return!1})}function B(t){t.children().removeClass("fc-first fc-last").filter(":first-child").addClass("fc-first").end().filter(":last-child").addClass("fc-last")}function j(t,e){var n=t.source||{},r=t.color,a=n.color,o=e("eventColor"),i=t.backgroundColor||r||n.backgroundColor||a||e("eventBackgroundColor")||o,s=t.borderColor||r||n.borderColor||a||e("eventBorderColor")||o,l=t.textColor||n.textColor||e("eventTextColor"),c=[];return i&&c.push("background-color:"+i),s&&c.push("border-color:"+s),l&&c.push("color:"+l),c.join(";")}function I(e,n,r){if(t.isFunction(e)&&(e=[e]),e){var a,o;for(a=0;e.length>a;a++)o=e[a].apply(n,r)||o;return o}}function X(){for(var t=0;arguments.length>t;t++)if(arguments[t]!==e)return arguments[t]}function J(t,e){function n(t,e){e&&(s(t,e),t.setDate(1));var n=a("firstDay"),f=d(t,!0);f.setDate(1);var v=s(d(f),1),g=d(f);l(g,-((g.getDay()-n+7)%7)),i(g);var p=d(v);l(p,(7-p.getDay()+n)%7),i(p,-1,!0);var m=c(),y=Math.round(h(p,g)/7);"fixed"==a("weekMode")&&(l(p,7*(6-y)),y=6),r.title=u(f,a("titleFormat")),r.start=f,r.end=v,r.visStart=g,r.visEnd=p,o(y,m,!0)}var r=this;r.render=n,Z.call(r,t,e,"month");var a=r.opt,o=r.renderBasic,i=r.skipHiddenDays,c=r.getCellsPerWeek,u=e.formatDate}function V(t,e){function n(t,e){e&&l(t,7*e);var n=l(d(t),-((t.getDay()-a("firstDay")+7)%7)),u=l(d(n),7),f=d(n);i(f);var v=d(u);i(v,-1,!0);var h=s();r.start=n,r.end=u,r.visStart=f,r.visEnd=v,r.title=c(f,l(d(v),-1),a("titleFormat")),o(1,h,!1)}var r=this;r.render=n,Z.call(r,t,e,"basicWeek");var a=r.opt,o=r.renderBasic,i=r.skipHiddenDays,s=r.getCellsPerWeek,c=e.formatDates}function U(t,e){function n(t,e){e&&l(t,e),i(t,0>e?-1:1);var n=d(t,!0),c=l(d(n),1);r.title=s(t,a("titleFormat")),r.start=r.visStart=n,r.end=r.visEnd=c,o(1,1,!1)}var r=this;r.render=n,Z.call(r,t,e,"basicDay");var a=r.opt,o=r.renderBasic,i=r.skipHiddenDays,s=e.formatDate}function Z(e,n,r){function a(t,e,n){ee=t,ne=e,re=n,o(),j||i(),s()}function o(){le=he("theme")?"ui":"fc",ce=he("columnFormat"),ue=he("weekNumbers"),de=he("weekNumberTitle"),ve="iso"!=he("weekNumberCalculation")?"w":"W"}function i(){Z=t("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(e)}function s(){var n=c();L&&L.remove(),L=t(n).appendTo(e),_=L.find("thead"),P=_.find(".fc-day-header"),j=L.find("tbody"),I=j.find("tr"),X=j.find(".fc-day"),J=I.find("td:first-child"),V=I.eq(0).find(".fc-day > div"),U=I.eq(0).find(".fc-day-content > div"),B(_.add(_.find("tr"))),B(I),I.eq(0).addClass("fc-first"),I.filter(":last").addClass("fc-last"),X.each(function(e,n){var r=Ee(Math.floor(e/ne),e%ne);ge("dayRender",O,r,t(n))}),y(X)}function c(){var t="<table class='fc-border-separate' style='width:100%' cellspacing='0'>"+u()+v()+"</table>";return t}function u(){var t,e,n=le+"-widget-header",r="";for(r+="<thead><tr>",ue&&(r+="<th class='fc-week-number "+n+"'>"+q(de)+"</th>"),t=0;ne>t;t++)e=Ee(0,t),r+="<th class='fc-day-header fc-"+ke[e.getDay()]+" "+n+"'>"+q(xe(e,ce))+"</th>";return r+="</tr></thead>"}function v(){var t,e,n,r=le+"-widget-content",a="";for(a+="<tbody>",t=0;ee>t;t++){for(a+="<tr class='fc-week'>",ue&&(n=Ee(t,0),a+="<td class='fc-week-number "+r+"'>"+"<div>"+q(xe(n,ve))+"</div>"+"</td>"),e=0;ne>e;e++)n=Ee(t,e),a+=h(n);a+="</tr>"}return a+="</tbody>"}function h(t){var e=le+"-widget-content",n=O.start.getMonth(),r=f(new Date),a="",o=["fc-day","fc-"+ke[t.getDay()],e];return t.getMonth()!=n&&o.push("fc-other-month"),+t==+r?o.push("fc-today",le+"-state-highlight"):r>t?o.push("fc-past"):o.push("fc-future"),a+="<td class='"+o.join(" ")+"'"+" data-date='"+xe(t,"yyyy-MM-dd")+"'"+">"+"<div>",re&&(a+="<div class='fc-day-number'>"+t.getDate()+"</div>"),a+="<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>"}function g(e){Q=e;var n,r,a,o=Q-_.height();"variable"==he("weekMode")?n=r=Math.floor(o/(1==ee?2:6)):(n=Math.floor(o/ee),r=o-n*(ee-1)),J.each(function(e,o){ee>e&&(a=t(o),a.find("> div").css("min-height",(e==ee-1?r:n)-R(a)))})}function p(t){$=t,ie.clear(),se.clear(),te=0,ue&&(te=_.find("th.fc-week-number").outerWidth()),K=Math.floor(($-te)/ne),S(P.slice(0,-1),K)}function y(t){t.click(w).mousedown(Me)}function w(e){if(!he("selectable")){var n=m(t(this).data("date"));ge("dayClick",this,n,!0,e)}}function b(t,e,n){n&&ae.build();for(var r=Te(t,e),a=0;r.length>a;a++){var o=r[a];y(D(o.row,o.leftCol,o.row,o.rightCol))}}function D(t,n,r,a){var o=ae.rect(t,n,r,a,e);return be(o,e)}function C(t){return d(t)}function M(t,e){b(t,l(d(e),1),!0)}function E(){Ce()}function T(t,e,n){var r=Se(t),a=X[r.row*ne+r.col];ge("dayClick",a,t,e,n)}function x(t,e){oe.start(function(t){Ce(),t&&D(t.row,t.col,t.row,t.col)},e)}function k(t,e,n){var r=oe.stop();if(Ce(),r){var a=Ee(r);ge("drop",t,a,!0,e,n)}}function H(t){return d(t.start)}function F(t){return ie.left(t)}function N(t){return ie.right(t)}function z(t){return se.left(t)}function W(t){return se.right(t)}function A(t){return I.eq(t)}var O=this;O.renderBasic=a,O.setHeight=g,O.setWidth=p,O.renderDayOverlay=b,O.defaultSelectionEnd=C,O.renderSelection=M,O.clearSelection=E,O.reportDayClick=T,O.dragStart=x,O.dragStop=k,O.defaultEventEnd=H,O.getHoverListener=function(){return oe},O.colLeft=F,O.colRight=N,O.colContentLeft=z,O.colContentRight=W,O.getIsCellAllDay=function(){return!0},O.allDayRow=A,O.getRowCnt=function(){return ee},O.getColCnt=function(){return ne},O.getColWidth=function(){return K},O.getDaySegmentContainer=function(){return Z},fe.call(O,e,n,r),me.call(O),pe.call(O),G.call(O);var L,_,P,j,I,X,J,V,U,Z,$,Q,K,te,ee,ne,re,ae,oe,ie,se,le,ce,ue,de,ve,he=O.opt,ge=O.trigger,be=O.renderOverlay,Ce=O.clearOverlays,Me=O.daySelectionMousedown,Ee=O.cellToDate,Se=O.dateToCell,Te=O.rangeToSegments,xe=n.formatDate;Y(e.addClass("fc-grid")),ae=new ye(function(e,n){var r,a,o;P.each(function(e,i){r=t(i),a=r.offset().left,e&&(o[1]=a),o=[a],n[e]=o}),o[1]=a+r.outerWidth(),I.each(function(n,i){ee>n&&(r=t(i),a=r.offset().top,n&&(o[1]=a),o=[a],e[n]=o)}),o[1]=a+r.outerHeight()}),oe=new we(ae),ie=new De(function(t){return V.eq(t)}),se=new De(function(t){return U.eq(t)})}function G(){function t(t,e){n.renderDayEvents(t,e)}function e(){n.getDaySegmentContainer().empty()}var n=this;n.renderEvents=t,n.clearEvents=e,de.call(n)}function $(t,e){function n(t,e){e&&l(t,7*e);var n=l(d(t),-((t.getDay()-a("firstDay")+7)%7)),u=l(d(n),7),f=d(n);i(f);var v=d(u);i(v,-1,!0);var h=s();r.title=c(f,l(d(v),-1),a("titleFormat")),r.start=n,r.end=u,r.visStart=f,r.visEnd=v,o(h)}var r=this;r.render=n,K.call(r,t,e,"agendaWeek");var a=r.opt,o=r.renderAgenda,i=r.skipHiddenDays,s=r.getCellsPerWeek,c=e.formatDates}function Q(t,e){function n(t,e){e&&l(t,e),i(t,0>e?-1:1);var n=d(t,!0),c=l(d(n),1);r.title=s(t,a("titleFormat")),r.start=r.visStart=n,r.end=r.visEnd=c,o(1)}var r=this;r.render=n,K.call(r,t,e,"agendaDay");var a=r.opt,o=r.renderAgenda,i=r.skipHiddenDays,s=e.formatDate}function K(n,r,a){function o(t){We=t,i(),K?c():s()}function i(){qe=Ue("theme")?"ui":"fc",Ye=Ue("isRTL"),Be=y(Ue("minTime")),je=y(Ue("maxTime")),Ie=Ue("columnFormat"),Xe=Ue("weekNumbers"),Je=Ue("weekNumberTitle"),Ve="iso"!=Ue("weekNumberCalculation")?"w":"W",Re=Ue("snapMinutes")||Ue("slotMinutes")}function s(){var e,r,a,o,i,s=qe+"-widget-header",l=qe+"-widget-content",f=0==Ue("slotMinutes")%15;for(c(),ce=t("<div style='position:absolute;z-index:2;left:0;width:100%'/>").appendTo(n),Ue("allDaySlot")?(ue=t("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(ce),e="<table style='width:100%' class='fc-agenda-allday' cellspacing='0'><tr><th class='"+s+" fc-agenda-axis'>"+Ue("allDayText")+"</th>"+"<td>"+"<div class='fc-day-content'><div style='position:relative'/></div>"+"</td>"+"<th class='"+s+" fc-agenda-gutter'>&nbsp;</th>"+"</tr>"+"</table>",de=t(e).appendTo(ce),ve=de.find("tr"),C(ve.find("td")),ce.append("<div class='fc-agenda-divider "+s+"'>"+"<div class='fc-agenda-divider-inner'/>"+"</div>")):ue=t([]),he=t("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>").appendTo(ce),ge=t("<div style='position:relative;width:100%;overflow:hidden'/>").appendTo(he),be=t("<div class='fc-event-container' style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(ge),e="<table class='fc-agenda-slots' style='width:100%' cellspacing='0'><tbody>",r=v(),o=u(d(r),je),u(r,Be),Ae=0,a=0;o>r;a++)i=r.getMinutes(),e+="<tr class='fc-slot"+a+" "+(i?"fc-minor":"")+"'>"+"<th class='fc-agenda-axis "+s+"'>"+(f&&i?"&nbsp;":on(r,Ue("axisFormat")))+"</th>"+"<td class='"+l+"'>"+"<div style='position:relative'>&nbsp;</div>"+"</td>"+"</tr>",u(r,Ue("slotMinutes")),Ae++;e+="</tbody></table>",Ce=t(e).appendTo(ge),M(Ce.find("td"))}function c(){var e=h();K&&K.remove(),K=t(e).appendTo(n),ee=K.find("thead"),ne=ee.find("th").slice(1,-1),re=K.find("tbody"),ae=re.find("td").slice(0,-1),oe=ae.find("> div"),ie=ae.find(".fc-day-content > div"),se=ae.eq(0),le=oe.eq(0),B(ee.add(ee.find("tr"))),B(re.add(re.find("tr")))}function h(){var t="<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>"+g()+p()+"</table>";return t}function g(){var t,e,n,r=qe+"-widget-header",a="";for(a+="<thead><tr>",Xe?(t=nn(0,0),e=on(t,Ve),Ye?e+=Je:e=Je+e,a+="<th class='fc-agenda-axis fc-week-number "+r+"'>"+q(e)+"</th>"):a+="<th class='fc-agenda-axis "+r+"'>&nbsp;</th>",n=0;We>n;n++)t=nn(0,n),a+="<th class='fc-"+ke[t.getDay()]+" fc-col"+n+" "+r+"'>"+q(on(t,Ie))+"</th>";return a+="<th class='fc-agenda-gutter "+r+"'>&nbsp;</th>"+"</tr>"+"</thead>"}function p(){var t,e,n,r,a,o=qe+"-widget-header",i=qe+"-widget-content",s=f(new Date),l="";for(l+="<tbody><tr><th class='fc-agenda-axis "+o+"'>&nbsp;</th>",n="",e=0;We>e;e++)t=nn(0,e),a=["fc-col"+e,"fc-"+ke[t.getDay()],i],+t==+s?a.push(qe+"-state-highlight","fc-today"):s>t?a.push("fc-past"):a.push("fc-future"),r="<td class='"+a.join(" ")+"'>"+"<div>"+"<div class='fc-day-content'>"+"<div style='position:relative'>&nbsp;</div>"+"</div>"+"</div>"+"</td>",n+=r;return l+=n,l+="<td class='fc-agenda-gutter "+i+"'>&nbsp;</td>"+"</tr>"+"</tbody>"}function m(t){t===e&&(t=Se),Se=t,sn={};var n=re.position().top,r=he.position().top,a=Math.min(t-n,Ce.height()+r+1);le.height(a-R(se)),ce.css("top",n),he.height(a-r-1),Fe=Ce.find("tr:first").height()+1,Ne=Ue("slotMinutes")/Re,ze=Fe/Ne}function w(e){Ee=e,_e.clear(),Pe.clear();var n=ee.find("th:first");de&&(n=n.add(de.find("th:first"))),n=n.add(Ce.find("th:first")),Te=0,S(n.width("").each(function(e,n){Te=Math.max(Te,t(n).outerWidth())}),Te);var r=K.find(".fc-agenda-gutter");de&&(r=r.add(de.find("th.fc-agenda-gutter")));var a=he[0].clientWidth;He=he.width()-a,He?(S(r,He),r.show().prev().removeClass("fc-last")):r.hide().prev().addClass("fc-last"),xe=Math.floor((a-Te)/We),S(ne.slice(0,-1),xe)}function b(){function t(){he.scrollTop(r)}var e=v(),n=d(e);n.setHours(Ue("firstHour"));var r=_(e,n)+1;t(),setTimeout(t,0)}function D(){b()}function C(t){t.click(E).mousedown(tn)}function M(t){t.click(E).mousedown(U)}function E(t){if(!Ue("selectable")){var e=Math.min(We-1,Math.floor((t.pageX-K.offset().left-Te)/xe)),n=nn(0,e),r=this.parentNode.className.match(/fc-slot(\d+)/);if(r){var a=parseInt(r[1])*Ue("slotMinutes"),o=Math.floor(a/60);n.setHours(o),n.setMinutes(a%60+Be),Ze("dayClick",ae[e],n,!1,t)}else Ze("dayClick",ae[e],n,!0,t)}}function x(t,e,n){n&&Oe.build();for(var r=an(t,e),a=0;r.length>a;a++){var o=r[a];C(k(o.row,o.leftCol,o.row,o.rightCol))}}function k(t,e,n,r){var a=Oe.rect(t,e,n,r,ce);return Ge(a,ce)}function H(t,e){for(var n=0;We>n;n++){var r=nn(0,n),a=l(d(r),1),o=new Date(Math.max(r,t)),i=new Date(Math.min(a,e));if(i>o){var s=Oe.rect(0,n,0,n,ge),c=_(r,o),u=_(r,i);s.top=c,s.height=u-c,M(Ge(s,ge))}}}function F(t){return _e.left(t)}function N(t){return Pe.left(t)}function z(t){return _e.right(t)}function W(t){return Pe.right(t)}function A(t){return Ue("allDaySlot")&&!t.row}function L(t){var e=nn(0,t.col),n=t.row;return Ue("allDaySlot")&&n--,n>=0&&u(e,Be+n*Re),e}function _(t,n){if(t=d(t,!0),u(d(t),Be)>n)return 0;if(n>=u(d(t),je))return Ce.height();var r=Ue("slotMinutes"),a=60*n.getHours()+n.getMinutes()-Be,o=Math.floor(a/r),i=sn[o];return i===e&&(i=sn[o]=Ce.find("tr").eq(o).find("td div")[0].offsetTop),Math.max(0,Math.round(i-1+Fe*(a%r/r)))}function P(){return ve}function j(t){var e=d(t.start);return t.allDay?e:u(e,Ue("defaultEventMinutes"))}function I(t,e){return e?d(t):u(d(t),Ue("slotMinutes"))}function X(t,e,n){n?Ue("allDaySlot")&&x(t,l(d(e),1),!0):J(t,e)}function J(e,n){var r=Ue("selectHelper");if(Oe.build(),r){var a=rn(e).col;if(a>=0&&We>a){var o=Oe.rect(0,a,0,a,ge),i=_(e,e),s=_(e,n);if(s>i){if(o.top=i,o.height=s-i,o.left+=2,o.width-=5,t.isFunction(r)){var l=r(e,n);l&&(o.position="absolute",Me=t(l).css(o).appendTo(ge))}else o.isStart=!0,o.isEnd=!0,Me=t(en({title:"",start:e,end:n,className:["fc-select-helper"],editable:!1},o)),Me.css("opacity",Ue("dragOpacity"));Me&&(M(Me),ge.append(Me),S(Me,o.width,!0),T(Me,o.height,!0))}}}else H(e,n)}function V(){$e(),Me&&(Me.remove(),Me=null)}function U(e){if(1==e.which&&Ue("selectable")){Ke(e);var n;Le.start(function(t,e){if(V(),t&&t.col==e.col&&!A(t)){var r=L(e),a=L(t);n=[r,u(d(r),Re),a,u(d(a),Re)].sort(O),J(n[0],n[3])}else n=null},e),t(document).one("mouseup",function(t){Le.stop(),n&&(+n[0]==+n[1]&&Z(n[0],!1,t),Qe(n[0],n[3],!1,t))})}}function Z(t,e,n){Ze("dayClick",ae[rn(t).col],t,e,n)}function G(t,e){Le.start(function(t){if($e(),t)if(A(t))k(t.row,t.col,t.row,t.col);else{var e=L(t),n=u(d(e),Ue("defaultEventMinutes"));H(e,n)}},e)}function $(t,e,n){var r=Le.stop();$e(),r&&Ze("drop",t,L(r),A(r),e,n)}var Q=this;Q.renderAgenda=o,Q.setWidth=w,Q.setHeight=m,Q.afterRender=D,Q.defaultEventEnd=j,Q.timePosition=_,Q.getIsCellAllDay=A,Q.allDayRow=P,Q.getCoordinateGrid=function(){return Oe},Q.getHoverListener=function(){return Le},Q.colLeft=F,Q.colRight=z,Q.colContentLeft=N,Q.colContentRight=W,Q.getDaySegmentContainer=function(){return ue},Q.getSlotSegmentContainer=function(){return be},Q.getMinMinute=function(){return Be},Q.getMaxMinute=function(){return je},Q.getSlotContainer=function(){return ge},Q.getRowCnt=function(){return 1},Q.getColCnt=function(){return We},Q.getColWidth=function(){return xe},Q.getSnapHeight=function(){return ze},Q.getSnapMinutes=function(){return Re},Q.defaultSelectionEnd=I,Q.renderDayOverlay=x,Q.renderSelection=X,Q.clearSelection=V,Q.reportDayClick=Z,Q.dragStart=G,Q.dragStop=$,fe.call(Q,n,r,a),me.call(Q),pe.call(Q),te.call(Q);var K,ee,ne,re,ae,oe,ie,se,le,ce,ue,de,ve,he,ge,be,Ce,Me,Ee,Se,Te,xe,He,Fe,Re,Ne,ze,We,Ae,Oe,Le,_e,Pe,qe,Ye,Be,je,Ie,Xe,Je,Ve,Ue=Q.opt,Ze=Q.trigger,Ge=Q.renderOverlay,$e=Q.clearOverlays,Qe=Q.reportSelection,Ke=Q.unselect,tn=Q.daySelectionMousedown,en=Q.slotSegHtml,nn=Q.cellToDate,rn=Q.dateToCell,an=Q.rangeToSegments,on=r.formatDate,sn={};Y(n.addClass("fc-agenda")),Oe=new ye(function(e,n){function r(t){return Math.max(l,Math.min(c,t))}var a,o,i;ne.each(function(e,r){a=t(r),o=a.offset().left,e&&(i[1]=o),i=[o],n[e]=i}),i[1]=o+a.outerWidth(),Ue("allDaySlot")&&(a=ve,o=a.offset().top,e[0]=[o,o+a.outerHeight()]);for(var s=ge.offset().top,l=he.offset().top,c=l+he.outerHeight(),u=0;Ae*Ne>u;u++)e.push([r(s+ze*u),r(s+ze*(u+1))])}),Le=new we(Oe),_e=new De(function(t){return oe.eq(t)}),Pe=new De(function(t){return ie.eq(t)})}function te(){function n(t,e){var n,r=t.length,o=[],i=[];for(n=0;r>n;n++)t[n].allDay?o.push(t[n]):i.push(t[n]);y("allDaySlot")&&(te(o,e),k()),s(a(i),e)}function r(){H().empty(),F().empty()}function a(e){var n,r,a,s,l,c=Y(),f=W(),v=z(),h=t.map(e,i),g=[];for(r=0;c>r;r++)for(n=P(0,r),u(n,f),l=o(e,h,n,u(d(n),v-f)),l=ee(l),a=0;l.length>a;a++)s=l[a],s.col=r,g.push(s);return g}function o(t,e,n,r){var a,o,i,s,l,c,u,f,v=[],h=t.length;for(a=0;h>a;a++)o=t[a],i=o.start,s=e[a],s>n&&r>i&&(n>i?(l=d(n),u=!1):(l=i,u=!0),s>r?(c=d(r),f=!1):(c=s,f=!0),v.push({event:o,start:l,end:c,isStart:u,isEnd:f}));return v.sort(ue)}function i(t){return t.end?d(t.end):u(d(t.start),y("defaultEventMinutes"))}function s(n,r){var a,o,i,s,l,u,d,v,h,g,p,m,b,D,C,M,S=n.length,T="",k=F(),H=y("isRTL");for(a=0;S>a;a++)o=n[a],i=o.event,s=A(o.start,o.start),l=A(o.start,o.end),u=L(o.col),d=_(o.col),v=d-u,d-=.025*v,v=d-u,h=v*(o.forwardCoord-o.backwardCoord),y("slotEventOverlap")&&(h=Math.max(2*(h-10),h)),H?(p=d-o.backwardCoord*v,g=p-h):(g=u+o.backwardCoord*v,p=g+h),g=Math.max(g,u),p=Math.min(p,d),h=p-g,o.top=s,o.left=g,o.outerWidth=h,o.outerHeight=l-s,T+=c(i,o);for(k[0].innerHTML=T,m=k.children(),a=0;S>a;a++)o=n[a],i=o.event,b=t(m[a]),D=w("eventRender",i,i,b),D===!1?b.remove():(D&&D!==!0&&(b.remove(),b=t(D).css({position:"absolute",top:o.top,left:o.left}).appendTo(k)),o.element=b,i._id===r?f(i,b,o):b[0]._fci=a,V(i,b));for(E(k,n,f),a=0;S>a;a++)o=n[a],(b=o.element)&&(o.vsides=R(b,!0),o.hsides=x(b,!0),C=b.find(".fc-event-title"),C.length&&(o.contentTop=C[0].offsetTop));for(a=0;S>a;a++)o=n[a],(b=o.element)&&(b[0].style.width=Math.max(0,o.outerWidth-o.hsides)+"px",M=Math.max(0,o.outerHeight-o.vsides),b[0].style.height=M+"px",i=o.event,o.contentTop!==e&&10>M-o.contentTop&&(b.find("div.fc-event-time").text(re(i.start,y("timeFormat"))+" - "+i.title),b.find("div.fc-event-title").remove()),w("eventAfterRender",i,i,b))}function c(t,e){var n="<",r=t.url,a=j(t,y),o=["fc-event","fc-event-vert"];return b(t)&&o.push("fc-event-draggable"),e.isStart&&o.push("fc-event-start"),e.isEnd&&o.push("fc-event-end"),o=o.concat(t.className),t.source&&(o=o.concat(t.source.className||[])),n+=r?"a href='"+q(t.url)+"'":"div",n+=" class='"+o.join(" ")+"'"+" style="+"'"+"position:absolute;"+"top:"+e.top+"px;"+"left:"+e.left+"px;"+a+"'"+">"+"<div class='fc-event-inner'>"+"<div class='fc-event-time'>"+q(ae(t.start,t.end,y("timeFormat")))+"</div>"+"<div class='fc-event-title'>"+q(t.title||"")+"</div>"+"</div>"+"<div class='fc-event-bg'></div>",e.isEnd&&D(t)&&(n+="<div class='ui-resizable-handle ui-resizable-s'>=</div>"),n+="</"+(r?"a":"div")+">"}function f(t,e,n){var r=e.find("div.fc-event-time");b(t)&&g(t,e,r),n.isEnd&&D(t)&&p(t,e,r),S(t,e)}function v(t,e,n){function r(){c||(e.width(a).height("").draggable("option","grid",null),c=!0)}var a,o,i,s=n.isStart,c=!0,u=N(),f=B(),v=I(),g=X(),p=W();e.draggable({opacity:y("dragOpacity","month"),revertDuration:y("dragRevertDuration"),start:function(n,p){w("eventDragStart",e,t,n,p),Z(t,e),a=e.width(),u.start(function(n,a){if(K(),n){o=!1;var u=P(0,a.col),p=P(0,n.col);i=h(p,u),n.row?s?c&&(e.width(f-10),T(e,v*Math.round((t.end?(t.end-t.start)/Re:y("defaultEventMinutes"))/g)),e.draggable("option","grid",[f,1]),c=!1):o=!0:(Q(l(d(t.start),i),l(C(t),i)),r()),o=o||c&&!i
}else r(),o=!0;e.draggable("option","revert",o)},n,"drag")},stop:function(n,a){if(u.stop(),K(),w("eventDragStop",e,t,n,a),o)r(),e.css("filter",""),U(t,e);else{var s=0;c||(s=Math.round((e.offset().top-J().offset().top)/v)*g+p-(60*t.start.getHours()+t.start.getMinutes())),G(this,t,i,s,c,n,a)}}})}function g(t,e,n){function r(){K(),s&&(f?(n.hide(),e.draggable("option","grid",null),Q(l(d(t.start),b),l(C(t),b))):(a(D),n.css("display",""),e.draggable("option","grid",[T,x])))}function a(e){var r,a=u(d(t.start),e);t.end&&(r=u(d(t.end),e)),n.text(ae(a,r,y("timeFormat")))}var o,i,s,c,f,v,g,p,b,D,M,E=m.getCoordinateGrid(),S=Y(),T=B(),x=I(),k=X();e.draggable({scroll:!1,grid:[T,x],axis:1==S?"y":!1,opacity:y("dragOpacity"),revertDuration:y("dragRevertDuration"),start:function(n,r){w("eventDragStart",e,t,n,r),Z(t,e),E.build(),o=e.position(),i=E.cell(n.pageX,n.pageY),s=c=!0,f=v=O(i),g=p=0,b=0,D=M=0},drag:function(t,n){var a=E.cell(t.pageX,t.pageY);if(s=!!a){if(f=O(a),g=Math.round((n.position.left-o.left)/T),g!=p){var l=P(0,i.col),u=i.col+g;u=Math.max(0,u),u=Math.min(S-1,u);var d=P(0,u);b=h(d,l)}f||(D=Math.round((n.position.top-o.top)/x)*k)}(s!=c||f!=v||g!=p||D!=M)&&(r(),c=s,v=f,p=g,M=D),e.draggable("option","revert",!s)},stop:function(n,a){K(),w("eventDragStop",e,t,n,a),s&&(f||b||D)?G(this,t,b,f?0:D,f,n,a):(s=!0,f=!1,g=0,b=0,D=0,r(),e.css("filter",""),e.css(o),U(t,e))}})}function p(t,e,n){var r,a,o=I(),i=X();e.resizable({handles:{s:".ui-resizable-handle"},grid:o,start:function(n,o){r=a=0,Z(t,e),w("eventResizeStart",this,t,n,o)},resize:function(s,l){r=Math.round((Math.max(o,e.height())-l.originalSize.height)/o),r!=a&&(n.text(ae(t.start,r||t.end?u(M(t),i*r):null,y("timeFormat"))),a=r)},stop:function(n,a){w("eventResizeStop",this,t,n,a),r?$(this,t,0,i*r,n,a):U(t,e)}})}var m=this;m.renderEvents=n,m.clearEvents=r,m.slotSegHtml=c,de.call(m);var y=m.opt,w=m.trigger,b=m.isEventDraggable,D=m.isEventResizable,M=m.eventEnd,S=m.eventElementHandlers,k=m.setHeight,H=m.getDaySegmentContainer,F=m.getSlotSegmentContainer,N=m.getHoverListener,z=m.getMaxMinute,W=m.getMinMinute,A=m.timePosition,O=m.getIsCellAllDay,L=m.colContentLeft,_=m.colContentRight,P=m.cellToDate,Y=m.getColCnt,B=m.getColWidth,I=m.getSnapHeight,X=m.getSnapMinutes,J=m.getSlotContainer,V=m.reportEventElement,U=m.showEvents,Z=m.hideEvents,G=m.eventDrop,$=m.eventResize,Q=m.renderDayOverlay,K=m.clearOverlays,te=m.renderDayEvents,ne=m.calendar,re=ne.formatDate,ae=ne.formatDates;m.draggableDayEvent=v}function ee(t){var e,n=ne(t),r=n[0];if(re(n),r){for(e=0;r.length>e;e++)ae(r[e]);for(e=0;r.length>e;e++)oe(r[e],0,0)}return ie(n)}function ne(t){var e,n,r,a=[];for(e=0;t.length>e;e++){for(n=t[e],r=0;a.length>r&&se(n,a[r]).length;r++);(a[r]||(a[r]=[])).push(n)}return a}function re(t){var e,n,r,a,o;for(e=0;t.length>e;e++)for(n=t[e],r=0;n.length>r;r++)for(a=n[r],a.forwardSegs=[],o=e+1;t.length>o;o++)se(a,t[o],a.forwardSegs)}function ae(t){var n,r,a=t.forwardSegs,o=0;if(t.forwardPressure===e){for(n=0;a.length>n;n++)r=a[n],ae(r),o=Math.max(o,1+r.forwardPressure);t.forwardPressure=o}}function oe(t,n,r){var a,o=t.forwardSegs;if(t.forwardCoord===e)for(o.length?(o.sort(ce),oe(o[0],n+1,r),t.forwardCoord=o[0].backwardCoord):t.forwardCoord=1,t.backwardCoord=t.forwardCoord-(t.forwardCoord-r)/(n+1),a=0;o.length>a;a++)oe(o[a],0,t.forwardCoord)}function ie(t){var e,n,r,a=[];for(e=0;t.length>e;e++)for(n=t[e],r=0;n.length>r;r++)a.push(n[r]);return a}function se(t,e,n){n=n||[];for(var r=0;e.length>r;r++)le(t,e[r])&&n.push(e[r]);return n}function le(t,e){return t.end>e.start&&t.start<e.end}function ce(t,e){return e.forwardPressure-t.forwardPressure||(t.backwardCoord||0)-(e.backwardCoord||0)||ue(t,e)}function ue(t,e){return t.start-e.start||e.end-e.start-(t.end-t.start)||(t.event.title||"").localeCompare(e.event.title)}function fe(n,r,a){function o(e,n){var r=V[e];return t.isPlainObject(r)?P(r,n||a):r}function i(t,e){return r.trigger.apply(r,[t,e||_].concat(Array.prototype.slice.call(arguments,2),[_]))}function s(t){var e=t.source||{};return X(t.startEditable,e.startEditable,o("eventStartEditable"),t.editable,e.editable,o("editable"))&&!o("disableDragging")}function c(t){var e=t.source||{};return X(t.durationEditable,e.durationEditable,o("eventDurationEditable"),t.editable,e.editable,o("editable"))&&!o("disableResizing")}function f(t){j={};var e,n,r=t.length;for(e=0;r>e;e++)n=t[e],j[n._id]?j[n._id].push(n):j[n._id]=[n]}function v(){j={},I={},J=[]}function g(t){return t.end?d(t.end):q(t)}function p(t,e){J.push({event:t,element:e}),I[t._id]?I[t._id].push(e):I[t._id]=[e]}function m(){t.each(J,function(t,e){_.trigger("eventDestroy",e.event,e.event,e.element)})}function y(t,n){n.click(function(r){return n.hasClass("ui-draggable-dragging")||n.hasClass("ui-resizable-resizing")?e:i("eventClick",this,t,r)}).hover(function(e){i("eventMouseover",this,t,e)},function(e){i("eventMouseout",this,t,e)})}function w(t,e){D(t,e,"show")}function b(t,e){D(t,e,"hide")}function D(t,e,n){var r,a=I[t._id],o=a.length;for(r=0;o>r;r++)e&&a[r][0]==e[0]||a[r][n]()}function C(t,e,n,r,a,o,s){var l=e.allDay,c=e._id;E(j[c],n,r,a),i("eventDrop",t,e,n,r,a,function(){E(j[c],-n,-r,l),B(c)},o,s),B(c)}function M(t,e,n,r,a,o){var s=e._id;S(j[s],n,r),i("eventResize",t,e,n,r,function(){S(j[s],-n,-r),B(s)},a,o),B(s)}function E(t,n,r,a){r=r||0;for(var o,i=t.length,s=0;i>s;s++)o=t[s],a!==e&&(o.allDay=a),u(l(o.start,n,!0),r),o.end&&(o.end=u(l(o.end,n,!0),r)),Y(o,V)}function S(t,e,n){n=n||0;for(var r,a=t.length,o=0;a>o;o++)r=t[o],r.end=u(l(g(r),e,!0),n),Y(r,V)}function T(t){return"object"==typeof t&&(t=t.getDay()),G[t]}function x(){return U}function k(t,e,n){for(e=e||1;G[(t.getDay()+(n?e:0)+7)%7];)l(t,e)}function H(){var t=F.apply(null,arguments),e=R(t),n=N(e);return n}function F(t,e){var n=_.getColCnt(),r=K?-1:1,a=K?n-1:0;"object"==typeof t&&(e=t.col,t=t.row);var o=t*n+(e*r+a);return o}function R(t){var e=_.visStart.getDay();return t+=$[e],7*Math.floor(t/U)+Q[(t%U+U)%U]-e}function N(t){var e=d(_.visStart);return l(e,t),e}function z(t){var e=W(t),n=A(e),r=O(n);return r}function W(t){return h(t,_.visStart)}function A(t){var e=_.visStart.getDay();return t+=e,Math.floor(t/7)*U+$[(t%7+7)%7]-$[e]}function O(t){var e=_.getColCnt(),n=K?-1:1,r=K?e-1:0,a=Math.floor(t/e),o=(t%e+e)%e*n+r;return{row:a,col:o}}function L(t,e){for(var n=_.getRowCnt(),r=_.getColCnt(),a=[],o=W(t),i=W(e),s=A(o),l=A(i)-1,c=0;n>c;c++){var u=c*r,f=u+r-1,d=Math.max(s,u),v=Math.min(l,f);if(v>=d){var h=O(d),g=O(v),p=[h.col,g.col].sort(),m=R(d)==o,y=R(v)+1==i;a.push({row:c,leftCol:p[0],rightCol:p[1],isStart:m,isEnd:y})}}return a}var _=this;_.element=n,_.calendar=r,_.name=a,_.opt=o,_.trigger=i,_.isEventDraggable=s,_.isEventResizable=c,_.setEventData=f,_.clearEventData=v,_.eventEnd=g,_.reportEventElement=p,_.triggerEventDestroy=m,_.eventElementHandlers=y,_.showEvents=w,_.hideEvents=b,_.eventDrop=C,_.eventResize=M;var q=_.defaultEventEnd,Y=r.normalizeEvent,B=r.reportEventChange,j={},I={},J=[],V=r.options;_.isHiddenDay=T,_.skipHiddenDays=k,_.getCellsPerWeek=x,_.dateToCell=z,_.dateToDayOffset=W,_.dayOffsetToCellOffset=A,_.cellOffsetToCell=O,_.cellToDate=H,_.cellToCellOffset=F,_.cellOffsetToDayOffset=R,_.dayOffsetToDate=N,_.rangeToSegments=L;var U,Z=o("hiddenDays")||[],G=[],$=[],Q=[],K=o("isRTL");(function(){o("weekends")===!1&&Z.push(0,6);for(var e=0,n=0;7>e;e++)$[e]=n,G[e]=-1!=t.inArray(e,Z),G[e]||(Q[n]=e,n++);if(U=n,!U)throw"invalid hiddenDays"})()}function de(){function e(t,e){var n=r(t,!1,!0);he(n,function(t,e){N(t.event,e)}),w(n,e),he(n,function(t,e){k("eventAfterRender",t.event,t.event,e)})}function n(t,e,n){var a=r([t],!0,!1),o=[];return he(a,function(t,r){t.row===e&&r.css("top",n),o.push(r[0])}),o}function r(e,n,r){var o,l,c=Z(),d=n?t("<div/>"):c,v=a(e);return i(v),o=s(v),d[0].innerHTML=o,l=d.children(),n&&c.append(l),u(v,l),he(v,function(t,e){t.hsides=x(e,!0)}),he(v,function(t,e){e.width(Math.max(0,t.outerWidth-t.hsides))}),he(v,function(t,e){t.outerHeight=e.outerHeight(!0)}),f(v,r),v}function a(t){for(var e=[],n=0;t.length>n;n++){var r=o(t[n]);e.push.apply(e,r)}return e}function o(t){for(var e=t.start,n=C(t),r=ee(e,n),a=0;r.length>a;a++)r[a].event=t;return r}function i(t){for(var e=T("isRTL"),n=0;t.length>n;n++){var r=t[n],a=(e?r.isEnd:r.isStart)?V:X,o=(e?r.isStart:r.isEnd)?U:J,i=a(r.leftCol),s=o(r.rightCol);r.left=i,r.outerWidth=s-i}}function s(t){for(var e="",n=0;t.length>n;n++)e+=c(t[n]);return e}function c(t){var e="",n=T("isRTL"),r=t.event,a=r.url,o=["fc-event","fc-event-hori"];H(r)&&o.push("fc-event-draggable"),t.isStart&&o.push("fc-event-start"),t.isEnd&&o.push("fc-event-end"),o=o.concat(r.className),r.source&&(o=o.concat(r.source.className||[]));var i=j(r,T);return e+=a?"<a href='"+q(a)+"'":"<div",e+=" class='"+o.join(" ")+"'"+" style="+"'"+"position:absolute;"+"left:"+t.left+"px;"+i+"'"+">"+"<div class='fc-event-inner'>",!r.allDay&&t.isStart&&(e+="<span class='fc-event-time'>"+q(G(r.start,r.end,T("timeFormat")))+"</span>"),e+="<span class='fc-event-title'>"+q(r.title||"")+"</span>"+"</div>",t.isEnd&&F(r)&&(e+="<div class='ui-resizable-handle ui-resizable-"+(n?"w":"e")+"'>"+"&nbsp;&nbsp;&nbsp;"+"</div>"),e+="</"+(a?"a":"div")+">"}function u(e,n){for(var r=0;e.length>r;r++){var a=e[r],o=a.event,i=n.eq(r),s=k("eventRender",o,o,i);s===!1?i.remove():(s&&s!==!0&&(s=t(s).css({position:"absolute",left:a.left}),i.replaceWith(s),i=s),a.element=i)}}function f(t,e){var n=v(t),r=y(),a=[];if(e)for(var o=0;r.length>o;o++)r[o].height(n[o]);for(var o=0;r.length>o;o++)a.push(r[o].position().top);he(t,function(t,e){e.css("top",a[t.row]+t.top)})}function v(t){for(var e=P(),n=B(),r=[],a=g(t),o=0;e>o;o++){for(var i=a[o],s=[],l=0;n>l;l++)s.push(0);for(var c=0;i.length>c;c++){var u=i[c];u.top=L(s.slice(u.leftCol,u.rightCol+1));for(var l=u.leftCol;u.rightCol>=l;l++)s[l]=u.top+u.outerHeight}r.push(L(s))}return r}function g(t){var e,n,r,a=P(),o=[];for(e=0;t.length>e;e++)n=t[e],r=n.row,n.element&&(o[r]?o[r].push(n):o[r]=[n]);for(r=0;a>r;r++)o[r]=p(o[r]||[]);return o}function p(t){for(var e=[],n=m(t),r=0;n.length>r;r++)e.push.apply(e,n[r]);return e}function m(t){t.sort(ge);for(var e=[],n=0;t.length>n;n++){for(var r=t[n],a=0;e.length>a&&ve(r,e[a]);a++);e[a]?e[a].push(r):e[a]=[r]}return e}function y(){var t,e=P(),n=[];for(t=0;e>t;t++)n[t]=I(t).find("div.fc-day-content > div");return n}function w(t,e){var n=Z();he(t,function(t,n,r){var a=t.event;a._id===e?b(a,n,t):n[0]._fci=r}),E(n,t,b)}function b(t,e,n){H(t)&&S.draggableDayEvent(t,e,n),n.isEnd&&F(t)&&S.resizableDayEvent(t,e,n),z(t,e)}function D(t,e){var n,r=te();e.draggable({delay:50,opacity:T("dragOpacity"),revertDuration:T("dragRevertDuration"),start:function(a,o){k("eventDragStart",e,t,a,o),A(t,e),r.start(function(r,a,o,i){if(e.draggable("option","revert",!r||!o&&!i),Q(),r){var s=ne(a),c=ne(r);n=h(c,s),$(l(d(t.start),n),l(C(t),n))}else n=0},a,"drag")},stop:function(a,o){r.stop(),Q(),k("eventDragStop",e,t,a,o),n?O(this,t,n,0,t.allDay,a,o):(e.css("filter",""),W(t,e))}})}function M(e,r,a){var o=T("isRTL"),i=o?"w":"e",s=r.find(".ui-resizable-"+i),c=!1;Y(r),r.mousedown(function(t){t.preventDefault()}).click(function(t){c&&(t.preventDefault(),t.stopImmediatePropagation())}),s.mousedown(function(o){function s(n){k("eventResizeStop",this,e,n),t("body").css("cursor",""),u.stop(),Q(),f&&_(this,e,f,0,n),setTimeout(function(){c=!1},0)}if(1==o.which){c=!0;var u=te();P(),B();var f,d,v=r.css("top"),h=t.extend({},e),g=ie(oe(e.start));K(),t("body").css("cursor",i+"-resize").one("mouseup",s),k("eventResizeStart",this,e,o),u.start(function(r,o){if(r){var s=re(o),c=re(r);if(c=Math.max(c,g),f=ae(c)-ae(s)){h.end=l(R(e),f,!0);var u=d;d=n(h,a.row,v),d=t(d),d.find("*").css("cursor",i+"-resize"),u&&u.remove(),A(e)}else d&&(W(e),d.remove(),d=null);Q(),$(e.start,l(C(e),f))}},o)}})}var S=this;S.renderDayEvents=e,S.draggableDayEvent=D,S.resizableDayEvent=M;var T=S.opt,k=S.trigger,H=S.isEventDraggable,F=S.isEventResizable,R=S.eventEnd,N=S.reportEventElement,z=S.eventElementHandlers,W=S.showEvents,A=S.hideEvents,O=S.eventDrop,_=S.eventResize,P=S.getRowCnt,B=S.getColCnt;S.getColWidth;var I=S.allDayRow,X=S.colLeft,J=S.colRight,V=S.colContentLeft,U=S.colContentRight;S.dateToCell;var Z=S.getDaySegmentContainer,G=S.calendar.formatDates,$=S.renderDayOverlay,Q=S.clearOverlays,K=S.clearSelection,te=S.getHoverListener,ee=S.rangeToSegments,ne=S.cellToDate,re=S.cellToCellOffset,ae=S.cellOffsetToDayOffset,oe=S.dateToDayOffset,ie=S.dayOffsetToCellOffset}function ve(t,e){for(var n=0;e.length>n;n++){var r=e[n];if(r.leftCol<=t.rightCol&&r.rightCol>=t.leftCol)return!0}return!1}function he(t,e){for(var n=0;t.length>n;n++){var r=t[n],a=r.element;a&&e(r,a,n)}}function ge(t,e){return e.rightCol-e.leftCol-(t.rightCol-t.leftCol)||e.event.allDay-t.event.allDay||t.event.start-e.event.start||(t.event.title||"").localeCompare(e.event.title)}function pe(){function e(t,e,a){n(),e||(e=l(t,a)),c(t,e,a),r(t,e,a)}function n(t){f&&(f=!1,u(),s("unselect",null,t))}function r(t,e,n,r){f=!0,s("select",null,t,e,n,r)}function a(e){var a=o.cellToDate,s=o.getIsCellAllDay,l=o.getHoverListener(),f=o.reportDayClick;if(1==e.which&&i("selectable")){n(e);var d;l.start(function(t,e){u(),t&&s(t)?(d=[a(e),a(t)].sort(O),c(d[0],d[1],!0)):d=null},e),t(document).one("mouseup",function(t){l.stop(),d&&(+d[0]==+d[1]&&f(d[0],!0,t),r(d[0],d[1],!0,t))})}}var o=this;o.select=e,o.unselect=n,o.reportSelection=r,o.daySelectionMousedown=a;var i=o.opt,s=o.trigger,l=o.defaultSelectionEnd,c=o.renderSelection,u=o.clearSelection,f=!1;i("selectable")&&i("unselectAuto")&&t(document).mousedown(function(e){var r=i("unselectCancel");r&&t(e.target).parents(r).length||n(e)})}function me(){function e(e,n){var r=o.shift();return r||(r=t("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>")),r[0].parentNode!=n[0]&&r.appendTo(n),a.push(r.css(e).show()),r}function n(){for(var t;t=a.shift();)o.push(t.hide().unbind())}var r=this;r.renderOverlay=e,r.clearOverlays=n;var a=[],o=[]}function ye(t){var e,n,r=this;r.build=function(){e=[],n=[],t(e,n)},r.cell=function(t,r){var a,o=e.length,i=n.length,s=-1,l=-1;for(a=0;o>a;a++)if(r>=e[a][0]&&e[a][1]>r){s=a;break}for(a=0;i>a;a++)if(t>=n[a][0]&&n[a][1]>t){l=a;break}return s>=0&&l>=0?{row:s,col:l}:null},r.rect=function(t,r,a,o,i){var s=i.offset();return{top:e[t][0]-s.top,left:n[r][0]-s.left,width:n[o][1]-n[r][0],height:e[a][1]-e[t][0]}}}function we(e){function n(t){be(t);var n=e.cell(t.pageX,t.pageY);(!n!=!i||n&&(n.row!=i.row||n.col!=i.col))&&(n?(o||(o=n),a(n,o,n.row-o.row,n.col-o.col)):a(n,o),i=n)}var r,a,o,i,s=this;s.start=function(s,l,c){a=s,o=i=null,e.build(),n(l),r=c||"mousemove",t(document).bind(r,n)},s.stop=function(){return t(document).unbind(r,n),i}}function be(t){t.pageX===e&&(t.pageX=t.originalEvent.pageX,t.pageY=t.originalEvent.pageY)}function De(t){function n(e){return a[e]=a[e]||t(e)}var r=this,a={},o={},i={};r.left=function(t){return o[t]=o[t]===e?n(t).position().left:o[t]},r.right=function(t){return i[t]=i[t]===e?r.left(t)+n(t).width():i[t]},r.clear=function(){a={},o={},i={}}}var Ce={defaultView:"month",aspectRatio:1.35,header:{left:"title",center:"",right:"today prev,next"},weekends:!0,weekNumbers:!1,weekNumberCalculation:"iso",weekNumberTitle:"W",allDayDefault:!0,ignoreTimezone:!0,lazyFetching:!0,startParam:"start",endParam:"end",titleFormat:{month:"MMMM yyyy",week:"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",day:"dddd, MMM d, yyyy"},columnFormat:{month:"ddd",week:"ddd M/d",day:"dddd M/d"},timeFormat:{"":"h(:mm)t"},isRTL:!1,firstDay:0,monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],buttonText:{prev:"<span class='fc-text-arrow'>&lsaquo;</span>",next:"<span class='fc-text-arrow'>&rsaquo;</span>",prevYear:"<span class='fc-text-arrow'>&laquo;</span>",nextYear:"<span class='fc-text-arrow'>&raquo;</span>",today:"today",month:"month",week:"week",day:"day"},theme:!1,buttonIcons:{prev:"circle-triangle-w",next:"circle-triangle-e"},unselectAuto:!0,dropAccept:"*",handleWindowResize:!0},Me={header:{left:"next,prev today",center:"",right:"title"},buttonText:{prev:"<span class='fc-text-arrow'>&rsaquo;</span>",next:"<span class='fc-text-arrow'>&lsaquo;</span>",prevYear:"<span class='fc-text-arrow'>&raquo;</span>",nextYear:"<span class='fc-text-arrow'>&laquo;</span>"},buttonIcons:{prev:"circle-triangle-e",next:"circle-triangle-w"}},Ee=t.fullCalendar={version:"1.6.4"},Se=Ee.views={};t.fn.fullCalendar=function(n){if("string"==typeof n){var a,o=Array.prototype.slice.call(arguments,1);return this.each(function(){var r=t.data(this,"fullCalendar");if(r&&t.isFunction(r[n])){var i=r[n].apply(r,o);a===e&&(a=i),"destroy"==n&&t.removeData(this,"fullCalendar")}}),a!==e?a:this}n=n||{};var i=n.eventSources||[];return delete n.eventSources,n.events&&(i.push(n.events),delete n.events),n=t.extend(!0,{},Ce,n.isRTL||n.isRTL===e&&Ce.isRTL?Me:{},n),this.each(function(e,a){var o=t(a),s=new r(o,n,i);o.data("fullCalendar",s),s.render()}),this},Ee.sourceNormalizers=[],Ee.sourceFetchers=[];var Te={dataType:"json",cache:!1},xe=1;Ee.addDays=l,Ee.cloneDate=d,Ee.parseDate=p,Ee.parseISO8601=m,Ee.parseTime=y,Ee.formatDate=w,Ee.formatDates=b;var ke=["sun","mon","tue","wed","thu","fri","sat"],He=864e5,Fe=36e5,Re=6e4,Ne={s:function(t){return t.getSeconds()},ss:function(t){return _(t.getSeconds())},m:function(t){return t.getMinutes()},mm:function(t){return _(t.getMinutes())},h:function(t){return t.getHours()%12||12},hh:function(t){return _(t.getHours()%12||12)},H:function(t){return t.getHours()},HH:function(t){return _(t.getHours())},d:function(t){return t.getDate()},dd:function(t){return _(t.getDate())},ddd:function(t,e){return e.dayNamesShort[t.getDay()]},dddd:function(t,e){return e.dayNames[t.getDay()]},M:function(t){return t.getMonth()+1},MM:function(t){return _(t.getMonth()+1)},MMM:function(t,e){return e.monthNamesShort[t.getMonth()]},MMMM:function(t,e){return e.monthNames[t.getMonth()]},yy:function(t){return(t.getFullYear()+"").substring(2)},yyyy:function(t){return t.getFullYear()},t:function(t){return 12>t.getHours()?"a":"p"},tt:function(t){return 12>t.getHours()?"am":"pm"},T:function(t){return 12>t.getHours()?"A":"P"},TT:function(t){return 12>t.getHours()?"AM":"PM"},u:function(t){return w(t,"yyyy-MM-dd'T'HH:mm:ss'Z'")},S:function(t){var e=t.getDate();return e>10&&20>e?"th":["st","nd","rd"][e%10-1]||"th"},w:function(t,e){return e.weekNumberCalculation(t)},W:function(t){return D(t)}};Ee.dateFormatters=Ne,Ee.applyAll=I,Se.month=J,Se.basicWeek=V,Se.basicDay=U,n({weekMode:"fixed"}),Se.agendaWeek=$,Se.agendaDay=Q,n({allDaySlot:!0,allDayText:"all-day",firstHour:6,slotMinutes:30,defaultEventMinutes:120,axisFormat:"h(:mm)tt",timeFormat:{agenda:"h:mm{ - h:mm}"},dragOpacity:{agenda:.5},minTime:0,maxTime:24,slotEventOverlap:!0})})(jQuery);
/* =============================================================
 * bootstrap3-typeahead.js v3.0.3
 * https://github.com/bassjobsen/Bootstrap-3-Typeahead
 * =============================================================
 * Original written by @mdo and @fat
 * =============================================================
 * Copyright 2014 Bass Jobsen @bassjobsen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict";
  // jshint laxcomma: true


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.typeahead.defaults, options);
    this.matcher = this.options.matcher || this.matcher;
    this.sorter = this.options.sorter || this.sorter;
    this.select = this.options.select || this.select;
    this.autoSelect = typeof this.options.autoSelect == 'boolean' ? this.options.autoSelect : true;
    this.highlighter = this.options.highlighter || this.highlighter;
    this.updater = this.options.updater || this.updater;
    this.source = this.options.source;
    this.$menu = $(this.options.menu);
    this.shown = false;
    this.listen();
    this.showHintOnFocus = typeof this.options.showHintOnFocus == 'boolean' ? this.options.showHintOnFocus : false;
  };

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').data('value');
      if(this.autoSelect || val) {
        this.$element
          .val(this.updater(val))
          .change();
      }
      return this.hide();
    }

  , updater: function (item) {
      return item;
    }

  , setSource: function (source) {
      this.source = source;
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      }), scrollHeight;

      scrollHeight = typeof this.options.scrollHeight == 'function' ?
          this.options.scrollHeight.call() :
          this.options.scrollHeight;

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height + scrollHeight
        , left: pos.left
        })
        .show();

      this.shown = true;
      return this;
    }

  , hide: function () {
      this.$menu.hide();
      this.shown = false;
      return this;
    }

  , lookup: function (query) {
      var items;
      if (typeof(query) != 'undefined' && query !== null) {
        this.query = query;
      } else {
        this.query = this.$element.val() ||  '';
      }

      if (this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this;
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;

      return items ? this.process(items) : this;
    }

  , process: function (items) {
      var that = this;

      items = $.grep(items, function (item) {
        return that.matcher(item);
      });

      items = this.sorter(items);

      if (!items.length) {
        return this.shown ? this.hide() : this;
      }

      if (this.options.items == 'all' || this.options.minLength === 0 && !this.$element.val()) {
        return this.render(items).show();
      } else {
        return this.render(items.slice(0, this.options.items)).show();
      }
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase());
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item;

      while ((item = items.shift())) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item);
        else if (~item.indexOf(this.query)) caseSensitive.push(item);
        else caseInsensitive.push(item);
      }

      return beginswith.concat(caseSensitive, caseInsensitive);
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
      });
    }

  , render: function (items) {
      var that = this;

      items = $(items).map(function (i, item) {
        i = $(that.options.item).data('value', item);
        i.find('a').html(that.highlighter(item));
        return i[0];
      });

      if (this.autoSelect) {
        items.first().addClass('active');
      }
      this.$menu.html(items);
      return this;
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next();

      if (!next.length) {
        next = $(this.$menu.find('li')[0]);
      }

      next.addClass('active');
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev();

      if (!prev.length) {
        prev = this.$menu.find('li').last();
      }

      prev.addClass('active');
    }

  , listen: function () {
      this.$element
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this));

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this));
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        .on('mouseleave', 'li', $.proxy(this.mouseleave, this));
    }
  , destroy : function () {
      this.$element.data('typeahead',null);
      this.$element
        .off('focus')
        .off('blur')
        .off('keypress')
        .off('keyup');

      if (this.eventSupported('keydown')) {
        this.$element.off('keydown');
      }

      this.$menu.remove();
    }
  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element;
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;');
        isSupported = typeof this.$element[eventName] === 'function';
      }
      return isSupported;
    }

  , move: function (e) {
      if (!this.shown) return;

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault();
          break;

        case 38: // up arrow
          e.preventDefault();
          this.prev();
          break;

        case 40: // down arrow
          e.preventDefault();
          this.next();
          break;
      }

      e.stopPropagation();
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27]);
      if (!this.shown && e.keyCode == 40) {
        this.lookup("");
      } else {
        this.move(e);
      }
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return;
      this.move(e);
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break;

        case 9: // tab
        case 13: // enter
          if (!this.shown) return;
          this.select();
          break;

        case 27: // escape
          if (!this.shown) return;
          this.hide();
          break;
        default:
          this.lookup();
      }

      e.stopPropagation();
      e.preventDefault();
  }

  , focus: function (e) {
      if (!this.focused) {
        this.focused = true;
        if (this.options.minLength === 0 && !this.$element.val() || this.options.showHintOnFocus) {
          this.lookup();
        }
      }
    }

  , blur: function (e) {
      this.focused = false;
      if (!this.mousedover && this.shown) this.hide();
    }

  , click: function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.select();
      this.$element.focus();
    }

  , mouseenter: function (e) {
      this.mousedover = true;
      this.$menu.find('.active').removeClass('active');
      $(e.currentTarget).addClass('active');
    }

  , mouseleave: function (e) {
      this.mousedover = false;
      if (!this.focused && this.shown) this.hide();
    }

  };


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead;

  $.fn.typeahead = function (option) {
	var arg = arguments;
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option;
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)));
      if (typeof option == 'string') {
        if (arg.length > 1) {
          data[option].apply(data, Array.prototype.slice.call(arg ,1));
        } else {
          data[option]();
        }
      }
    });
  };

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  , scrollHeight: 0
  , autoSelect: true
  };

  $.fn.typeahead.Constructor = Typeahead;


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old;
    return this;
  };


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this);
    if ($this.data('typeahead')) return;
    $this.typeahead($this.data());
  });

}(window.jQuery);

/**
 * BxSlider v4.1.1 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2013, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

;(function($){

	var plugin = {};

	var defaults = {

		// GENERAL
		mode: 'horizontal',
		slideSelector: '',
		infiniteLoop: true,
		hideControlOnEnd: false,
		speed: 500,
		easing: null,
		slideMargin: 0,
		startSlide: 0,
		randomStart: false,
		captions: false,
		ticker: false,
		tickerHover: false,
		adaptiveHeight: false,
		adaptiveHeightSpeed: 500,
		video: false,
		useCSS: true,
		preloadImages: 'visible',
		responsive: true,

		// TOUCH
		touchEnabled: true,
		swipeThreshold: 50,
		oneToOneTouch: true,
		preventDefaultSwipeX: true,
		preventDefaultSwipeY: false,

		// PAGER
		pager: true,
		pagerType: 'full',
		pagerShortSeparator: ' / ',
		pagerSelector: null,
		buildPager: null,
		pagerCustom: null,

		// CONTROLS
		controls: true,
		nextText: 'Next',
		prevText: 'Prev',
		nextSelector: null,
		prevSelector: null,
		autoControls: false,
		startText: 'Start',
		stopText: 'Stop',
		autoControlsCombine: false,
		autoControlsSelector: null,

		// AUTO
		auto: false,
		pause: 4000,
		autoStart: true,
		autoDirection: 'next',
		autoHover: false,
		autoDelay: 0,

		// CAROUSEL
		minSlides: 1,
		maxSlides: 1,
		moveSlides: 0,
		slideWidth: 0,

		// CALLBACKS
		onSliderLoad: function() {},
		onSlideBefore: function() {},
		onSlideAfter: function() {},
		onSlideNext: function() {},
		onSlidePrev: function() {}
	}

	$.fn.bxSlider = function(options){

		if(this.length == 0) return this;

		// support mutltiple elements
		if(this.length > 1){
			this.each(function(){$(this).bxSlider(options)});
			return this;
		}

		// create a namespace to be used throughout the plugin
		var slider = {};
		// set a reference to our slider element
		var el = this;
		plugin.el = this;

		/**
		 * Makes slideshow responsive
		 */
		// first get the original window dimens (thanks alot IE)
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();



		/**
		 * ===================================================================================
		 * = PRIVATE FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Initializes namespace settings to be used throughout plugin
		 */
		var init = function(){
			// merge user-supplied options with the defaults
			slider.settings = $.extend({}, defaults, options);
			// parse slideWidth setting
			slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
			// store the original children
			slider.children = el.children(slider.settings.slideSelector);
			// check if actual number of slides is less than minSlides / maxSlides
			if(slider.children.length < slider.settings.minSlides) slider.settings.minSlides = slider.children.length;
			if(slider.children.length < slider.settings.maxSlides) slider.settings.maxSlides = slider.children.length;
			// if random start, set the startSlide setting to random number
			if(slider.settings.randomStart) slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
			// store active slide information
			slider.active = { index: slider.settings.startSlide }
			// store if the slider is in carousel mode (displaying / moving multiple slides)
			slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
			// if carousel, force preloadImages = 'all'
			if(slider.carousel) slider.settings.preloadImages = 'all';
			// calculate the min / max width thresholds based on min / max number of slides
			// used to setup and update carousel slides dimensions
			slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
			slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
			// store the current state of the slider (if currently animating, working is true)
			slider.working = false;
			// initialize the controls object
			slider.controls = {};
			// initialize an auto interval
			slider.interval = null;
			// determine which property to use for transitions
			slider.animProp = slider.settings.mode == 'vertical' ? 'top' : 'left';
			// determine if hardware acceleration can be used
			slider.usingCSS = slider.settings.useCSS && slider.settings.mode != 'fade' && (function(){
				// create our test div element
				var div = document.createElement('div');
				// css transition properties
				var props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
				// test for each property
				for(var i in props){
					if(div.style[props[i]] !== undefined){
						slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
						slider.animProp = '-' + slider.cssPrefix + '-transform';
						return true;
					}
				}
				return false;
			}());
			// if vertical mode always make maxSlides and minSlides equal
			if(slider.settings.mode == 'vertical') slider.settings.maxSlides = slider.settings.minSlides;
			// save original style data
			el.data("origStyle", el.attr("style"));
			el.children(slider.settings.slideSelector).each(function() {
			  $(this).data("origStyle", $(this).attr("style"));
			});
			// perform all DOM / CSS modifications
			setup();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var setup = function(){
			// wrap el in a wrapper
			el.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>');
			// store a namspace reference to .bx-viewport
			slider.viewport = el.parent();
			// add a loading div to display while images are loading
			slider.loader = $('<div class="bx-loading" />');
			slider.viewport.prepend(slider.loader);
			// set el to a massive width, to hold any needed slides
			// also strip any margin and padding from el
			el.css({
				width: slider.settings.mode == 'horizontal' ? (slider.children.length * 100 + 215) + '%' : 'auto',
				position: 'relative'
			});
			// if using CSS, add the easing property
			if(slider.usingCSS && slider.settings.easing){
				el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
			// if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
			}else if(!slider.settings.easing){
				slider.settings.easing = 'swing';
			}
			var slidesShowing = getNumberSlidesShowing();
			// make modifications to the viewport (.bx-viewport)
			slider.viewport.css({
				width: '100%',
				overflow: 'hidden',
				position: 'relative'
			});
			slider.viewport.parent().css({
				maxWidth: getViewportMaxWidth()
			});
			// make modification to the wrapper (.bx-wrapper)
			if(!slider.settings.pager) {
				slider.viewport.parent().css({
				margin: '0 auto 0px'
				});
			}
			// apply css to all slider children
			slider.children.css({
				'float': slider.settings.mode == 'horizontal' ? 'left' : 'none',
				listStyle: 'none',
				position: 'relative'
			});
			// apply the calculated width after the float is applied to prevent scrollbar interference
			slider.children.css('width', getSlideWidth());
			// if slideMargin is supplied, add the css
			if(slider.settings.mode == 'horizontal' && slider.settings.slideMargin > 0) slider.children.css('marginRight', slider.settings.slideMargin);
			if(slider.settings.mode == 'vertical' && slider.settings.slideMargin > 0) slider.children.css('marginBottom', slider.settings.slideMargin);
			// if "fade" mode, add positioning and z-index CSS
			if(slider.settings.mode == 'fade'){
				slider.children.css({
					position: 'absolute',
					zIndex: 0,
					display: 'none'
				});
				// prepare the z-index on the showing element
				slider.children.eq(slider.settings.startSlide).css({zIndex: 50, display: 'block'});
			}
			// create an element to contain all slider controls (pager, start / stop, etc)
			slider.controls.el = $('<div class="bx-controls" />');
			// if captions are requested, add them
			if(slider.settings.captions) appendCaptions();
			// check if startSlide is last slide
			slider.active.last = slider.settings.startSlide == getPagerQty() - 1;
			// if video is true, set up the fitVids plugin
			if(slider.settings.video) el.fitVids();
			// set the default preload selector (visible)
			var preloadSelector = slider.children.eq(slider.settings.startSlide);
			if (slider.settings.preloadImages == "all") preloadSelector = slider.children;
			// only check for control addition if not in "ticker" mode
			if(!slider.settings.ticker){
				// if pager is requested, add it
				if(slider.settings.pager) appendPager();
				// if controls are requested, add them
				if(slider.settings.controls) appendControls();
				// if auto is true, and auto controls are requested, add them
				if(slider.settings.auto && slider.settings.autoControls) appendControlsAuto();
				// if any control option is requested, add the controls wrapper
				if(slider.settings.controls || slider.settings.autoControls || slider.settings.pager) slider.viewport.after(slider.controls.el);
			// if ticker mode, do not allow a pager
			}else{
				slider.settings.pager = false;
			}
			// preload all images, then perform final DOM / CSS modifications that depend on images being loaded
			loadElements(preloadSelector, start);
		}

		var loadElements = function(selector, callback){
			var total = selector.find('img, iframe').length;
			if (total == 0){
				callback();
				return;
			}
			var count = 0;
			selector.find('img, iframe').each(function(){
				$(this).one('load', function() {
				  if(++count == total) callback();
				}).each(function() {
				  if(this.complete) $(this).load();
				});
			});
		}

		/**
		 * Start the slider
		 */
		var start = function(){
			// if infinite loop, prepare additional slides
			if(slider.settings.infiniteLoop && slider.settings.mode != 'fade' && !slider.settings.ticker){
				var slice = slider.settings.mode == 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides;
				var sliceAppend = slider.children.slice(0, slice).clone().addClass('bx-clone');
				var slicePrepend = slider.children.slice(-slice).clone().addClass('bx-clone');
				el.append(sliceAppend).prepend(slicePrepend);
			}
			// remove the loading DOM element
			slider.loader.remove();
			// set the left / top position of "el"
			setSlidePosition();
			// if "vertical" mode, always use adaptiveHeight to prevent odd behavior
			if (slider.settings.mode == 'vertical') slider.settings.adaptiveHeight = true;
			// set the viewport height
			slider.viewport.height(getViewportHeight());
			// make sure everything is positioned just right (same as a window resize)
			el.redrawSlider();
			// onSliderLoad callback
			slider.settings.onSliderLoad(slider.active.index);
			// slider has been fully initialized
			slider.initialized = true;
			// bind the resize call to the window
			if (slider.settings.responsive) $(window).bind('resize', resizeWindow);
			// if auto is true, start the show
			if (slider.settings.auto && slider.settings.autoStart) initAuto();
			// if ticker is true, start the ticker
			if (slider.settings.ticker) initTicker();
			// if pager is requested, make the appropriate pager link active
			if (slider.settings.pager) updatePagerActive(slider.settings.startSlide);
			// check for any updates to the controls (like hideControlOnEnd updates)
			if (slider.settings.controls) updateDirectionControls();
			// if touchEnabled is true, setup the touch events
			if (slider.settings.touchEnabled && !slider.settings.ticker) initTouch();
		}

		/**
		 * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
		 */
		var getViewportHeight = function(){
			var height = 0;
			// first determine which children (slides) should be used in our height calculation
			var children = $();
			// if mode is not "vertical" and adaptiveHeight is false, include all children
			if(slider.settings.mode != 'vertical' && !slider.settings.adaptiveHeight){
				children = slider.children;
			}else{
				// if not carousel, return the single active child
				if(!slider.carousel){
					children = slider.children.eq(slider.active.index);
				// if carousel, return a slice of children
				}else{
					// get the individual slide index
					var currentIndex = slider.settings.moveSlides == 1 ? slider.active.index : slider.active.index * getMoveBy();
					// add the current slide to the children
					children = slider.children.eq(currentIndex);
					// cycle through the remaining "showing" slides
					for (i = 1; i <= slider.settings.maxSlides - 1; i++){
						// if looped back to the start
						if(currentIndex + i >= slider.children.length){
							children = children.add(slider.children.eq(i - 1));
						}else{
							children = children.add(slider.children.eq(currentIndex + i));
						}
					}
				}
			}
			// if "vertical" mode, calculate the sum of the heights of the children
			if(slider.settings.mode == 'vertical'){
				children.each(function(index) {
				  height += $(this).outerHeight();
				});
				// add user-supplied margins
				if(slider.settings.slideMargin > 0){
					height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
				}
			// if not "vertical" mode, calculate the max height of the children
			}else{
				height = Math.max.apply(Math, children.map(function(){
					return $(this).outerHeight(false);
				}).get());
			}
			return height;
		}

		/**
		 * Returns the calculated width to be used for the outer wrapper / viewport
		 */
		var getViewportMaxWidth = function(){
			var width = '100%';
			if(slider.settings.slideWidth > 0){
				if(slider.settings.mode == 'horizontal'){
					width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
				}else{
					width = slider.settings.slideWidth;
				}
			}
			return width;
		}

		/**
		 * Returns the calculated width to be applied to each slide
		 */
		var getSlideWidth = function(){
			// start with any user-supplied slide width
			var newElWidth = slider.settings.slideWidth;
			// get the current viewport width
			var wrapWidth = slider.viewport.width();
			// if slide width was not supplied, or is larger than the viewport use the viewport width
			if(slider.settings.slideWidth == 0 ||
				(slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
				slider.settings.mode == 'vertical'){
				newElWidth = wrapWidth;
			// if carousel, use the thresholds to determine the width
			}else if(slider.settings.maxSlides > 1 && slider.settings.mode == 'horizontal'){
				if(wrapWidth > slider.maxThreshold){
					// newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.maxSlides - 1))) / slider.settings.maxSlides;
				}else if(wrapWidth < slider.minThreshold){
					newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
				}
			}
			return newElWidth;
		}

		/**
		 * Returns the number of slides currently visible in the viewport (includes partially visible slides)
		 */
		var getNumberSlidesShowing = function(){
			var slidesShowing = 1;
			if(slider.settings.mode == 'horizontal' && slider.settings.slideWidth > 0){
				// if viewport is smaller than minThreshold, return minSlides
				if(slider.viewport.width() < slider.minThreshold){
					slidesShowing = slider.settings.minSlides;
				// if viewport is larger than minThreshold, return maxSlides
				}else if(slider.viewport.width() > slider.maxThreshold){
					slidesShowing = slider.settings.maxSlides;
				// if viewport is between min / max thresholds, divide viewport width by first child width
				}else{
					var childWidth = slider.children.first().width();
					slidesShowing = Math.floor(slider.viewport.width() / childWidth);
				}
			// if "vertical" mode, slides showing will always be minSlides
			}else if(slider.settings.mode == 'vertical'){
				slidesShowing = slider.settings.minSlides;
			}
			return slidesShowing;
		}

		/**
		 * Returns the number of pages (one full viewport of slides is one "page")
		 */
		var getPagerQty = function(){
			var pagerQty = 0;
			// if moveSlides is specified by the user
			if(slider.settings.moveSlides > 0){
				if(slider.settings.infiniteLoop){
					pagerQty = slider.children.length / getMoveBy();
				}else{
					// use a while loop to determine pages
					var breakPoint = 0;
					var counter = 0
					// when breakpoint goes above children length, counter is the number of pages
					while (breakPoint < slider.children.length){
						++pagerQty;
						breakPoint = counter + getNumberSlidesShowing();
						counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
					}
				}
			// if moveSlides is 0 (auto) divide children length by sides showing, then round up
			}else{
				pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
			}
			return pagerQty;
		}

		/**
		 * Returns the number of indivual slides by which to shift the slider
		 */
		var getMoveBy = function(){
			// if moveSlides was set by the user and moveSlides is less than number of slides showing
			if(slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()){
				return slider.settings.moveSlides;
			}
			// if moveSlides is 0 (auto)
			return getNumberSlidesShowing();
		}

		/**
		 * Sets the slider's (el) left or top position
		 */
		var setSlidePosition = function(){
			// if last slide, not infinite loop, and number of children is larger than specified maxSlides
			if(slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop){
				if (slider.settings.mode == 'horizontal'){
					// get the last child's position
					var lastChild = slider.children.last();
					var position = lastChild.position();
					// set the left position
					setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.width())), 'reset', 0);
				}else if(slider.settings.mode == 'vertical'){
					// get the last showing index's position
					var lastShowingIndex = slider.children.length - slider.settings.minSlides;
					var position = slider.children.eq(lastShowingIndex).position();
					// set the top position
					setPositionProperty(-position.top, 'reset', 0);
				}
			// if not last slide
			}else{
				// get the position of the first showing slide
				var position = slider.children.eq(slider.active.index * getMoveBy()).position();
				// check for last slide
				if (slider.active.index == getPagerQty() - 1) slider.active.last = true;
				// set the repective position
				if (position != undefined){
					if (slider.settings.mode == 'horizontal') setPositionProperty(-position.left, 'reset', 0);
					else if (slider.settings.mode == 'vertical') setPositionProperty(-position.top, 'reset', 0);
				}
			}
		}

		/**
		 * Sets the el's animating property position (which in turn will sometimes animate el).
		 * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
		 *
		 * @param value (int)
		 *  - the animating property's value
		 *
		 * @param type (string) 'slider', 'reset', 'ticker'
		 *  - the type of instance for which the function is being
		 *
		 * @param duration (int)
		 *  - the amount of time (in ms) the transition should occupy
		 *
		 * @param params (array) optional
		 *  - an optional parameter containing any variables that need to be passed in
		 */
		var setPositionProperty = function(value, type, duration, params){
			// use CSS transform
			if(slider.usingCSS){
				// determine the translate3d value
				var propValue = slider.settings.mode == 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
				// add the CSS transition-duration
				el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
				if(type == 'slide'){
					// set the property value
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, propValue);
				}else if(type == 'ticker'){
					// make the transition use 'linear'
					el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						// reset the position
						setPositionProperty(params['resetValue'], 'reset', 0);
						// start the loop again
						tickerLoop();
					});
				}
			// use JS animate
			}else{
				var animateObj = {};
				animateObj[slider.animProp] = value;
				if(type == 'slide'){
					el.animate(animateObj, duration, slider.settings.easing, function(){
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, value)
				}else if(type == 'ticker'){
					el.animate(animateObj, speed, 'linear', function(){
						setPositionProperty(params['resetValue'], 'reset', 0);
						// run the recursive loop after animation
						tickerLoop();
					});
				}
			}
		}

		/**
		 * Populates the pager with proper amount of pages
		 */
		var populatePager = function(){
			var pagerHtml = '';
			var pagerQty = getPagerQty();
			// loop through each pager item
			for(var i=0; i < pagerQty; i++){
				var linkContent = '';
				// if a buildPager function is supplied, use it to get pager link value, else use index + 1
				if(slider.settings.buildPager && $.isFunction(slider.settings.buildPager)){
					linkContent = slider.settings.buildPager(i);
					slider.pagerEl.addClass('bx-custom-pager');
				}else{
					linkContent = i + 1;
					slider.pagerEl.addClass('bx-default-pager');
				}
				// var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
				// add the markup to the string
				pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
			};
			// populate the pager element with pager links
			slider.pagerEl.html(pagerHtml);
		}

		/**
		 * Appends the pager to the controls element
		 */
		var appendPager = function(){
			if(!slider.settings.pagerCustom){
				// create the pager DOM element
				slider.pagerEl = $('<div class="bx-pager" />');
				// if a pager selector was supplied, populate it with the pager
				if(slider.settings.pagerSelector){
					$(slider.settings.pagerSelector).html(slider.pagerEl);
				// if no pager selector was supplied, add it after the wrapper
				}else{
					slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
				}
				// populate the pager
				populatePager();
			}else{
				slider.pagerEl = $(slider.settings.pagerCustom);
			}
			// assign the pager click binding
			slider.pagerEl.delegate('a', 'click', clickPagerBind);
		}

		/**
		 * Appends prev / next controls to the controls element
		 */
		var appendControls = function(){
			slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
			slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
			// bind click actions to the controls
			slider.controls.next.bind('click', clickNextBind);
			slider.controls.prev.bind('click', clickPrevBind);
			// if nextSlector was supplied, populate it
			if(slider.settings.nextSelector){
				$(slider.settings.nextSelector).append(slider.controls.next);
			}
			// if prevSlector was supplied, populate it
			if(slider.settings.prevSelector){
				$(slider.settings.prevSelector).append(slider.controls.prev);
			}
			// if no custom selectors were supplied
			if(!slider.settings.nextSelector && !slider.settings.prevSelector){
				// add the controls to the DOM
				slider.controls.directionEl = $('<div class="bx-controls-direction" />');
				// add the control elements to the directionEl
				slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
				// slider.viewport.append(slider.controls.directionEl);
				slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
			}
		}

		/**
		 * Appends start / stop auto controls to the controls element
		 */
		var appendControlsAuto = function(){
			slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
			slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
			// add the controls to the DOM
			slider.controls.autoEl = $('<div class="bx-controls-auto" />');
			// bind click actions to the controls
			slider.controls.autoEl.delegate('.bx-start', 'click', clickStartBind);
			slider.controls.autoEl.delegate('.bx-stop', 'click', clickStopBind);
			// if autoControlsCombine, insert only the "start" control
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.append(slider.controls.start);
			// if autoControlsCombine is false, insert both controls
			}else{
				slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
			}
			// if auto controls selector was supplied, populate it with the controls
			if(slider.settings.autoControlsSelector){
				$(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
			// if auto controls selector was not supplied, add it after the wrapper
			}else{
				slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
			}
			// update the auto controls
			updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
		}

		/**
		 * Appends image captions to the DOM
		 */
		var appendCaptions = function(){
			// cycle through each child
			slider.children.each(function(index){
				// get the image title attribute
				var title = $(this).find('img:first').attr('title');
				// append the caption
				if (title != undefined && ('' + title).length) {
                    $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
                }
			});
		}

		/**
		 * Click next binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickNextBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToNextSlide();
			e.preventDefault();
		}

		/**
		 * Click prev binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPrevBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToPrevSlide();
			e.preventDefault();
		}

		/**
		 * Click start binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStartBind = function(e){
			el.startAuto();
			e.preventDefault();
		}

		/**
		 * Click stop binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStopBind = function(e){
			el.stopAuto();
			e.preventDefault();
		}

		/**
		 * Click pager binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPagerBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			var pagerLink = $(e.currentTarget);
			var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
			// if clicked pager link is not active, continue with the goToSlide call
			if(pagerIndex != slider.active.index) el.goToSlide(pagerIndex);
			e.preventDefault();
		}

		/**
		 * Updates the pager links with an active class
		 *
		 * @param slideIndex (int)
		 *  - index of slide to make active
		 */
		var updatePagerActive = function(slideIndex){
			// if "short" pager type
			var len = slider.children.length; // nb of children
			if(slider.settings.pagerType == 'short'){
				if(slider.settings.maxSlides > 1) {
					len = Math.ceil(slider.children.length/slider.settings.maxSlides);
				}
				slider.pagerEl.html( (slideIndex + 1) + slider.settings.pagerShortSeparator + len);
				return;
			}
			// remove all pager active classes
			slider.pagerEl.find('a').removeClass('active');
			// apply the active class for all pagers
			slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
		}

		/**
		 * Performs needed actions after a slide transition
		 */
		var updateAfterSlideTransition = function(){
			// if infinte loop is true
			if(slider.settings.infiniteLoop){
				var position = '';
				// first slide
				if(slider.active.index == 0){
					// set the new position
					position = slider.children.eq(0).position();
				// carousel, last slide
				}else if(slider.active.index == getPagerQty() - 1 && slider.carousel){
					position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
				// last slide
				}else if(slider.active.index == slider.children.length - 1){
					position = slider.children.eq(slider.children.length - 1).position();
				}
				if (slider.settings.mode == 'horizontal') { setPositionProperty(-position.left, 'reset', 0);; }
				else if (slider.settings.mode == 'vertical') { setPositionProperty(-position.top, 'reset', 0);; }
			}
			// declare that the transition is complete
			slider.working = false;
			// onSlideAfter callback
			slider.settings.onSlideAfter(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
		}

		/**
		 * Updates the auto controls state (either active, or combined switch)
		 *
		 * @param state (string) "start", "stop"
		 *  - the new state of the auto show
		 */
		var updateAutoControls = function(state){
			// if autoControlsCombine is true, replace the current control with the new state
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.html(slider.controls[state]);
			// if autoControlsCombine is false, apply the "active" class to the appropriate control
			}else{
				slider.controls.autoEl.find('a').removeClass('active');
				slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
			}
		}

		/**
		 * Updates the direction controls (checks if either should be hidden)
		 */
		var updateDirectionControls = function(){
			if(getPagerQty() == 1){
				slider.controls.prev.addClass('disabled');
				slider.controls.next.addClass('disabled');
			}else if(!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd){
				// if first slide
				if (slider.active.index == 0){
					slider.controls.prev.addClass('disabled');
					slider.controls.next.removeClass('disabled');
				// if last slide
				}else if(slider.active.index == getPagerQty() - 1){
					slider.controls.next.addClass('disabled');
					slider.controls.prev.removeClass('disabled');
				// if any slide in the middle
				}else{
					slider.controls.prev.removeClass('disabled');
					slider.controls.next.removeClass('disabled');
				}
			}
		}

		/**
		 * Initialzes the auto process
		 */
		var initAuto = function(){
			// if autoDelay was supplied, launch the auto show using a setTimeout() call
			if(slider.settings.autoDelay > 0){
				var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
			// if autoDelay was not supplied, start the auto show normally
			}else{
				el.startAuto();
			}
			// if autoHover is requested
			if(slider.settings.autoHover){
				// on el hover
				el.hover(function(){
					// if the auto show is currently playing (has an active interval)
					if(slider.interval){
						// stop the auto show and pass true agument which will prevent control update
						el.stopAuto(true);
						// create a new autoPaused value which will be used by the relative "mouseout" event
						slider.autoPaused = true;
					}
				}, function(){
					// if the autoPaused value was created be the prior "mouseover" event
					if(slider.autoPaused){
						// start the auto show and pass true agument which will prevent control update
						el.startAuto(true);
						// reset the autoPaused value
						slider.autoPaused = null;
					}
				});
			}
		}

		/**
		 * Initialzes the ticker process
		 */
		var initTicker = function(){
			var startPosition = 0;
			// if autoDirection is "next", append a clone of the entire slider
			if(slider.settings.autoDirection == 'next'){
				el.append(slider.children.clone().addClass('bx-clone'));
			// if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
			}else{
				el.prepend(slider.children.clone().addClass('bx-clone'));
				var position = slider.children.first().position();
				startPosition = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			}
			setPositionProperty(startPosition, 'reset', 0);
			// do not allow controls in ticker mode
			slider.settings.pager = false;
			slider.settings.controls = false;
			slider.settings.autoControls = false;
			// if autoHover is requested
			if(slider.settings.tickerHover && !slider.usingCSS){
				// on el hover
				slider.viewport.hover(function(){
					el.stop();
				}, function(){
					// calculate the total width of children (used to calculate the speed ratio)
					var totalDimens = 0;
					slider.children.each(function(index){
					  totalDimens += slider.settings.mode == 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
					});
					// calculate the speed ratio (used to determine the new speed to finish the paused animation)
					var ratio = slider.settings.speed / totalDimens;
					// determine which property to use
					var property = slider.settings.mode == 'horizontal' ? 'left' : 'top';
					// calculate the new speed
					var newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
					tickerLoop(newSpeed);
				});
			}
			// start the ticker loop
			tickerLoop();
		}

		/**
		 * Runs a continuous loop, news ticker-style
		 */
		var tickerLoop = function(resumeSpeed){
			speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
			var position = {left: 0, top: 0};
			var reset = {left: 0, top: 0};
			// if "next" animate left position to last child, then reset left to 0
			if(slider.settings.autoDirection == 'next'){
				position = el.find('.bx-clone').first().position();
			// if "prev" animate left position to 0, then reset left to first non-clone child
			}else{
				reset = slider.children.first().position();
			}
			var animateProperty = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			var resetValue = slider.settings.mode == 'horizontal' ? -reset.left : -reset.top;
			var params = {resetValue: resetValue};
			setPositionProperty(animateProperty, 'ticker', speed, params);
		}

		/**
		 * Initializes touch events
		 */
		var initTouch = function(){
			// initialize object to contain all touch values
			slider.touch = {
				start: {x: 0, y: 0},
				end: {x: 0, y: 0}
			}
			slider.viewport.bind('touchstart', onTouchStart);
		}

		/**
		 * Event handler for "touchstart"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchStart = function(e){
			if(slider.working){
				e.preventDefault();
			}else{
				// record the original position when touch starts
				slider.touch.originalPos = el.position();
				var orig = e.originalEvent;
				// record the starting touch x, y coordinates
				slider.touch.start.x = orig.changedTouches[0].pageX;
				slider.touch.start.y = orig.changedTouches[0].pageY;
				// bind a "touchmove" event to the viewport
				slider.viewport.bind('touchmove', onTouchMove);
				// bind a "touchend" event to the viewport
				slider.viewport.bind('touchend', onTouchEnd);
			}
		}

		/**
		 * Event handler for "touchmove"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchMove = function(e){
			var orig = e.originalEvent;
			// if scrolling on y axis, do not prevent default
			var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
			var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
			// x axis swipe
			if((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX){
				e.preventDefault();
			// y axis swipe
			}else if((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY){
				e.preventDefault();
			}
			if(slider.settings.mode != 'fade' && slider.settings.oneToOneTouch){
				var value = 0;
				// if horizontal, drag along x axis
				if(slider.settings.mode == 'horizontal'){
					var change = orig.changedTouches[0].pageX - slider.touch.start.x;
					value = slider.touch.originalPos.left + change;
				// if vertical, drag along y axis
				}else{
					var change = orig.changedTouches[0].pageY - slider.touch.start.y;
					value = slider.touch.originalPos.top + change;
				}
				setPositionProperty(value, 'reset', 0);
			}
		}

		/**
		 * Event handler for "touchend"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchEnd = function(e){
			slider.viewport.unbind('touchmove', onTouchMove);
			var orig = e.originalEvent;
			var value = 0;
			// record end x, y positions
			slider.touch.end.x = orig.changedTouches[0].pageX;
			slider.touch.end.y = orig.changedTouches[0].pageY;
			// if fade mode, check if absolute x distance clears the threshold
			if(slider.settings.mode == 'fade'){
				var distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
				if(distance >= slider.settings.swipeThreshold){
					slider.touch.start.x > slider.touch.end.x ? el.goToNextSlide() : el.goToPrevSlide();
					el.stopAuto();
				}
			// not fade mode
			}else{
				var distance = 0;
				// calculate distance and el's animate property
				if(slider.settings.mode == 'horizontal'){
					distance = slider.touch.end.x - slider.touch.start.x;
					value = slider.touch.originalPos.left;
				}else{
					distance = slider.touch.end.y - slider.touch.start.y;
					value = slider.touch.originalPos.top;
				}
				// if not infinite loop and first / last slide, do not attempt a slide transition
				if(!slider.settings.infiniteLoop && ((slider.active.index == 0 && distance > 0) || (slider.active.last && distance < 0))){
					setPositionProperty(value, 'reset', 200);
				}else{
					// check if distance clears threshold
					if(Math.abs(distance) >= slider.settings.swipeThreshold){
						distance < 0 ? el.goToNextSlide() : el.goToPrevSlide();
						el.stopAuto();
					}else{
						// el.animate(property, 200);
						setPositionProperty(value, 'reset', 200);
					}
				}
			}
			slider.viewport.unbind('touchend', onTouchEnd);
		}

		/**
		 * Window resize event callback
		 */
		var resizeWindow = function(e){
			// get the new window dimens (again, thank you IE)
			var windowWidthNew = $(window).width();
			var windowHeightNew = $(window).height();
			// make sure that it is a true window resize
			// *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
			// are resized. Can you just die already?*
			if(windowWidth != windowWidthNew || windowHeight != windowHeightNew){
				// set the new window dimens
				windowWidth = windowWidthNew;
				windowHeight = windowHeightNew;
				// update all dynamic elements
				el.redrawSlider();
			}
		}

		/**
		 * ===================================================================================
		 * = PUBLIC FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Performs slide transition to the specified slide
		 *
		 * @param slideIndex (int)
		 *  - the destination slide's index (zero-based)
		 *
		 * @param direction (string)
		 *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
		 */
		el.goToSlide = function(slideIndex, direction){
			// if plugin is currently in motion, ignore request
			if(slider.working || slider.active.index == slideIndex) return;
			// declare that plugin is in motion
			slider.working = true;
			// store the old index
			slider.oldIndex = slider.active.index;
			// if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
			if(slideIndex < 0){
				slider.active.index = getPagerQty() - 1;
			// if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
			}else if(slideIndex >= getPagerQty()){
				slider.active.index = 0;
			// set active index to requested slide
			}else{
				slider.active.index = slideIndex;
			}
			// onSlideBefore, onSlideNext, onSlidePrev callbacks
			slider.settings.onSlideBefore(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			if(direction == 'next'){
				slider.settings.onSlideNext(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}else if(direction == 'prev'){
				slider.settings.onSlidePrev(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}
			// check if last slide
			slider.active.last = slider.active.index >= getPagerQty() - 1;
			// update the pager with active class
			if(slider.settings.pager) updatePagerActive(slider.active.index);
			// // check for direction control update
			if(slider.settings.controls) updateDirectionControls();
			// if slider is set to mode: "fade"
			if(slider.settings.mode == 'fade'){
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				// fade out the visible child and reset its z-index value
				slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
				// fade in the newly requested slide
				slider.children.eq(slider.active.index).css('zIndex', 51).fadeIn(slider.settings.speed, function(){
					$(this).css('zIndex', 50);
					updateAfterSlideTransition();
				});
			// slider mode is not "fade"
			}else{
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				var moveBy = 0;
				var position = {left: 0, top: 0};
				// if carousel and not infinite loop
				if(!slider.settings.infiniteLoop && slider.carousel && slider.active.last){
					if(slider.settings.mode == 'horizontal'){
						// get the last child position
						var lastChild = slider.children.eq(slider.children.length - 1);
						position = lastChild.position();
						// calculate the position of the last slide
						moveBy = slider.viewport.width() - lastChild.outerWidth();
					}else{
						// get last showing index position
						var lastShowingIndex = slider.children.length - slider.settings.minSlides;
						position = slider.children.eq(lastShowingIndex).position();
					}
					// horizontal carousel, going previous while on first slide (infiniteLoop mode)
				}else if(slider.carousel && slider.active.last && direction == 'prev'){
					// get the last child position
					var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
					var lastChild = el.children('.bx-clone').eq(eq);
					position = lastChild.position();
				// if infinite loop and "Next" is clicked on the last slide
				}else if(direction == 'next' && slider.active.index == 0){
					// get the last clone position
					position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
					slider.active.last = false;
				// normal non-zero requests
				}else if(slideIndex >= 0){
					var requestEl = slideIndex * getMoveBy();
					position = slider.children.eq(requestEl).position();
				}

				/* If the position doesn't exist
				 * (e.g. if you destroy the slider on a next click),
				 * it doesn't throw an error.
				 */
				if ("undefined" !== typeof(position)) {
					var value = slider.settings.mode == 'horizontal' ? -(position.left - moveBy) : -position.top;
					// plugin values to be animated
					setPositionProperty(value, 'slide', slider.settings.speed);
				}
			}
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.goToNextSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.last) return;
			var pagerIndex = parseInt(slider.active.index) + 1;
			el.goToSlide(pagerIndex, 'next');
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.goToPrevSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
			var pagerIndex = parseInt(slider.active.index) - 1;
			el.goToSlide(pagerIndex, 'prev');
		}

		/**
		 * Starts the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.startAuto = function(preventControlUpdate){
			// if an interval already exists, disregard call
			if(slider.interval) return;
			// create an interval
			slider.interval = setInterval(function(){
				slider.settings.autoDirection == 'next' ? el.goToNextSlide() : el.goToPrevSlide();
			}, slider.settings.pause);
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
		}

		/**
		 * Stops the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.stopAuto = function(preventControlUpdate){
			// if no interval exists, disregard call
			if(!slider.interval) return;
			// clear the interval
			clearInterval(slider.interval);
			slider.interval = null;
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('start');
		}

		/**
		 * Returns current slide index (zero-based)
		 */
		el.getCurrentSlide = function(){
			return slider.active.index;
		}

		/**
		 * Returns number of slides in show
		 */
		el.getSlideCount = function(){
			return slider.children.length;
		}

		/**
		 * Update all dynamic slider elements
		 */
		el.redrawSlider = function(){
			// resize all children in ratio to new screen size
			slider.children.add(el.find('.bx-clone')).outerWidth(getSlideWidth());
			// adjust the height
			slider.viewport.css('height', getViewportHeight());
			// update the slide position
			if(!slider.settings.ticker) setSlidePosition();
			// if active.last was true before the screen resize, we want
			// to keep it last no matter what screen size we end on
			if (slider.active.last) slider.active.index = getPagerQty() - 1;
			// if the active index (page) no longer exists due to the resize, simply set the index as last
			if (slider.active.index >= getPagerQty()) slider.active.last = true;
			// if a pager is being displayed and a custom pager is not being used, update it
			if(slider.settings.pager && !slider.settings.pagerCustom){
				populatePager();
				updatePagerActive(slider.active.index);
			}
		}

		/**
		 * Destroy the current instance of the slider (revert everything back to original state)
		 */
		el.destroySlider = function(){
			// don't do anything if slider has already been destroyed
			if(!slider.initialized) return;
			slider.initialized = false;
			$('.bx-clone', this).remove();
			slider.children.each(function() {
				$(this).data("origStyle") != undefined ? $(this).attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			});
			$(this).data("origStyle") != undefined ? this.attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			$(this).unwrap().unwrap();
			if(slider.controls.el) slider.controls.el.remove();
			if(slider.controls.next) slider.controls.next.remove();
			if(slider.controls.prev) slider.controls.prev.remove();
			if(slider.pagerEl) slider.pagerEl.remove();
			$('.bx-caption', this).remove();
			if(slider.controls.autoEl) slider.controls.autoEl.remove();
			clearInterval(slider.interval);
			if(slider.settings.responsive) $(window).unbind('resize', resizeWindow);
		}

		/**
		 * Reload the slider (revert all DOM changes, and re-initialize)
		 */
		el.reloadSlider = function(settings){
			if (settings != undefined) options = settings;
			el.destroySlider();
			init();
		}

		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);
/*
 * jQuery Shorten plugin 1.1.0
 *
 * Copyright (c) 2014 Viral Patel
 * http://viralpatel.net
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

 /*
 ** updated by Jeff Richardson
 ** Updated to use strict,
 ** IE 7 has a "bug" It is returning underfined when trying to reference string characters in this format
 ** content[i]. IE 7 allows content.charAt(i) This works fine in all modern browsers.
 ** I've also added brackets where they werent added just for readability (mostly for me).
 */

 (function($) {
    $.fn.shorten = function (settings) {

    "use strict";
        if ($(this).data('jquery.shorten')){
            return false;
        }
        $(this).data('jquery.shorten', true);
        
        var config = {
            showChars: 100,
            ellipsesText: "...",
            moreText: "more",
            lessText: "less",
            errMsg: null
        };

        if (settings) {
            $.extend(config, settings);
        }

        $(document).off("click", '.morelink');

        $(document).on({click: function () {

                var $this = $(this);
                if ($this.hasClass('less')) {
                    $this.removeClass('less');
                    $this.html(config.moreText);
                    $this.parent().prev().prev().show(); // shortcontent
                    $this.parent().prev().hide(); // allcontent

                } else {
                    $this.addClass('less');
                    $this.html(config.lessText);
                    $this.parent().prev().prev().hide(); // shortcontent
                    $this.parent().prev().show(); // allcontent
                }
                return false;
            }
        }, '.morelink');

    return this.each(function () {
        var $this = $(this);

        var content = $this.html();
        var contentlen = $this.text().length;
        if (contentlen > config.showChars) {
            var c = content.substr(0, config.showChars);
            if (c.indexOf('<') >= 0) // If there's HTML don't want to cut it
            {
                var inTag = false; // I'm in a tag?
                var bag = ''; // Put the characters to be shown here
                var countChars = 0; // Current bag size
                var openTags = []; // Stack for opened tags, so I can close them later
                var tagName = null;

                for (var i = 0, r=0; r <= config.showChars; i++) {
                    if (content[i] == '<' && !inTag) {
                        inTag = true;

                        // This could be "tag" or "/tag"
                        tagName = content.substring(i + 1, content.indexOf('>', i));

                        // If its a closing tag
                        if (tagName[0] == '/') {


                            if (tagName != '/' + openTags[0]) {
                                config.errMsg = 'ERROR en HTML: the top of the stack should be the tag that closes';
                            } else {
                                openTags.shift(); // Pops the last tag from the open tag stack (the tag is closed in the retult HTML!)
                            }

                        } else {
                            // There are some nasty tags that don't have a close tag like <br/>
                            if (tagName.toLowerCase() != 'br') {
                                openTags.unshift(tagName); // Add to start the name of the tag that opens
                            }
                        }
                    }
                    if (inTag && content[i] == '>') {
                        inTag = false;
                    }

                    if (inTag) { bag += content.charAt(i); } // Add tag name chars to the result
                    else {
                        r++;
                        if (countChars <= config.showChars) {
                           bag += content.charAt(i); // Fix to ie 7 not allowing you to reference string characters using the []
                            countChars++;
                        } else // Now I have the characters needed
                        {
                            if (openTags.length > 0) // I have unclosed tags
                            {
                                //console.log('They were open tags');
                                //console.log(openTags);
                                for (j = 0; j < openTags.length; j++) {
                                    //console.log('Cierro tag ' + openTags[j]);
                                    bag += '</' + openTags[j] + '>'; // Close all tags that were opened

                                    // You could shift the tag from the stack to check if you end with an empty stack, that means you have closed all open tags
                                }
                                break;
                            }
                        }
                    }
                }
                c = $('<div/>').html(bag + '<span class="ellip">' + config.ellipsesText + '</span>').html();
            }

            var html = '<div class="shortcontent">' + c +
                '</div><div class="allcontent">' + content +
                '</div><span><a href="javascript://nop/" class="morelink">' + config.moreText + '</a></span>';

            $this.html(html);
            $this.find(".allcontent").hide(); // Hide all text
            $('.shortcontent p:last', $this).css('margin-bottom',0); //Remove bottom margin on last paragraph as it's likely shortened
        }
    });

    };

 })(jQuery);

/*
Lightbox for Bootstrap 3 by @ashleydw
https://github.com/ashleydw/lightbox

License: https://github.com/ashleydw/lightbox/blob/master/LICENSE
*/


(function() {
  "use strict";
  var $, EkkoLightbox;

  $ = jQuery;

  EkkoLightbox = function(element, options) {
    var content, footer, header,
      _this = this;
    this.options = $.extend({
      title: null,
      footer: null,
      remote: null
    }, $.fn.ekkoLightbox.defaults, options || {});
    this.$element = $(element);
    content = '';
    this.modal_id = this.options.modal_id ? this.options.modal_id : 'ekkoLightbox-' + Math.floor((Math.random() * 1000) + 1);
    header = '<div class="modal-header"' + (this.options.title || this.options.always_show_close ? '' : ' style="display:none"') + '><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">' + (this.options.title || "&nbsp;") + '</h4></div>';
    footer = '<div class="modal-footer"' + (this.options.footer ? '' : ' style="display:none"') + '>' + this.options.footer + '</div>';
    $(document.body).append('<div id="' + this.modal_id + '" class="ekko-lightbox modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' + header + '<div class="modal-body"><div class="ekko-lightbox-container"><div></div></div></div>' + footer + '</div></div></div>');
    this.modal = $('#' + this.modal_id);
    this.modal_dialog = this.modal.find('.modal-dialog').first();
    this.modal_content = this.modal.find('.modal-content').first();
    this.modal_body = this.modal.find('.modal-body').first();
    this.lightbox_container = this.modal_body.find('.ekko-lightbox-container').first();
    this.lightbox_body = this.lightbox_container.find('> div:first-child').first();
    this.modal_arrows = null;
    this.border = {
      top: parseFloat(this.modal_dialog.css('border-top-width')) + parseFloat(this.modal_content.css('border-top-width')) + parseFloat(this.modal_body.css('border-top-width')),
      right: parseFloat(this.modal_dialog.css('border-right-width')) + parseFloat(this.modal_content.css('border-right-width')) + parseFloat(this.modal_body.css('border-right-width')),
      bottom: parseFloat(this.modal_dialog.css('border-bottom-width')) + parseFloat(this.modal_content.css('border-bottom-width')) + parseFloat(this.modal_body.css('border-bottom-width')),
      left: parseFloat(this.modal_dialog.css('border-left-width')) + parseFloat(this.modal_content.css('border-left-width')) + parseFloat(this.modal_body.css('border-left-width'))
    };
    this.padding = {
      top: parseFloat(this.modal_dialog.css('padding-top')) + parseFloat(this.modal_content.css('padding-top')) + parseFloat(this.modal_body.css('padding-top')),
      right: parseFloat(this.modal_dialog.css('padding-right')) + parseFloat(this.modal_content.css('padding-right')) + parseFloat(this.modal_body.css('padding-right')),
      bottom: parseFloat(this.modal_dialog.css('padding-bottom')) + parseFloat(this.modal_content.css('padding-bottom')) + parseFloat(this.modal_body.css('padding-bottom')),
      left: parseFloat(this.modal_dialog.css('padding-left')) + parseFloat(this.modal_content.css('padding-left')) + parseFloat(this.modal_body.css('padding-left'))
    };
    this.modal.on('show.bs.modal', this.options.onShow.bind(this)).on('shown.bs.modal', function() {
      _this.modal_shown();
      return _this.options.onShown.call(_this);
    }).on('hide.bs.modal', this.options.onHide.bind(this)).on('hidden.bs.modal', function() {
      if (_this.gallery) {
        $(document).off('keydown.ekkoLightbox');
      }
      _this.modal.remove();
      return _this.options.onHidden.call(_this);
    }).modal('show', options);
    return this.modal;
  };

  EkkoLightbox.prototype = {
    modal_shown: function() {
      var video_id,
        _this = this;
      if (!this.options.remote) {
        return this.error('No remote target given');
      } else {
        this.gallery = this.$element.data('gallery');
        if (this.gallery) {
          if (this.options.gallery_parent_selector === 'document.body' || this.options.gallery_parent_selector === '') {
            this.gallery_items = $(document.body).find('*[data-toggle="lightbox"][data-gallery="' + this.gallery + '"]');
          } else {
            this.gallery_items = this.$element.parents(this.options.gallery_parent_selector).first().find('*[data-toggle="lightbox"][data-gallery="' + this.gallery + '"]');
          }
          this.gallery_index = this.gallery_items.index(this.$element);
          $(document).on('keydown.ekkoLightbox', this.navigate.bind(this));
          if (this.options.directional_arrows && this.gallery_items.length > 1) {
            this.lightbox_container.prepend('<div class="ekko-lightbox-nav-overlay"><a href="#" class="' + this.strip_stops(this.options.left_arrow_class) + '"></a><a href="#" class="' + this.strip_stops(this.options.right_arrow_class) + '"></a></div>');
            this.modal_arrows = this.lightbox_container.find('div.ekko-lightbox-nav-overlay').first();
            this.lightbox_container.find('a' + this.strip_spaces(this.options.left_arrow_class)).on('click', function(event) {
              event.preventDefault();
              return _this.navigate_left();
            });
            this.lightbox_container.find('a' + this.strip_spaces(this.options.right_arrow_class)).on('click', function(event) {
              event.preventDefault();
              return _this.navigate_right();
            });
          }
        }
        if (this.options.type) {
          if (this.options.type === 'image') {
            return this.preloadImage(this.options.remote, true);
          } else if (this.options.type === 'youtube' && (video_id = this.getYoutubeId(this.options.remote))) {
            return this.showYoutubeVideo(video_id);
          } else if (this.options.type === 'vimeo') {
            return this.showVimeoVideo(this.options.remote);
          } else {
            return this.error("Could not detect remote target type. Force the type using data-type=\"image|youtube|vimeo\"");
          }
        } else {
          return this.detectRemoteType(this.options.remote);
        }
      }
    },
    strip_stops: function(str) {
      return str.replace(/\./g, '');
    },
    strip_spaces: function(str) {
      return str.replace(/\s/g, '');
    },
    isImage: function(str) {
      return str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
    },
    isSwf: function(str) {
      return str.match(/\.(swf)((\?|#).*)?$/i);
    },
    getYoutubeId: function(str) {
      var match;
      match = str.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match && match[2].length === 11) {
        return match[2];
      } else {
        return false;
      }
    },
    getVimeoId: function(str) {
      if (str.indexOf('vimeo') > 0) {
        return str;
      } else {
        return false;
      }
    },
    navigate: function(event) {
      event = event || window.event;
      if (event.keyCode === 39 || event.keyCode === 37) {
        if (event.keyCode === 39) {
          return this.navigate_right();
        } else if (event.keyCode === 37) {
          return this.navigate_left();
        }
      }
    },
    navigate_left: function() {
      var src;
      if (this.gallery_items.length === 1) {
        return;
      }
      if (this.gallery_index === 0) {
        this.gallery_index = this.gallery_items.length - 1;
      } else {
        this.gallery_index--;
      }
      this.$element = $(this.gallery_items.get(this.gallery_index));
      this.updateTitleAndFooter();
      src = this.$element.attr('data-remote') || this.$element.attr('href');
      return this.detectRemoteType(src, this.$element.attr('data-type'));
    },
    navigate_right: function() {
      var next, src;
      if (this.gallery_items.length === 1) {
        return;
      }
      if (this.gallery_index === this.gallery_items.length - 1) {
        this.gallery_index = 0;
      } else {
        this.gallery_index++;
      }
      this.$element = $(this.gallery_items.get(this.gallery_index));
      src = this.$element.attr('data-remote') || this.$element.attr('href');
      this.updateTitleAndFooter();
      this.detectRemoteType(src, this.$element.attr('data-type'));
      if (this.gallery_index + 1 < this.gallery_items.length) {
        next = $(this.gallery_items.get(this.gallery_index + 1), false);
        src = next.attr('data-remote') || next.attr('href');
        if (next.attr('data-type') === 'image' || this.isImage(src)) {
          return this.preloadImage(src, false);
        }
      }
    },
    detectRemoteType: function(src, type) {
      var video_id;
      if (type === 'image' || this.isImage(src)) {
        this.options.type = 'image';
        return this.preloadImage(src, true);
      } else if (type === 'youtube' || (video_id = this.getYoutubeId(src))) {
        this.options.type = 'youtube';
        return this.showYoutubeVideo(video_id);
      } else if (type === 'vimeo' || (video_id = this.getVimeoId(src))) {
        this.options.type = 'vimeo';
        return this.showVimeoVideo(video_id);
      } else {
        return this.error("Could not detect remote target type. Force the type using data-type=\"image|youtube|vimeo\"");
      }
    },
    updateTitleAndFooter: function() {
      var caption, footer, header, title;
      header = this.modal_content.find('.modal-header');
      footer = this.modal_content.find('.modal-footer');
      title = this.$element.data('title') || "&nbsp;";
      caption = this.$element.data('footer') || "";
      header.css('display', '').find('.modal-title').html(title);
      if (title || this.options.always_show_close) {
        header.css('display', '');
      } else {
        header.css('display', 'none');
      }
      if (caption) {
        footer.css('display', '').html(caption);
      } else {
        footer.css('display', 'none');
      }
      return this;
    },
    showLoading: function() {
      this.lightbox_body.html('<div class="modal-loading">Loading..</div>');
      return this;
    },
    showYoutubeVideo: function(id) {
      var aspectRatio, height, width;
      aspectRatio = 560 / 315;
      width = this.$element.data('width') || 560;
      width = this.checkDimensions(width);
      height = width / aspectRatio;
      this.resize(width);
      this.lightbox_body.html('<iframe width="' + width + '" height="' + height + '" src="//www.youtube.com/embed/' + id + '?badge=0&autoplay=1&html5=1" frameborder="0" allowfullscreen></iframe>');
      if (this.modal_arrows) {
        return this.modal_arrows.css('display', 'none');
      }
    },
    showVimeoVideo: function(id) {
      var aspectRatio, height, width;
      aspectRatio = 500 / 281;
      width = this.$element.data('width') || 560;
      width = this.checkDimensions(width);
      height = width / aspectRatio;
      this.resize(width);
      this.lightbox_body.html('<iframe width="' + width + '" height="' + height + '" src="' + id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>');
      if (this.modal_arrows) {
        return this.modal_arrows.css('display', 'none');
      }
    },
    error: function(message) {
      this.lightbox_body.html(message);
      return this;
    },
    preloadImage: function(src, onLoadShowImage) {
      var img,
        _this = this;
      img = new Image();
      if ((onLoadShowImage == null) || onLoadShowImage === true) {
        img.onload = function() {
          var image;
          image = $('<img />');
          image.attr('src', img.src);
          image.addClass('img-responsive');
          _this.lightbox_body.html(image);
          if (_this.modal_arrows) {
            _this.modal_arrows.css('display', 'block');
          }
          return _this.resize(img.width);
        };
        img.onerror = function() {
          return _this.error('Failed to load image: ' + src);
        };
      }
      img.src = src;
      return img;
    },
    resize: function(width) {
      var width_total;
      width_total = width + this.border.left + this.padding.left + this.padding.right + this.border.right;
      this.modal_dialog.css('width', 'auto').css('max-width', width_total);
      this.lightbox_container.find('a').css('padding-top', function() {
        return $(this).parent().height() / 2;
      });
      return this;
    },
    checkDimensions: function(width) {
      var body_width, width_total;
      width_total = width + this.border.left + this.padding.left + this.padding.right + this.border.right;
      body_width = document.body.clientWidth;
      if (width_total > body_width) {
        width = this.modal_body.width();
      }
      return width;
    },
    close: function() {
      return this.modal.modal('hide');
    }
  };

  $.fn.ekkoLightbox = function(options) {
    return this.each(function() {
      var $this;
      $this = $(this);
      options = $.extend({
        remote: $this.attr('data-remote') || $this.attr('href'),
        gallery_parent_selector: $this.attr('data-parent'),
        type: $this.attr('data-type')
      }, options, $this.data());
      new EkkoLightbox(this, options);
      return this;
    });
  };

  $.fn.ekkoLightbox.defaults = {
    gallery_parent_selector: '*:not(.row)',
    left_arrow_class: '.glyphicon .glyphicon-chevron-left',
    right_arrow_class: '.glyphicon .glyphicon-chevron-right',
    directional_arrows: true,
    type: null,
    always_show_close: true,
    onShow: function() {},
    onShown: function() {},
    onHide: function() {},
    onHidden: function() {}
  };

}).call(this);


$(function() {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $('#calendar').fullCalendar({
        firstDay: 1,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: false,
        allDaySlot: true,
        events: baseUrl+'/user-actions/list-events',
        allDayText: 'Celý den',
        axisFormat: 'H:mm',
        timeFormat: {
            agenda: 'H(:mm){ - H(:mm)}',
            '': 'H(:mm){-H(:mm) }'
        },
        monthNames: ["Leden","Únor","Březen","Duben","Květen","Červen","Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec" ],
        monthNamesShort: ['Led','Uno','Bře','Dub','Kvě','Cer','Cvc','Srp','Zář','Ríj','Lis','Pro'],
        dayNames: [ 'Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota' ],
        dayNamesShort: [ 'Ne','Po','Ut','Stř','Čt','Pá','So' ],
        buttonText: {
            today: 'Dnes',
            month: 'Měsíc',
            week: 'Týden',
            day: 'Den'
        }
    });
});

/**
 *  Language tables
 */
window.translate = {
    cs:
    {
        more: 'více',
        next: 'další',
        previous: 'předchozí',
    },
    en:
    {
        more: 'more',
        next: 'next',
        previous: 'prev.',
    }
}

/**
 * URLs for the NTK wide search
 * @type {Array}
 */
var searchUrls = [
    'http://techlib.summon.serialssolutions.com/{LANGUAGE}/#!/search?ho=t&q={QUERY}&l={LANGUAGE}', // Vsechno
    'http://techlib.summon.serialssolutions.com/{LANGUAGE}/#!/search?ho=t&fvf=ContentType,Book%20%2F%20eBook,f&q={QUERY}', // Knihy
    'http://techlib.summon.serialssolutions.com/{LANGUAGE}/#!/search?ho=t&fvf=IsFullText,true,f|IsScholarly,true,f|IsPeerReviewed,true,f&q={QUERY}', // Clanky
    'http://techlib.summon.serialssolutions.com/{LANGUAGE}/#!/search?ho=t&fvf=SourceType,Library%20Catalog,f&q={QUERY}' // Knihovni katalog
];

/**
 * Search form handler
 */
$('.search-main form[role="search"]').submit(function(e){
    searchUrl = searchUrls[$('#search-main-category').val()]
    summon_language = (language == 'cs') ? 'cs-CZ' : 'en';
    subject = $('.search-field').val();
    searchUrl = searchUrl.replace('{QUERY}', encodeURIComponent(subject));
    searchUrl = searchUrl.replace('{LANGUAGE}', summon_language);
    window.location.href = searchUrl;
    return false;
});

$('#editorContactButton').click(function(e) {
    $('#editorContact').toggle();
    e.preventDefault();
});

(function($, Modernizr){

  // NAVBAR: Menu handler
  // Adds hover funcionality for desktops and removes it for touch devices
  // -------------------------------
  var hoverable = function() {
    if(!Modernizr.touch && Modernizr.mq('(min-width: 992px)')) {
      var elements = $('[data-hover="dropdown"]');
      elements.parent().addClass('hoverable');
      elements.off('click.enable').on('click.disable', function(e){ return false; });
      elements.trigger('click.disable');
    }
    else {
      var elements = $('[data-hover="dropdown"]');
      elements.parent().removeClass('hoverable');
      elements.off('click.disable').on('click.enable', function(e){ return true; })
      elements.trigger('click.enable');
    }
  };

  // Init
  $(window).resize(hoverable);
  hoverable();

  // Main Search field
  // -------------------------------
  $('.search-field')
    .on('focus', function(){ $(this).closest('form').addClass("is-focused"); })
    .on('blur', function(){ $(this).closest('form').removeClass("is-focused"); });


  // NAVBAR: Search form
  // -------------------------------
  var navbarFormInput = $('.navbar-form input'),
      navbarTrigger = navbarFormInput.siblings('.form-indicator');

  navbarTrigger.on('click', function(){
    navbarFormInput.show();
  });

	navbarFormInput.on('keyup', function () {
    var value = $(this).val();

    if(value.length == 0) {
      // Yes, this ugly method is necessary to keep entity unescaped
      navbarTrigger.attr('data-icon', $('<div/>').html('&#xe009;').text());
    }
    else {
      navbarTrigger.attr('data-icon', $('<div/>').html('&#xe00a;').text());
    }
  });

  navbarFormInput.on('focus', function () {
    $(this).siblings('.form-indicator').css('color', '#666');
  });

  navbarFormInput.on('blur', function () {
    $(this).siblings('.form-indicator').removeAttr('style');
  });

  $('.form-indicator').on('click', function(){
    var formInput = $(this).siblings('#keywordInput');
    formInput.val('');
    formInput.focus();
    $(this).attr('data-icon', $('<div/>').html('&#xe009;').text());
  });

  // CAROUSEL: extension
  // Adds slides counter and next slide button (with title)
  // -------------------------------
  $('.carousel').each(function(){
    var _this = $(this),
        slides = _this.find('.item');
        secondSlideHeading = _this.find('.item').eq(1).find('h3').text();

    // Init next button
    _this.find('.carousel-next span').text(secondSlideHeading);

    // Init counter
    _this.find('.slides-count').text(slides.length);
    _this.find('.current-slide').text(_this.find('.active').index() + 1);

    // Handle sliding
    _this.on('slide.bs.carousel', function (e) {
      var nextItem = $(e.relatedTarget),
          nextItemHeading = '';

      _this.find('.current-slide').text(nextItem.index() + 1);

      // Handle next slide button
      if((nextItem.index() + 1) < slides.length) {
        nextItemHeading = _this.find('.item:eq('+(nextItem.index() + 1)+') h3').text();
      }
      else {
        nextItemHeading = _this.find('.item:eq(0) h3').text();
      }

      _this.find('.carousel-next span').text(nextItemHeading);

    })

  });

  // Main Search select
  // -------------------------------
  $('.search-field-btn .dropdown-menu a').on('click', function(){
    // set title
    $('.search-field-btn .title').text($(this).text());

    // set active item
    $(this).closest('ul').find('li').removeClass('active');
    $(this).parent().addClass('active');

    // set hidden value
    $('#search-main-category').val($(this).data('target'));
  });

  $('.search-links .links-trigger').on('click', function(){
    $(this).hide();
    $(this).siblings('span').show();
  });


  // Fitvids
  // Make all videos in the page responsive
  // -------------------------------

  // Target your .container, .wrapper, .post, etc.
  $(".l-body").fitVids();


  // FullCalendar Demo
  // TODO: remove for production
  // -------------------------------
  $(function(){

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,basicWeek,basicDay'
      },
      editable: true,

      eventClick: function(calEvent, jsEvent, view) {
          // change the border color just for fun
          $(this).css('border-color', 'red');
      },

      events: [
        {
          title: 'All Day Event',
          start: new Date(y, m, 1),
          backgroundColor: '#01a3b8'
        },
        {
          title: 'Long Event',
          start: new Date(y, m, d-5),
          end: new Date(y, m, d-2),
          backgroundColor: '#adcd3b'
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d-3, 16, 0),
          allDay: false,
          backgroundColor: '#30b562'
        },
        {
          id: 999,
          title: 'Repeating Event',
          start: new Date(y, m, d+4, 16, 0),
          allDay: false,
          backgroundColor: '#01a3b8'
        },
        {
          title: 'Meeting',
          start: new Date(y, m, d, 10, 30),
          allDay: false,
          backgroundColor: '#30b562'
        },
        {
          title: 'Lunch',
          start: new Date(y, m, d, 12, 0),
          end: new Date(y, m, d, 14, 0),
          allDay: false,
          backgroundColor: '#f36c2c'
        },
        {
          title: 'Birthday Party',
          start: new Date(y, m, d+1, 19, 0),
          end: new Date(y, m, d+1, 22, 30),
          allDay: false,
          backgroundColor: '#e1b41b'
        },
        {
          title: 'Click for Google',
          start: new Date(y, m, 28),
          end: new Date(y, m, 29),
          url: 'http://google.com/',
          backgroundColor: '#e1b41b'
        }
      ]
    });

  });

  // FILTERABLE tables
  // ----------------------------

  // New expression to handle case-insensitive search
  $.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
      return function( elem ) {
          return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
      };
  });

  $('.input-filter').on('keyup', function(){
    var targetColumnIndex = $(this).parent().index() +1,
        table = $(this).closest('table');

    // Apply expression
    table.find('tbody td:nth-child(' + targetColumnIndex + '):Contains("' + $(this).val() + '")').parent().show();
    table.find('tbody td:nth-child(' + targetColumnIndex + '):not(:Contains("' + $(this).val() + '"))').parent().hide();

  });

  // FACET filtering
  // ----------------------------
  $('.js-facet').facetFilter();


})(jQuery, Modernizr);
