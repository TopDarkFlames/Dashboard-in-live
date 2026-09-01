# HomeLab Dashboard

> A modern dashboard for monitoring and managing your homelab infrastructure.

O **HomeLab Dashboard** é uma aplicação web criada para centralizar o monitoramento de servidores, serviços e containers de um homelab em uma única interface.

A proposta é permitir acompanhar rapidamente o estado da infraestrutura, visualizar métricas, identificar serviços indisponíveis e, futuramente, executar ações administrativas diretamente pelo dashboard.

---

## Preview

> O projeto está em desenvolvimento. Screenshots serão adicionadas conforme a interface for implementada.

<!--
![HomeLab Dashboard](./docs/images/dashboard.png)
-->

---

## Funcionalidades

### Dashboard

- [ ] Visão geral da infraestrutura
- [ ] Servidores online/offline
- [ ] Serviços online/offline
- [ ] Uso médio de CPU
- [ ] Uso de memória RAM
- [ ] Uso de armazenamento
- [ ] Uptime
- [ ] Alertas recentes

### Servidores

- [ ] Cadastro de servidores
- [ ] Status online/offline
- [ ] Hostname
- [ ] Sistema operacional
- [ ] Endereço IP
- [ ] Endereço Tailscale
- [ ] Uso de CPU
- [ ] Uso de memória
- [ ] Uso de armazenamento
- [ ] Uptime
- [ ] Última atualização

### Serviços

- [ ] Cadastro de serviços
- [ ] URL e porta
- [ ] Associação com servidor
- [ ] Status online/offline
- [ ] Tempo de resposta
- [ ] Health checks automáticos
- [ ] Histórico de disponibilidade

### Containers

- [ ] Integração com Docker
- [ ] Listagem de containers
- [ ] Status dos containers
- [ ] Imagem utilizada
- [ ] Uso de CPU
- [ ] Uso de memória
- [ ] Iniciar container
- [ ] Parar container
- [ ] Reiniciar container

### Monitoramento

- [ ] Coleta periódica de métricas
- [ ] Histórico de CPU
- [ ] Histórico de memória
- [ ] Histórico de armazenamento
- [ ] Histórico de latência
- [ ] Histórico de uptime
- [ ] Gráficos de utilização

### Alertas

- [ ] Servidor offline
- [ ] Serviço offline
- [ ] CPU acima do limite
- [ ] RAM acima do limite
- [ ] Armazenamento próximo do limite
- [ ] Histórico de alertas

---

## Arquitetura

```text
┌─────────────────────────┐
│        Frontend         │
│   React + TypeScript    │
└────────────┬────────────┘
             │ REST API
             ▼
┌─────────────────────────┐
│         Backend         │
│    API + Collector      │
└────────────┬────────────┘
             │
       ┌─────┼───────────────┐
       │     │               │
       ▼     ▼               ▼
 Docker API  Metrics     Health Checks
       │     │               │
       └─────┼───────────────┘
             │
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│ Metrics / Services /    │
│ Servers / History       │
└─────────────────────────┘
```

A própria aplicação será containerizada. Durante o desenvolvimento, o Docker Compose será responsável por executar frontend, backend e PostgreSQL.

---

## Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

Backend ainda a ser definido entre:

- ASP.NET Core
- Spring Boot

### Database

- PostgreSQL

### Infraestrutura

- Docker
- Docker Compose
- Linux
- Tailscale

### Integrações planejadas

- Docker Engine API
- TrueNAS API
- Tailscale
- Health Checks HTTP
- Métricas do sistema operacional

---

## Estrutura do projeto

