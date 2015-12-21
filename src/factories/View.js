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
    adapter: 'riot',
    tagName: 'div'
  },

  validate: [
    'template',
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
     * @param data {Object} Data to be made available to the riot tag
     * @param [force=false] {Boolean} Whether to force a render, by default if already rendered, render reverts to {@link View#sync}.
     * @param {Boolean} [replaceData=false] Indicates the data should be replaced
     *
     */
    render(data = {}, force = false, replaceData = false) {
      if (!this._rendered || force === true) {
        return this.runMiddleware(data)
          .then((middlewareData) => {
            return handleMiddlewareResolveForViewRender.call(this, data, middlewareData, force, replaceData);
          }, (err) => {
            return handleMiddlewareRejectForViewRender.call(this, err, data)
          });
      } else {
        return this.sync(data, replaceData)
          .then(() => {
            this.show();
          });
      }
    },

    /**
     * @todo document
     * @param data
     */
    runMiddleware(data = {}) {
      return this.options.director.middleware.security.run(this.security, data)
        .then(() => {
          return this.options.director.middleware.data.run(this.data, data, this.sync.bind(this))
            .then(null, (err) => {
              // data failed
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
     * @todo decide whether we want to re-run middleware when syncing
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

          if (this.adapter.rebindEventsAfterSync) {
            if (this.adapter.events === true) {
              this.adapter.bindEvents(this);
            }
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

function ensureSubViews() {
  _.each(this.options.subViews, (options = {}, name) => {
    options.name = options.name || name;

    if (!this.subViews[options.name]) {
      this.SubView(options);
    }
  });
}

// @todo pass params
function renderSubViews(data, force, replaceData = false) {
  const promises = [];

  ensureSubViews.call(this);

  _.each(this.subViews, (subView) => {
    promises.push(
      subView.render(data, force, replaceData)
    );
  });

  return Promise.all(promises);
}

function syncSubViews(data, replaceData = false) {
  const promises = [];

  _.each(this.subViews, (subView) => {
    promises.push(
      subView.sync(data, replaceData)
    );
  });

  return Promise.all(promises);
}

function mergeIntoData(...data) {
  const replaceData = data.pop();
  const args = data;

  if (replaceData === true) {
    this._data = {};
  }

  args.unshift(this._data);

  _.merge.apply(data, args);
}

function handleMiddlewareResolveForViewRender(data, middlewareData, force, replaceData = false) {
  mergeIntoData.call(this, data, middlewareData, replaceData);
  let $el;

  if (this.el && force !== true) {
    $el = $(this.el);
  }

  this.el = this.adapter.render(this, data, $el);

  if (this.adapter.events === true) {
    this.adapter.bindEvents(this);
  }

  this._rendered = true;

  return renderSubViews.call(this, data, force, replaceData);
}

function handleMiddlewareRejectForViewRender(err, data) {
  this.hide();

  switch (err.reason) {
    case 'security':
      // it is ok for security to reject, in this case we are not allowed to see this View
      break;
    case 'data':
      // log for tech support
      console.error(`Data middleware failed for View '${this.name}'.`, this, data, err);
      break;
    default:
      // throw log for tech support / bugs
      throw err;
      break;
  }
}

export default View;