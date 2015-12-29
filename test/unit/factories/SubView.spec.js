import _ from 'lodash';
import Adapter from '../../../src/factories/Adapter';
import View from '../../../src/factories/View';
import SubView from '../../../src/factories/SubView';
import ObjectWithView from '../../../src/factories/ObjectWithView';

/**
 * Adapter
 */
describe(`SubView`, () => {

  const viewInitialize = View.initialize;
  const viewValidate = View.validate;
  let subViewName;
  let view;
  let holder;
  let template;
  let parentView;
  let baseSubView;

  function resetMocks() {
    View.validate = [];
    View.initialize = _.noop;
    subViewName = 'test';
    view = 'view';
    holder = 'holder';
    template = 'template';
    View.viewOptions[view] = parentView = {
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
          [subViewName]: baseSubView
        }
      },
      template
    };

    Object.setPrototypeOf(parentView, View.prototype);

    baseSubView = {
      name: subViewName,
      parentView,
      view,
      holder
    };
  }

  beforeEach(done => {
    resetMocks();

    done();
  });

  it(`should be a function`, (done) => {
    expect(SubView).to.be.a('function');
    done();
  });

  it(`should extend ObjectWithView`, (done) => {
    expect(SubView(baseSubView)).to.be.an.instanceOf(ObjectWithView);
    done();
  });

  describe(`const subView = SubView(Object options)`, () => {

    it(`should be an instance of SubView`, (done) => {
      expect(SubView(baseSubView)).to.be.an.instanceOf(SubView);
      done();
    });

    it(`should add itself to its parentViews subViews`, (done) => {
      const subView = SubView(baseSubView);
      expect(parentView.subViews[subViewName]).to.equal(subView);
      done();
    });

    it(`should throw an Error if constructed without a 'holder', 'parentView' or unique 'name' property`, done => {

      function tryToConstructSubViewWithoutParentView() {
        resetMocks();
        delete baseSubView.parentView;
        SubView(baseSubView);
      }

      function tryToConstructSubViewWithoutHolder() {
        resetMocks();
        delete baseSubView.holder;
        SubView(baseSubView);
      }

      function tryToConstructSubViewWithoutName() {
        resetMocks();
        delete baseSubView.name;
        SubView(baseSubView);
      }

      function tryToConstructSubViewWithDuplicateName() {
        resetMocks();
        SubView(baseSubView);
        SubView(baseSubView);
      }

      function tryToConstructSubViewWithValidOptions() {
        resetMocks();
        SubView(baseSubView);
      }

      expect(tryToConstructSubViewWithoutName).to.throw(Error);
      expect(tryToConstructSubViewWithDuplicateName).to.throw(Error);
      expect(tryToConstructSubViewWithoutHolder).to.throw(Error);
      expect(tryToConstructSubViewWithoutParentView).to.throw(Error);

      expect(tryToConstructSubViewWithValidOptions).to.not.throw(Error);

      done();
    });

  });

  describe(`SubView.ensure(View view, Object options)`, () => {

    it(`should throw an error if not called with an instance of View as the first argument`, done => {
      function tryToEnsureSubViewWithoutPassingAView() {
        SubView.ensure()
      }

      function tryToEnsureSubViewByPassingAnObjectInsteadOfAnInstanceOfView() {
        SubView.ensure({})
      }

      expect(tryToEnsureSubViewWithoutPassingAView).to.throw(Error);
      expect(tryToEnsureSubViewByPassingAnObjectInsteadOfAnInstanceOfView).to.throw(Error);

      done();
    });

    it(`should, if called with just a View, ensure all SubViews for this View`, done => {
      const ensure = SubView.ensure;
      const desiredArguments = [
        [parentView],
        [parentView, parentView.options.subViews[subViewName]]
      ];
      const actualArguments = [];

      SubView.ensure = function (view, options) {
        const args = [];

        if (view) {
          args.push(view)
        }

        if (options) {
          args.push(options)
        }

        actualArguments.push(args);

        return ensure(view, options);
      };

      SubView.ensure(parentView);

      expect(actualArguments).to.deep.equal(desiredArguments);

      SubView.ensure = ensure;

      done();
    });

    it(`should, if called with an options object, try to find the SubView by name, and if it doesn't exist create it`, done => {
      const initialSubView = SubView.ensure(parentView, baseSubView);

      const ensuredSubView = SubView.ensure(parentView, baseSubView);

      expect(ensuredSubView).to.deep.equal(initialSubView, 'the ensured subview should equal the initially constructed subview');

      done();
    });

    it(`should, if called with an options string, try to find the SubView by name, and throw an error if it is not defined`, done => {
      function tryToEnsureExistingSubViewByName() {
        SubView.ensure(parentView, subViewName);
      }

      function tryToEnsureNonExistingSubViewByName() {
        SubView.ensure(parentView, 'name that does not exist');
      }

      expect(tryToEnsureExistingSubViewByName).to.not.throw(Error);
      expect(tryToEnsureNonExistingSubViewByName).to.throw(Error);

      done();
    });

  });

  describe(`SubView.render(View view, Object options)`, () => {

    it(`should throw an error if not called with an instance of View as the first argument`, done => {
      const ensure = SubView.ensure;

      SubView.ensure = mockFunction();

      function tryToRenderSubViewWithoutPassingAView() {
        SubView.render();
      }

      function tryToRenderSubViewByPassingAnObjectInsteadOfAnInstanceOfView() {
        SubView.render({})
      }

      function tryToRenderSubViewByPassingAnInstanceOfView() {
        SubView.render(parentView);
      }

      expect(tryToRenderSubViewWithoutPassingAView).to.throw(Error);
      expect(tryToRenderSubViewByPassingAnObjectInsteadOfAnInstanceOfView).to.throw(Error);

      expect(tryToRenderSubViewByPassingAnInstanceOfView).to.not.throw(Error);

      SubView.ensure = ensure;
      done();
    });

    it(`should ensure the subViews for the passed View`, done => {
      const ensure = SubView.ensure;

      SubView.ensure = mockFunction();
      SubView.render(parentView);
      verify(SubView.ensure)(parentView);

      SubView.ensure = ensure;
      done();
    });

    it(`should set subView.view.holder to an element in the context of the parent views element if holder in the options is a string `, done => {
      const ensure = SubView.ensure;
      const element = {};

      parentView.subViews[subViewName] = {
        options: baseSubView,
        view: parentView,
        render: mockFunction()
      };
      parentView.el.querySelector = mockFunction();

      when(parentView.el.querySelector)(holder)
        .thenReturn(element);
      SubView.ensure = mockFunction();

      SubView.render(parentView);

      expect(parentView.subViews[subViewName].view.holder).to.equal(element);

      SubView.ensure = ensure;
      done();
    });

    it(`should call the render method on all of the SubViews with the data, force and replace arguments passed in`, done => {
      const ensure = SubView.ensure;
      const data = {};
      const force = false;
      parentView.subViews[subViewName] = {
        options: baseSubView,
        view: parentView,
        render: mockFunction()
      };

      SubView.ensure = mockFunction();
      SubView.render(parentView, data, force);
      verify(parentView.subViews[subViewName].render)(data, force);

      SubView.ensure = ensure;
      done();
    })

  });

  after(done => {
    View.viewOptions[view] = {};
    View.initialize = viewInitialize;
    View.validate = viewValidate;

    done();
  });

});