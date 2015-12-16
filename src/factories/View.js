/**
 * @author rik
 */
import _ from 'lodash';
import $ from 'jquery';
import riot from 'riot/riot+compiler';

import ViewValidator from '../validators/View';
import Adapter from './Adapter';

/**
 * @class View
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property el {HTMLElement} Html element that is the (pre-rendered) element of this view
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property tag {String} Refers to a riot tag
 *
 * @todo implement events
 * @todo implement subViews
 */
function View(options = {}) {
  _.defaults(options, View.defaults);

  ViewValidator.construct(options);

  const view = Object.create(View.prototype);

  _.extend(view, options);

  view.adapter = Adapter.adapters[options.adapter];
  view.options = options;

  return view;
}

View.Adapter = Adapter;
View.adapters = Adapter.adapters;

/**
 * Default properties of {@link View}s, these may be overridden
 * @memberof View
 * @static
 * @type Object
 * @property {String} [holder='body'] - Default holder
 */
View.defaults = {
  holder: 'body',
  tagName: 'div'
};

View.prototype = {

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
    this.$el.hide();
  },

  /**
   * Shows the {@link View}
   * @method show
   * @memberof View
   * @instance
   */
  show() {
    this.$el.show();
  },

  /**
   * Creates the HTML for an element and appends it to the holder, if the element already exists, this method reverts to {@link View#sync}, unless the force paramter is set to true
   *
   * @method render
   * @memberof View
   * @instance
   *
   * @param data {Object} Data to be made available to the riot tag
   * @param [force=false] {Boolean} Whether to force a render, by default if already rendered, render reverts to {@link View#sync}.
   */
  render(data = {}, force = false) {
    if (!this._rendered || force === true) {
      let $el;

      if (this.el && force !== true) {
        $el = $(this.el);
      } else {
        const html = this.adapter.makeHtml(this, data);

        if (this.adapter.wrap) {
          $el = $(Adapter.emptyTag(this.tagName));
          $el.append(html);
        } else {
          $el = $(html);
        }

        $el.appendTo(this.$holder);
      }

      this.el = this.adapter.initializeEl(this, $el, data) || $el[0];
      this._rendered = true;
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
    this.adapter.sync(this, data);

    if (this.adapter.rebindEventsAfterSync) {
      // @todo implement events
    }
  },

  /**
   * Removes the {@link View}
   *
   * @method hide
   * @memberof View
   * @instance
   */
  remove() {
    this.adapter.remove(this);
  }

};

export default View;