/**
 * @author rik
 */
import _ from 'lodash';
import AdapterValidator from '../validators/Adapter';

/**
 * The {@link Adapter} class serves to abstract the actual rendering of {@link View}s.
 * A {@link View} uses an {@link Adapter} to create its HTML.
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
function Adapter(options = {}) {
  _.defaults(options, {
    rebindEventsAfterSync: true,
    events: true,
    render: Adapter.prototype.render,
    sync: Adapter.prototype.sync,
    remove: Adapter.prototype.remove
  });

  AdapterValidator.construct(options);

  const adapter = Adapter.adapters[options.name] = Object.create(Adapter.prototype);

  _.extend(adapter, options);
  adapter.options = options;

  return adapter;
}

Adapter.adapters = {};

Adapter.emptyTag = function (tagName) {
  return `<${tagName}></${tagName}>`;
};

Adapter.prototype = {

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