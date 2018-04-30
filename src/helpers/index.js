import moment from 'moment';
import {port, endPoint} from './../../config';

const Success = function(message, time) {
  this.message = message;
  this.time = time;
};

const Failed = function(message) {
  this.message = message;
};

const isEmpty = val => val == null || !(Object.keys(val) || val).length;

const Options = function (message, time) {
  this.method = 'post';
  this.body = {
    message,
    time
  };
  this.json = true;
  this.url = `http://localhost:${port}${endPoint}`;
};

const createFutureTimeInSeconds = time =>
  moment().add(time, 's').utc().unix();

export {Success, Failed, isEmpty, Options, createFutureTimeInSeconds};