// counterProducer.js
const rabbit = require('rabbit.js');

const context = rabbit.createContext('amqp://localhost');
const pub = context.socket('PUB');
pub.connect('updates');

let counter = 0;
setInterval(() => {
    counter++;
    pub.write(JSON.stringify({ counter }));
}, 1000);

