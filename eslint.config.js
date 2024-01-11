import { ignores } from '@jjangga0214/eslint-config/helpers'
import javascript from '@jjangga0214/eslint-config/javascript'
import typescript from '@jjangga0214/eslint-config/typescript'
import jest from '@jjangga0214/eslint-config/jest'

export default [
  { ignores },
  ...javascript,
  ...typescript,
  ...jest,
  {
    files: ['workflows/**/*.{c,m,}{j,t}s{x,}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    // TODO: remove this patch
    // BUG: "parserPath or languageOptions.parser is required! (undefined:undefined)  import/no-named-as-default"
    // REF: https://github.com/import-js/eslint-plugin-import/issues/2556#issuecomment-1663038247
    // When the [PR](https://github.com/import-js/eslint-plugin-import/pull/2829) is merged, we can remove this patch.
    files: ['**/*.{c,m,}js{x,}'],
    rules: {
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
    },
  },
]
