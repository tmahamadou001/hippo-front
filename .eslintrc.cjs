module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    // ============================================================================
    // RÈGLE CRITIQUE: Interdire l'import direct d'axios
    // ============================================================================
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'axios',
        message: '❌ N\'importez PAS axios directement ! Utilisez apiClient depuis @/services/api à la place.\n\n' +
                 'Exemple:\n' +
                 '  ❌ import axios from \'axios\'\n' +
                 '  ✅ import apiClient from \'@/services/api\'\n\n' +
                 'Raison: apiClient configure automatiquement:\n' +
                 '  - La baseURL (http://localhost:4000/api/v1-admin)\n' +
                 '  - L\'ajout du token JWT dans les headers\n' +
                 '  - Le refresh automatique du token\n' +
                 '  - La gestion des erreurs'
      }]
    }],

    // Autres règles Vue/TypeScript
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
}
