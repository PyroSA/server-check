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

module.exports = getStatusXHR;
