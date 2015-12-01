/**
 * @author rik
 */
import View from '../../src/factories/View';

describe(`View`, () => {

  it(`should be a function`, (done) => {
    expect(View).to.be.a('function');
    done();
  });

});