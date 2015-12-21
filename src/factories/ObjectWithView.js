/**
 * @author rik
 */
import _ from 'lodash';
import View from './View';
import FactoryFactory from 'frontend-factory';

/**
 * @todo document
 * @class ObjectWithView
 * @type {Factory}
 */
const ObjectWithView = FactoryFactory({

  defaults() {
    return {
      security: [],
      data: []
    }
  },

  validate: [
    {
      name: 'string'
    },
    'director',
    'view',
    (options) => {
      if (!(options.holder || options.$holder || options.el)) {
        throw new Error(`Can't construct ObjectWithView, a holder must be specified.`);
      }

      if (!options.director.options.views[options.view]) {
        throw new Error(`Can't construct ObjectWithView, View with name '${options.view}' is not defined.`);
      }
    }
  ],

  initialize() {
    //noinspection JSUnusedAssignment
    _.extend(this, _.omit(this.options, _.keys(ObjectWithView.prototype).push('view')));
    this.view = View(makeViewOptions(this.options));
    this.view.owner = this;
  },

  prototype: {

    /**
     * @todo document
     * @returns {*}
     */
    get holder() {
      if (this.view) {
        return this.view.holder;
      }
    },

    /**
     * @todo document
     * @returns {*}
     */
    get $holder() {
      if (this.view) {
        return this.view.$holder;
      }
    },

    /**
     * @todo document
     * @returns {*}
     */
    get el() {
      if (this.view) {
        return this.view.el;
      }
    },

    /**
     * @todo document
     * @returns {*}
     */
    get $el() {
      if (this.view) {
        return this.view.$el;
      }
    },

    /**
     * Renders the {@link View}
     *
     * @method render
     * @memberof ObjectWithView
     * @instance
     *
     * @param req {Object} Data to merge req with used for the middleware
     * @param res {Object} Data to merge res with used for the middleware and, when middleware has finished, as data for the template
     * @param {Boolean} [replace=false] Indicates the current data should be replaced instead of being extended (merged) with the data passed in.
     *
     * @returns {Promise}
     *
     * @example
     * view.render({
     *   user: {
     *     name: 'bob'
     *   }
     * }).then(() => {
     *   // do something
     * });
     */
    render(req = {}, res = {}, replace = false) {
      return this.view.render(req, res, replace);
    },

    /**
     * Syncs data to the {@link View}, data will be merged into the current data unless the replace argument is set to true.
     *
     * @method sync
     * @memberof ObjectWithView
     * @param data {Object} The data that has to be synced to the view.
     * @param {Boolean} [replace=false] Indicates the current data should be replaced instead of being extended (merged) with the data passed in.
     *
     * @returns {Promise}
     *
     * @example
     * view.sync({
     *   user: {
     *     name: 'bob'
     *   }
     * }).then(() => {
     *   // do something
     * });
     */
    sync(data = {}, replace = false) {
      return this.view.sync(data, replace);
    },

    /**
     * Hides the {@link View}
     *
     * @method hide
     * @memberof ObjectWithView
     * @instance
     * @example
     * view.hide();
     */
    hide() {
      this.view.hide();
    },

    /**
     * Shows the {@link View}
     *
     * @method show
     * @memberof ObjectWithView
     * @instance
     *
     * @example
     * view.show();
     */
    show() {
      this.view.show();
    },

    /**
     * Removes the {@link View}
     *
     * @method remove
     * @memberof ObjectWithView
     * @instance
     *
     * @example
     * view.remove();
     */
    remove() {
      this.view.remove();
    }

  }

});

function makeViewOptions(options = {}) {
  const viewImpl = _.defaults(options.director.options.views[options.view], options.director.View.defaults);
  const viewOptions = _.clone(viewImpl);

  _.extend(viewOptions, _.defaults({}, options, viewOptions, {
    security: [],
    data: []
  }));

  if (Array.isArray(viewImpl.security)) {
    viewOptions.security.push.apply(viewOptions.security, viewImpl.security);
  }

  if (Array.isArray(viewImpl.data)) {
    viewOptions.data.push.apply(viewOptions.data, viewImpl.data);
  }

  return viewOptions;
}

export default ObjectWithView;