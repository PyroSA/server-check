function getStatus (endpoint) {
  const JSON_REQUEST = {
    method: 'get',
    mode: 'no-cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO: Our server isn't working cross-host... Fix it!
  return fetch(endpoint, JSON_REQUEST)
    .then((response) => response.json())
    .then((result) => {
      return result;
    });
}

module.exports = getStatus;
