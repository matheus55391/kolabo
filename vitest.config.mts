import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: [
                'src/**/*.{ts,tsx}',
            ],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                'src/components/ui/**', // shadcn/ui components
                '.next/',
                'coverage/',
                '**/*.test.{ts,tsx}',
                '**/*.spec.{ts,tsx}',
                // Layouts genéricos que só renderizam children
                '**/layout.tsx',
                '**/template.tsx',
                // Páginas simples que só importam componentes sem lógica
                'src/app/**/page.tsx',
                // Arquivos de configuração do Next.js
                'src/app/layout.tsx',
                'src/app/not-found.tsx',
                'src/app/error.tsx',
                'src/app/loading.tsx',
                // API routes simples (pode remover se tiver lógica complexa)
                'src/app/api/**/route.ts',
                // Tipos e interfaces puras
                'src/@types/**',
                'src/types/**',
                // Middleware (geralmente testado via integração)
                'src/middleware.ts',
            ],
            // Thresholds desabilitados temporariamente durante desenvolvimento
            // Meta final: lines: 80, functions: 80, branches: 75, statements: 80
            thresholds: {
                lines: 0,
                functions: 0,
                branches: 0,
                statements: 0,
            },
        },
    },
})
