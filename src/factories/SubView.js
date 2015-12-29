/**
 * @author rik
 */
import _ from 'lodash';
import ObjectWithView from './ObjectWithView';
import View from './View';

/**
 * @todo document
 * @class SubView
 * @extends ObjectWithView
 */
const SubView = ObjectWithView.extend({

  validate: [
    'parentView',
    'name',
    'holder',
    (options) => {
      if (options.parentView.subViews[options.name]) {
        throw new Error(`Can't construct SubView, SubView with name '${options.name}' already defined.`);
      }
    }
  ],

  initialize() {
    this.options.parentView.subViews[this.options.name] = this;
  }

});

/**
 * @todo document
 * @param view {View}
 * @param options {undefined|Object|String}
 */
SubView.ensure = function (view, options) {
  if (!(view instanceof View)) {
    throw new Error(`first argument must be a View`);
  }

  if (options) {
    if (typeof options === 'object') {
      if (!view.subViews[options.name]) {
        options.parentView = view;
        SubView(options);
      }
    } else if (typeof options === 'string') {
      const subView = _.get(view.options.subViews, options);

      if (!subView) {
        throw new Error(`Can't ensure SubView '${options}', SubView not defined on View '${view.options.name}'`);
      }

      SubView.ensure(view, subView);
    }
  } else {
    _.each(view.options.subViews, (subView, name) => {
      subView.name = subView.name || name;
      SubView.ensure(view, subView);
    });
  }
};

/**
 * @todo document
 * @param view
 * @param data
 * @param force
 */
SubView.render = function (view, data, force = false) {
  if (!(view instanceof View)) {
    throw new Error(`first argument must be a View`);
  }

  SubView.ensure(view);

  _.each(view.subViews, (subView) => {
    if (typeof subView.options.holder === 'string') {
      subView.view.holder = view.el.querySelector(subView.options.holder) || view.el;
    }

    subView.render(data, force);
  });
};

export default SubView;