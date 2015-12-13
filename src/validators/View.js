/**
 * @author rik
 */
import $ from 'jquery';
import Adapter from '../factories/Adapter';

const ViewValidator = {

  construct(options = {}) {
    if (options.static && (!options.name || typeof options.name !== 'string')) {
      throw new Error(`Can't construct static view, no name specified`);
    }

    if (!options.template || typeof options.template !== 'string') {
      throw new Error(`Can't construct view, no template specified`);
    }

    if (!options.adapter || typeof options.adapter !== 'string') {
      throw new Error(`Can't construct view, no adapter specified`);
    }

    if (!Adapter.adapters[options.adapter]) {
      throw new Error(`Can't construct view, adapter ${options.adapter} doesn't exist`);
    }

    if (!(options.holder && typeof options.holder === 'string') && !(options.$holder && options.$holder.length)) {
      throw new Error(`Can't construct view, no holder specified`);
    }

    if (!(options.holder && $(options.holder).length) && !(options.$holder && options.$holder.length)) {
      throw new Error(`Can't construct view, holder not found in DOM`);
    }
  }

};

export default ViewValidator;