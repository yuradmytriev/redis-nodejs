import {timeForTest} from './../config';

//TODO change to event emitter
const sendMessage = async (redisDb) => {
  let timeout;
  const send = async () => {
    clearTimeout(timeout);

    const currentTime = Math.floor(new Date() / 1000);
    await redisDb.getMessagesToSend(currentTime);

    const message = await redisDb.quePop();

    if(message) {
      console.log(message);
      send();
      return;
    }

    timeout = setTimeout(send, timeForTest);
  };
  send();
};

export default sendMessage;