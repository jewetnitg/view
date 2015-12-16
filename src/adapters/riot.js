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
const riotAdapter = Adapter({

  name: 'riot',

  render(view, data = {}, $el) {
    const html = Adapter.emptyTag(view.template);

    if (!$el) {
      $el = $(html);
      $el.appendTo(view.$holder);
    }

    view.tagInstance = riotAdapter.riot.mount($el[0], view.template, data)[0];
    return view.tagInstance.root;
  },

  sync(view, data = {}) {
    view.tagInstance.update(data);
  },

  remove(view) {
    // @todo what do we do with the keepTheParent parameter
    view.tagInstance.unmount();
    view.$el.remove();
  }

});

riotAdapter.riot = riot;

export default riotAdapter;