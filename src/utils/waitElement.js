/**
 * @file src/waitElement.js
 * @author maoquan(maoquan@htsc.com)
 *  等待指定dom ready的工具方法
 */
function waitElementReady(selector, callback) {
  var elem = document.querySelector(selector);

  if (elem !== null) {
    callback(elem);
    return;
  }

  setTimeout(function () {
    waitElementReady(selector, callback);
  }, 200);
}

function delay(duration) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration);
  });
}

function waitElement(selector) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
  var waitPromise = new Promise(function (resolve) {
    waitElementReady(selector, function (elem) {
      return resolve(elem);
    });
  });
  return Promise.race([delay(timeout), waitPromise]);
}

export default waitElement;
