// package: examplecom
// file: proto/examplecom/simple_service.proto

var proto_examplecom_simple_service_pb = require("../../proto/examplecom/simple_service_pb");
var proto_othercom_external_child_message_pb = require("../../proto/othercom/external_child_message_pb");
var google_protobuf_empty_pb = require("google-protobuf/google/protobuf/empty_pb");
var grpc = require("grpc-web-client").grpc;

var FromObject = {};
FromObject.proto_examplecom_simple_service_pb = {};
FromObject.proto_othercom_external_child_message_pb = {};
FromObject.google_protobuf_empty_pb = {};

FromObject.proto_examplecom_simple_service_pb.UnaryRequest = function(obj) {
  var out = new proto_examplecom_simple_service_pb.UnaryRequest();
  out.setSomeInt64(obj.someInt64);
  if (obj.someTimestamp) {
    out.setSomeTimestamp(FromObject.proto_examplecom_simple_service_pb.google.protobuf.Timestamp(obj.someTimestamp));
  }
  return out;
};

FromObject.proto_examplecom_simple_service_pb.UnaryResponse = function(obj) {
  var out = new proto_examplecom_simple_service_pb.UnaryResponse();
  return out;
};

FromObject.proto_examplecom_simple_service_pb.StreamRequest = function(obj) {
  var out = new proto_examplecom_simple_service_pb.StreamRequest();
  out.setSomeString(obj.someString);
  return out;
};

exports.FromObject = FromObject;

var SimpleService = (function () {
  function SimpleService() {}
  SimpleService.serviceName = "examplecom.SimpleService";
  return SimpleService;
}());

SimpleService.DoUnary = {
  methodName: "DoUnary",
  service: SimpleService,
  requestStream: false,
  responseStream: false,
  requestType: proto_examplecom_simple_service_pb.UnaryRequest,
  responseType: proto_othercom_external_child_message_pb.ExternalChildMessage
};

SimpleService.DoServerStream = {
  methodName: "DoServerStream",
  service: SimpleService,
  requestStream: false,
  responseStream: true,
  requestType: proto_examplecom_simple_service_pb.StreamRequest,
  responseType: proto_othercom_external_child_message_pb.ExternalChildMessage
};

SimpleService.DoClientStream = {
  methodName: "DoClientStream",
  service: SimpleService,
  requestStream: true,
  responseStream: false,
  requestType: proto_examplecom_simple_service_pb.StreamRequest,
  responseType: google_protobuf_empty_pb.Empty
};

SimpleService.DoBidiStream = {
  methodName: "DoBidiStream",
  service: SimpleService,
  requestStream: true,
  responseStream: true,
  requestType: proto_examplecom_simple_service_pb.StreamRequest,
  responseType: proto_othercom_external_child_message_pb.ExternalChildMessage
};

SimpleService.Delete = {
  methodName: "Delete",
  service: SimpleService,
  requestStream: false,
  responseStream: false,
  requestType: proto_examplecom_simple_service_pb.UnaryRequest,
  responseType: proto_examplecom_simple_service_pb.UnaryResponse
};

exports.SimpleService = SimpleService;

function SimpleServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

SimpleServiceClient.prototype.doUnary = function doUnary(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SimpleService.DoUnary, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SimpleServiceClient.prototype.doServerStream = function doServerStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SimpleService.DoServerStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.end.forEach(function (handler) {
        handler();
      });
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SimpleServiceClient.prototype.doClientStream = function doClientStream(metadata) {
  var listeners = {
    end: [],
    status: []
  };
  var client = grpc.client(SimpleService.DoClientStream, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.end.forEach(function (handler) {
      handler();
    });
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      if (!client.started) {
        client.start(metadata);
      }
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SimpleServiceClient.prototype.doBidiStream = function doBidiStream(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(SimpleService.DoBidiStream, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.end.forEach(function (handler) {
      handler();
    });
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SimpleServiceClient.prototype.delete = function pb_delete(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SimpleService.Delete, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.SimpleServiceClient = SimpleServiceClient;
function SimpleServicePromisesClient(serviceHost, options) {
  this.client = new SimpleServiceClient(serviceHost, options);
}

SimpleServicePromisesClient.prototype.doUnary = function doUnary(requestMessageObj) {
  var client = this.client;
  var requestMessage = FromObject.proto_examplecom_simple_service_pb.UnaryRequest(requestMessageObj);
  return new Promise(function (resolve, reject) {
    client.doUnary(requestMessage, function(error, responseMessage) {
      if (error !== null) {
        reject(error);
      } else {
        resolve(responseMessage.toObject());
      }
    });
  });
};




SimpleServicePromisesClient.prototype.delete = function pb_delete(requestMessageObj) {
  var client = this.client;
  var requestMessage = FromObject.proto_examplecom_simple_service_pb.UnaryRequest(requestMessageObj);
  return new Promise(function (resolve, reject) {
    client.pb_delete(requestMessage, function(error, responseMessage) {
      if (error !== null) {
        reject(error);
      } else {
        resolve(responseMessage.toObject());
      }
    });
  });
};

exports.SimpleServicePromisesClient = SimpleServicePromisesClient;

