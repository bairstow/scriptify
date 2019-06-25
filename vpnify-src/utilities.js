import { exec } from 'child_process';

const versionTextMatch = new RegExp('^OpenVPN');

export const fetchVersionInfo = setState => {
  const versionInfo = exec('openvpn --version');
  versionInfo.stdout.on('data', data => {
    const versionOutput = data.split('\n');
    versionOutput.forEach(line => {
      if (versionTextMatch.test(line)) {
        const displayText = line.split('[')[0];
        console.log(displayText);
        setState({
          version: displayText,
        });
      }
    });
  });
};

export const fetchConnectionStatus = () => {
  return '-';
};
