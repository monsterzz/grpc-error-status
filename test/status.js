const assert = require('chai').assert;
const parse = require('..').parse;

const Any = require('google-protobuf/google/protobuf/any_pb').Any;
const Status = require('../src/google/rpc/status_pb').Status;
const BadRequest = require('../src/google/rpc/error_details_pb').BadRequest;

describe('parseErrorStatus', () => {
  it('should return null for plain js error', () => {
    const parsed = parse(new Error('some error'));
    assert.strictEqual(parsed, null, 'should return null');
  });

  it('should return Status for grpc error', () => {
    const error = createGrpcError(createGrpcStatus());
    const parsed = parse(error);

    assert(parsed instanceof Status, 'should parse Status');
    assert.strictEqual(parsed.getCode(), 42, 'code should be 42');
  });

  it('should contain BadRequest', () => {
    const error = createGrpcError(createGrpcStatus());
    const parsed = parse(error);

    const details = parsed.getDetailsList();
    assert.strictEqual(details.length, 1, 'should have one detailed entry');
    assert.instanceOf(details[0], BadRequest, 'should contain BadRequest');
  });

  it('should have FieldViolation', () => {
    const error = createGrpcError(createGrpcStatus());
    const parsed = parse(error);

    const details = parsed.getDetailsList();
    const fv = details[0].getFieldViolationsList();
    assert.strictEqual(fv.length, 1, 'should contain one field');
    assert.strictEqual(fv[0].getField(), 'some_field', 'should be some_field');
  });

  it('should serialize as object', () => {
    const error = createGrpcError(createGrpcStatus());
    const parsed = parse(error);
    parsed.toObject();
  });
});

/**
 * Wraps any message to google.protobuf.Any
 * @param {String} type
 * @param {Message} msg
 * @return {Any}
 */
function wrapInAny(type, msg) {
  const any = new Any();
  any.pack(msg.serializeBinary(), type);
  return any;
}

/**
 * Create status for testing.
 * @return {Status}
 */
function createGrpcStatus() {
  const status = new Status();
  status.setCode(42);
  status.setMessage('some error');

  const fieldViolation = new BadRequest.FieldViolation();
  fieldViolation.setField('some_field');
  fieldViolation.setDescription('should be set');

  const badReq = new BadRequest();
  badReq.addFieldViolations(fieldViolation);

  status.addDetails(wrapInAny('google.rpc.BadRequest', badReq));
  return status;
}

/**
 * Wrap grpc status to grpc-like error.
 * @param {Status} status
 * @return {Error}
 */
function createGrpcError(status) {
  const err = new Error();
  err.metadata = {
    get: function(key) {
      if (key === 'grpc-status-details-bin') {
        return [status.serializeBinary()];
      }
    },
  };
  return err;
}
