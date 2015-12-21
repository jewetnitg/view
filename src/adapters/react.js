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

  render(view, data = {}, $el) {
    if ($el) {
      $el.remove();
    }

    this.sync(view, data);

    return view.el;
  },

  sync(view, data = {}) {
    view.reactElement = reactAdapter.React.createElement(view.template, data);
    view.el = reactAdapter.ReactDOM.findDOMNode(reactAdapter.ReactDOM.render(view.reactElement, view.$holder[0]));
  },

  remove(view) {
    // @todo see if there is a react way to remove elements
    view.reactElement = null;
    view.$el.remove();
  }

};

reactAdapter.React = React;
reactAdapter.ReactDOM = ReactDOM;

export default reactAdapter;