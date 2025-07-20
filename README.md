# WhatsApp Sender - Frontend

Frontend da plataforma WhatsApp Sender construído com React + Vite.

## Funcionalidades

- 🎨 Interface moderna com Tailwind CSS
- 📱 Design responsivo
- 🔐 Sistema de autenticação
- 📊 Dashboard interativo
- 📧 Gerenciamento de campanhas
- 👥 Gerenciamento de grupos
- 📈 Relatórios e logs
- ⚙️ Configurações de instâncias WhatsApp

## Tecnologias

- React 19
- Vite 7
- Tailwind CSS 3
- React Router DOM
- Axios
- Lucide React (ícones)

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Configuração

Crie um arquivo `.env` baseado no `.env.production`:

```env
VITE_API_URL=https://your-domain.com/api
```

## Deploy

### Heroku/Easypanel
- Build automático via buildpack Node.js
- Comando start: `npm start`
- Porta automática via `$PORT`

### Docker
```bash
# Build
docker build -t whatsapp-sender-frontend .

# Run
docker run -p 4173:4173 whatsapp-sender-frontend
```

### Netlify/Vercel
- Build command: `npm run build`
- Publish directory: `dist`

## Estrutura

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas principais
├── contexts/       # Contextos React
├── lib/           # Utilitários e configurações
└── assets/        # Recursos estáticos
```

## Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servir build (produção)
- `npm run lint` - Linting ESLint
- `npm run preview` - Preview local da build

## Licença

MIT