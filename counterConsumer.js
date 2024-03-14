// counterConsumer.js
const rabbit = require('rabbit.js');
const redis = require('redis');

const context = rabbit.createContext('amqp://localhost');
const sub = context.socket('SUB');
sub.connect('updates');

const client = redis.createClient();

sub.on('data', data => {
    const { counter } = JSON.parse(data);
    acquireLock(() => {
        client.get('counterLock', (err, lock) => {
            if (lock) {
                console.log('Another process is holding the lock. Skipping update.');
                return;
            }
            client.set('counterLock', 'locked', 'EX', 5, 'NX', (err, lockSet) => {
                if (lockSet) {
                    client.rpush('updateQueue', counter, (err, reply) => {
                        if (err) {
                            console.error('Error pushing to update queue:', err);
                            releaseLock();
                            return;
                        }
                        console.log('Counter updated to:', counter);
                        updateCounter();
                    });
                } else {
                    console.log('Failed to acquire lock. Skipping update.');
                }
            });
        });
    });
});

function updateCounter() {
    client.lpop('updateQueue', (err, reply) => {
        if (err) {
            console.error('Error popping from update queue:', err);
            releaseLock();
            return;
        }
if (reply !== null) {
            client.set('counter', reply, (err, reply) => {
                if (err) {
                    console.error('Error updating counter:', err);
                    releaseLock();
                    return;
                }
                console.log('Counter updated successfully.');
                notifyUpdate();
                releaseLock();
            });
        } else {
            console.log('Queue is empty. No update needed.');
            releaseLock();
        }
    });
}

function acquireLock(callback) {
    client.set('counterLock', 'locked', 'EX', 5, 'NX', (err, lockSet) => {
        if (err) {
            console.error('Error acquiring lock:', err);
            return;
        }
        if (lockSet) {
            callback();
        } else {
            console.log('Failed to acquire lock. Another process is holding it.');
        }
    });
}

function releaseLock() {
    client.del('counterLock', (err, reply) => {
        if (err) {
            console.error('Error releasing lock:', err);
            return;
        }
        console.log('Lock released.');
    });
}

function notifyUpdate() {
    const pub = context.socket('PUB');
    pub.connect('updateNotifications');
    pub.write(JSON.stringify({ message: 'Counter updated successfully' }));
    pub.close();
}
