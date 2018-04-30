import request from 'request';
import {expect} from 'chai';

import {Options, createFutureTimeInSeconds} from './../src/helpers';
import {messageForTest, messageTimeInSeconds} from './../config';

describe("Test send message", () => {

  it("Create post to '/echoAtTime' endpoint", done => {
    const time = createFutureTimeInSeconds(messageTimeInSeconds);
    const options = new Options(messageForTest, time);

    request(options, (error, response, body) => {
      if(error) return console.error(error);

      const {message} = body;
      expect(message).to.equal(message);
      done();
    });
  });

});
