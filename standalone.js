import {
  View,
  SubView,
  Adapter,
  ObjectWithView,
  riotAdapter,
  reactAdapter,
  handlebarsAdapter
} from './index';

import riot from 'riot';

if (typeof window.define == 'function' && window.define.amd) {
  window.define('View', function () {
    return View;
  });
  window.define('Adapter', function () {
    return Adapter;
  });
  window.define('ObjectWithView', function () {
    return ObjectWithView;
  });
  window.define('riotAdapter', function () {
    return riotAdapter;
  });
  window.define('reactAdapter', function () {
    return reactAdapter;
  });
  window.define('handlebarsAdapter', function () {
    return handlebarsAdapter;
  });
  window.define('riot', function () {
    return riot;
  });
} else {
  window['View'] = View;
  window['Adapter'] = Adapter;
  window['riotAdapter'] = riotAdapter;
  window['reactAdapter'] = reactAdapter;
  window['handlebarsAdapter'] = handlebarsAdapter;
  window.riot = riot;
}

export default index;