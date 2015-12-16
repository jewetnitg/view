/**
 * @author rik
 */
import React from 'react';
import ReactDOM from 'react-dom';

import Adapter from '../factories/Adapter';

/**
 *
 * @name reactAdapter
 * @extends Adapter
 */
const reactAdapter = Adapter({

  name: 'react',

  render(view, data = {}, $el) {
    if ($el) {
      $el.remove();
    }

    this.sync(view, data);

    return view.el;
  },

  sync(view, data = {}) {
    view.reactElement = React.createElement(view.template, data);
    view.el = ReactDOM.render(view.reactElement, view.$holder[0]);
  },

  remove(view) {
    // @todo see if there is a react way to remove elements
    view.reactElement
    view.$el.remove();
  }

});

reactAdapter.React = React;
reactAdapter.ReactDOM = ReactDOM;

export default reactAdapter;