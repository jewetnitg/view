// @todo refactor out
function ensure(name = "", list = {}, factory, options = {}, existing = {}, constructor) {
  if (typeof options === 'string') {
    if (existing[options]) {
      return existing[options];
    }

    const opts = list[options];

    if (!opts) {
      throw new Error(`Can't ensure '${options}' ${name}, ${name} not defined.`);
    }

    return factory(opts);
  } else if (constructor && options instanceof constructor) {
    return options;
  } else if (options instanceof factory) {
    return options;
  } else if (!Array.isArray(options) && typeof options === 'object') {
    return factory(options);
  }
}

export default ensure;