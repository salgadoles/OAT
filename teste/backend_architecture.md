# Arquitetura do Backend para Pesquisa e Paginação de Cursos

## 1. Modelo de Dados (MySQL)

Com base nas informações do frontend, propomos o seguinte modelo de dados relacional para os cursos:

### Tabela `cursos`
Esta tabela armazenará as informações principais de cada curso.

| Campo         | Tipo de Dados     | Restrições      | Descrição                               |
|---------------|-------------------|-----------------|-----------------------------------------|
| `id`          | `INT`             | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único do curso.           |
| `titulo`      | `VARCHAR(255)`    | `NOT NULL`      | Título do curso.                        |
| `descricao`   | `TEXT`            | `NOT NULL`      | Descrição detalhada do curso.           |
| `criador`     | `VARCHAR(255)`    | `NOT NULL`      | Nome do criador/instrutor do curso.     |
| `categoria`   | `VARCHAR(100)`    | `NOT NULL`      | Categoria do curso (ex: UI/UX Design).  |
| `score`       | `DECIMAL(2,1)`    | `NOT NULL`      | Avaliação do curso (ex: 4.5).           |
| `preco`       | `DECIMAL(10,2)`   | `NOT NULL`      | Preço original do curso.                |
| `promocao`    | `DECIMAL(10,2)`   | `NULLABLE`      | Preço promocional do curso, se houver.  |
| `percentual_desconto` | `INT`     | `NULLABLE`      | Percentual de desconto (ex: 90).        |
| `imagem_url`  | `VARCHAR(255)`    | `NOT NULL`      | URL da imagem de capa do curso.         |
| `data_criacao`| `DATETIME`        | `DEFAULT CURRENT_TIMESTAMP` | Data de criação do registro.            |
| `data_atualizacao`| `DATETIME`    | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Data da última atualização. |

### Tabela `skills`
Esta tabela armazenará as habilidades associadas aos cursos.

| Campo         | Tipo de Dados     | Restrições      | Descrição                               |
|---------------|-------------------|-----------------|-----------------------------------------|
| `id`          | `INT`             | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único da skill.           |
| `nome`        | `VARCHAR(100)`    | `NOT NULL`, `UNIQUE` | Nome da habilidade (ex: lorem ipsum).   |

### Tabela `curso_skills` (Tabela de Junção)
Esta tabela fará a ligação muitos-para-muitos entre `cursos` e `skills`.

| Campo         | Tipo de Dados     | Restrições      | Descrição                               |
|---------------|-------------------|-----------------|-----------------------------------------|
| `curso_id`    | `INT`             | `FOREIGN KEY` (`cursos.id`) | ID do curso.                            |
| `skill_id`    | `INT`             | `FOREIGN KEY` (`skills.id`) | ID da skill.                            |
| `PRIMARY KEY` | (`curso_id`, `skill_id`) | Chave primária composta.                |

## 2. Endpoints da API (NestJS)

Propomos os seguintes endpoints RESTful para gerenciar a pesquisa e paginação de cursos. O prefixo base para todos os endpoints será `/api/cursos`.

### `GET /api/cursos`
**Descrição**: Retorna uma lista paginada de cursos, com suporte a filtros e pesquisa.

**Parâmetros de Query**:

| Parâmetro     | Tipo      | Descrição                                       | Exemplo                     |
|---------------|-----------|-------------------------------------------------|-----------------------------|
| `page`        | `INT`     | Número da página (padrão: 1).                   | `?page=2`                   |
| `limit`       | `INT`     | Número de itens por página (padrão: 10).        | `?limit=20`                 |
| `search`      | `STRING`  | Termo de pesquisa para título ou descrição.     | `?search=python`            |
| `categoria`   | `STRING`  | Filtra cursos por categoria.                    | `?categoria=UI/UX Design`   |
| `criador`     | `STRING`  | Filtra cursos por criador.                      | `?criador=Chrystian Allday` |
| `minScore`    | `DECIMAL` | Filtra cursos com score mínimo.                 | `?minScore=4.0`             |
| `maxScore`    | `DECIMAL` | Filtra cursos com score máximo.                 | `?maxScore=5.0`             |
| `skills`      | `STRING`  | Lista de skills separadas por vírgula.          | `?skills=lorem ipsum,design`|

**Exemplo de Resposta (JSON)**:
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Curso de Python Avançado",
      "descricao": "Automação, APIs e IA",
      "criador": "Chrystian Allday",
      "categoria": "Programação",
      "score": 4.8,
      "preco": 100.00,
      "promocao": 10.00,
      "percentual_desconto": 90,
      "imagem_url": "https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna",
      "skills": ["Python", "Automação", "IA"]
    }
  ],
  "meta": {
    "totalItems": 100,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalPages": 10,
    "currentPage": 1
  }
}
```

## 3. Lógica de Pesquisa e Paginação

### Pesquisa Inteligente
-   A pesquisa (`search`) será aplicada nos campos `titulo` e `descricao` dos cursos, utilizando operadores `LIKE` (ou equivalente no ORM) para correspondência parcial e insensível a maiúsculas/minúsculas.
-   Os filtros (`categoria`, `criador`, `minScore`, `maxScore`) serão aplicados como cláusulas `WHERE` adicionais na consulta SQL.
-   O filtro `skills` será implementado através de uma junção (`JOIN`) com as tabelas `skills` e `curso_skills`, permitindo filtrar cursos que possuam *todas* as skills especificadas (AND) ou *qualquer uma* (OR), dependendo da implementação desejada (inicialmente, sugiro AND para maior especificidade).

### Paginação
-   A paginação será controlada pelos parâmetros `page` e `limit`.
-   A consulta SQL utilizará `LIMIT` e `OFFSET` para retornar apenas os resultados da página solicitada.
-   O backend calculará o número total de itens (`totalItems`), o número de itens na página atual (`itemCount`), o número de itens por página (`itemsPerPage`), o total de páginas (`totalPages`) e a página atual (`currentPage`) para retornar no objeto `meta` da resposta.
