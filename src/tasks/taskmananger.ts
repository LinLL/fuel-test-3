import { Agenda } from "@hokify/agenda";
import { mongoConnectionAgendaString, FuelTransferTarget } from "../../config";
import { taskList, Task } from './taskList';
import { transfer } from "../swapFuel";
import mongoose from "mongoose";
import { getAllMnemonic } from "../mongoInterface/fuelMongoInterface";


export function defineTranserTask(agenda: Agenda){
    agenda.define('FuelTransferTask', async (job,done) => {
        try{
            await transfer(job.attrs.data.mnemonic, job.attrs.data.toAddressString, job.attrs.data.amount);
        console.log(`transfer ${job.attrs.data.amount} fuel to ${job.attrs.data.toAddressString} at ${job.attrs.data.date} success!`)
            done();
        }catch(error){
            console.log(error);
            let e = error as Error
            done(e)
        }
        } );
}



export async function scheduleRandomTasks(tasks: Task[], agenda: Agenda) {

  var numTasks = tasks.length;
  // Select random tasks from taskList
  
  for (let i = 0; i < numTasks; i++) {
    const index = Math.floor(Math.random() * tasks.length);
    const task = tasks[index];
    tasks.push(task);
    tasks.splice(index, 1);
  }
  // Schedule tasks with random delay within the next hour
  for (const task of tasks) {
    console.log(`Scheduling task ${task.name} with params ${JSON.stringify(task.params)} at time ${task.params.date}`);
    const scheduleTask = await agenda.schedule(new Date(task.params.date), task.name, task.params);
  }


}



async function initAllFuelTransferTasks(chixuTianshu: number){
    await mongoose.connect('mongodb://localhost:27017/fuel');   

    const transferTasks : Task[] = []
    const mnemonics = await getAllMnemonic();

    const taskDateList = generateSchedule(mnemonics.length+1, chixuTianshu, Math.ceil(mnemonics.length/chixuTianshu)+1);
    for (var m of mnemonics){
        const taskdate = taskDateList.pop();
        transferTasks.push({ name: 'FuelTransferTask', params:{ mnemonic: m, toAddressString: FuelTransferTarget, amount: 1 , date:taskdate['date']} });
    }
    await mongoose.connection.destroy();

    return transferTasks;
}


interface Schedule {
    date: Date;
  }
  
  function generateSchedule(numTasks: number, numDays: number, numTasksPerDay: number): Schedule[] {
    const startTime = 9 * 60 + 30; // 9:30 AM in minutes
    const endTime = 17 * 60; // 5:00 PM in minutes
    const totalMinsPerDay = endTime - startTime;
    const totalTasks = numDays * numTasksPerDay;
    
    // Distribute tasks evenly over the time span
    const tasksPerTimeSlot = Math.ceil(numTasks / totalTasks);
    const timeSlotsPerDay = Math.floor(totalMinsPerDay / tasksPerTimeSlot);
    
    // Generate a list of all available time slots for each day
    const timeSlots: Schedule[] = [];
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const shuffleArray = shuffle([...Array(numTasksPerDay).keys()]); // 将每天的任务数初始化为 [0, 1, ..., numTasksPerDay-1] 并随机排列
      shuffleArray.forEach((j) => {
        const randomOffset = Math.floor(Math.random() * timeSlotsPerDay); // 随机产生一个时间偏移量
        const currentTime = new Date(currentDate.setHours(0, startTime + j * tasksPerTimeSlot + randomOffset));
        timeSlots.push({ date: currentTime });
      });
    }
    
    // Randomly assign tasks to time slots
    const randomTimeSlots = shuffle(timeSlots);
    const schedule: Schedule[] = [];
    for (let i = 0; i < numTasks; i++) {
      if (i < totalTasks) {
        schedule.push(randomTimeSlots[i]);
      }
    }
    
    // Sort the schedule by date and time
    schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return schedule;
  }
  
  // Helper function to shuffle an array
  function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  

  



//main
export async function initAndInsertDBAllFuelTransTasks (days: number)  {

    const mongoosedbConnect = await mongoose.createConnection(mongoConnectionAgendaString);
    const agenda = new Agenda();
    agenda.mongo(mongoosedbConnect, 'agendaJobs');
    
    
    const transferTaskList = await initAllFuelTransferTasks(days);

    await scheduleRandomTasks(transferTaskList, agenda);
    console.log('All tasks scheduled successfully!');
    
    console.log('Stopping Agenda...');

    mongoosedbConnect.destroy()

} 

 //initAndInsertDBAllFuelTransTasks(14);

