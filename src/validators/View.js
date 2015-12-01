/**
 * @author rik
 */
import $ from 'jquery';

const ViewValidator = {

  construct(options = {}) {
    if (!options.tag || typeof options.tag !== 'string') {
      throw new Error(`Can't construct view, no tag specified`);
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