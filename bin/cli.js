#!/usr/bin/env node

const readline = require('readline');
const { spawn } = require('child_process');
const os = require('os');

class CommandRunner {
  constructor() {
    this.history = [];
  }
  
  async execute(command, args = []) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      
      proc.on('close', (code) => {
        this.history.push({ command, args, code, stdout, stderr });
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error('Command failed: ' + code));
        }
      });
    });
  }
  
  getHistory() {
    return this.history;
  }
}

const runner = new CommandRunner();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

console.log('CLI Tool v1.0.0');
console.log('Type "help" for commands, "exit" to quit');

rl.prompt();

rl.on('line', async (line) => {
  const cmd = line.trim();
  
  if (cmd === 'exit') {
    rl.close();
    return;
  }
  
  if (cmd === 'help') {
    console.log('Commands: help, exit, history, <any shell command>');
  } else if (cmd === 'history') {
    console.log(runner.getHistory());
  } else if (cmd) {
    try {
      await runner.execute(cmd);
    } catch (e) {
      console.error(e.message);
    }
  }
  
  rl.prompt();
});