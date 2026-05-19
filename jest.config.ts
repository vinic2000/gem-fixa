import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.ts',
    'lib/**/*.ts',
    '!lib/db/migrations/**',
    '!lib/db/seeders/**',
  ],
  clearMocks: true,
}

export default config
