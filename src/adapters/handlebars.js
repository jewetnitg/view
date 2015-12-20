/**
 * @author rik
 */
import Handlebars from 'hbsfy/runtime';

/**
 *
 * @name handlebarsAdapter
 * @extends Adapter
 */
const handlebarsAdapter = {

  name: 'handlebars',
  events: true,
  rebindEventsAfterSync: true,

  render(view, data = {}, $el) {
    if ($el) {
      $el.remove();
    }

    this.sync(view, data);

    return view.el;
  },

  sync(view, data = {}) {
    this.remove(view);

    const html = view.template(data);
    const $el = $(html);

    $el.appendTo(view.$holder);

    view.el = $el[0];
  },

  remove(view) {
    if (view.$el) {
      view.$el.remove();
    }
  }

};

handlebarsAdapter.Handlebars = Handlebars;

export default handlebarsAdapter;