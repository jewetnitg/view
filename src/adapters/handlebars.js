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

  render(view, data = {}, el) {
    if (el) {
      el.parentNode.removeChild(el);
    }

    this.sync(view, data);

    return view.el;
  },

  sync(view, data = {}) {
    this.remove(view);

    const html = view.template(data);

    view.holder.insertAdjacentHTML('afterbegin', html);
    view.el = view.holder.childNodes[0];
  },

  remove(view) {
    if (view.el) {
      view.el.parentNode.removeChild(view.el);
    }
  }

};

handlebarsAdapter.Handlebars = Handlebars;

export default handlebarsAdapter;