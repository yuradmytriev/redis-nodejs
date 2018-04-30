const router = require('express').Router();

import {Success, Failed} from './../helpers';

router.post('/echoAtTime', (req, res) => {
  const {body: {message, time}, redisDb} = req;
  const success = new Success(message, time);

  redisDb.saveMessage(message, time);
  res.status(200).json(success)
});

router.all('/*', (req, res) => {
  const failed = new Failed('Not found');

  res.status(404).json(failed);
});


export default router;