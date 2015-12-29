/**
 * @author rik
 */
import _ from 'lodash';
import FactoryFactory from 'frontend-factory';
// WebStorm bug
//noinspection JSDuplicatedDeclaration
import ensure from '../helpers/ensure';

/**
 * The {@link Adapter} class serves to abstract the actual rendering of {@link View}s.
 * A {@link View} uses an {@link Adapter} to create its HTML, append it to the DOM and listen for events.
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property name {String}
 * @property {Boolean} [rebindEventsAfterSync=true]
 * @property {Boolean} [events=true]
 * @property render {Function<HTMLElement>}
 * @property [sync=Adapter#sync] {Function}
 * @property [remove=Adapter#remove] {Function}
 *
 * @class Adapter
 */
const Adapter = FactoryFactory({

  defaults: {
    rebindEventsAfterSync: false,
    viewDefaults: {},
    events: false
  },

  validate: [
    {
      name: 'string',
      render: 'function'
    },
    (options) => {
      if (Adapter.adapters[options.name]) {
        throw new Error(`Can't construct Adapter, Adapter with name '${options.name}' already exists.`);
      }
    }
  ],

  initialize() {
    _.extend(this, this.options);
    Adapter.adapters[this.name] = this;
  },

  prototype: {

    /**
     * In charge of syncing data for a {@link View}, by default it removes the {@link View}s current el and creates a new one with the data provided.
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
      this.render(view, data, view.el);
    },

    /**
     * Removes the el of a {@link View} from the DOM.
     *
     * @method remove
     * @memberof Adapter
     * @instance
     *
     * @param view {View} The {@link View} that should be removed from the DOM.
     */
    remove(view) {
      // fallback, remove may be overridden
      view.el.parentNode.removeChild(view.el);
    },

    /**
     * @todo document
     * @param view
     * @param event
     * @param eventHandler
     * @param selector
     */
    bindEvent(view, event, eventHandler, selector) {
      if (view.el) {
        const el = selector ? view.el.querySelector(selector) : view.el;

        if (!el) {
          throw new Error(`Can't bind '${event}' event listener, element not found.`);
        }

        el.addEventListener(event, eventHandler);
      }
    },

    /**
     * @todo document
     * @param view
     */
    bindEvents(view) {
      _.each(view.events, (eventHandler, eventAndSelector) => {
        const eventHandlerFn = typeof eventHandler === 'string' ? _.get(view, eventHandler) : eventHandler;

        if (typeof eventHandlerFn !== 'function') {
          if (typeof eventHandler === 'string') {
            throw new Error(`Can't bind event listener ${eventAndSelector} with event handler ${eventHandler}, eventHandler not defined on view`);
          }

          throw new Error(`Can't bind event listener ${eventAndSelector} invalid or no eventHandler provided`);
        }

        const [event, selector] = (() => {
          const splitEventAndSelector = eventAndSelector.split(' ');
          return [splitEventAndSelector.shift(), splitEventAndSelector.join(' ')];
        })();

        this.bindEvent(view, event, eventHandlerFn, selector);
      });
    }
  }

});

/**
 * @todo document
 * @type Object
 */
Adapter.adapters = {};

/**
 * @todo document
 * @todo refactor out ensure
 * @name ensure
 * @memberof Adapter
 * @static
 * @param options {Object}
 */
Adapter.ensure = function (options = {}) {
  return ensure('Adapter', Adapter.adapters, Adapter, options, Adapter.adapters);
};

export default Adapter;