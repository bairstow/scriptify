"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchConnectionStatus = exports.fetchVersionInfo = void 0;

var _child_process = require("child_process");

const versionTextMatch = new RegExp('^OpenVPN');

const fetchVersionInfo = setState => {
  const versionInfo = (0, _child_process.exec)('openvpn --version');
  versionInfo.stdout.on('data', data => {
    const versionOutput = data.split('\n');
    versionOutput.forEach(line => {
      if (versionTextMatch.test(line)) {
        const displayText = line.split('[')[0];
        console.log(displayText);
        setState({
          version: displayText
        });
      }
    });
  });
};

exports.fetchVersionInfo = fetchVersionInfo;

const fetchConnectionStatus = () => {
  return '-';
};

exports.fetchConnectionStatus = fetchConnectionStatus;