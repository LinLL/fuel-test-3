

export interface Task {
    name: string;
    params: { [key: string]: any };
  }
  
export const taskList: Task[] = [
    { name: 'task1', params: { param1: 'value1', param2: 'value2' } },
    { name: 'task1', params: { param1: 'value3', param2: 'value4' } },
    { name: 'task1', params: { param1: 'value5', param2: 'value6' } },
];


