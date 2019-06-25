import { exec } from 'child_process';
import React from 'react';
import { render, Box, Color } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

import { fetchConnectionStatus } from './utilities';

const dividerLength = 36;
const dividerChar = '-';
const dividerString = dividerChar.repeat(dividerLength);
const versionTextMatch = new RegExp('^OpenVPN');

// fetch status utility call
// - output to /tmp vpn directory
// - check exists on script call and output
// - clear directory on disconnection or new area connection
//
// sudo openvpn --config ~/script/resource/my_expressvpn_usa_-_san_francisco_udp.ovpn

// display barred output of current status

// add scrollable/selectable/searchable list of location options

// handle enter to connect to new location. esc to exit script with no effect. x to disconnect

// output results before exiting

// delete home script and auth files

class ConnectionDialog extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      version: '-',
      status: '-',
      mode: 'option',
      inputValue: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.fetchVersionInfo = this.fetchVersionInfo.bind(this);
    this.renderVersionInfo = this.renderVersionInfo.bind(this);
    this.renderConnectionStatus = this.renderConnectionStatus.bind(this);
  }

  componentDidMount() {
    this.fetchVersionInfo();
  }

  handleInputChange(inputValue) {
    this.setState({ inputValue });
  }

  handleInputSubmit() {
    const { inputValue } = this.state;

    switch (inputValue) {
      case 'c':
        this.setState({
          mode: 'option',
          inputValue: '',
        });
        break;
      case 's':
        this.setState({
          mode: 'select',
          inputValue: '',
        });
        break;
      case 'e':
        this.setState({
          mode: 'exit',
          inputValue: '',
        });
        break;
      default:
        this.setState({
          mode: 'option',
          inputValue: '',
        });
    }
  }

  fetchVersionInfo() {
    const versionInfo = exec('openvpn --version');
    versionInfo.stdout.on('data', data => {
      const versionOutput = data.split('\n');
      versionOutput.forEach(line => {
        if (versionTextMatch.test(line)) {
          const displayText = line.split('[')[0];
          this.setState({
            version: displayText,
          });
        }
      });
    });
  }

  fetchConnectionStatus() {
    return '-';
  }

  renderDivider(title = 'default') {
    const titleLength = title.length;
    const titlePrepend = dividerChar.repeat(4);
    const titleAppend = dividerChar.repeat(dividerLength - 6 - titleLength);
    const titleString = `${titlePrepend} ${title} ${titleAppend}`;
    return (
      <div>
        <Color yellow>{dividerString}</Color>
        <Color yellow>{titleString}</Color>
        <Color yellow>{dividerString}</Color>
      </div>
    );
  }

  renderVersionInfo() {
    return <Box>{this.state.version}</Box>;
  }

  renderConnectionStatus() {
    return <Box>{this.state.status}</Box>;
  }

  renderModeOptions() {
    const { inputValue } = this.state;
    return (
      <div>
        <Box>[c]lose connection [s]elect new connection [e]xit</Box>
        <TextInput value={inputValue} onChange={this.handleInputChange} onSubmit={this.handleInputSubmit} />
      </div>
    );
  }

  renderConnectionSelection() {
    const items = [
      {
        label: 'San Francisco',
        value: 'sf',
      },
      {
        label: 'Test',
        value: 'test',
      },
    ];
    const handleSelect = item => {
      console.log(`label: ${item.label}, value: ${item.value}`);
    };
    return <SelectInput items={items} onSelect={handleSelect} />;
  }

  render() {
    const { mode } = this.state;
    return (
      <Box width={'100%'} flexDirection={'column'}>
        {this.renderDivider('version')}
        {this.renderVersionInfo()}
        {this.renderDivider('status')}
        {this.renderConnectionStatus()}
        {this.renderDivider(mode)}
        {mode === 'option' && this.renderModeOptions()}
        {mode === 'select' && this.renderConnectionSelection()}
      </Box>
    );
  }
}

render(<ConnectionDialog />);
