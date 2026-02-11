export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "DevMusic API",
    version: "1.0.0",
    description: "API para gerenciamento de músicas com autenticação JWT, filtros e paginação"
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Ambiente local"
    }
  ],
  tags: [
    { name: "Users" },
    { name: "Musics" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Deivid" },
          email: { type: "string", format: "email", example: "deivid@email.com" },
          password: { type: "string", example: "123456" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "deivid@email.com" },
          password: { type: "string", example: "123456" }
        }
      },
      MusicRequest: {
        type: "object",
        required: ["title", "artist"],
        properties: {
          title: { type: "string", example: "Music One" },
          artist: { type: "string", example: "Artist A" },
          url: { type: "string", example: "https://example.com/song.mp3" }
        }
      },
      MusicUpdateRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "New Title" },
          artist: { type: "string", example: "New Artist" },
          url: { type: "string", example: "https://example.com/song.mp3" }
        }
      },
      PaginatedMusicsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object"
            }
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              total: { type: "integer", example: 42 },
              totalPages: { type: "integer", example: 5 },
              hasNextPage: { type: "boolean", example: true },
              hasPreviousPage: { type: "boolean", example: false }
            }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" }
        }
      }
    }
  },
  paths: {
    "/api/users/register": {
      post: {
        tags: ["Users"],
        summary: "Registrar usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        responses: {
          "201": { description: "Usuário criado" },
          "400": { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/users/login": {
      post: {
        tags: ["Users"],
        summary: "Autenticar usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          "200": { description: "Login realizado" },
          "400": { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Buscar perfil do usuário logado",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Perfil retornado" },
          "401": { description: "Não autorizado" },
          "404": { description: "Usuário não encontrado" }
        }
      }
    },
    "/api/musics": {
      post: {
        tags: ["Musics"],
        summary: "Criar música",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MusicRequest"
              }
            }
          }
        },
        responses: {
          "201": { description: "Música criada" },
          "400": { description: "Erro de validação" },
          "401": { description: "Não autorizado" }
        }
      },
      get: {
        tags: ["Musics"],
        summary: "Listar músicas do usuário logado",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 }, required: false },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 }, required: false },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["createdAt", "title", "artist"] }, required: false },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] }, required: false },
          { in: "query", name: "title", schema: { type: "string" }, required: false },
          { in: "query", name: "artist", schema: { type: "string" }, required: false },
          { in: "query", name: "createdFrom", schema: { type: "string" }, required: false },
          { in: "query", name: "createdTo", schema: { type: "string" }, required: false }
        ],
        responses: {
          "200": {
            description: "Lista paginada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedMusicsResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/musics/all": {
      get: {
        tags: ["Musics"],
        summary: "Listar todas as músicas",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 }, required: false },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 }, required: false },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["createdAt", "title", "artist"] }, required: false },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] }, required: false },
          { in: "query", name: "title", schema: { type: "string" }, required: false },
          { in: "query", name: "artist", schema: { type: "string" }, required: false },
          { in: "query", name: "userId", schema: { type: "integer", minimum: 1 }, required: false },
          { in: "query", name: "createdFrom", schema: { type: "string" }, required: false },
          { in: "query", name: "createdTo", schema: { type: "string" }, required: false }
        ],
        responses: {
          "200": {
            description: "Lista paginada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedMusicsResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/musics/{id}": {
      put: {
        tags: ["Musics"],
        summary: "Atualizar música",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer", minimum: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MusicUpdateRequest"
              }
            }
          }
        },
        responses: {
          "200": { description: "Música atualizada" },
          "400": { description: "Erro de validação" },
          "401": { description: "Não autorizado" },
          "403": { description: "Sem permissão" },
          "404": { description: "Música não encontrada" }
        }
      },
      delete: {
        tags: ["Musics"],
        summary: "Deletar música",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer", minimum: 1 }
          }
        ],
        responses: {
          "200": { description: "Música deletada" },
          "401": { description: "Não autorizado" },
          "403": { description: "Sem permissão" },
          "404": { description: "Música não encontrada" }
        }
      }
    }
  }
};
