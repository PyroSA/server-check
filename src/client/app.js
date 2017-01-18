var Vue = require('vue');
const statusReader = require('./lib/statusReader');

const SERVER_STORAGE_KEY = 'server-check';
const ServerStorage = require('./lib/serverStorage');
const serverStorage = new ServerStorage(SERVER_STORAGE_KEY);

var app = function () {
  return new Vue({
    el: '#app',
    data: {
      newServer: '',
      servers: serverStorage.load(),
      editedServer: null
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
        this.servers.splice(this.servers.indexOf(server), 1);
      },

      checkServer: function (server) {
        statusReader(server.endpoint)
          .then((result) => {
            console.log({ endpoint: server.endpoint, result });
          });
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
      }
    }
  });
};

module.exports = app;
