/**
 * @author rik
 */
import _ from 'lodash';
import $ from 'jquery';
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
  },

  prototype: {}

});

export default SubView;