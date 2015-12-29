import View from './src/factories/View';
import SubView from './src/factories/SubView';
import ObjectWithView from './src/factories/ObjectWithView';
import Adapter from './src/factories/Adapter';

import riotAdapter from './src/adapters/riot';
import reactAdapter from './src/adapters/react';
import handlebarsAdapter from './src/adapters/handlebars';

// circular dependency workaround
View.SubView = SubView;

export {
  View as View,
  SubView as SubView,
  Adapter as Adapter,
  ObjectWithView as ObjectWithView,
  riotAdapter as riotAdapter,
  reactAdapter as reactAdapter,
  handlebarsAdapter as handlebarsAdapter
};

export default View;