```text
homelab-dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── repositories/
│   ├── integrations/
│   └── Dockerfile
│
├── database/
│   ├── migrations/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   └── images/
│
├── .vscode/
│   ├── extensions.json
│   └── settings.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## Modelo de dados

### Server

```text
Server
├── id
├── name
├── hostname
├── ipAddress
├── tailscaleIp
├── operatingSystem
├── status
├── cpuUsage
├── memoryUsage
├── diskUsage
├── uptime
└── lastSeen
```

### Service

```text
Service
├── id
├── name
├── url
├── port
├── status
├── responseTime
├── serverId
└── lastCheck
```

### Container

```text
Container
├── id
├── name
├── containerId
├── image
├── status
├── cpuUsage
├── memoryUsage
└── serverId
```

### Metric

```text
Metric
├── id
├── serverId
├── cpuUsage
├── memoryUsage
├── diskUsage
├── networkUsage
└── timestamp
```

### Alert

```text
Alert
├── id
├── serverId
├── serviceId
├── type
├── message
├── severity
├── resolved
└── createdAt
```

---

## API

### Dashboard

```http
GET /api/dashboard
```

### Servers

```http
GET    /api/servers
GET    /api/servers/{id}
POST   /api/servers
PUT    /api/servers/{id}
DELETE /api/servers/{id}

GET /api/servers/{id}/metrics
GET /api/servers/{id}/containers
GET /api/servers/{id}/services
```

### Services

```http
GET    /api/services
GET    /api/services/{id}
POST   /api/services
PUT    /api/services/{id}
DELETE /api/services/{id}
```

### Containers

```http
GET /api/containers
GET /api/containers/{id}

POST /api/containers/{id}/start
POST /api/containers/{id}/stop
POST /api/containers/{id}/restart
```

### Metrics

```http
GET /api/metrics
GET /api/servers/{id}/metrics
```

### Alerts

```http
GET /api/alerts
GET /api/alerts/active

POST /api/alerts/{id}/resolve
```

---

## Exemplo do Dashboard

```text
HomeLab Dashboard

Servers
3 / 4 Online

Services
12 / 13 Online

CPU
34%

Memory
58%

────────────────────────────────

Server Status

TrueNAS         ● Online
Desktop         ● Online
Raspberry Pi    ● Online
Notebook        ○ Offline

────────────────────────────────

Services

Nextcloud       ● Online      23ms
Jellyfin        ● Online      14ms
Immich          ● Online      31ms
Vaultwarden     ● Online      18ms
Grafana         ● Online      11ms
```

---

## Roadmap

### Status atual

A fundação da versão `v0.1` já está implementada no repositório:

- Frontend React + TypeScript + Vite com dashboard responsivo
- Backend ASP.NET Core com endpoints mockados de dashboard, servidores e serviços
- PostgreSQL preparado no Docker Compose
- Dockerfiles para frontend e backend
- Proxy do Nginx para a API
- Health check da API em `/api/health`

Os dados ainda são mockados. A próxima etapa é persistir servidores e serviços no PostgreSQL e substituir os endpoints temporários por dados reais.

### v0.1 — Foundation

- [ ] Criar estrutura inicial do projeto
- [ ] Configurar frontend com React + TypeScript
- [ ] Configurar backend
- [ ] Configurar PostgreSQL
- [ ] Criar `Dockerfile` para o frontend
- [ ] Criar `Dockerfile` para o backend
- [ ] Criar `docker-compose.yml`
- [ ] Configurar variáveis de ambiente com `.env`
- [ ] Executar frontend, backend e PostgreSQL através do Docker Compose
- [ ] Configurar recomendação da extensão Docker no VS Code
- [ ] Criar dashboard inicial com dados mockados
- [ ] Criar layout responsivo

### v0.2 — Services

- [ ] Cadastro de servidores
- [ ] Cadastro de serviços
- [ ] Health checks HTTP
- [ ] Detecção online/offline
- [ ] Medição de response time

### v0.3 — Metrics

- [ ] Coleta real de CPU
- [ ] Coleta de RAM
- [ ] Coleta de armazenamento
- [ ] Coleta de uptime
- [ ] Persistência das métricas
- [ ] Gráficos históricos

### v0.4 — Docker Integration

- [ ] Integração com Docker Engine API
- [ ] Listagem de containers
- [ ] Métricas dos containers
- [ ] Start
- [ ] Stop
- [ ] Restart

### v0.5 — Monitoring

- [ ] Histórico de disponibilidade
- [ ] Sistema de alertas
- [ ] Limites configuráveis
- [ ] Dashboard de incidentes

### v1.0

- [ ] Autenticação
- [ ] Dashboard personalizável
- [ ] Integração com TrueNAS
- [ ] Integração com Tailscale
- [ ] Sistema completo de alertas
- [ ] Docker Compose para instalação
- [ ] Documentação completa
- [ ] Release estável

---

## Executando localmente

### Requisitos

- Git
- Docker
- Docker Compose

### Desenvolvimento opcional

Para facilitar o desenvolvimento:

- Visual Studio Code
- Extensão Docker para Visual Studio Code

> A extensão do VS Code é opcional. O Docker Engine continua sendo necessário para executar os containers.

### Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/homelab-dashboard.git
cd homelab-dashboard
```

