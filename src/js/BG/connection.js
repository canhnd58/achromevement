const ports = {};

export const onConnect = cb =>
  new Promise(resolve => {
    chrome.runtime.onConnect.addListener(port => {
      ports[port.name] = port;
      port.onDisconnect.addListener(() => {
        delete ports[port.name];
      });
      cb && cb(port);
      resolve();
    });
  });

export const listen = (portname, action, cb) => {
  ports[portname] &&
    ports[portname].onMessage.addListener(msg => {
      if (msg.action === action && cb) {
        cb(msg.data);
      }
    });
};

export const send = (portname, action, data) => {
  ports[portname] && ports[portname].postMessage({ action, data });
};
