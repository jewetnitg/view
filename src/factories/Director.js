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
import ensureView from '../helpers/ensureView';
import ensureStaticViews from '../helpers/ensureStaticViews';

// provided adapters
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

  validate() {
    // @todo implement validation? do we need validation?
  },

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
      //noinspection JSPrimitiveTypeWrapperUsage
      react.React = this.options.libraries.react;
    }

    if (this.options.libraries['react-dom']) {
      //noinspection JSPrimitiveTypeWrapperUsage
      react.ReactDOM = this.options.libraries['react-dom'];
    }

    this.middleware = MiddlewareRunner({
      security: {
        middleware: this.options.middleware.security
      },
      data: {
        sync: this.sync.bind(this),
        res: true,
        //reqFactory: RequestFactoryFactory(this.session),
        //resFactory: DataResponseFactoryFactory(this),
        middleware: this.options.middleware.data
      }
    });

    // get options for Views
    this.viewOptions = {};

    // @todo refactor out, replace with ensure
    _.each(this.options.adapters, (adapterOptions, viewName) => {
      adapterOptions.name = adapterOptions.name || viewName;
      this.Adapter(adapterOptions);
    });

    // @todo refactor out, replace with ensure
    _.each(this.options.views, (viewOptions, viewName) => {
      viewOptions.name = viewOptions.name || viewName;
      viewOptions.director = this;
      this.viewOptions[viewOptions.name] = viewOptions;
    });
  },

  prototype: {

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
        this.viewOptions[options.name] = this.viewOptions[options.name] || view;
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
     * @param data
     * @todo refactor to ensure
     */
    setComposition(options = {}, data = {}) {
      if (!Array.isArray(options) && typeof options === 'object') {
        const promises = [];

        if (options.view) {
          promises.push(
            this.setCurrentView(options.view, data)
          );
        }

        if (options.staticViews) {
          promises.push(
            this.setStaticViews(options.staticViews, data)
          );
        }

        return Promise.all(promises);
      } else if (typeof object === 'string') {
        const composition = this.compositions[options];

        if (!composition) {
          throw new Error(`Can't set composition, composition '${options}' not defined.`);
        }

        return this.setComposition(composition, data);
      }
    },

    /**
     * @todo implement
     */
    ensureStaticView() {
      throw new Error(`Not yet implemented`);
    },

    /**
     * @todo implement
     */
    ensureView() {
      throw new Error(`Not yet implemented`);
    },

    /**
     *
     * @param view
     * @param data
     *
     * @todo implement data
     */
    setCurrentView(view = {}, data = {}) {
      this.hideCurrentView();
      // refactor to Director#ensureView
      this.currentView = ensureView(view, this.viewOptions, this.View.bind(this));

      return this.currentView.render(data)
        .then(() => {
          this.currentView.show();
        });
    },

    /**
     *
     * @param staticViews
     * @param data
     *
     * @todo implement data
     */
    setStaticViews(staticViews = [], data = {}) {
      const promises = [];
      this.hideStaticViews();
      this.currentStaticViews = {};

      // @todo refactor to Director#ensureStaticView and call in the loop below
      ensureStaticViews.call(this, staticViews, this.options.staticViews, this.staticViews, this.StaticView.bind(this));

      _.each(staticViews, (staticViewName) => {
        const staticView = this.staticViews[staticViewName];

        if (!staticView) {
          throw new Error(`StaticView with name '${staticViewName}' not defined`);
        }

        const promise = staticView.render(data)
          .then(() => {
            staticView.show();
          });

        promises.push(promise);

        this.currentStaticViews[staticViewName] = staticView;
      });

      return Promise.all(promises);
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
      const promises = [];

      if (this.currentView) {
        promises.push(
          this.currentView.sync(data)
        );
      }

      if (this.currentStaticViews) {
        _.each(this.currentStaticViews, (staticView) => {
          promises.push(
            staticView.sync(data)
          );
        });
      }

      return Promise.all(promises);
    }

  }

});

export default Director;