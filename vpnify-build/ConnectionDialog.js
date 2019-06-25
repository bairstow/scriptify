"use strict";

var _child_process = require("child_process");

var _react = _interopRequireDefault(require("react"));

var _moment = _interopRequireDefault(require("moment"));

var _ink = require("ink");

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

var _inkSelectInput = _interopRequireDefault(require("ink-select-input"));

var _utilities = require("./utilities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dateFormat = 'DD_MM_YYYY';
const dividerLength = 36;
const dividerChar = '-';
const dividerString = dividerChar.repeat(dividerLength);
const versionTextMatch = new RegExp('^OpenVPN');

class ConnectionDialog extends _react.default.PureComponent {
  constructor() {
    super();
    this.state = {
      version: '-',
      status: '-',
      connectionOptions: [],
      mode: 'option',
      inputValue: '',
      logFilename: '',
      versionInfoProcess: null,
      logOutputProcess: null,
      connectionFilesProcess: null,
      connectionProcess: null
    };
    this.killProcess = this.killProcess.bind(this);
    this.fetchVersionInfo = this.fetchVersionInfo.bind(this);
    this.fetchConnectionStatus = this.fetchConnectionStatus.bind(this);
    this.fetchConnectionOptions = this.fetchConnectionOptions.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleConnectionSelection = this.handleConnectionSelection.bind(this);
    this.renderVersionInfo = this.renderVersionInfo.bind(this);
    this.renderConnectionStatus = this.renderConnectionStatus.bind(this);
    this.renderConnectionSelection = this.renderConnectionSelection.bind(this);
  }

  componentDidMount() {
    this.fetchVersionInfo();
    this.fetchConnectionOptions();
  }

  componentWillUnmount() {
    this.killAllActiveProcesses();
  }

  killActiveConnection() {
    this.killProcess('connectionProcess');
  }

  killAllActiveProcesses() {
    const processKeys = ['versionInfoProcess', 'logOutputProcess', 'connectionFilesProcess', 'connectionProcess'];
    processKeys.forEach(key => this.killProcess(key));
  }

  killProcess(processKey) {
    const process = this.state[processKey];
    if (!!process && process.hasOwnProperty('kill')) value.kill();
  }

  fetchVersionInfo() {
    const versionInfoProcess = (0, _child_process.exec)('openvpn --version');
    versionInfoProcess.stdout.on('data', data => {
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
    this.setState({
      versionInfoProcess
    });
  }

  fetchConnectionStatus(filename) {
    const logOutputProcess = (0, _child_process.exec)(`sudo tail -8f ${filename}`);
    logOutputProcess.stdout.on('data', data => {
      this.setState({
        status: data
      });
    });
    this.setState({
      logOutputProcess
    });
  }

  fetchConnectionOptions() {
    const connectionFilesProcess = (0, _child_process.exec)('ls /etc/openvpn/client/config');
    connectionFilesProcess.stdout.on('data', data => {
      const rawOptions = data.split('\n');
      const connectionOptions = rawOptions.slice(0, rawOptions.length - 1);
      this.setState({
        connectionOptions
      });
    });
    this.setState({
      connectionFilesProcess
    });
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
        this.killActiveConnection();
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
        this.killAllActiveProcesses();
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

  handleConnectionSelection(item) {
    const logFilename = `/etc/openvpn/client/log/${(0, _moment.default)().format(dateFormat)}.log`;
    const connectionCommand = `sudo openvpn --config ~/script/resource/${item.value} --log ${logFilename}`;
    const connectionProcess = (0, _child_process.exec)(connectionCommand);
    this.fetchConnectionStatus(logFilename);
    this.setState({
      mode: 'option',
      inputValue: '',
      logFilename,
      connectionProcess
    });
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
    const {
      connectionOptions
    } = this.state;
    const items = connectionOptions.map(connection => ({
      label: connection,
      value: connection
    }));
    return _react.default.createElement(_inkSelectInput.default, {
      items: items,
      onSelect: this.handleConnectionSelection
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