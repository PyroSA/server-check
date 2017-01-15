const SERVER_STORAGE_KEY = 'server-check';
const serverStorage = {
  load: function () {
    var servers = JSON.parse(localStorage.getItem(SERVER_STORAGE_KEY) || '[]')
    servers.forEach(function (server, index) {
      server.id = index
    });
    serverStorage.uid = servers.length
    return servers
  },
  save: function (servers) {
    localStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(servers))
  }
}

var app = new Vue({
  el: '#app',
  data: {
    newServer: '',
    servers: serverStorage.load(),
    editedServer: null
  },
  watch: {
    servers: {
      handler: function (servers) {
        serverStorage.save(servers)
      },
      deep: true
    }
  },
  filters: {
    pluralize: function (n) {
      return n === 1 ? 'server' : 'servers'
    }
  },
  computed: {
    monitoring: function () {
      return this.servers.filter(function (server) {
        return server.monitor
      }).length;
    }
  },
  methods: {
    addServer: function () {
      var value = this.newServer && this.newServer.trim()
      if (!value) {
        return
      }
      this.servers.push({
        id: serverStorage.uid++,
        name: value,
        host: value,
        monitor: false
      })
      this.newServer = ''
    },

    removeServer: function (server) {
      this.servers.splice(this.servers.indexOf(server), 1)
    },

    editServer: function (server) {
      this.beforeEditCache = {
        name: server.name,
        host: server.host
      }
      this.editedServer = server
    },

    doneEdit: function (server) {
      if (!this.editedServer) {
        return
      }
      this.editedServer = null
      server.name = server.name.trim()
      server.host = server.host.trim()
      if (!server.name) {
        this.removeServer(server)
      }
    },

    cancelEdit: function (server) {
      this.editedServer = null
      server.name = this.beforeEditCache.name;
      server.host = this.beforeEditCache.host;
    }
  },
})
