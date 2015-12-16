const AdapterValidator = {

  construct(options = {}) {
    if (!options.name || typeof options.name !== 'string') {
      throw new Error(`Can't construct Adapter, no or invalid name provided.`);
    }

    if (!options.makeHtml || typeof options.makeHtml !== 'function') {
      throw new Error(`Can't construct Adapter, no or invalid render method.`);
    }
  }

};

export default AdapterValidator;