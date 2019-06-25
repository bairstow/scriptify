"use strict";

var _child_process = require("child_process");

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

var _inkSelectInput = _interopRequireDefault(require("ink-select-input"));

var _utilities = require("./utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dividerLength = 36;
const dividerChar = '-';
const dividerString = dividerChar.repeat(dividerLength);
const versionTextMatch = new RegExp('^OpenVPN'); // fetch status utility call
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

class ConnectionDialog extends _react.default.PureComponent {
  constructor() {
    super();
    this.state = {
      version: '-',
      status: '-',
      mode: 'option',
      inputValue: ''
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
    this.setState({
      inputValue
    });
  }

  handleInputSubmit() {
    const {
      inputValue
    } = this.state;

    switch (inputValue) {
      case 'c':
        this.setState({
          mode: 'option',
          inputValue: ''
        });
        break;

      case 's':
        this.setState({
          mode: 'select',
          inputValue: ''
        });
        break;

      case 'e':
        this.setState({
          mode: 'exit',
          inputValue: ''
        });
        break;

      default:
        this.setState({
          mode: 'option',
          inputValue: ''
        });
    }
  }

  fetchVersionInfo() {
    const versionInfo = (0, _child_process.exec)('openvpn --version');
    versionInfo.stdout.on('data', data => {
      const versionOutput = data.split('\n');
      versionOutput.forEach(line => {
        if (versionTextMatch.test(line)) {
          const displayText = line.split('[')[0];
          this.setState({
            version: displayText
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
    return _react.default.createElement("div", null, _react.default.createElement(_ink.Color, {
      yellow: true
    }, dividerString), _react.default.createElement(_ink.Color, {
      yellow: true
    }, titleString), _react.default.createElement(_ink.Color, {
      yellow: true
    }, dividerString));
  }

  renderVersionInfo() {
    return _react.default.createElement(_ink.Box, null, this.state.version);
  }

  renderConnectionStatus() {
    return _react.default.createElement(_ink.Box, null, this.state.status);
  }

  renderModeOptions() {
    const {
      inputValue
    } = this.state;
    return _react.default.createElement("div", null, _react.default.createElement(_ink.Box, null, "[c]lose connection [s]elect new connection [e]xit"), _react.default.createElement(_inkTextInput.default, {
      value: inputValue,
      onChange: this.handleInputChange,
      onSubmit: this.handleInputSubmit
    }));
  }

  renderConnectionSelection() {
    const items = [{
      label: 'San Francisco',
      value: 'sf'
    }, {
      label: 'Test',
      value: 'test'
    }];

    const handleSelect = item => {
      console.log(`label: ${item.label}, value: ${item.value}`);
    };

    return _react.default.createElement(_inkSelectInput.default, {
      items: items,
      onSelect: handleSelect
    });
  }

  render() {
    const {
      mode
    } = this.state;
    return _react.default.createElement(_ink.Box, {
      width: '100%',
      flexDirection: 'column'
    }, this.renderDivider('version'), this.renderVersionInfo(), this.renderDivider('status'), this.renderConnectionStatus(), this.renderDivider(mode), mode === 'option' && this.renderModeOptions(), mode === 'select' && this.renderConnectionSelection());
  }

}

(0, _ink.render)(_react.default.createElement(ConnectionDialog, null));