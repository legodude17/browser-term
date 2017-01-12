import * as commands from './commands/index';
import {Terminal} from 'xterm';

export default class BrowserTerm {
  constructor(fs, node = document.appendChild(document.createEvent('div'))) {
    this.fs = fs;
    this.node = node;
    this.term = new Terminal();
    this.term.open(node);
  }

  
}
