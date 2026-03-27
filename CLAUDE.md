# Creador de Workflows n8n

Este repositorio es el entorno de trabajo para crear workflows n8n de alta calidad
mediante Claude Code. El foco principal es construir **agentes de IA**, aunque se
pueden crear workflows de cualquier tipo.

---

## Configuracion inicial (una sola vez)

> Las 7 skills de n8n ya estan instaladas en este entorno. El MCP server (`n8n-mcp`)
> tambien esta instalado globalmente. Solo necesitas completar tus credenciales.

### 1. Completar credenciales del MCP Server

Edita el archivo `.mcp.json` en la raiz del proyecto y reemplaza los valores:

- `N8N_API_URL`: URL de tu instancia n8n (ej: `https://miinstancia.n8n.cloud`)
- `N8N_API_KEY`: Ve a **Settings → API → Create API Key** en tu instancia n8n

Luego reinicia Claude Code para que cargue el MCP server con tus credenciales.

> El archivo `.mcp.json` esta en `.gitignore` para proteger tus credenciales.
> Si necesitas compartir la configuracion usa `.mcp.json.example` (sin credenciales reales).

### 2. Skills de n8n

Las 7 skills ya estan instaladas en `~/.claude/skills/`. Se activan automaticamente
segun el contexto de cada consulta, sin necesidad de comandos adicionales.

---

## Herramientas disponibles

### n8n-mcp (MCP Server)

Conecta Claude directamente con tu instancia n8n. Capacidades:

- Acceso a **1,236 nodos** documentados (806 core + 430 community)
- **2,709 templates** de workflows reales para referencia
- Gestion completa: crear, leer, actualizar, eliminar y ejecutar workflows
- Validacion de configuraciones de nodos antes de crear
- Busqueda de nodos por funcionalidad o nombre
- Consulta de ejecuciones y logs

### n8n-skills (7 skills activas)

| Skill | Descripcion |
|-------|-------------|
| **n8n MCP Tools Expert** | Uso correcto de las herramientas MCP — prioridad maxima |
| **n8n Workflow Patterns** | 5 arquitecturas probadas en 2,653+ templates reales |
| **n8n Node Configuration** | Configuracion correcta de 525+ nodos y sus dependencias |
| **n8n Expression Syntax** | Sintaxis `{{ }}`, `$json`, `$node`, `$items`, etc. |
| **n8n Validation Expert** | Interpretacion y resolucion de errores de validacion |
| **n8n Code JavaScript** | Code nodes JS con 10+ patrones probados en produccion |
| **n8n Code Python** | Code nodes Python sin librerias externas |

---

## Modo de interaccion

### Modo directo
Para workflows simples (hasta 5 nodos, logica lineal).
Claude disena y crea el workflow completo sin interrupciones.

### Modo colaborativo
Para workflows complejos (agentes de IA, logica condicional, multiples integraciones).
Claude presenta el diseno primero, espera aprobacion, luego construye por modulos.

Podes pedir explicitamente el modo que prefieras. Por defecto:
- **Directo**: si el objetivo esta claro y el flujo es lineal
- **Colaborativo**: si hay ambiguedad, multiples branches, o agentes de IA encadenados

---

## Proceso estandar de creacion

1. **Entender** el objetivo (preguntar si hay ambiguedad)
2. **Diseniar** la arquitectura: nodos, conexiones, flujo de datos
3. **Verificar** que existan las credenciales necesarias en la instancia
4. **Crear** el workflow via MCP
5. **Validar** configuraciones con las herramientas MCP antes de activar
6. **Ejecutar** en modo test con datos reales si es posible
7. **Documentar** agregando descripcion al workflow en n8n

---

## Buenas practicas para agentes de IA en n8n

### Arquitectura recomendada

```
Trigger → Memory/Context → AI Agent → Tools → Output
```

- Usar **AI Agent node** cuando el agente necesita tomar decisiones y usar tools
- Usar **Basic LLM Chain** solo para transformaciones simples de texto
- Usar **Information Extractor** para parsear datos estructurados de texto libre

### Memoria y contexto

- **Window Buffer Memory**: para conversaciones con historial reciente
- **Vector Store Memory**: para RAG y recuperacion semantica de informacion
- Siempre inicializar el contexto del sistema con instrucciones claras y especificas

### Manejo de errores

- Incluir siempre un nodo **Error Trigger** conectado a una notificacion
- Usar expresiones con fallback: `{{ $json.campo ?? 'valor_default' }}`
- Loguear errores con suficiente contexto para depurar

### Naming conventions

Formato: `[Verbo] [Objeto] [Contexto opcional]`

- `Get User Profile from Database`
- `Send Alert to Slack Channel`
- `Extract Invoice Data with AI`
- `Loop Through Products`

### Seguridad

- **Nunca** hardcodear API keys en nodos — siempre usar el sistema de credenciales de n8n
- **Nunca** editar workflows de produccion directamente — duplicar primero, probar, luego reemplazar
- Validar y sanitizar inputs que vengan de usuarios o webhooks externos

### Performance

- Preferir **Split In Batches** sobre procesar todo en un solo loop cuando hay muchos items
- Usar **Wait** node para respetar rate limits de APIs externas
- Activar el modo "Continue On Fail" solo cuando sea intencional

---

## Ejemplos de pedidos

```
# Workflow simple (modo directo)
"Crea un workflow que se ejecute cada hora, obtenga los leads nuevos de HubSpot
y los guarde en una hoja de Google Sheets"

# Agente de IA (modo colaborativo)
"Quiero un agente que responda preguntas sobre mis documentos en Notion,
tenga memoria de la conversacion y pueda buscar en internet cuando no sepa la respuesta"

# Workflow de datos
"Necesito sincronizar productos entre Shopify y WooCommerce cada 30 minutos,
transformando el formato de precios y manteniendo el stock actualizado"
```

---

## Links de referencia

- n8n-mcp: https://github.com/czlonkowski/n8n-mcp
- n8n-skills: https://github.com/czlonkowski/n8n-skills
- Documentacion n8n: https://docs.n8n.io
