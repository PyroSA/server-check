function getStatusFetch (endpoint) {
  console.log('fetch', endpoint);
  const JSON_REQUEST = {
    method: 'get',
    mode: 'no-cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // TODO: Well shit if the client is hosted on HTTPS, the status cannot be retrieved from HTTP
  return fetch(endpoint, JSON_REQUEST)
    .then((response) => response.json())
    .then((result) => {
      return result;
    });
}

function getStatusXHR (endpoint) {
  return new Promise((resolve, reject) => {

    console.log('xhr', endpoint);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint);
    xhr.responseType = 'json';

    xhr.onload = function () {
      console.log(xhr.response);
      resolve(xhr.response);
    };

    xhr.onerror = function (err) {
      console.log("Houston, we've got a problem.");
      console.log(err);
      console.log(xhr);
      reject();
    };
    xhr.send();
  });
}

module.exports = getStatusFetch || getStatusXHR;