### Configure o ambiente

```bash
cp .env.example .env
```

Edite as variáveis conforme necessário.

### Inicie a aplicação

```bash
docker compose up -d
```

Acompanhe os logs:

```bash
docker compose logs -f
```

Pare a aplicação:

```bash
docker compose down
```

---

## VS Code

O projeto pode recomendar extensões através de `.vscode/extensions.json`.

Exemplo:

```json
{
  "recommendations": [
    "ms-azuretools.vscode-docker"
  ]
}
```

Com a extensão instalada, os containers, imagens, volumes e outros recursos Docker podem ser acompanhados diretamente pelo Visual Studio Code.

---

## Variáveis de ambiente

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=homelab
DATABASE_USER=homelab
DATABASE_PASSWORD=change_me

API_PORT=8080
FRONTEND_PORT=3000
```

Nunca envie o arquivo `.env` para o repositório.

Utilize `.env.example` para documentar as variáveis necessárias sem armazenar credenciais reais.

---

## Segurança

O HomeLab Dashboard foi projetado principalmente para execução em redes privadas.

Não é recomendado expor diretamente a interface administrativa para a internet.

Para acesso remoto, considere:

- Tailscale
- WireGuard
- VPN
- Reverse Proxy
- HTTPS
- Autenticação

Tokens, senhas, chaves de API e outras credenciais nunca devem ser armazenadas diretamente no código-fonte.

A integração futura com Docker também deve ser implementada com cuidado. O acesso direto ao Docker Socket (`/var/run/docker.sock`) concede privilégios elevados sobre o host e deve ser protegido ou substituído por uma solução com permissões restritas.

---

## Objetivos do projeto

- Desenvolvimento Full Stack
- Arquitetura de software
- APIs REST
- React
- TypeScript
- Backend
- PostgreSQL
- Docker
- Docker Compose
- Linux
- Redes
- Monitoramento
- Integração entre sistemas
- Segurança
- Self-hosting
- DevOps

---

## Possíveis melhorias futuras

- WebSockets para métricas em tempo real
- Notificações via Discord
- Notificações via Telegram
- Monitoramento via SNMP
- Descoberta automática de dispositivos
- Monitoramento de temperatura
- Monitoramento de rede
- Wake-on-LAN
- Logs centralizados
- Sistema de plugins
- Múltiplos usuários
- Diferentes níveis de permissão
- Tema claro/escuro
- PWA
- Dashboard drag-and-drop
- Backup das configurações

---

## Contribuindo

Contribuições, sugestões e melhorias são bem-vindas.

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Faça suas alterações.
4. Crie um commit.
5. Envie a branch.
6. Abra um Pull Request.

---

## Status do projeto

🚧 **Em desenvolvimento**

A primeira etapa do projeto será focada na construção da arquitetura base, containerização da aplicação e desenvolvimento da interface utilizando dados mockados.

As integrações reais com servidores, Docker e serviços serão adicionadas progressivamente.

---

## Licença

Este projeto está disponível sob a licença MIT.

Consulte o arquivo `LICENSE` para mais informações.
