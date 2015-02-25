'use strict';

var requireUncached = require('require-uncached');
var chai = requireUncached('chai');
var expect = chai.expect;
chai.should();

chai.use(requireUncached('../lib/dirty-chai'));

function shouldFail(func, msg) {
  it('should fail with a message', function() {
    expect(func).to.throw(msg);
  });
}

describe('dirty chai', function() {
  describe('ok', function() {
    describe('when true expression', function() {
      it('should not assert function', function() {
          expect(true).to.be.ok();
      });

      it('should not assert property', function() {
          expect(true).to.be.ok.and.not.equal(false);
      });

      it('should not assert another chain conversion', function() {
          expect(true).to.be.ok.and.not.false();
      });

      it('should not assert with ensure', function() {
          expect(true).to.be.ok.ensure();
          expect(true).to.be.ok.not.ensure();
      });

      it('should work with should', function() {
        true.should.be.true.and.not.false();
      });
    });

    describe('when false expression', function() {
      it('should assert non-function at chain end', function() {
        var assertion = expect(true).to.not.be.ok.and.not;
        shouldFail(assertion.equal.bind(assertion, false), /expected true to be falsy/);
      });

      it('should assert with custom message at chain end', function() {
        expect(function() {
          expect(true).to.not.be.false.and.be.ok('true is not ok');
        }).to.throw(/true is not ok/);
      });

      it('should assert function mid-chain', function() {
        expect(function() {
          expect(true).to.not.be.ok().and.not.equal(false);
        }).to.throw(/expected true to be falsy/);
      });

      it('should assert with custom message mid-chain', function() {
        expect(function() {
          expect(true).to.not.be.ok('true is not ok').and.not.equal(false);
        }).to.throw(/true is not ok/);
      });

      it('should assert with custom message of terminating assert', function() {
        expect(function() {
          expect(true).to.be.ok.and.not.equal(true, 'true is not ok');
        }).to.throw(/true is not ok/);
      });

      it('should assert with ensure', function() {
        expect(function() {
          expect(true).to.not.be.ok.ensure();
        }).to.throw(/expected true to be falsy/);
      });
    });
  });

  describe('when plugin creates new property', function() {
    var stubCalled;

    beforeEach(function() {
      stubCalled = false;

      chai.use(function(chai, util) {
        chai.Assertion.addProperty('neverFail', function() { this.assert(true === true); stubCalled = true; });
        chai.Assertion.addProperty('flagelate', function() { util.flag(this, 'legfree', true); });
      });
    });

    it('should convert asserting property to a chainable method', function() {
      var prop = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, 'neverFail');
      chai.Assertion.prototype.should.have.a.property('neverFail').and.should.be.a('function');
      prop.should.have.property('get').and.be.a('function');
      prop.get.call(new chai.Assertion({})).should.be.a('function');
    });

    it('should not convert asserting property to a chainable method', function() {
      var obj = {};
      var assertion = new chai.Assertion(obj);
      var prop = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, 'flagelate');
      chai.Assertion.prototype.should.have.a.property('flagelate').and.should.be.a('function');
      prop.should.have.property('get').and.be.a('function');
      prop.get.call(assertion).should.equal(assertion);
    });

    it('should call assertion', function() {
      expect(true).to.neverFail();

      expect(stubCalled).to.be.true();
    });
  });
});
