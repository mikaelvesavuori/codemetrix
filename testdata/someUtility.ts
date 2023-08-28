export function someUtility(str: string) {
  return str.replace('~src', `${process.cwd()}/src`);
}
