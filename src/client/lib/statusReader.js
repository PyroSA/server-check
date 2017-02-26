function getStatusXHR (endpoint) {
  return new Promise((resolve, reject) => {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', endpoint);
    xhr.responseType = 'json';

    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onerror = function (err) {
      console.error("Houston, we've got a problem.", err, xhr);
      reject();
    };
    xhr.send();
  });
}

module.exports = getStatusXHR;
