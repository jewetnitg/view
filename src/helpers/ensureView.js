import ensure from './ensure';

function ensureView(view = {}, views = {}, factory) {
  return ensure('View', views, factory, view);
}

export default ensureView;