const Vue = require('vue');

const statusReader = require('./lib/statusReader');

const SERVER_STORAGE_KEY = 'server-check';
const ServerStorage = require('./lib/serverStorage');
const serverStorage = new ServerStorage(SERVER_STORAGE_KEY);

const CHECK_FREQUENCY = 30000;

const mainChart = new window.Chartist.Line('.ct-chart', { labels: ['new'], series: [[0, 30, 60, 90, 0, 100]] });

const updateGraphs = (servers, graphs, element = 'rtt') => {
  const data = {
    labels: servers.map((server) => server.name),
    series: graphs.map((graph) => graph[element])
  };
  mainChart.update(data);
};

const inhumanize = (input) => {
  return input.toString().replace('GB', 'e9').replace('MB', 'e6').replace('MB', 'e3');
};

const calculateGraphs = (responses, graph) => {
  graph.rtt = responses.map((response) => response.rtt);
  graph.cpu = responses.map((response) => response.os.load['1m']);
  graph.memFree = responses.map((response) => inhumanize(response.os.mem.free));
  graph.memRss = responses.map((response) => inhumanize(response.process.mem.rss));
  graph.memProc = responses.map((response) => inhumanize(response.process.mem.used));
};

const checkServer = (server, responses, graph) => {
  const startTime = new Date();
  return statusReader(server.endpoint)
    .then((result) => {
      result.rtt = new Date() - startTime;
      responses.push(result);
      while (responses.length > 100) {
        responses.shift();
      }
      calculateGraphs(responses, graph);
    });
};

const checkServers = (servers, responses, graphs, index) => {
  const promises = [];
  if (index === undefined) {
    servers.forEach(function (server, index) {
      if (server.monitor) {
        promises.push(checkServer(servers[index], responses[index], graphs[index]));
      }
    });
  } else {
    promises.push(checkServer(servers[index], responses[index], graphs[index]));
  }
  Promise.all(promises)
    .then(() => {
      updateGraphs(servers, graphs, 'rtt');
    });
};

var app = function () {
  return new Vue({
    el: '#app',
    components: {
    },
    data: {
      editedServer: null,
      newServer: '',
      graphs: [],
      responses: [],
      servers: serverStorage.load()
    },
    watch: {
      servers: {
        handler: function (servers) {
          serverStorage.save(servers);
        },
        deep: true
      }
    },
    filters: {
      pluralize: function (n) {
        return n === 1 ? 'server' : 'servers';
      }
    },
    computed: {
      monitoring: function () {
        return this.servers.filter(function (server) {
          return server.monitor;
        }).length;
      }
    },
    methods: {
      addServer: function () {
        var value = this.newServer && this.newServer.trim();
        if (!value) {
          return;
        }
        this.servers.push({
          id: serverStorage.uid++,
          name: value,
          endpoint: value,
          monitor: false
        });
        this.newServer = '';
      },

      removeServer: function (server) {
        const index = this.servers.indexOf(server);
        this.graphs.splice(index, 1);
        this.servers.splice(index, 1);
        this.responses.splice(index, 1);
      },

      editServer: function (server) {
        this.beforeEditCache = {
          name: server.name,
          endpoint: server.endpoint
        };
        this.editedServer = server;
      },

      doneEdit: function (server) {
        if (!this.editedServer) {
          return;
        }
        this.editedServer = null;
        server.name = (server.name || '').trim();
        server.endpoint = (server.endpoint || '').trim();
        if (!server.name) {
          this.removeServer(server);
        }
      },

      cancelEdit: function (server) {
        this.editedServer = null;
        server.name = this.beforeEditCache.name;
        server.endpoint = this.beforeEditCache.endpoint;
      },

      checkServers: function (index) {
        checkServers(this.servers, this.responses, this.graphs, index);
      }
    },

    mounted: function () {
      this.servers.forEach((server) => {
        this.graphs.push({rtt: [9]});
        this.responses.push([]);
      });
      this.checkServers();
      setInterval(() => checkServers(this.servers, this.responses, this.graphs), CHECK_FREQUENCY);
    }
  });
};

module.exports = app;
