# DGK Restaurante

Aplicativo Expo Router que replica o painel DGK: CRUD completo de pratos, consulta de clima, listagem de unidades e tela dedicada à equipe. Todo o estado é centralizado com **Zustand** e as telas consomem um provedor de dados configurável (Back4App/Parse ou Supabase REST) + API pública de clima.

## Como executar

```bash
npm install
npx expo start --tunnel
```

Use o QR Code exibido pelo Metro para abrir o app via **Expo Go**. O parâmetro `--tunnel` garante que o dispositivo móvel acesse o servidor mesmo fora da mesma rede.

## Telas e recursos

- **Home** – dashboard do cardápio com formulário, filtros, ordenação, alternância de disponibilidade, estatísticas e clima por cidade.
- **Sobre** – apresenta todas as unidades cadastradas e quantos pratos pertencem a cada uma (relacionamento *Menu → Unit*).
- **Equipe** – lista membros do time vinculados às respectivas unidades, permite filtrar por filial e enviar uma mensagem rápida.
- **Estado global** – toda a lógica (menu, filtros, formulários, unidades, equipe e clima) vive em `hooks/useRestaurantStore.ts` com Zustand.
- **Interações** – botões, pickers customizados, inputs numéricos, switches e textareas adaptados para mobile.

## Configuração do back-end

A aplicação lê as credenciais em variáveis `EXPO_PUBLIC_*` (arquivo `.env` ou `app.json > extra`). Defina também os nomes das coleções/tabelas se preferir outros valores.

### Variáveis comuns

| Chave | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_PROVIDER` | `back4app` (padrão) ou `supabase`. |
| `EXPO_PUBLIC_MENU_COLLECTION` | Nome da entidade de pratos (`Menu`). |
| `EXPO_PUBLIC_UNIT_COLLECTION` | Nome da entidade de unidades (`Unit`). |
| `EXPO_PUBLIC_TEAM_COLLECTION` | Nome da entidade de equipe (`Team`). |

### Back4App / Parse

`app.json` já traz os valores do seu projeto Back4App:

```jsonc
"extra": {
  "EXPO_PUBLIC_API_PROVIDER": "back4app",
  "EXPO_PUBLIC_PARSE_APP_ID": "pNVxg3NT3JEjb3nf1lxe08CaOurqvo4UB696F2Nm",
  "EXPO_PUBLIC_PARSE_REST_KEY": "lfBJsVApepUZ1xoooif52gGnGmADQZHhztxD5vb",
  "EXPO_PUBLIC_PARSE_SERVER_URL": "https://parseapi.back4app.com/",
  "EXPO_PUBLIC_MENU_COLLECTION": "Menu",
  "EXPO_PUBLIC_TEAM_COLLECTION": "Team",
  "EXPO_PUBLIC_UNIT_COLLECTION": "Unit"
}
```

Caso prefira `.env`, use os mesmos valores acima. Crie as classes `Menu`, `Unit` e `Team` com os seguintes campos: `name (String)`, `description (String)`, `price (Number)`, `category (String)`, `unit (String)` para pratos; `city`, `address`, `phone`, `weatherLocation` para unidades; `role`, `bio`, `unitId` para equipe.

### Supabase (alternativa ao Back4App)

```env
EXPO_PUBLIC_API_PROVIDER=supabase
EXPO_PUBLIC_SUPABASE_URL=https://SUAPROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=suaChaveAnon
```

- Ative o módulo REST e habilite as tabelas `Menu`, `Unit` e `Team`.
- Garanta campos equivalentes aos mencionados acima (a chave primária `id` é usada automaticamente).

Com isso o app pode trocar de provedor sem alterações de código – basta ajustar as variáveis.

## Scripts úteis

| Comando | Ação |
| --- | --- |
| `npm start` | Inicia o Expo CLI (mesmo que `npx expo start`). |
| `npm run android/ios/web` | Abre cada plataforma diretamente. |
| `npm run lint` | Valida o código com as regras do Expo. |

## Estrutura destacada

- `app/(tabs)` – rotas Home, Sobre e Equipe com Expo Router.
- `components/restaurant` – UI compartilhada (tabela, formulário, filtros, picker, etc.).
- `hooks/useRestaurantStore.ts` – estado global + ações (CRUD, filtros, clima, unidades e equipe).
- `lib/dataClient.ts` – client abstrato para Back4App ou Supabase.
- `lib/weather.ts` – integração com Open-Meteo para o painel de clima.
