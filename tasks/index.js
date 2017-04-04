// bouchon-tasks/tasks/index.js

import _ from 'lodash';
import { createAction } from 'bouchon';
import { createSelector } from 'bouchon';

// Your actions using redux-act (https://github.com/pauldijou/redux-act)
const actions = {
  get: createAction('Retrieve all tasks'),
  getOne: createAction('Retrieve a task'),
  create: createAction('Create a task'),
  update: createAction('Update a task'),
  delete: createAction('Delete a task'),
};

// Your selectors using reselect (https://github.com/rackt/reselect)
const selectors = {};

// A selector returning all the tasks
selectors.getAllTasks = () => state => state.tasks;

// A selector sorting all tasks and returning the one with the highest id number
selectors.getLastTask = () => createSelector(
  selectors.getAllTasks(),
  tasks => (
    _.values(tasks).sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    }).slice(0).pop()
  )
);

// A selector that returns the last created task, and formats it
// into a valid response object to simulate an API answer to our POST
selectors.getCreatedTask = () => createSelector(
  selectors.getLastTask(),
  task => ({
    id: task.id,
    message: 'Task Created',
  }),
);

// A selector that returns a task from a given id
selectors.getOneTask = ({ taskId }) => createSelector(
  selectors.getAllTasks(),
  tasks => _.find(tasks, ['id', Number(taskId)]) || {},
)

// Your handlers
const createTaskHandler = (
  state,
  {
    /* params, */                 // route parameters if there was any
    body: { description, title }, // body parameters sent with the POST request
  },
) => {
  // Get the last created task identifier
  const lastTaskCreatedId = _.values(state)
    .sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    }).slice(0).pop().id;

  // Increment it in order to assign it to the future task
  const newTaskId = lastTaskCreatedId + 1;

  // Prepare the content of the new task
  return ([
    ...state,
    {
      description,
      id: newTaskId,
      status: 'open',
      title,
    },
  ]);
};

const updateTaskHandler = (
  state,
  {
    params: { taskId }, // route parameters
    body,               // body parameters sent with the PATCH request
  },
) => state.map(task => {
  // If a task is found for the given taskId, update its parameters
  if (task.id === Number(taskId)) {
    return {
      ...task,
      ...body,
    };
  }
  return task;
});

const deleteTaskHandler = (
  state,
  {
    params: { taskId }, // route parameters
    /* body, */         // body parameters if there was any
  },
) => state.filter(task => task.id !== Number(taskId));

// Your reducer
const reducer = {
  [actions.get]: state => state,
  [actions.create]: createTaskHandler,
  [actions.update]: updateTaskHandler,
  [actions.delete]: deleteTaskHandler,
};

// Your routes
const routes = {
  'GET /': {
    action: actions.get,
    selector: selectors.getAllTasks,
    status: 200,
  },
  'GET /:taskId': {
    action: actions.getOne,
    selector: selectors.getOneTask,
    status: 200,
  },
  'POST /': {
    action: actions.create,
    selector: selectors.getCreatedTask,
    status: 201,
  },
  'PATCH /:taskId': {
    action: actions.update,
    selector: selectors.getOneTask,
    status: 201,
  },
  'DELETE /:taskId': {
    action: actions.delete,
    responseBody: {},
    status: 204,
  }
};

export default {
  name: 'tasks',
  data: require('./data.json'),
  reducer: reducer,
  endpoint: 'tasks',
  routes: routes,
}
