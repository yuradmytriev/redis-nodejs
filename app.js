import express from 'express';
import bodyParser from 'body-parser';
import cluster from 'express-cluster'; //or pm2

import {port} from './config';
import {router} from './src/routers';
import createRedisConnection from './src/db/redis';
import sendMessage from './src/sendMessage';

const cpuCount = 2; //or use os.cpus().length
const clusterSettings = {count: cpuCount};

cluster(() => {
  const app = express();
  const listenPort = process.env.PORT || port;

  app.use(bodyParser.json());

  const start = async () => {
    const redisDb = await createRedisConnection();
    await sendMessage(redisDb);
    app.use((req, res, next) => {
      req.redisDb = redisDb;
      next();
    });
    app.use("/", router);
  };

  start();

  app.listen(listenPort, () => console.log('app started'));

}, clusterSettings);