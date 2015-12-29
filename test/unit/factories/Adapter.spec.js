/**
 * @author rik
 */
import Adapter from '../../../src/factories/Adapter';

/**
 * Adapter
 */
describe(`Adapter`, () => {
  let adapterName = 'test';
  let baseAdapter = {
    name: adapterName,
    render: function () {

    }
  };

  beforeEach(done => {
    adapterName = 'test';
    baseAdapter = {
      name: adapterName,
      render() {

      }
    };
    Adapter.adapters = {};
    done();
  });

  it(`should be a function`, (done) => {
    expect(Adapter).to.be.a('function');
    done();
  });

  describe(`Adapter.ensure(String adapter)`, () => {

    it(`should return an already defined Adapter if the string references the name of an Adapter that exists`, (done) => {
      const existingAdapter = Adapter(baseAdapter);
      const ensuredAdapter = Adapter.ensure(adapterName);

      expect(ensuredAdapter).to.equal(existingAdapter, 'expected the ensured Adapter to equal the Adapter with the provided name');

      done();
    });

    it(`should throw an error if the string references the name of an Adapter that does not exist`, (done) => {

      function tryToEnsureAdapterThatDoesNotExist() {
        Adapter.ensure(adapterName);
      }

      expect(tryToEnsureAdapterThatDoesNotExist).to.throw(Error);

      done();
    });

  });

  describe(`Adapter.ensure(Adapter adapter)`, () => {

    it(`should return the provided adapter`, (done) => {
      const existingAdapter = Adapter(baseAdapter);
      const ensuredAdapter = Adapter.ensure(existingAdapter);

      expect(ensuredAdapter).to.equal(existingAdapter, 'expected the ensured Adapter to equal the Adapter with the provided name');

      done();
    });

  });

  describe(`Adapter.ensure(Object adapter)`, () => {

    it(`should create a new Adapter`, (done) => {
      const ensuredAdapter = Adapter.ensure(baseAdapter);

      expect(ensuredAdapter.options).to.equal(baseAdapter, 'expected the ensured Adapter to equal the Adapter with the provided name');

      done();
    });

  });


  /**
   * const adapter = Adapter()
   */
  describe(`const adapter = Adapter(Object options)`, () => {

    it(`should return an instance of Adapter`, (done) => {
      const adapter = Adapter(baseAdapter);
      expect(adapter).to.be.an.instanceOf(Adapter);
      done();
    });

    it(`should extend itself with the options passed in`, (done) => {
      baseAdapter.randomProperty = 'someValue';
      const adapter = Adapter(baseAdapter);
      expect(adapter.randomProperty).to.equal(baseAdapter.randomProperty);
      done();
    });

    it(`should add itself to the Adapter.adapter object`, (done) => {
      const adapter = Adapter(baseAdapter);

      expect(Adapter.adapters[baseAdapter.name]).to.equal(adapter);

      done();
    });

    it(`should throw an error if constructed with no or an invalid name`, (done) => {
      delete baseAdapter.name;

      function tryToConstructAdapterWithoutAName() {
        Adapter(baseAdapter)
      }

      function tryToConstructAdapterWithAnInvalidName() {
        baseAdapter.name = {};
        Adapter(baseAdapter)
      }

      expect(tryToConstructAdapterWithoutAName).to.throw(Error);
      expect(tryToConstructAdapterWithAnInvalidName).to.throw(Error);

      done();
    });

    it(`should throw an error if constructed without a render method`, (done) => {
      delete baseAdapter.render;

      function tryToConstructAdapterWithoutARenderMethod() {
        Adapter(baseAdapter)
      }

      function tryToConstructAdapterWithAnInvalidARenderProperty() {
        baseAdapter.render = {};
        Adapter(baseAdapter)
      }

      expect(tryToConstructAdapterWithoutARenderMethod).to.throw(Error);
      expect(tryToConstructAdapterWithAnInvalidARenderProperty).to.throw(Error);
      done();
    });

    it(`should throw an error if an Adapter with this name already exists`, (done) => {
      Adapter(baseAdapter);

      function tryToConstructAdapterWithAnExistingName() {
        Adapter(baseAdapter)
      }

      expect(tryToConstructAdapterWithAnExistingName).to.throw(Error);
      done();
    });

    /**
     * adapter.sync
     */
    describe(`adapter.sync(View view, Object data)`, () => {

      it(`should first remove the passed in view and then render it`, (done) => {
        const adapter = Adapter(baseAdapter);
        const callOrder = [];
        const desiredCallOrder = ['remove', 'render'];
        const data = {};
        const el = {};
        const view = {
          el
        };

        adapter.remove = mockFunction();
        adapter.render = mockFunction();

        when(adapter.remove)(view)
          .then(() => {
            callOrder.push('remove');
          });

        when(adapter.render)(view, data, el)
          .then(() => {
            callOrder.push('render');
          });

        adapter.sync(view, data);

        verify(adapter.remove)(view);
        verify(adapter.render)(view, data, el);

        expect(callOrder).to.deep.equal(desiredCallOrder);

        done();
      });

    });

    /**
     * adapter.remove
     */
    describe(`adapter.remove(View view)`, () => {

      it(`should remove the view.el Element from its parent node`, (done) => {
        const adapter = Adapter(baseAdapter);
        const el = {
          parentNode: {
            removeChild: mockFunction()
          }
        };
        const view = {
          el
        };

        adapter.remove(view);

        verify(el.parentNode.removeChild)(el);

        done();
      });

    });

    /**
     * adapter.bindEvent
     */
    describe(`adapter.bindEvent(View view, String event, Function eventHandler, String selector)`, () => {

      it(`if selector is specified, it should try to find the selector in the context of the Views element`, (done) => {
        const adapter = Adapter(baseAdapter);
        const selector = "selector";
        const event = "event";
        const eventHandler = mockFunction();
        const el = {
          querySelector: mockFunction()
        };
        const selectorEl = {
          addEventListener: mockFunction()
        };
        const view = {
          el
        };
        when(el.querySelector)(selector)
          .thenReturn(selectorEl);

        adapter.bindEvent(view, event, eventHandler, selector);

        verify(el.querySelector)(selector);

        done();
      });

      it(`if the selector is specified, it should throw an error if the selector can not be found in the context of the Views element`, (done) => {
        const adapter = Adapter(baseAdapter);
        const selector = "selector";
        const event = "event";
        const eventHandler = mockFunction();
        const el = {
          querySelector: mockFunction()
        };
        const view = {
          el
        };

        function bindEventWithSelectorOfElementThatCanNotBeFound() {
          adapter.bindEvent(view, event, eventHandler, selector);
        }

        expect(bindEventWithSelectorOfElementThatCanNotBeFound).to.throw(Error);

        done();
      });

      it(`it should add an event listener to the element`, (done) => {
        const adapter = Adapter(baseAdapter);
        const event = "event";
        const eventHandler = mockFunction();
        const el = {
          addEventListener: mockFunction()
        };
        const view = {
          el
        };

        adapter.bindEvent(view, event, eventHandler);

        verify(el.addEventListener)(event, eventHandler);

        done();
      });

    });

    /**
     * adapter.bindEvents
     */
    describe(`adapter.bindEvents(View view)`, () => {

      it(`should, if the eventHandler is a string, try to find it on the view deeply`, (done) => {
        const adapter = Adapter(baseAdapter);
        adapter.bindEvent = mockFunction();
        const view = {
          el: {},
          events: {
            'click': 'some.deep'
          },
          some: {
            deep: mockFunction()
          }
        };

        adapter.bindEvents(view);

        verify(adapter.bindEvent)(view, anything(), view.some.deep);

        done();
      });

      it(`should, if the eventHandler is a string, and no corresponding method can be found on the View, throw an error`, (done) => {
        const adapter = Adapter(baseAdapter);

        adapter.bindEvent = mockFunction();

        const view = {
          el: {},
          events: {
            'click': 'some.deep'
          }
        };

        function tryToBindEventsWithEventOfWhichHandlerIsNotDefinedOnView() {
          adapter.bindEvents(view);
        }

        function tryToBindEventsWithEventOfWhichHandlerIsNotAFunctionOnView() {
          view.some = {
            deep: {}
          };
          adapter.bindEvents(view);
        }

        expect(tryToBindEventsWithEventOfWhichHandlerIsNotDefinedOnView).to.throw(Error);
        expect(tryToBindEventsWithEventOfWhichHandlerIsNotAFunctionOnView).to.throw(Error);

        done();
      });

      it(`should, if the eventHandler is not a function, and not a string, throw an error`, (done) => {
        const adapter = Adapter(baseAdapter);

        adapter.bindEvent = mockFunction();

        const view = {
          el: {},
          events: {
            'click': {}
          }
        };

        function tryToBindEventsWithEventOfWhichHandlerIsNotAStringOrFunction() {
          adapter.bindEvents(view);
        }

        expect(tryToBindEventsWithEventOfWhichHandlerIsNotAStringOrFunction).to.throw(Error);

        done();
      });

      it(`should determine the event and selector for the event listener based on the event key`, (done) => {
        const adapter = Adapter(baseAdapter);
        const event = 'click';
        const selector = '.some div #selector';
        const eventKey = `${event} ${selector}`;

        adapter.bindEvent = mockFunction();

        const view = {
          el: {},
          events: {
            [eventKey]: 'some.deep'
          },
          some: {
            deep: mockFunction()
          }
        };

        adapter.bindEvents(view);

        verify(adapter.bindEvent)(view, event, anything(), selector);

        done();
      });

    });

  });

});