"use strict";

var _react = _interopRequireDefault(require("react"));

var _moment = _interopRequireDefault(require("moment"));

var _fs = _interopRequireDefault(require("fs"));

var _ink = require("ink");

var _inkTextInput = _interopRequireDefault(require("ink-text-input"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GENERATION_DATA = [{
  key: 'companyId',
  display: 'Company ID'
}, {
  key: 'areaId',
  display: 'Area ID'
}, {
  key: 'demandType',
  display: 'Demand Type (forecast/actual)'
}, {
  key: 'demandDriverId',
  display: 'Demand Driver ID'
}, {
  key: 'startDate',
  display: 'Start Date (DD/MM/YYYY)'
}, {
  key: 'endDate',
  display: 'End Date (DD/MM/YYYY)'
}, {
  key: 'averageValue',
  display: 'Average Value'
}, {
  key: 'outputFileName',
  display: 'Output Filename'
}];

const generateNulledValues = data => data.reduce((datum, result) => {
  return Object.assign({}, result, {
    [datum.key]: null
  });
}, {});

const generateTableData = stateData => GENERATION_DATA.map(datum => {
  return {
    name: datum.display,
    value: stateData[datum.key] || '-'
  };
});

const dividerChar = '-';
const dividerString = dividerChar.repeat(33);
const dateFormat = 'DD/MM/YYYY';

const formatEntryTimestamp = momentValue => `${momentValue.format('x')}000000`;

class Dialog extends _react.default.PureComponent {
  constructor() {
    super();
    this.state = Object.assign({
      inputStage: 0,
      inputValue: ''
    }, generateNulledValues(GENERATION_DATA));
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.generateOutputFile = this.generateOutputFile.bind(this);
  }

  checkInputComplete(inputStage) {
    return inputStage === GENERATION_DATA.length;
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
    const currentSubmissionKey = GENERATION_DATA[inputStage].key;
    const nextInputStage = inputStage + 1;
    this.setState({
      inputStage: nextInputStage,
      inputValue: '',
      [currentSubmissionKey]: inputValue
    });
    if (this.checkInputComplete(nextInputStage)) this.generateOutputFile();
  }

  generateOutputFile() {
    const {
      companyId,
      areaId,
      demandType,
      demandDriverId,
      startDate,
      endDate,
      averageValue,
      outputFileName
    } = this.state;
    const currentTimestamp = (0, _moment.default)().format('X');
    const startMoment = (0, _moment.default)(startDate, dateFormat).add(10, 'h');
    const endMoment = (0, _moment.default)(endDate, dateFormat).add(10, 'h');
    const timestampRange = [];

    while (!startMoment.isSame(endMoment)) {
      timestampRange.push(formatEntryTimestamp(startMoment));
      startMoment.add(1, 'd');
    }

    timestampRange.push(formatEntryTimestamp(startMoment));
    const templateString = `insert demand,company_id=${companyId},area_id=${areaId},type=${demandType},driver_id=${demandDriverId} last_modified=${currentTimestamp},value=${averageValue}`;
    const generatedEntries = timestampRange.map(timestamp => `${templateString} ${timestamp}\n`);

    _fs.default.writeFile(outputFileName, generatedEntries.join(''), error => {
      if (error) {
        console.log({
          error
        });
      } else {
        console.log(`Successfully generated ${outputFileName}`);
      }
    });
  }

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
      width: 32
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
    const inputDisplay = GENERATION_DATA[inputStage].display;
    return _react.default.createElement(_ink.Box, {
      width: '100%',
      flexDirection: 'row'
    }, _react.default.createElement(_ink.Box, {
      paddingRight: 1
    }, "Please enter ", inputDisplay, ":"), _react.default.createElement(_inkTextInput.default, {
      value: inputValue,
      onChange: this.handleInputChange,
      onSubmit: this.handleInputSubmit
    }));
  }

  render() {
    const tableData = generateTableData(this.state);
    return _react.default.createElement(_ink.Box, {
      width: '100%',
      flexDirection: 'column'
    }, this.renderDivider(), tableData.map(datum => this.renderTableRow(datum)), this.renderDivider(), !this.checkInputComplete(this.state.inputStage) && this.renderInput());
  }

}

(0, _ink.render)(_react.default.createElement(Dialog, null));