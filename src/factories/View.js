import _ from 'lodash';
import $ from 'jquery';
import riot from 'riot/riot+compiler';
import FactoryFactory from 'frontend-factory';

/**
 * @class View
 *
 * @param options {Object} Object containing the properties listed below
 *
 * @property el {HTMLElement} Html element that is the (pre-rendered) element of this view
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property template {*} Type varying on the chosen adapter, if the adapter allows for template to be a function, it can be used to use a different template depending on the data passed in
 *
 */
const View = FactoryFactory({

  defaults: {
    holder: 'body',
    adapter: 'riot'
  },

  validate: [
    'template',
    'holder',
    'adapter',
    'director',
    {
      'adapter': 'string'
    },
    (options = {}) => {
      if (!options.director.adapters[options.adapter]) {
        throw new Error(`Can't construct view, adapter ${options.adapter} doesn't exist`);
      }

      if (!(options.holder && typeof options.holder === 'string') && !(options.$holder && options.$holder.length)) {
        throw new Error(`Can't construct view, no holder specified`);
      }

      if (!(options.holder && $(options.holder).length) && !(options.$holder && options.$holder.length)) {
        throw new Error(`Can't construct view, holder not found in DOM`);
      }
    }
  ],

  initialize() {
    _.extend(this, _.omit(this.options, ['$el']));

    this.adapter = this.options.director.adapters[this.options.adapter];
    this._data = {};
    this.subViews = {};
  },

  prototype: {

    /**
     * The root element wrapped in jQuery
     * @name $el
     * @memberof View
     * @instance
     * @type jQuery|null
     */
    get $el() {
      return this.el ? $(this.el) : null;
    },

    /**
     * The holder wrapped in jQuery
     * @name $holder
     * @memberof View
     * @instance
     * @type jQuery
     */
    get $holder() {
      return $(this.holder);
    },

    /**
     * @todo document
     * @param options
     * @constructor
     */
    SubView(options = {}) {
      options.parentView = this;
      delete options.$holder;
      return this.subViews[options.name] = this.options.director.SubView(options);
    },

    /**
     * Hides the {@link View}
     * @method hide
     * @memberof View
     * @instance
     */
    hide() {
      if (this.$el) {
        this.$el.hide();
      }
    },

    /**
     * Shows the {@link View}
     * @method show
     * @memberof View
     * @instance
     */
    show() {
      if (this.$el) {
        this.$el.show();
      }
    },

    /**
     * Creates the HTML for an element and appends it to the holder, if the element already exists, this method reverts to {@link View#sync}, unless the force parameter is set to true
     *
     * @method render
     * @memberof View
     * @instance
     *
     * @param params {Object} Object the params object used in middleware execution is extended with
     * @param res {Object} Object the res object used in middleware execution is extended with (response data)
     * @param [force=false] {Boolean} Whether to force a render, by default if already rendered, render reverts to {@link View#sync}.
     * @param {Boolean} [replaceData=false] Indicates the params should be replaced
     *
     */
    render(params = {}, res = {}, force = false, replaceData = false) {
      if (!this._rendered || force === true) {
        return this.runMiddleware(params, res)
          .then((middlewareData) => {
            return handleMiddlewareResolveForViewRender.call(this, params, middlewareData, force, replaceData);
          }, (err) => {
            return handleMiddlewareRejectForViewRender.call(this, err, params)
          });
      } else {
        return this.sync(params, replaceData)
          .then(() => {
            this.show();
          });
      }
    },

    /**
     * @todo document
     * @todo refactor?
     * @param params
     * @param res
     */
    runMiddleware(params = {}, res = {}) {
      return this.options.director.middleware.security.run(this.security, params, params)
        .then(() => {
          res.sync = this.sync.bind(this);
          return this.options.director.middleware.data.run(this.data, params, params, res)
            .then(null, (err) => {
              return Promise.reject({
                reason: 'data',
                err
              });
            });
        }, (err) => {
          return Promise.reject({
            reason: 'security',
            err
          });
        });
    },

    /**
     * Syncs data to the template
     *
     * @method sync
     * @memberof View
     * @instance
     *
     * @param data {Object} Data for the riot tag, will be extended with the current data
     * @param {Boolean} [replaceData=false] Indicates the data should be replaced
     */
    sync(data = {}, replaceData = false) {
      return Promise.resolve()
        .then(() => {
          mergeIntoData.call(this, data, replaceData);

          this.adapter.sync(this, this._data);

          if (this.adapter.rebindEventsAfterSync && this.adapter.events === true) {
            this.adapter.bindEvents(this);
          }

          return syncSubViews.call(this);
        });
    },

    /**
     * Removes the {@link View}
     *
     * @method hide
     * @memberof View
     * @instance
     */
    remove() {
      this.adapter.remove(this);
    }

  }

});

function renderSubViews(req, data, force, replaceData = false) {
  ensureSubViews.call(this);
  return Promise.all(
    _.map(this.subViews, (subView) => {
      return subView.render(req, data, force, replaceData);
    })
  );
}

function ensureSubViews() {
  _.each(this.options.subViews, (options = {}, name) => {
    options.name = options.name || name;

    if (!this.subViews[options.name]) {
      this.SubView(options);
    }
  });
}

function syncSubViews(data, replaceData = false) {
  return Promise.all(
    _.map(this.subViews, (subView) => {
      return subView.sync(data, replaceData)
    })
  );
}

function handleMiddlewareResolveForViewRender(req, middlewareData, force, replaceData = false) {
  mergeIntoData.call(this, middlewareData, replaceData);
  let $el = this.el && force !== true ? $(this.el) : null;

  this.el = this.adapter.render(this, this._data, $el);

  if (this.adapter.events === true) {
    this.adapter.bindEvents(this);
  }

  this._rendered = true;

  return renderSubViews.call(this, req, middlewareData, force, replaceData);
}

function mergeIntoData(...data) {
  const replaceData = data.pop();
  const args = data;

  if (replaceData === true) {
    this._data = {};
  }

  args.unshift(this._data);

  return _.merge.apply(data, args);
}

function handleMiddlewareRejectForViewRender(err, data) {
  this.hide();

  if (err.reason === 'data') {
    // log for tech support
    console.error(`Data middleware failed for View '${this.name}'.`, this, data, err);
  } else if (err.reason !== 'security') {
    // throw log for tech support / bugs
    throw err;
  }
}

export default View;