/**
 * @author rik
 */
import _ from 'lodash';
import $ from 'jquery';
import riot from 'riot/riot+compiler';

import ViewValidator from '../validators/View';

/**
 * @class View
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property tag {String} Refers to a riot tag
 */
function View(options = {}) {
  _.defaults(options, View.defaults);

  ViewValidator.construct(options);

  const props = {
    tag: {
      value: options.tag
    },
    holder: {
      value: options.holder
    },
    static: {
      value: options.static
    }
  };

  const view = Object.create(View.prototype, props);

  view._display = 'block';

  if (options.static === true) {
    View.staticViews[options.name] = view;
    view.render();
    view.hide();
  }

  return view;
}

/**
 * Riot object the View uses, this should be used to run compiles, mounts etc.
 * @name riot
 * @memberof View
 * @static
 * @type {Object}
 */
View.riot = riot;

/**
 *
 * @type Object
 */
View.staticViews = {};

/**
 * Default properties of {@link View}s, these may be overridden
 * @memberof View
 * @static
 * @type Object
 * @property {String} [holder='body'] - Default holder
 * @property {String} [static=false] - Whether the view is static
 */
View.defaults = {
  holder: 'body',
  static: false
};

View.prototype = {

  /**
   * The root element of this view
   * @name el
   * @memberof View
   * @instance
   * @type HTMLElement|null
   */
  get el() {
    return this.tagInstance ? this.tagInstance.root : null;
  },

  /**
   * The root element wrapped in jQuery
   * @name $el
   * @memberof View
   * @instance
   * @type jQuery|null
   */
  get $el() {
    return this.el ? $(this.el) : null;
  },

  /**
   * The holder wrapped in jQuery
   * @name $holder
   * @memberof View
   * @instance
   * @type jQuery
   */
  get $holder() {
    return $(this.holder || this.$holder);
  },

  /**
   * Hides the {@link View}
   * @method hide
   * @memberof View
   * @instance
   */
  hide() {
    this._display = this.el.style.display;
    this.el.style.display = 'none';
  },

  /**
   * Shows the {@link View}
   * @method show
   * @memberof View
   * @instance
   */
  show() {
    this.el.style.display = this._display;
  },

  /**
   * Renders the riot tag to the DOM (into the $holder)
   *
   * @method render
   * @memberof View
   * @instance
   *
   * @param data {Object} Data to be made available to the riot tag
   */
  render(data = {}) {
    if (!this.tagInstance) {
      const $el = $(emptyTag(this.tag));
      $el.appendTo(this.$holder);
      this.tagInstance = riot.mount($el[0], this.tag, data)[0];
      this._display = this.el.style.display ;
    } else {
      this.sync(data);
      this.show();
    }
  },

  /**
   * Syncs data to the riot tag
   *
   * @method sync
   * @memberof View
   * @instance
   *
   * @param data {Object} Data for the riot tag, will be extended with the current data
   */
  sync(data = {}) {
    this.tagInstance.update(data);
  },

  /**
   * Removes the {@link View}
   * @method hide
   * @memberof View
   * @instance
   */
  remove() {
    // @todo what do we do with the keepTheParent parameter
    this.tagInstance.unmount();
    this.$el.remove();
  }

};

function emptyTag(tagName) {
  return `<${tagName}></${tagName}>`;
}

export default View;