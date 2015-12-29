/**
 * @author rik
 */
import {
  View,
  SubView,
  Adapter,
  handlebarsAdapter
} from '../../../index';


// @todo refactor out Adapter to separate integration test
describe(`View`, () => {
  let adapter;
  let view;
  let ensuredView;
  let viewWithSubView;

  describe(`Integration`, () => {

    it(`should allow me to register Adapters`, (done) => {
      Adapter.adapters = {};
      adapter = Adapter(handlebarsAdapter);
      done();
    });

    it(`should allow me to register Views`, (done) => {
      view = View({
        name: 'testView',
        adapter: 'handlebars',
        holder: 'body',
        template(data) {
          return '<div>' + data.data + '</div>';
        }
      });
      done();
    });

    it(`should allow me to render the View to its holder with data`, (done) => {
      const data = {
        data: 'test'
      };

      const viewTemplate = view.template;
      const viewSet = view.set;

      const innerHTML = 'sadsadasd';
      const templateMock = mockFunction();

      view.template = function (data) {
        templateMock(data);
        return `<div>${innerHTML}</div>`;
      };

      view.set = mockFunction();

      // execute the SUT
      view.render(data);

      // verify the new data is merged into the view data
      verify(view.set)(data);

      // verify template is passed the view data
      verify(templateMock)(view.data);

      // verify the view element contains the correct HTML
      expect(view.el.innerHTML).to.equal(innerHTML);

      // verify the view element is appended to the correct holder
      expect(view.el.parentNode).to.equal(document.body);

      view.template = viewTemplate;
      view.set = viewSet;

      done();
    });

    it(`should allow me to sync the view with data`, (done) => {
      const data = {
        data: 'test'
      };

      const viewTemplate = view.template;
      const viewSet = view.set;

      const innerHTML = 'sadsrgsrgsadasd';
      const templateMock = mockFunction();

      view.template = function (data) {
        templateMock(data);
        return `<div>${innerHTML}</div>`;
      };

      view.set = mockFunction();

      // execute the SUT
      view.sync(data);

      // verify the new data is merged into the view data
      verify(view.set)(data);

      // verify the view element contains the correct HTML
      expect(view.el.innerHTML).to.equal(innerHTML);

      view.template = viewTemplate;
      view.set = viewSet;

      done();
    });

    it(`should allow me to remove the view from the dom`, (done) => {
      const el = view.el;

      expect(el.parentNode).to.equal(document.body);

      view.remove();

      expect(view.el).to.equal(null);
      expect(el.parentNode).to.not.equal(document.body);

      done();
    });

    it(`should allow me to set data on a View`, (done) => {
      const data = {
        someProperty: 'someValue'
      };

      // execute the SUT
      view.set(data);

      expect(view.data.someProperty).to.equal(data.someProperty);

      done();
    });

    it(`should allow me ensure a View`, (done) => {
      ensuredView = View.ensure('testView');

      expect(ensuredView.options).to.deep.equal(view.options);

      done();
    });

    it(`should allow me register a View so it can be ensured later`, (done) => {
      const viewOptions = {
        name: 'testView2',
        adapter: 'handlebars',
        holder: 'body',
        template(data) {
          return '<div>html</div>';
        }
      };
      View.register(viewOptions);

      ensuredView = View.ensure('testView2');

      expect(ensuredView.options).to.deep.equal(viewOptions);

      done();
    });

    it(`should allow me hide a View`, (done) => {
      ensuredView.render();

      ensuredView.el.style.display = 'block';
      ensuredView.hide();

      expect(ensuredView.el.style.display).to.equal('none');

      done();
    });

    it(`should allow me show a View`, (done) => {
      ensuredView.show();

      expect(ensuredView.el.style.display).to.equal('block');

      done();
    });

    it(`should allow me to create a View with SubViews`, (done) => {
      viewWithSubView = View({
        name: 'viewWithSubView',
        adapter: 'handlebars',
        template(data) {
          return '<div>html<div class="subview-holder"></div></div>';
        },
        subViews: {
          testSubView: {
            view: 'testView',
            holder: '.subview-holder'
          }
        }
      });

      viewWithSubView.render();

      const subViewHolder = viewWithSubView.el.querySelector('.subview-holder');

      expect(viewWithSubView.subViews.testSubView).to.be.an.instanceOf(SubView);
      expect(viewWithSubView.subViews.testSubView.el.parentNode).to.equal(subViewHolder);

      done();
    });

  });

});