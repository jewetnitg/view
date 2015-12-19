import View from './src/factories/View';

// register provided adapters
// @todo create lodash adapter
// @todo create ejs adapter
// @todo create polymer adapter
import './src/adapters/riot';
import './src/adapters/react';
import './src/adapters/handlebars';

export default View;