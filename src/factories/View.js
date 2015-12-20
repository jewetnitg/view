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
 * @property el {HTMLElement} Html element that is the (pre-rendered) element of this view
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property template {*} Type varying on the chosen adapter, if the adapter allows for template to be a function, it can be used to use a different template depending on the data passed in
 *
 * @todo add subviews
 */
function View(options = {}) {
  _.defaults(options, View.defaults);

  ViewValidator.construct(options);

  const view = Object.create(View.prototype);

  _.extend(view, options);

  view.adapter = options.director.adapters[options.adapter];
  view.options = options;

  return view;
}

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
    if (this.$el) {
      this.$el.hide();
    }
  },

  /**
   * Shows the {@link View}
   * @method show
   * @memberof View
   * @instance
   */
  show() {
    if (this.$el) {
      this.$el.show();
    }
  },

  /**
   * Creates the HTML for an element and appends it to the holder, if the element already exists, this method reverts to {@link View#sync}, unless the force paramter is set to true
   *
   * @method render
   * @memberof View
   * @instance
   *
   * @todo refactor
   *
   * @param data {Object} Data to be made available to the riot tag
   * @param [force=false] {Boolean} Whether to force a render, by default if already rendered, render reverts to {@link View#sync}.
   */
  render(data = {}, force = false) {
    if (!this._rendered || force === true) {
      return this.options.director.middleware.security.run(this.security, data)
        .then(() => {
          return this.options.director.middleware.data.run(this.data, data, this.sync.bind(this))
            .then((middlewareData) => {
              _.merge(data, middlewareData);
              let $el;

              if (this.el && force !== true) {
                $el = $(this.el);
              }

              this.el = this.adapter.render(this, data, $el);

              if (this.adapter.events === true) {
                this.adapter.bindEvents(this);
              }

              this._rendered = true;
            }, () => {
              // data failed
              this.hide();
              console.error(`Data middleware failed for View '${this.name}'.`, this, data);
            });
        }, () => {
          // security failed
          this.hide();
        });
    } else {
      this.sync(data);
      this.show();
    }

    return Promise.resolve();
  },

  /**
   * Syncs data to the template
   *
   * @todo decide whether we want to re-run middleware when syncing
   *
   * @method sync
   * @memberof View
   * @instance
   *
   * @param data {Object} Data for the riot tag, will be extended with the current data
   */
  sync(data = {}) {
    return Promise.resolve()
      .then(() => {
        const possiblePromise = this.adapter.sync(this, data);

        if (this.adapter.rebindEventsAfterSync) {
          if (this.adapter.events === true) {
            this.adapter.bindEvents(this);
          }
        }

        return possiblePromise;
      });
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