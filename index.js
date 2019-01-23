const jspb = require('google-protobuf');

const googleRpc = {};
['code_pb', 'error_details_pb', 'status_pb'].forEach((file) => {
  const mod = require(`./src/google/rpc/${file}`);
  for (const o of Object.keys(mod)) {
    googleRpc[o] = mod[o];
  }
});

// HACK monkey patching
proto.google.rpc.Status.toObject = function(includeInstance, msg) {
  const obj = {
    code: jspb.Message.getFieldWithDefault(msg, 1, 0),
    message: jspb.Message.getFieldWithDefault(msg, 2, ''),
    detailsList: jspb.Message.toObjectList(
        msg.getDetailsList(),
        (includeObject, obj) => {
          const result = obj.toObject();
          if (includeInstance) {
            result.$jspbMessageInstance = obj;
          }
          return result;
        },
        includeInstance
    ),
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }

  return obj;
};

module.exports.parse = function parseErrorStatus(e) {
  if (!e || !e.metadata) {
    return null;
  }

  if (typeof e.metadata.get !== 'function') {
    throw new Error('e.metadata.get should be a function');
  }

  let detailsBin = e.metadata.get('grpc-status-details-bin');
  if (detailsBin instanceof Array) {
    detailsBin = detailsBin[0];
  }

  const status = googleRpc.Status.deserializeBinary(detailsBin);
  status.setDetailsList(status.getDetailsList().map((d) => {
    const name = d.getTypeName();
    if (!name.startsWith('google.rpc.')) {
      return d;
    }
    const objName = name.split('.').pop();

    if (!googleRpc.hasOwnProperty(objName)) {
      throw new Error(`Unknown type ${d.getTypeName()}`);
    }

    return d.unpack(googleRpc[objName].deserializeBinary, name);
  }));
  return status;
};
