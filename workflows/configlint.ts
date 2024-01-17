/**
 * This module is to wrap ajv for lint-staged.
 * ajv does not accept additional arguments,
 * and with lint-staged, it is not possible to work around this directly.
 */

/* eslint-disable unicorn/no-process-exit */
import { $ } from 'execa'

try {
  await $({ stdio: 'inherit' })`pnpm lint:config`
} catch {
  process.exit(1)
}
