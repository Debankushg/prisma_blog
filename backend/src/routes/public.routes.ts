import { Router } from 'express';
import { getPublicBlog, listPublicBlogs } from '../controllers/public.controller';
import { validate } from '../middleware/validate';
import { blogIdSchema, publicListBlogsSchema } from '../validators/blog.validator';

// No `authenticate` here on purpose: these endpoints are open to anonymous visitors.
const router = Router();

router.get('/blogs', validate(publicListBlogsSchema), listPublicBlogs);
router.get('/blogs/:id', validate(blogIdSchema), getPublicBlog);

export default router;
