import React from 'react';
import {render, Box, Color} from 'ink';
import InkBox from 'ink-box';
import TextInput from 'ink-text-input';

const GENERATION_KEYS = [
  'companyId',
  'areaId',
  'demandType',
  'demandDriverId',
  'startDate',
  'endDate',
  'averageValue',
  'valuePattern',
  'outputFilePath'
];

const generateNulledValues = keys => keys.reduce((key, result) => {
  return Object.assign({}, result, { key: null });
}, {});
const generateTableData = (keys, data) => keys.map(key => ({ name: key, value: (data[key] || '-') }));
const dividerChar = '-';
const dividerString = dividerChar.repeat(25);

class Dialog extends React.PureComponent {
  constructor() {
    super();

    this.state = Object.assign({
      inputStage: 0,
      inputValue: '',
    }, generateNulledValues(GENERATION_KEYS));

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.generateOutputFile = this.generateOutputFile.bind(this);
  }

  checkInputComplete(inputStage) {
    return inputStage === GENERATION_KEYS.length;
  }

  handleInputChange(inputValue) {
    this.setState({ inputValue });
  }

  handleInputSubmit() {
    const { inputStage, inputValue } = this.state;
    const currentSubmissionKey = GENERATION_KEYS[inputStage];

    const nextInputStage = inputStage + 1;
    this.setState({
      inputStage: nextInputStage,
      inputValue: '',
      [currentSubmissionKey]: inputValue
    });

    if (this.checkInputComplete(nextInputStage)) this.generateOutputFile();
  }

  generateOutputFile() {
  }

  renderTableRow(entry) {
    const { name, value } = entry;
    return (
      <Box key={name} width={'100%'} flexDirection={'row'}>
        <Box width={24}>
          <Color blue>{name}</Color>
        </Box>
        <Box paddingRight={1}>|</Box>
        <Box width={'20%'}>{value}</Box>
      </Box>
    );
  }

  renderDivider() {
    return (
      <Color yellow>{dividerString}</Color>
    );
  }

  renderInput() {
    const { inputStage, inputValue } = this.state;
    const inputKey = GENERATION_KEYS[inputStage];
    return (
      <Box width={'100%'} flexDirection={'row'}>
        <Box paddingRight={1}>Please enter {inputKey}:</Box>
        <TextInput value={inputValue} onChange={this.handleInputChange} onSubmit={this.handleInputSubmit} />
      </Box>
    );
  }

  render() {
    const tableData = generateTableData(GENERATION_KEYS, this.state);
    return (
      <Box width={'100%'} flexDirection={'column'}>
        {this.renderDivider()}
        {tableData.map(datum => this.renderTableRow(datum))}
        {this.renderDivider()}
        {!this.checkInputComplete(this.state.inputStage) && this.renderInput()}
      </Box>
    );
  }
}

render(<Dialog />);
