const cluster = require('cluster');
const http = require('http');
const cpus = require('os').cpus();
const _ = require('lodash');

const hosts = [];

const initMaster = function () {
  for (var i = 0; i < cpus.length; i++) {
    console.log(`${cpus[i].model} @ ${cpus[i].speed}`);
    const worker = cluster.fork();
    hosts.push(worker.id);
  }

  cluster.on('exit', (info) => {
    const worker = cluster.fork();
    hosts.splice(hosts.indexOf(info.id), 1, worker.id);
    console.log(`Child process ${info.id} killed, fork()-ed a new one`);
    console.log(hosts);
  });
};

const initChild = function () {
  console.log(`Starting child process ${cluster.worker.id}`);
  return require('./statusServer')(8000 + cluster.worker.id);
};

(function () {
  if (cluster.isMaster) {
    initMaster();
  } else {
    initChild();
  }
})();
