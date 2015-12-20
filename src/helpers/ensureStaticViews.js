import ensure from './ensure';

function ensureStaticViews(staticViewNames = [], staticViews, dst = {}, factory) {
  staticViewNames = typeof staticViewNames === 'string' ? [staticViewNames] : staticViewNames;

  _.each(staticViewNames, (staticViewName) => {
    dst[staticViewName] = ensure('StaticView', staticViews, factory, staticViewName, dst);
  });
}

export default ensureStaticViews;