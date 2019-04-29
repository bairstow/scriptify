"use strict";

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _inkBox = _interopRequireDefault(require("ink-box"));

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GENERATION_KEYS = ['companyId', 'areaId', 'demandType', 'demandDriverId', 'startDate', 'endDate', 'averageValue', 'valuePattern', 'outputFilePath'];

const generateNulledValues = keys => keys.reduce((key, result) => {
  return Object.assign({}, result, {
    key: null
  });
}, {});

const generateTableData = (keys, data) => keys.map(key => ({
  name: key,
  value: data[key] || '-'
}));

const dividerChar = '-';
const dividerString = dividerChar.repeat(25);

class Dialog extends _react.default.PureComponent {
  constructor() {
    super();
    this.state = Object.assign({
      inputStage: 0,
      inputValue: ''
    }, generateNulledValues(GENERATION_KEYS));
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.generateOutputFile = this.generateOutputFile.bind(this);
  }

  checkInputComplete(inputStage) {
    return inputStage === GENERATION_KEYS.length;
  }

  handleInputChange(inputValue) {
    this.setState({
      inputValue
    });
  }

  handleInputSubmit() {
    const {
      inputStage,
      inputValue
    } = this.state;
    const currentSubmissionKey = GENERATION_KEYS[inputStage];
    const nextInputStage = inputStage + 1;
    this.setState({
      inputStage: nextInputStage,
      inputValue: '',
      [currentSubmissionKey]: inputValue
    });
    if (this.checkInputComplete(nextInputStage)) this.generateOutputFile();
  }

  generateOutputFile() {}

  renderTableRow(entry) {
    const {
      name,
      value
    } = entry;
    return _react.default.createElement(_ink.Box, {
      key: name,
      width: '100%',
      flexDirection: 'row'
    }, _react.default.createElement(_ink.Box, {
      width: 24
    }, _react.default.createElement(_ink.Color, {
      blue: true
    }, name)), _react.default.createElement(_ink.Box, {
      paddingRight: 1
    }, "|"), _react.default.createElement(_ink.Box, {
      width: '20%'
    }, value));
  }

  renderDivider() {
    return _react.default.createElement(_ink.Color, {
      yellow: true
    }, dividerString);
  }

  renderInput() {
    const {
      inputStage,
      inputValue
    } = this.state;
    const inputKey = GENERATION_KEYS[inputStage];
    return _react.default.createElement(_ink.Box, {
      width: '100%',
      flexDirection: 'row'
    }, _react.default.createElement(_ink.Box, {
      paddingRight: 1
    }, "Please enter ", inputKey, ":"), _react.default.createElement(_inkTextInput.default, {
      value: inputValue,
      onChange: this.handleInputChange,
      onSubmit: this.handleInputSubmit
    }));
  }

  render() {
    const tableData = generateTableData(GENERATION_KEYS, this.state);
    return _react.default.createElement(_ink.Box, {
      width: '100%',
      flexDirection: 'column'
    }, this.renderDivider(), tableData.map(datum => this.renderTableRow(datum)), this.renderDivider(), !this.checkInputComplete(this.state.inputStage) && this.renderInput());
  }

}

(0, _ink.render)(_react.default.createElement(Dialog, null));