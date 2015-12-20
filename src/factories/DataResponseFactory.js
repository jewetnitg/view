/**
 * @author rik
 */
import _ from 'lodash';

function DataResponseFactoryFactory(director) {
  function DataResponseFactory() {
    const _destruct = [];
    return {
      set destruct(val) {
        if (typeof val === 'function') {
          _destruct.push(val);
        }
      },

      get destruct() {
        return _destruct;
      },

      sync(data) {
        view.sync(data);
      }
    };
  }

  return DataResponseFactory;
}


export default DataResponseFactoryFactory;