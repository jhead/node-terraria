import Datatypes from '../../src/datatypes';

require('chai').should();

describe('Datatypes', function() {

  describe('byte', function() {

    describe('#encode()', function() {
      let bValue = 255;
      let result = Datatypes.byte.encode(bValue);

      it('should return a single-byte buffer', function() {
        result.should.be.an.instanceof(Buffer);
        result.should.have.length(1);
      });

      it('resulting buffer should contain only the input value', function() {
        result[0].should.equal(bValue);
      });
    });

    describe('byte#decode()', function() {
      let originalBuffer = new Buffer([ 0x01, 0x02, 0x03 ]);
      let result = Datatypes.byte.decode(originalBuffer);

      it('should return a number', function() {
        result.should.be.a('number');
      });

      it('should return the first byte from input buffer', function() {
        result.should.equal(originalBuffer[0]);
      });
    });

  });

});
