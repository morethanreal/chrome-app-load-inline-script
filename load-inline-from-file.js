var xhr = {
  async: true,
  ok: function(inRequest) {
    return (inRequest.status >= 200 && inRequest.status < 300)
        || (inRequest.status === 304)
        || (inRequest.status === 0);
  },
  load: function(url, next, nextContext) {
    url += '?' + Math.random();
    var request = new XMLHttpRequest();
    request.open('GET', url, xhr.async);
    request.responseType = "document";
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        next.call(nextContext, !xhr.ok(request) && request,
          request.response, url);
      }
    });
    request.send();
  }
};

function execute(url) {
  var script = document.createElement('script');
  script.onload = function() {
    document.querySelector('#result').textContent = window.foo && window.foo();
  };
  script.setAttribute('src', url);
  document.head.appendChild(script);
}

function main(fs) {
  xhr.load('x-foo.html', function(err, html) {
    if (err) {
      return;
    }
    var script = html.querySelector('script');
    fs.root.getFile('x-foo.js', {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = execute.bind(this, fileEntry.toURL());
        var blob = new Blob([script.textContent], {type: 'text/plain'});
        fileWriter.write(blob);
      });
    });
  }, window);
}

var rfs = window.requestFileSystem || window.webkitRequestFileSystem;
rfs(window.TEMPORARY, 512 * 1024, main);
