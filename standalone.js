/**
 * @author rik
 */
import index from './index';

const globalName = 'View';

if (typeof window.define == 'function' && window.define.amd) {
  window.define(globalName, function () {
    return index;
  });
  window.define('riot', function () {
    return index.riot;
  });
} else {
  window[globalName] = index;
  window.riot = index.riot;
}

export default index;