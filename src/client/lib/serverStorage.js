function ServerStorage (storageKey) {
  this._storageKey = storageKey;
}

ServerStorage.prototype.load = function () {
  var servers = JSON.parse(localStorage.getItem(this._storageKey) || '[]');
  servers.forEach(function (server, index) {
    server.id = index;
  });
  this.uid = servers.length;
  return servers;
};

ServerStorage.prototype.save = function (servers) {
  localStorage.setItem(this._storageKey, JSON.stringify(servers));
};

module.exports = ServerStorage;
