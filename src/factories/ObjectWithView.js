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

  defaults: {},

  validate: [
    'view',
    (options) => {
      if (!View.viewOptions[options.view]) {
        throw new Error(`Can't construct ObjectWithView, View with name '${options.view}' is not defined.`);
      }
    }
  ],

  initialize() {
    //noinspection JSUnusedAssignment
    const toBeOmittedKeys = _.keys(ObjectWithView.prototype);
    toBeOmittedKeys.push('view');

    _.extend(this, _.omit(this.options, toBeOmittedKeys));

    // @todo document
    this.view = View(makeViewOptions(this.options));
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
    get el() {
      if (this.view) {
        return this.view.el;
      }
    },

    /**
     * Renders the {@link View}
     *
     * @method render
     * @memberof ObjectWithView
     * @instance
     *
     * @param data {Object} Data to render the View with
     * @param {Boolean} [force=false] Indicates the render should be forced, normally rendering a rendered View reverts to syncing it.
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
    render(data = {}, force = false) {
      return this.view.render(data, force);
    },

    /**
     * Syncs data to the {@link View}, data will be merged into the current data
     *
     * @method sync
     * @memberof ObjectWithView
     * @param data {Object} The data that has to be synced to the view.
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
    sync(data = {}) {
      this.view.sync(data);
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
  const viewImpl = _.defaults(View.viewOptions[options.view], View.defaults);
  // clone so we don't change the original
  const viewOptions = _.clone(viewImpl);

  Object.assign(viewOptions, _.defaults({
    holder: options.holder,
    el: options.el
  }, viewOptions));

  return viewOptions;
}

export default ObjectWithView;