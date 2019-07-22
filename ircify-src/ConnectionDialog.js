import { exec, execSync } from 'child_process';
import React from 'react';
import { render, Box, Color } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

const dividerLength = 36;
const dividerChar = '-';
const dividerString = dividerChar.repeat(dividerLength);

const ircJarCommand = 'java -jar /home/josh/git/jb-irc-manager/target/uberjar/jb-irc-manager-0.1.0-SNAPSHOT-standalone.jar';
const configDefinition = '/home/josh/git/jb-irc-manager/resources/config.edn';
const NEW_SEARCH = 'NEW_SEARCH';
const dblQuoteRegex = /"/gi;

const initialState = {
  mode: 'search',
  inputValue: '',
  searchResult: [],
  selection: '',
  fetchLog: '',
};

class ConnectionDialog extends React.PureComponent {
  constructor() {
    super();

    this.state = initialState;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleSelectResult = this.handleSelectResult.bind(this);
  }

  handleInputChange(inputValue) {
    this.setState({ inputValue });
  }

  handleInputSubmit() {
    const { inputValue } = this.state;

    const searchOutput = execSync(`${ircJarCommand} -c "${configDefinition}" -s "${inputValue}"`);
    const searchResult = searchOutput
      .toString()
      .split('\n')
      .filter(result => result !== '')
      .map(result => result.replace(dblQuoteRegex, ''));
    this.setState({
      mode: 'select',
      inputValue: '',
      searchResult,
    });
  }

  handleSelectResult(item) {
    if (item.value === NEW_SEARCH) {
      this.setState(initialState);
      return;
    }

    const fetchOutputProcess = exec(`${ircJarCommand} -c "${configDefinition}" -f "${item.value}"`);
    fetchOutputProcess.stdout.on('data', data => {
      this.setState({
        mode: 'fetch',
        fetchLog: data,
      });
    });
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

  renderSearchInput() {
    const { inputValue } = this.state;
    return (
      <div>
        {this.renderDivider('search')}
        <Box>Enter search term:</Box>
        <TextInput value={inputValue} onChange={this.handleInputChange} onSubmit={this.handleInputSubmit} />
      </div>
    );
  }

  renderSelectResult() {
    const { searchResult } = this.state;
    const items = searchResult.map(result => ({ label: result, value: result }));
    items.unshift({ label: '*** NEW SEARCH ***', value: NEW_SEARCH });
    return (
      <div>
        {this.renderDivider('select')}
        <SelectInput items={items} onSelect={this.handleSelectResult} />
      </div>
    );
  }

  renderFetch() {
    const { fetchLog } = this.state;
    return (
      <div>
        {this.renderDivider('fetch')}
        <div>{fetchLog}</div>
      </div>
    );
  }

  render() {
    const { mode } = this.state;
    return (
      <Box width={'100%'} flexDirection={'column'}>
        {mode === 'search' && this.renderSearchInput()}
        {mode === 'select' && this.renderSelectResult()}
        {mode === 'fetch' && this.renderFetch()}
      </Box>
    );
  }
}

render(<ConnectionDialog />);
