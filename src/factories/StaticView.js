/**
 * @author rik
 */
import _ from 'lodash';
import View from './View';

/**
 * StaticViews are Views that can be visible on multiple pages, like a menu bar, they can be 'protected' using security middleware, and can acquire data using its data middleware.
 *
 * @class StaticView
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property router {Router} Router instance
 * @property name {String} The name of the StaticView
 * @property view {String} Reference to a view
 * @property {String} [holder] The selector of the element this StaticView should be appended to.
 * @property {String|Array<String>} [security] Security middleware to run before rendering this StaticView
 * @property {String|Array<String>} [data] Data middleware to run before rendering this StaticView, the StaticView gets its data from here
 *
 * @example
 * const staticView = StaticView({
 *   router: router, // router instance
 *   name: 'menuBar',
 *   view: 'MenuBarView',
 *   holder: '.static-top-bar',
 *   security: ['user.isLoggedIn'],
 *   data: ['menu.activeItems']
 * });
 */
function StaticView(options = {}) {
  _.defaults(options, StaticView.defaults);

  // @todo validate inputs

  const viewOptions = makeViewOptions(options);
  const staticView = Object.create(StaticView.prototype);

  _.extend(staticView, _.omit(options, _.keys(StaticView.prototype)));

  staticView.options = options;
  staticView.view = View(viewOptions);

  return staticView;
}

function makeViewOptions(options = {}) {
  const viewOptions = _.clone(options.director.viewOptions[options.view]);
  _.defaults(viewOptions, options.director.View.defaults);

  viewOptions.holder = options.holder || viewOptions.holder;
  viewOptions.$holder = options.$holder || viewOptions.$holder;
  viewOptions.el = options.el || viewOptions.el;

  return viewOptions;
}

/**
 * Default properties for {@link StaticView}s, these may be overridden.
 * By default, there are no defaults.
 *
 * @name defaults
 * @memberof StaticView
 * @static
 * @type {Object}
 */
StaticView.defaults = {};

StaticView.prototype = {

  get holder() {
    return this.view.holder;
  },

  get $holder() {
    return this.view.$holder;
  },

  get el() {
    return this.view.el;
  },

  get $el() {
    return this.view.$el;
  },

  /**
   * Runs the security and data, if security or data fails the view is hidden, if they succeed, the data from the data middleware is passed to the {@link View}s render method.
   *
   * @method render
   * @memberof StaticView
   * @instance
   *
   * @param data {Object} Data to use as params for the security and data middleware
   *
   * @returns {Promise}
   */
  render(data = {}) {
    return this.view.render(data);
    // @todo implement in View
    //return this.view.security(this.security, data)
    //  .then(() => {
    //    return this.view.data(this.data, data);
    //  })
    //  .then((data) => {
    //    this.view.render(data);
    //  })
    //  .catch(() => {
    //    this.hide();
    //  });
  },

  sync(data = {}) {
    return this.view.sync(data);
  },

  /**
   * Hides the {@link View}
   *
   * @method hide
   * @memberof StaticView
   * @instance
   */
  hide() {
    this.view.hide();
  },

  /**
   * Shows the {@link View}
   *
   * @method show
   * @memberof StaticView
   * @instance
   */
  show() {
    this.view.show();
  }

};

export default StaticView;