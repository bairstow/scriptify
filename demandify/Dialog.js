import React from 'react';
import moment from 'moment';
import fs from 'fs';
import {render, Box, Color} from 'ink';
import TextInput from 'ink-text-input';

const GENERATION_DATA = [
  {
    key: 'companyId',
    display: 'Company ID',
  },
  {
    key: 'areaId',
    display: 'Area ID',
  },
  {
    key: 'demandType',
    display: 'Demand Type (forecast/actual)',
  },
  {
    key: 'demandDriverId',
    display: 'Demand Driver ID',
  },
  {
    key: 'startDate',
    display: 'Start Date (DD/MM/YYYY)',
  },
  {
    key: 'endDate',
    display: 'End Date (DD/MM/YYYY)',
  },
  {
    key: 'averageValue',
    display: 'Average Value',
  },
  {
    key: 'outputFileName',
    display: 'Output Filename',
  },
];

const generateNulledValues = data => data.reduce((datum, result) => {
  return Object.assign({}, result, { [datum.key]: null });
}, {});
const generateTableData = (stateData) => GENERATION_DATA.map(datum => {
  return ({ name: datum.display, value: (stateData[datum.key] || '-') });
});
const dividerChar = '-';
const dividerString = dividerChar.repeat(33);
const dateFormat = 'DD/MM/YYYY';
const formatEntryTimestamp = momentValue => `${momentValue.format('x')}000000`;

class Dialog extends React.PureComponent {
  constructor() {
    super();

    this.state = Object.assign({
      inputStage: 0,
      inputValue: '',
    }, generateNulledValues(GENERATION_DATA));

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.generateOutputFile = this.generateOutputFile.bind(this);
  }

  checkInputComplete(inputStage) {
    return inputStage === GENERATION_DATA.length;
  }

  handleInputChange(inputValue) {
    this.setState({ inputValue });
  }

  handleInputSubmit() {
    const { inputStage, inputValue } = this.state;
    const currentSubmissionKey = GENERATION_DATA[inputStage].key;

    const nextInputStage = inputStage + 1;
    this.setState({
      inputStage: nextInputStage,
      inputValue: '',
      [currentSubmissionKey]: inputValue,
    });

    if (this.checkInputComplete(nextInputStage)) this.generateOutputFile();
  }

  generateOutputFile() {
    const { companyId, areaId, demandType, demandDriverId, startDate, endDate, averageValue, outputFileName } = this.state;
    const currentTimestamp = moment().format('X');
    const startMoment = moment(startDate, dateFormat).add(10, 'h');
    const endMoment = moment(endDate, dateFormat).add(10, 'h');

    const timestampRange = [];
    while (!startMoment.isSame(endMoment)) {
      timestampRange.push(formatEntryTimestamp(startMoment));
      startMoment.add(1, 'd');
    }
    timestampRange.push(formatEntryTimestamp(startMoment));
    const templateString = `insert demand,company_id=${companyId},area_id=${areaId},type=${demandType},driver_id=${demandDriverId} last_modified=${currentTimestamp},value=${averageValue}`
    const generatedEntries = timestampRange.map(timestamp => `${templateString} ${timestamp}\n`);
    fs.writeFile(outputFileName, generatedEntries.join(''), error => {
      if (error) {
        console.log({ error });
      } else {
        console.log(`Successfully generated ${outputFileName}`);
      }
    });
  }

  renderTableRow(entry) {
    const { name, value } = entry;
    return (
      <Box key={name} width={'100%'} flexDirection={'row'}>
        <Box width={32}>
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
    const inputDisplay = GENERATION_DATA[inputStage].display;
    return (
      <Box width={'100%'} flexDirection={'row'}>
        <Box paddingRight={1}>Please enter {inputDisplay}:</Box>
        <TextInput value={inputValue} onChange={this.handleInputChange} onSubmit={this.handleInputSubmit} />
      </Box>
    );
  }

  render() {
    const tableData = generateTableData(this.state);
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
