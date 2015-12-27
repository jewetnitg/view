import _ from 'lodash';
// WebStorm bug
//noinspection JSDuplicatedDeclaration
import ensure from '../helpers/ensure';
import FactoryFactory from 'frontend-factory';
import Adapter from './Adapter';

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
    'name',
    'template',
    'holder',
    'adapter',
    {
      'adapter': 'string'
    },
    (options = {}) => {
      // this will throw an error if the adapter does not exist
      Adapter.ensure(options.adapter);

      if (!(options.holder && typeof options.holder === 'string')) {
        throw new Error(`Can't construct view, no holder specified`);
      }

      if (!(options.holder && document.querySelectorAll(options.holder).length)) {
        throw new Error(`Can't construct view, holder not found in DOM`);
      }
    }
  ],

  initialize() {
    Object.assign(this,
      {
        data: {}
      },
      this.options,
      {
        adapter: Adapter.ensure(this.options.adapter),
        subViews: {},
        holder: typeof this.options.holder === 'string'
          ? document.querySelector(this.options.holder)
          : this.options.holder,
        _private: {
          elCssDisplay: null
        }
      }
    );
    View.views[this.options.name] = View.views[this.options.name] || [];
    View.views[this.options.name].push(this);

    if (!View.viewOptions[this.options.name]) {
      View.viewOptions[this.options.name] = this.options;
    }
  },

  prototype: {

    /**
     * @todo document
     * @param options
     * @constructor
     */
    SubView(options = {}) {
      options.parentView = this;
      // circular dependency workaround
      return View.SubView(options);
    },

    /**
     * Hides the {@link View}
     * @method hide
     * @memberof View
     * @instance
     */
    hide() {
      if (this.el) {
        this.el.style.display = 'none';
      }
    },

    /**
     * Shows the {@link View}
     * @method show
     * @memberof View
     * @instance
     */
    show() {
      if (this.el) {
        this._private.elCssDisplay = this._private.elCssDisplay === 'none' ? 'block' : this._private.elCssDisplay;

        this.el.style.display = this._private.elCssDisplay;
      }
    },

    /**
     * Creates the HTML for an element and appends it to the holder, if the element already exists, this method reverts to {@link View#sync}, unless the force parameter is set to true
     *
     * @method render
     * @memberof View
     * @instance
     *
     * @param data {Object} Data to pass to the template
     * @param [force=false] {Boolean} Forces a render when normally {@link View#sync} would be used.
     * @param {Boolean} [replaceData=false] Indicates the params should be replaced.
     * @param {Boolean} [forceSubViews=false] Same as force, but for {@link SubView}s
     * @param {Boolean} [replaceSubViewData=false] Same as replaceData, but for {@link SubView}s
     */
    render(data = {}, force = false, replaceData = false, forceSubViews = false, replaceSubViewData = false) {
      if (!this._rendered || force === true) {
        mergeIntoData.call(this, data, replaceData);
        let el = this.el && force !== true ? this.el : null;

        this.el = this.adapter.render(this, this.data, el);

        if (this.adapter.events === true) {
          this.adapter.bindEvents(this);
        }

        this._private.elCssDisplay = this.el.style.display;
        this._rendered = true;

        renderSubViews.call(this, data, forceSubViews, replaceSubViewData);
      } else {
        this.sync(data, replaceData)
      }

      this.show();
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
      mergeIntoData.call(this, data, replaceData);

      this.adapter.sync(this, this.data);

      if (this.adapter.rebindEventsAfterSync && this.adapter.events === true) {
        this.adapter.bindEvents(this);
      }

      _.each(this.subViews, (subView) => {
        subView.sync(data, replaceData)
      });
    },

    /**
     * Removes the {@link View}
     *
     * @method remove
     * @memberof View
     * @instance
     */
    remove() {
      if (this._rendered) {
        this.adapter.remove(this);
        this._rendered = false;
        this.el = null;

        _.each(this.subViews, (subView) => {
          subView.remove();
        });
      }
    }

  }

});

/**
 * @todo document
 */
View.viewOptions = {};
/**
 * @todo document
 */
View.views = {};

/**
 * @todo document
 * @param options
 */
View.ensure = function (options = {}) {
  return ensure('View', View.viewOptions, View, options);
};

/**
 * @todo document
 * @param options
 */
View.register = function (options = {}) {
  _.defaults(options, View.defaults);
  // @todo uncomment once implemented in Factory
  //Factory.validate(View.validate, options)
  return View.viewOptions[options.name] = options;
};

function renderSubViews(data, force, replaceData = false) {
  ensureSubViews.call(this);

  _.each(this.subViews, (subView) => {
    if (typeof subView.options.holder === 'string') {
      subView.view.holder = this.el.querySelector(subView.options.holder) || this.el;
    }

    subView.render(data, force, replaceData);
  });
}

function ensureSubViews() {
  _.each(this.options.subViews, (options = {}, name) => {
    options.name = options.name || name;
    if (options.name && !this.subViews[options.name]) {
      this.SubView(options);
    }
  });
}

function mergeIntoData(...data) {
  const replaceData = data.pop();
  const args = data;

  if (typeof replaceData === 'boolean') {
    if (replaceData) {
      this.data = {};
    }
  } else {
    args.push(replaceData);
  }

  args.unshift(this.data);

  return _.merge.apply(data, args);
}

export default View;