/**
 * @author rik
 */
import _ from 'lodash';
import ObjectWithView from './ObjectWithView';

const StaticView = ObjectWithView.extend({

  validate(options) {
    if (options.director.staticViews[options.name]) {
      throw new Error(`Can't construct StaticView, StaticView with name '${options.name}' already defined.`);
    }
  }

});

export default StaticView;