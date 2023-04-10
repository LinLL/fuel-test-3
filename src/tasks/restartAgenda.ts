import { Agenda } from "@hokify/agenda";
import { mongoConnectionAgendaString, FuelTransferTarget } from "../../config";
import { defineTranserTask, initAndInsertDBAllFuelTransTasks } from "./taskmananger";

const agenda = new Agenda({db: {address: mongoConnectionAgendaString}});
defineTranserTask(agenda);
//initAndInsertDBAllFuelTransTasks(14);
async function restart() {
    console.log("restart agenda");
    try{
    await agenda.start();
    }catch(error){
        console.log(error)
    }
}

restart()