import redis from 'redis';
import bluebird from 'bluebird';

import {isEmpty} from './../helpers';

const {RedisClient} = redis;
bluebird.promisifyAll(RedisClient.prototype);

class Redis {
  constructor() {
    this.client;
    this.id;
  }

  createConnection() {
    const client = redis.createClient();
    const {connection_options: {port, host}} = client;

    client.on('connect', () =>
      console.log(`Redis client connected at port: ${port} and host: ${host}`));

    this.client = client;
  }

  /*-------- id -----------*/

  async createMessageId() {
    try {
      return await this.client.incrAsync('message:id');
    }
    catch (err) {
      console.error(err);
    }
  }

  async getInitId() {
    try {
      return await this.client.getAsync('message:id');
    }
    catch (err) {
      console.error(err);
    }
  }

  async setMessageId(id) {
    try {
      return await this.client.setAsync('message:id', id);
    }
    catch (err) {
      console.error(err);
    }
  }

  async initMessageId() {
    try {
      const id = await this.getInitId();
      if (isEmpty(id)) {
        const initId = 1;
        await this.setMessageId(initId);
        this.id = initId;
      }
      this.id = id;
    }
    catch (err) {
      console.error(err);
    }
  }

  async getMessageId() {
    try {
      return await this.client.incrAsync('message:id');
    }
    catch (err) {
      console.error(err);
    }
  }

  /*-------- id -----------*/


  /*-------- set message to object -------*/

  async setMessageObject(id, message, time) {
    try {
      return await this.client.hmsetAsync(`message:data:${id}`, {message, time});
    }
    catch (err) {
      console.error(err);
    }
  }

  async getMessageObject(id) {
    try {
      return await this.client.hgetallAsync(`message:data:${id}`);
    }
    catch (err) {
      console.error(err);
    }
  }

  async deleteMessageObject(id) {
    try {
      return await this.client.delAsync(`message:data:${id}`);
    }
    catch (err) {
      console.error(err);
    }
  }

  /*-------- set message to object -------*/


  /*------------ que --------------*/

  async quePush(message) {
    try {
      return await this.client.saddAsync('message:queue', message);
    }
    catch (err) {
      console.error(err);
    }
  }

  async quePop() {
    try {
      return await this.client.spopAsync('message:queue');
    }
    catch (err) {
      console.error(err);
    }
  }

  /*------------ que --------------*/


  /*----------- queue --------------*/

  async setMessageToQueue(id, time) {
    try {
      return await this.client.zaddAsync('message:list', time, id);
    }
    catch (err) {
      console.error(err);
    }
  }

  async getMessagesFromQueue(time) {
    try {
      return await this.client.zrangebyscoreAsync('message:list', 0, time);
    }
    catch (err) {
      console.error(err);
    }
  }

  async removeMessagesFromQueue(time) {
    try {
      return await this.client.zremrangebyscoreAsync('message:list', 0, time);
    }
    catch (err) {
      console.error(err);
    }
  }

  async saveMessage(message, time) {
    const id = await this.getMessageId();
    await this.setMessageObject(id, message, time);
    await this.setMessageToQueue(id, time);
    return id;
  }

  //TODO refactor
  async getMessagesToSend(time) {
    const messageQueue = await this.getMessagesFromQueue(time);
    const removedMessageQueue = await this.removeMessagesFromQueue(time);

    if (isEmpty(messageQueue)) return;
    const message = messageQueue.slice(-removedMessageQueue);
    await Promise.all(message.map(id => this.processMessage(id)));
  }

  async processMessage(id) {
    const {message} = await this.getMessageObject(id);

    await this.deleteMessageObject(id);
    await this.quePush(message);
  }
}

const createRedisConnection = async () => {
  const redisClient = new Redis();
  await redisClient.createConnection();
  await redisClient.initMessageId();
  return redisClient;
};

export default createRedisConnection;

