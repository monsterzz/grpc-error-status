# grpc-error-status

[![Build Status](https://travis-ci.org/monsterzz/grpc-error-status.svg?branch=master)](https://travis-ci.org/monsterzz/grpc-error-status)

Install package:

    npm install grpc-error-status --save

Working with gRPC errors made easy:

    const grpcStatus = require('grpc-error-status');
    
    client.sayHello({name: 'you'}, (err, resp) => {
      const status = grpcStatus.parse(err);
      if (status != null) {
        console.log(status.toObject());
        return;
      }
      console.log('Greeting:', response.message);
    });

All required types are included.
See ```protos/google/rpc/*.proto``` to find possible types of error details and Status structure.
