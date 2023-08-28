import { someUtility } from './someUtility.js';

interface Something {
  do: () => void;
}

export class doSomething implements Something {
  do() {
    someUtility('~src/asdf');
  }
}
