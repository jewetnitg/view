/**
 * @author rik
 */
import _ from 'lodash';
import $ from 'jquery';
import ObjectWithView from './ObjectWithView';

/**
 * @todo document
 * @class SubView
 * @extends ObjectWithView
 */
const SubView = ObjectWithView.extend({

  validate: [
    'parentView',
    {'holder': 'string'},
    (options) => {
      if (options.parentView.subViews[options.name]) {
        throw new Error(`Can't construct SubView, SubView with name '${options.name}' already defined.`);
      }
    }
  ],

  prototype: {

    /**
     * holder selector in the context of the parentView of this {@link SubView}
     * @todo document
     * @type jQuery
     * @name $holder
     * @memberof SubView
     * @instance
     */
    get $holder() {
      if (this.holder && this.parentView) {
        return $(this.holder, this.parentView.el);
      }
    }

  }

});

export default SubView;