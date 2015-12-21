/**
 * @author rik
 */
import _ from 'lodash';
import MiddlewareRunner from 'frontend-middleware';
import FactoryFactory from 'frontend-factory';

import View from './View';
import SubView from './SubView';
import StaticView from './StaticView';
import ObjectWithView from './ObjectWithView';
import Adapter from './Adapter';
import ensure from '../helpers/ensure';
// provided adapters
// this.ensureStaticView
import react from '../adapters/react';
import riot from '../adapters/riot';
import handlebars from '../adapters/handlebars';

/**
 * @todo document
 * @param options
 * @returns {Director}
 * @constructor
 */
const Director = FactoryFactory({

  defaults() {
    return {
      session: {},
      adapters: {
        react,
        riot,
        handlebars
      },
      middleware: {}
    }
  },

  props: {
    views: {
      value: {}
    },
    viewOptions: {
      value: {}
    },
    adapters: {
      value: {}
    },
    compositions: {
      value: {}
    },
    staticViews: {
      value: {}
    }
  },

  initialize() {
    this.currentView = null;
    this.currentStaticViews = null;

    if (this.options.viewConfig) {
      _.extend(View.defaults, this.options.viewConfig);
    }

    if (this.options.staticViewConfig) {
      _.extend(StaticView.defaults, this.options.staticViewConfig);
    }

    if (this.options.libraries.riot) {
      riot.riot = this.options.libraries.riot;
    }

    if (this.options.libraries.react) {
      react.React = this.options.libraries.react;
    }

    if (this.options.libraries['react-dom']) {
      react.ReactDOM = this.options.libraries['react-dom'];
    }

    MiddlewareRunner.session = this.options.session;

    this.middleware = MiddlewareRunner({
      security: {
        middleware: this.options.middleware.security
      },
      data: {
        sync: this.sync.bind(this),
        res: true,
        middleware: this.options.middleware.data
      }
    });
  },

  prototype: {

    get session() {
      return this.options.session;
    },

    ObjectWithView(options = {}) {
      options.director = this;
      return ObjectWithView(options);
    },

    SubView(options = {}) {
      options.director = this;
      return SubView(options);
    },

    /**
     *
     * @param options
     *
     * @returns {View}
     */
    View(options = {}) {
      options.director = this;

      const view = View(options);

      if (options.name) {
        this.views[options.name] = this.views[options.name] || [];
        this.views[options.name].push(view);
        this.options.views[options.name] = this.options.views[options.name] || view;
      }

      return view;
    },

    /**
     *
     * @param options
     *
     * @returns {StaticView}
     */
    StaticView(options = {}) {
      options.director = this;

      const staticView = StaticView(options);

      if (options.name) {
        this.staticViews[options.name] = this.staticViews[options.name] || staticView;
      }

      return staticView;
    },

    /**
     *
     * @param options
     *
     * @returns Adapter
     */
    Adapter(options = {}) {
      options.director = this;

      const adapter = Adapter(options);

      if (options.name) {
        this.adapters[options.name] = this.adapters[options.name] || adapter;
      }

      return adapter;
    },

    /**
     *
     * @param options
     *
     * @returns {{}}
     */
    Composition(options = {}) {
      if (!options.name) {
        throw new Error(`Can't construct a Composition without a name.`);
      }

      return this.compositions[options.name] = this.compositions[options.name] || options;
    },

    /**
     *
     * @param options
     * @param params
     * @param resExtendObj
     */
    setComposition(options = {}, params = {}, resExtendObj = {}) {
      if (!Array.isArray(options) && typeof options === 'object') {
        return Promise.all([
          options.view ? this.setCurrentView(options.view, params, resExtendObj) : null,
          options.staticViews ? this.setStaticViews(options.staticViews, params, resExtendObj) : null
        ]);
      } else if (typeof options === 'string') {
        const composition = this.compositions[options];

        if (!composition) {
          throw new Error(`Can't set composition, composition '${options}' not defined.`);
        }

        return this.setComposition(composition, params, resExtendObj);
      }
    },

    /**
     * @todo document
     */
    ensureAdapter(adapter) {
      return ensure('Adapter', this.options.adapters, this.Adapter.bind(this), adapter, this.adapters);
    },

    /**
     * @todo document
     */
    ensureView(view) {
      return ensure('View', this.options.views, this.View.bind(this), view);
    },

    /**
     * @todo document
     */
    ensureStaticView(staticViewName) {
      return ensure(
        'StaticView',
        this.options.staticViews,
        this.StaticView.bind(this),
        staticViewName,
        this.staticViews
      );
    },

    /**
     *
     * @param view
     * @param params
     * @param res
     *
     */
    setCurrentView(view = {}, params = {}, res = {}) {
      this.hideCurrentView();
      this.currentView = this.ensureView(view, this.options.views, this.View.bind(this));

      return this.currentView.render(params, res)
        .then(() => {
          this.currentView.show();
        });
    },

    /**
     *
     * @param staticViews
     * @param params
     * @param res
     */
    setStaticViews(staticViews = [], params = {}, res = {}) {
      this.hideStaticViews();
      this.currentStaticViews = {};

      return Promise.all(
        _.map(staticViews, (staticViewName) => {
          const staticView = this.ensureStaticView(staticViewName);

          this.currentStaticViews[staticViewName] = staticView;

          return staticView.render(params, res);
        })
      );
    },

    /**
     *
     */
    hideCurrentView() {
      if (this.currentView) {
        this.currentView.hide();
      }
    },

    /**
     *
     */
    hideStaticViews() {
      _.each(this.currentStaticViews, (staticView) => {
        staticView.hide();
      });
    },

    /**
     * @todo document
     * @param data
     * @returns {Promise}
     */
    sync(data = {}) {
      const currentViewSync = this.currentView && this.currentView.sync(data);
      return Promise.all(
        _.map(this.currentStaticViews, (staticView) => {
          return staticView.sync(data)
        }).concat([currentViewSync])
      );
    }

  }

});

export default Director;