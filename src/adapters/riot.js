/**
 * @author rik
 */
import riot from 'riot/riot+compiler';

import Adapter from '../factories/Adapter';

/**
 *
 * @name riotAdapter
 * @extends Adapter
 */
const riotAdapter = {

  name: 'riot',

  render(view, data = {}, el) {
    let template = view.template;

    if (typeof template === 'function') {
      template = view.template(data);
    }

    if (!template) {
      throw new Error(`Can't render View ${view.name}, no template provided.`);
    }

    if (typeof template !== 'string') {
      throw new Error(`Can't render View ${view.name}, template should be a string or a function that returns a string.`);
    }

    if (!el) {
      el = document.createElement(template);
      view.holder.appendChild(el);
    }

    view.tagInstance = riotAdapter.riot.mount(el, template, data)[0];
    return view.tagInstance.root;
  },

  sync(view, data = {}) {
    view.tagInstance.update(data);
  },

  remove(view) {
    view.tagInstance.unmount(true);
    view.el.parentNode.removeChild(view.el);
  }

};

riotAdapter.riot = riot;

export default riotAdapter;