import _ from 'lodash';

import ObjectWithView from '../../../src/factories/ObjectWithView';
import View from '../../../src/factories/View';

describe(`ObjectWithView`, () => {

  const viewInitialize = View.initialize;
  const viewValidate = View.validate;
  let objectWithViewName;
  let view;
  let holder;
  let template;
  let mockView;
  let baseObjectWithView;

  function resetMocks() {
    View.validate = [];
    View.initialize = _.noop;
    objectWithViewName = 'test';
    view = 'view';
    holder = 'holder';
    template = 'template';
    View.viewOptions[view] = mockView = {
      name: 'view',
      adapter: 'riot',
      el: {
        querySelector() {
        },
        addEventListener() {
        },
        removeEventListener() {
        }
      },
      subViews: {},
      options: {
        subViews: {
          [objectWithViewName]: baseObjectWithView
        }
      },
      template
    };

    Object.setPrototypeOf(mockView, View.prototype);

    baseObjectWithView = {
      name: objectWithViewName,
      view,
      holder
    };
  }

  beforeEach(done => {
    resetMocks();

    done();
  });

  it(`should be a function`, (done) => {
    expect(ObjectWithView).to.be.a('function');
    done();
  });

  describe(`const objectWithView = ObjectWithView(Object options)`, () => {

    it(`should return an instance of ObjectWithView`, done => {
      expect(ObjectWithView(baseObjectWithView)).to.be.an.instanceOf(ObjectWithView);
      done();
    });

    it(`should throw an error if constructed without a view`, done => {
      function tryToCreateObjectWithViewWithoutAView() {
        delete baseObjectWithView.view;
        ObjectWithView(baseObjectWithView);
      }

      expect(tryToCreateObjectWithViewWithoutAView).to.throw(Error);
      done();
    });

    it(`should throw an error if constructed with a view that is not registered on the View class`, done => {

      function tryToCreateObjectWithViewWithAViewThatIsNotRegisteredOnTheViewClass() {
        delete View.viewOptions[view];
        ObjectWithView(baseObjectWithView);
      }

      expect(tryToCreateObjectWithViewWithAViewThatIsNotRegisteredOnTheViewClass).to.throw(Error);

      done();
    });

    it.skip(`should extend itself with the options passed into the constructor, except for the view property and properties already defined on the ObjectWithView prototype`, done => {
      // @todo implement
      done();
    });

    it.skip(`should construct a View by merging the options of the by name referenced View and the holder and el properties provided in the options`, done => {
      // @todo implement
      done();
    });

    describe(`objectWithView.holder`, () => {

      it(`should return its views holder`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        const viewHolder = objectWithView.view.holder = {};

        const objectWithViewHolder = objectWithView.holder;

        expect(viewHolder).to.equal(objectWithViewHolder);
      });

    });

    describe(`objectWithView.el`, () => {

      it(`should return its views el`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        const viewEl = objectWithView.view.el = {};

        const objectWithViewEl = objectWithView.el;

        expect(viewEl).to.equal(objectWithViewEl);
      });

    });

    describe(`objectWithView.render(Object data, Boolean force)`, () => {

      it(`should call the the views render method with the arguments provided`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        objectWithView.view.render = mockFunction();
        const data = {};
        const force = {};

        objectWithView.render(data, force);

        verify(objectWithView.view.render)(data, force);
      });

    });

    describe(`objectWithView.sync(Object data)`, () => {

      it(`should call the the views sync method with the arguments provided`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        objectWithView.view.sync = mockFunction();
        const data = {};

        objectWithView.sync(data);

        verify(objectWithView.view.sync)(data);
      });

    });

    describe(`objectWithView.hide()`, () => {

      it(`should call the the views hide method`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        objectWithView.view.hide = mockFunction();
        objectWithView.hide();

        verify(objectWithView.view.hide)();
      });

    });

    describe(`objectWithView.show()`, () => {

      it(`should call the the views show method`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        objectWithView.view.show = mockFunction();
        objectWithView.show();

        verify(objectWithView.view.show)();
      });

    });

    describe(`objectWithView.remove()`, () => {

      it(`should call the the views remove method`, () => {
        const objectWithView = ObjectWithView(baseObjectWithView);
        objectWithView.view.remove = mockFunction();
        objectWithView.remove();

        verify(objectWithView.view.remove)();
      });

    });

  });

  after(done => {
    View.viewOptions[view] = {};
    View.initialize = viewInitialize;
    View.validate = viewValidate;

    done();
  });

});