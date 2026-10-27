import { z } from 'zod';
import { env } from './env';
import { createBlogBodySchema, updateBlogBodySchema } from '../validators/blog.validator';
import { forgotPasswordBodySchema, loginBodySchema, registerBodySchema, resetPasswordBodySchema } from '../validators/auth.validator';

// Request schemas are generated from the same zod validators the API enforces,
// so the docs can never drift from the runtime validation.
const toSchema = (schema: z.ZodType) => {
  const { $schema: _ignored, ...json } = z.toJSONSchema(schema, { target: 'openapi-3.0', io: 'input' }) as Record<string, unknown>;
  return json;
};

const publicUser = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const envelope = (data: object) => ({
  type: 'object',
  properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data },
});

const authResult = {
  type: 'object',
  properties: { user: publicUser },
};

const blog = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    content: { type: 'string' },
    authorId: { type: 'string', format: 'uuid' },
    author: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' } },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const blogList = {
  type: 'object',
  properties: {
    items: { type: 'array', items: blog },
    meta: {
      type: 'object',
      properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } },
    },
  },
};

const publicBlogSummary = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    excerpt: { type: 'string', description: 'Plain-text preview' },
    author: { type: 'object', properties: { name: { type: 'string' } } },
    publishedAt: { type: 'string', format: 'date-time' },
  },
};

const publicBlogDetail = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    content: { type: 'string', description: 'Full post (Markdown)' },
    author: { type: 'object', properties: { name: { type: 'string' } } },
    publishedAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const publicBlogList = {
  type: 'object',
  properties: {
    items: { type: 'array', items: publicBlogSummary },
    meta: blogList.properties.meta,
  },
};

const blogSecurity = [{ cookieAuth: [] }, { bearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };

const json = (schema: object) => ({ 'application/json': { schema } });
const err = (description: string) => ({ description, content: json({ $ref: '#/components/schemas/Error' }) });

export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'Blogging API', version: '1.0.0', description: 'User registration and authentication.' },
  servers: [{ url: `http://localhost:${env.PORT}/api/v1` }],
  tags: [{ name: 'Auth' }, { name: 'Blogs' }, { name: 'Public' }, { name: 'System' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: env.COOKIE_NAME, description: 'Set automatically (httpOnly) by login/register.' },
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterInput: toSchema(registerBodySchema),
      LoginInput: toSchema(loginBodySchema),
      ForgotPasswordInput: toSchema(forgotPasswordBodySchema),
      ResetPasswordInput: toSchema(resetPasswordBodySchema),
      CreateBlogInput: toSchema(createBlogBodySchema),
      UpdateBlogInput: toSchema(updateBlogBodySchema),
      PublicUser: publicUser,
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: { type: 'object', properties: { path: { type: 'string' }, message: { type: 'string' } } },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { tags: ['System'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/RegisterInput' }) },
        responses: {
          201: { description: 'Registered', content: json(envelope(authResult)) },
          409: err('Email already registered'),
          422: err('Validation failed'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        description: 'Sets an httpOnly session cookie.',
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/LoginInput' }) },
        responses: {
          200: { description: 'Logged in', content: json(envelope(authResult)) },
          401: err('Invalid email or password'),
          422: err('Validation failed'),
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset link',
        description: 'Always returns 200, whether or not the email exists. Limited to 5 requests per 15 minutes per IP.',
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ForgotPasswordInput' }) },
        responses: { 200: { description: 'Reset email sent if the account exists', content: json(envelope({ nullable: true })) }, 422: err('Validation failed'), 429: err('Too many requests') },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Set a new password using the emailed token',
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ResetPasswordInput' }) },
        responses: { 200: { description: 'Password reset', content: json(envelope({ nullable: true })) }, 400: err('Invalid or expired token'), 422: err('Validation failed') },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Log out (clears the session cookie)', responses: { 200: { description: 'Logged out', content: json(envelope({ nullable: true })) } } },
    },
    '/blogs': {
      post: {
        tags: ['Blogs'],
        summary: 'Create a blog',
        security: blogSecurity,
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/CreateBlogInput' }) },
        responses: { 201: { description: 'Created', content: json(envelope(blog)) }, 401: err('Unauthorized'), 422: err('Validation failed') },
      },
      get: {
        tags: ['Blogs'],
        summary: 'List and search blogs',
        description:
          'Everyone\'s posts by default (newest first). Combine `q`, `author`, `sort`, `order` and `mine` freely; results are paginated.',
        security: blogSecurity,
        parameters: [
          { name: 'q', in: 'query', description: 'Search in title and content (case-insensitive)', schema: { type: 'string', maxLength: 100 } },
          { name: 'author', in: 'query', description: 'Filter by blogger name (case-insensitive, partial match)', schema: { type: 'string', maxLength: 100 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'title', 'author'], default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          { name: 'mine', in: 'query', description: 'Only my own posts', schema: { type: 'boolean', default: false } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: { 200: { description: 'Blogs', content: json(envelope(blogList)) }, 401: err('Unauthorized') },
      },
    },
    '/blogs/{id}': {
      get: {
        tags: ['Blogs'],
        summary: 'Get a blog',
        description: 'Any signed-in user can read any blog. Only the author can edit or delete it.',
        security: blogSecurity,
        parameters: [idParam],
        responses: { 200: { description: 'Blog', content: json(envelope(blog)) }, 401: err('Unauthorized'), 404: err('Not found') },
      },
      patch: {
        tags: ['Blogs'],
        summary: 'Edit my blog (title and/or content)',
        security: blogSecurity,
        parameters: [idParam],
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/UpdateBlogInput' }) },
        responses: { 200: { description: 'Updated', content: json(envelope(blog)) }, 401: err('Unauthorized'), 404: err('Not found'), 422: err('Validation failed') },
      },
      delete: {
        tags: ['Blogs'],
        summary: 'Delete my blog',
        security: blogSecurity,
        parameters: [idParam],
        responses: { 200: { description: 'Deleted', content: json(envelope({ nullable: true })) }, 401: err('Unauthorized'), 404: err('Not found') },
      },
    },
    '/public/blogs': {
      get: {
        tags: ['Public'],
        summary: 'List all blogs (no login required)',
        description:
          'Every post with the author name and publish date. Search by blogger name, sort, and page through the results. Limited to 120 requests per minute per IP.',
        parameters: [
          { name: 'author', in: 'query', description: 'Search by blogger name (case-insensitive, partial match)', schema: { type: 'string', maxLength: 100 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['publishedAt', 'title', 'author'], default: 'publishedAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: { 200: { description: 'Blogs', content: json(envelope(publicBlogList)) }, 422: err('Validation failed'), 429: err('Too many requests') },
      },
    },
    '/public/blogs/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Read one blog (no login required)',
        parameters: [idParam],
        responses: { 200: { description: 'Blog', content: json(envelope(publicBlogDetail)) }, 404: err('Not found'), 422: err('Validation failed') },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current user',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: { 200: { description: 'Profile', content: json(envelope(publicUser)) }, 401: err('Unauthorized') },
      },
    },
  },
};
