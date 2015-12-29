import _ from 'lodash';

import View from '../../../src/factories/View';
import Adapter from '../../../src/factories/Adapter';

describe(`View`, () => {

  let viewName;
  let adapterName;
  let adapter;
  let view;
  let holder;
  let template;
  let baseView;
  let baseAdapter;
  let innerHtml;
  let outerHtml;

  function resetMocks() {
    delete Adapter.adapters[adapterName];
    adapterName = 'testAdapter';
    baseAdapter = {
      name: adapterName,
      render() {
        return template();
      }
    };

    adapter = Adapter(baseAdapter);

    delete View.viewOptions[viewName];
    viewName = 'testView';
    holder = 'body';
    innerHtml = 'inner html';

    outerHtml = `<div>${innerHtml}</div>`;
    template = function () {
      return outerHtml;
    };


    baseView = {
      name: viewName,
      adapter: adapterName,
      template,
      view,
      holder
    };
  }

  beforeEach(done => {
    resetMocks();

    done();
  });


  it(`should be a function`, done => {
    expect(View).to.be.a('function');
    done();
  });

  describe(`const view = View(Object options)`, () => {

    it(`should return an instance of View`, done => {
      expect(View(baseView)).to.be.an.instanceOf(View);
      done();
    });

    it(`should throw an error if constructed without a valid, name, template, holder or adapter`, done => {
      function tryToCreateViewWithoutHolder() {
        resetMocks();
        baseView.holder = null;
        View(baseView);
      }

      function tryToCreateViewWithoutTemplate() {
        resetMocks();
        baseView.template = null;
        View(baseView);
      }

      function tryToCreateViewWithoutAdapter() {
        resetMocks();
        baseView.adapter = null;
        View(baseView);
      }

      function tryToCreateViewWithNonExistantAdapter() {
        resetMocks();
        baseView.adapter = 'someAdapterThatDoesNotExist';
        View(baseView);
      }

      function tryToCreateViewWithHolderThatIsNotInTheDOM() {
        resetMocks();
        baseView.holder = '.some-selector of an element that is not in the dom';
        View(baseView);
      }

      function tryToCreateViewWithoutAName() {
        resetMocks();
        baseView.name = null;
        View(baseView);
      }

      function tryToCreateViewCorrectly() {
        resetMocks();
        View(baseView);
      }

      expect(tryToCreateViewWithoutHolder).to.throw(Error);
      expect(tryToCreateViewWithoutTemplate).to.throw(Error);
      expect(tryToCreateViewWithoutAdapter).to.throw(Error);
      expect(tryToCreateViewWithNonExistantAdapter).to.throw(Error);
      expect(tryToCreateViewWithHolderThatIsNotInTheDOM).to.throw(Error);
      expect(tryToCreateViewWithoutAName).to.throw(Error);

      expect(tryToCreateViewCorrectly).to.not.throw(Error);

      done();
    });

    describe(`view.set(Object Data, String setMethod)`, () => {

      it(`should set the provided data on the view.data`, done => {
        const view = View(baseView);
        const toBeSetData = {
          someProperty: 'someValue'
        };

        view.set(toBeSetData);

        expect(view.data.someProperty).to.equal(toBeSetData.someProperty);

        done();
      });

    });

    describe(`view.render(Object data, Boolean force)`, () => {

      it(`should set the passed in data on the view`, done => {
        const view = View(baseView);
        const data = {};

        view.show = mockFunction();
        view.set = mockFunction();

        view.render(data);

        verify(view.set)(data);

        done();
      });

      it(`should use its Adapters 'render' method to create the element for this view`, done => {
        const view = View(baseView);
        const el = document.createElement('div');

        view.show = mockFunction();
        adapter.render = mockFunction();

        when(adapter.render)(view, view.data, view.el)
          .thenReturn(el);

        view.render();

        verify(adapter.render)(view, view.data);

        expect(view.el).to.equal(el);

        done();
      });

      it(`should pass the current element (view.el) if it exists to the Adapters 'render' method`, done => {
        const view = View(baseView);
        const el = document.createElement('div');

        view.el = el;
        view.show = mockFunction();
        adapter.render = mockFunction();

        view.render();

        verify(adapter.render)(view, view.data, el);

        done();
      });

      it(`if the adapter has events, it should bind the events by calling its Adapters 'bindEvents' method`, done => {
        const view = View(baseView);
        view.show = mockFunction();

        adapter.bindEvents = mockFunction();
        adapter.events = true;
        view.render();

        verify(adapter.bindEvents)(view);

        done();
      });

      it(`should revert to the sync method if already rendered unless the force argument is true`, done => {
        const view = View(baseView);
        const data = {};

        view.show = mockFunction();

        view.sync = mockFunction(data);
        view.render(data);
        verify(view.sync, never())(data);

        view.render(data);
        verify(view.sync, once())(data);

        view.render(data, true);
        verify(view.sync, once())(data);


        done();
      });

      it(`should show the view`, done => {
        const view = View(baseView);

        view.show = mockFunction();

        view.render();

        verify(view.show)();

        done();
      });

      it(`should render the Views subViews and pass it the data passed in so it is propagated to subViews`, done => {
        const view = View(baseView);
        const data = {};
        View.SubView.render = mockFunction();
        view.show = mockFunction();
        view.render(data);

        verify(View.SubView.render)(view, data);

        done();
      });

    });

    describe(`view.sync(Object data)`, () => {

      it(`should set the passed in data on the view`, done => {
        const view = View(baseView);
        const data = {};

        // so we don't throw errors
        adapter.sync = mockFunction();

        view.set = mockFunction();
        view.sync(data);

        verify(view.set)(data);

        done();
      });

      it(`should use its Adapters 'sync' method to sync the view data to the DOM, it should pass it the view and the views data`, done => {
        const view = View(baseView);

        adapter.sync = mockFunction();

        view.sync();

        verify(adapter.sync)(view, view.data);

        done();
      });

      it(`if the adapter has events and rebindEventsAfterSync set to true, it should bind the events by calling its Adapters 'bindEvents' method`, done => {
        const view = View(baseView);

        // so we don't throw errors
        adapter.sync = mockFunction();

        adapter.bindEvents = mockFunction();
        adapter.events = true;
        adapter.rebindEventsAfterSync = true;

        view.sync();

        verify(adapter.bindEvents)(view);

        done();
      });

      it(`should sync the Views subViews and pass it the data passed in so it is propagated to subViews`, done => {
        const view = View(baseView);
        const data = {};

        // so we don't throw errors
        adapter.sync = mockFunction();

        view.subViews.test = {
          sync: mockFunction()
        };

        view.sync(data);

        verify(view.subViews.test.sync)(data);

        done();
      });

    });

    describe(`view.show()`, () => {

      it(`should only execute if the view is has been rendered`, done => {
        function callBeforeRender() {
          resetMocks();
          const view = View(baseView);
          const displaySetMock = mockFunction();
          view.el = {
            style: {
              set display(val) {
                displaySetMock(val);
              }
            }
          };
          view.show();

          verify(displaySetMock, never())();
        }

        function callAfterRender() {
          resetMocks();
          const view = View(baseView);
          adapter.render = function () {
            return document.createElement('div');
          };

          view.render();

          let display = 'block';
          const displaySetMock = mockFunction();

          view.el = {
            style: {
              set display(val) {
                displaySetMock(val);
                display = val;
              },
              get display() {
                return display;
              }
            }
          };

          view.show();

          verify(displaySetMock)(display);
        }

        callBeforeRender();
        callAfterRender();

        done();
      });

      it(`should set the Views el display style to its initial value`, done => {
        const view = View(baseView);
        const initialDisplay = 'inline';

        adapter.render = function () {
          return document.createElement('div');
        };

        view.render();

        view.el.style.display = initialDisplay;

        view.hide();

        expect(view.el.style.display).not.to.equal(initialDisplay);

        view.show();

        expect(view.el.style.display).to.equal(initialDisplay);

        done();
      });

    });

    describe(`view.hide()`, () => {

      it(`should set the Views el display style to 'none'`, done => {
        const view = View(baseView);
        const initialDisplay = 'inline';
        let display = initialDisplay;

        adapter.render = function () {
          return document.createElement('div');
        };

        view.render();
        view.el.style.display = initialDisplay;

        const displaySetMock = mockFunction();

        view.el = {
          style: {
            set display(val) {
              displaySetMock(val);
            },
            get display() {
              return display;
            }
          }
        };

        view.hide();

        verify(displaySetMock)('none');

        done();
      });

    });

    describe(`view.remove()`, () => {

      it(`should only execute if the view is rendered`, done => {

        function callRemoveBeforeRender() {
          resetMocks();
          const view = View(baseView);
          view.show = mockFunction();
          adapter.remove = mockFunction();
          view.remove();
          verify(adapter.remove, never())(view);
        }

        function callRemoveAfterRender() {
          resetMocks();
          const view = View(baseView);
          view.show = mockFunction();
          adapter.remove = mockFunction();
          view.render();
          view.remove();

          verify(adapter.remove)(view);
        }

        callRemoveBeforeRender();
        callRemoveAfterRender();

        done();
      });

      it(`should use its Adapters 'remove' method to remove the element from the DOM`, done => {
        const view = View(baseView);

        adapter.remove = mockFunction();
        view.show = mockFunction();

        // if a view is not rendered, remove is ignored
        view.render();

        view.remove();

        verify(adapter.remove)(view);

        done();
      });

      it(`should set the Views el property to null`, done => {
        const view = View(baseView);

        view.show = mockFunction();
        adapter.remove = mockFunction();
        // if a view is not rendered, remove is ignored
        view.render();
        expect(view.el).not.to.equal(null);

        view.remove();
        expect(view.el).to.equal(null);

        done();
      });

      it(`should cause a render call not to revert to syncing anymore`, done => {
        const view = View(baseView);

        adapter.remove = mockFunction();
        adapter.render = mockFunction();
        view.sync = mockFunction();
        view.show = mockFunction();

        // if a view is not rendered, remove is ignored
        view.render();
        view.render();

        verify(adapter.render, once())();
        verify(view.sync, once())();

        view.remove();
        view.render();

        // sync is still called once
        verify(view.sync, once())();

        // render has now been called twice
        verify(adapter.render, times(2))();

        done();
      });

      it(`should remove its subViews`, done => {
        const view = View(baseView);

        // so we don't throw errors
        view.show = mockFunction();
        adapter.remove = mockFunction();

        view.subViews.test = {
          remove: mockFunction()
        };

        view.render();
        view.remove();

        verify(view.subViews.test.remove)();

        done();
      });

    });

  });

  describe(`View.ensure`, () => {
    // @todo implement
  });

  describe(`View.register`, () => {

    it(`should add defaults to the provided options`, done => {
      const options = {};
      const viewDefaults = View.defaults;
      View.defaults = {
        someDefaultProperty: 'yes'
      };

      View.register(options);

      expect(options.someDefaultProperty).to.equal(View.defaults.someDefaultProperty);

      View.defaults = viewDefaults;
      done();
    });

    it(`should add passed in options to View.viewOptions by name`, done => {
      const options = {
        name: 'testView'
      };

      View.register(options);

      expect(View.viewOptions.testView).to.equal(options);

      done();
    });


  });

  after(done => {
    delete View.viewOptions[viewName];
    delete Adapter.adapters[adapterName];

    done();
  });

});