import _ from 'lodash';
// WebStorm bug
//noinspection JSDuplicatedDeclaration
import ensure from '../helpers/ensure';
import FactoryFactory from 'frontend-factory';
import Adapter from './Adapter';

/**
 * @class View
 *
 * @todo refactor _privateCssDisplay stuff to a HideableElement factory
 * @param options {Object} Object containing the properties listed below
 *
 * @property el {HTMLElement} Html element that is the (pre-rendered) element of this view
 * @property holder {String} jQuery selector, refers to the element this view should be appended to
 * @property template {*} Type varying on the chosen adapter, if the adapter allows for template to be a function, it can be used to use a different template depending on the data passed in
 *
 */
const View = FactoryFactory({

  /**
   * @todo document
   */
  defaults: {
    holder: 'body',
    adapter: 'riot'
  },

  validate: [
    'name',
    'template',
    {'holder': 'string'},
    'adapter',
    (options = {}) => {
      // this will throw an error if the adapter does not exist
      Adapter.ensure(options.adapter);

      // @todo when this is implemented in frontend-factory remove the line above, and enable this one
      // FactoryFactory.validate(Adapter.validate, options);

      if (!document.querySelector(options.holder)) {
        throw new Error(`Can't construct view, holder not found in DOM.`);
      }
    }
  ],

  initialize() {
    // @todo refactor
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
     * Hides the {@link View}
     * @method hide
     * @memberof View
     * @instance
     */
    hide() {
      if (this._rendered) {
        this._private.elCssDisplay = this.el.style.display || this._private.elCssDisplay || 'block';
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
      if (this._rendered) {
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
     */
    render(data = {}, force = false) {
      if (!this._rendered || force === true) {
        this.set(data);
        let el = this.el && force !== true ? this.el : null;

        this.el = this.adapter.render(this, this.data, el);

        if (this.adapter.events === true) {
          this.adapter.bindEvents(this);
        }

        this._rendered = true;

        View.SubView.render(this, data);
      } else {
        this.sync(data)
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
     */
    sync(data = {}) {
      this.set(data);

      this.adapter.sync(this, this.data);

      if (this.adapter.rebindEventsAfterSync && this.adapter.events === true) {
        this.adapter.bindEvents(this);
      }

      _.each(this.subViews, (subView) => {
        subView.sync(data)
      });
    },

    /**
     * @todo document
     * @param data
     */
    set(data) {
      if (!Array.isArray(data)) {
        data = [data];
      }

      data.unshift(this.data);

      return _.merge.apply(_, data);
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
 * @todo refactor out ensure
 * @param options
 */
View.ensure = function (options = {}) {
  return ensure('View', View.viewOptions, View, options);
};

/**
 * Registers a View so that {@link ObjectWithView} instances (like SubViews) can refer to this view, this doesn't actually construct a {@link View}
 * @todo document
 * @param options
 */
View.register = function (options = {}) {
  _.defaults(options, View.defaults);
  // @todo uncomment once implemented in Factory
  //Factory.defaults(View.validate, options);
  //Factory.validate(View.validate, options);
  return View.viewOptions[options.name] = options;
};

export default View;