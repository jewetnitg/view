/**
 * @author rik
 */
import React from 'react';
import ReactDOM from 'react-dom';

/**
 *
 * @name reactAdapter
 * @extends Adapter
 */
const reactAdapter = {

  name: 'react',

  viewDefaults: {
    holder: '.current-view > .react'
  },

  render(view, data = {}, el) {
    if (el) {
      el.parentNode.removeChild(el);
    }

    this.sync(view, data);

    return view.el;
  },

  sync(view, data = {}) {
    view.reactElement = reactAdapter.React.createElement(view.template, data);
    view.el = reactAdapter.ReactDOM.findDOMNode(reactAdapter.ReactDOM.render(view.reactElement, view.holder));
  },

  remove(view) {
    view.reactElement = null;
    reactAdapter.ReactDOM.unmountComponentAtNode(view.$el.parent()[0]);
  }

};

reactAdapter.React = React;
reactAdapter.ReactDOM = ReactDOM;

export default reactAdapter;