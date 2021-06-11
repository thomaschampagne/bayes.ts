module.exports = {
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(specs|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
};
