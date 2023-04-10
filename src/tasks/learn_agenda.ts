import { Agenda } from "@hokify/agenda";
const mongoConnectionString = 'mongodb://127.0.0.1/agenda';

const agenda = new Agenda({db: {address: mongoConnectionString}});

// Or override the default collection name:
// const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName'}});

// or pass additional connection options:
// const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName', options: {ssl: true}}});

// or pass in an existing mongodb-native MongoClient instance
// const agenda = new Agenda({mongo: myMongoClient});
function defineTask() {
  agenda.define('delete old users', async job => {
    console.log(job.attrs.data);
    console.log(job.attrs.data.para1);
    console.log("delete old users");
 } );
}

defineTask()

(async function() {
  // 等待 Agenda 连接到数据库
  await agenda.start();

  // 获取数据库中所有任务
  const jobs = await agenda.jobs();

  // 遍历所有任务，并输出其状态
  jobs.forEach((job) => {
    console.log(`Task ${job.attrs.name} status:`);
    console.log(`  - Data: ${JSON.stringify(job.attrs.data)}`);
    console.log(`  - Last run time: ${job.attrs.lastRunAt}`);
    console.log(`  - Failed at: ${job.attrs.failedAt}`);
  });
})();

(async function() { // IIFE to give access to async/await

  agenda.schedule(new Date(Date.now() + 1000), 'delete old users', {para1: 'para1', para2: 'para2'});
  agenda.schedule(new Date(Date.now() + 3000), 'delete old users');
  agenda.schedule(new Date(Date.now() + 10000), 'delete old users');
  await agenda.start();


  //await agenda.every( "1 minutes", 'delete old users');

  // Alternatively, you could also do:
  //await agenda.every('*/1 * * * *', 'delete old users');
})();




