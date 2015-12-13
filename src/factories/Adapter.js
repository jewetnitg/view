/**
 * @author rik
 */
import _ from 'lodash';

/**
 * The {@link Adapter} class serves to abstract the actual rendering of {@link View}s.
 * A {@link View} uses an {@link Adapter} to create its HTML.
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property name {String}
 * @property {Boolean} [wrap=true]
 * @property {Boolean} [rebindEventsAfterSync=true]
 * @property {Boolean} [events=true]
 * @property makeHtml {Function<String>}
 * @property [initializeEl=Adapter#initializeEl] {Function<HTMLElement>}
 * @property [sync=Adapter#sync] {Function}
 * @property [remove=Adapter#remove] {Function}
 *
 * @class Adapter
 */
function Adapter(options = {}) {
  _.defaults(options, {
    wrap: true,
    rebindEventsAfterSync: true,
    events: true,
    initializeEl: Adapter.prototype.initializeEl,
    sync: Adapter.prototype.sync,
    remove: Adapter.prototype.remove
  });

  if (!options.name || typeof options.name !== 'string') {
    throw new Error(`Can't construct Adapter, no or invalid name provided.`);
  }

  if (!options.makeHtml || typeof options.makeHtml !== 'function') {
    throw new Error(`Can't construct Adapter, no or invalid render method.`);
  }

  const props = {

    name: {
      value: options.name
    },

    wrap: {
      value: options.wrap
    },

    makeHtml: {
      value: options.makeHtml
    },

    initializeEl: {
      value: options.initializeEl
    },

    sync: {
      value: options.sync
    },

    remove: {
      value: options.remove
    }

  };

  return Adapter.adapters[options.name] = Object.create(Adapter.prototype, props);
}

Adapter.adapters = {};

Adapter.emptyTag = function (tagName) {
  return `<${tagName}></${tagName}>`;
};

Adapter.prototype = {

  /**
   * Called after the element has been appended to the DOM.
   * May be overridden by providing an initializeEl function in the options when constructing an {@link Adapter}.
   *
   * @method initializeEl
   * @memberof Adapter
   * @instance
   *
   * @param view {View} Instance of the {@link View} this element belongs to.
   * @param $el {jquery} The element to initialize wrapped in jQuery.
   * @param data {Object} The data to initialize the {@link View} / element with.
   *
   * @returns {HTMLElement}
   */
  initializeEl(view, $el, data) {
    // fallback, initializeEl may be overridden
    return $el[0];
  },

  /**
   * Must be provided in the options when constructing an {@link Adapter}, makes the HTML for a {@link View} according to the data provided.
   *
   * @method makeHtml
   * @memberof Adapter
   * @instance
   * @abstract
   *
   * @param view {View} View for which to create HTML
   * @param data {Object} Data to fill the {@link View}s html with
   *
   * @returns {String} The html with the provided data applied to it for the {@link View}.
   */
  makeHtml(view, data) {
    // abstract, should be implemented
    return "";
  },

  /**
   * In charge of syncing data for a {@link View}, by default it removes the {@link View}s current $el and creates a new one with the data provided.
   * May be overridden by providing a sync function in the options when constructing an {@link Adapter}.
   *
   * @method sync
   * @memberof Adapter
   * @instance
   *
   * @param view
   * @param data
   */
  sync(view, data = {}) {
    // fallback, sync should really be overridden
    this.remove(view);
    view.render(data, true);
  },

  /**
   * Removes the $el of a {@link View} from the DOM.
   *
   * @method remove
   * @memberof Adapter
   * @instance
   *
   * @param view {View} The {@link View} that should be removed from the DOM.
   */
  remove(view) {
    // fallback, remove may be overridden
    view.$el.remove();
    view.$el = null;
    view.el = null;
  }

};

export default Adapter;