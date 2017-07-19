if (getParameterByName("embed") !== null) {
  var load = document.createElement("DIV");
  load.style.width = "100%";
  load.style.height = "100%";
  load.style.backgroundColor = "#08b";
  load.style.zIndex = "1";
  load.style.position = "relative";
  load.style.opacity = "1";
  load.style.transition = "opacity 1s 1s, z-index 0s 2s";
  document.body.appendChild(load);
  var divs = document.getElementsByTagName("div");
  var box = document.getElementsByClassName("box")[0];
  for (var i = 0; i < divs.length; i++) {
    if (divs[i] !== load) {
      divs[i].style.transition = "0s";
      if (!isDescendant(box, divs[i]) && box !== divs[i]) {
        divs[i].style.visibility = "hidden";
        divs[i].style.height = "0px";
        divs[i].style.position = "fixed";
        divs[i].style.top = "0px";
        divs[i].style.left = "0px";
      }
      else {
        divs[i].style.visibility = "visible";
      }
    }
  }
  box.style.position = "fixed";
  box.style.top = "0px";
  box.style.left = "0px";
  var start = document.createElement("BUTTON");
  start.innerHTML = "Start!";
  start.style.position = "fixed";
  start.style.top = "50%";
  start.style.left = "50%";
  start.style.backgroundColor = "#333";
  start.style.transform = "translate(-50%, -50%)";
  start.onclick = function () {
    load.style.opacity = "0";
    load.style.zIndex = "-1";
    start.style.color = "#08b";
    start.style.backgroundColor = "#08b";
    start.style.boxShadow = "0px 0px 0px #08b";
  }
  load.appendChild(start);
}
//load.style.opacity = "0";

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isDescendant(parent, child) {
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}