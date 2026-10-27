import { Router } from 'express';
import { createBlog, deleteBlog, getBlog, listBlogs, updateBlog } from '../controllers/blog.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { blogIdSchema, createBlogSchema, listBlogsSchema, updateBlogSchema } from '../validators/blog.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBlogSchema), createBlog);
router.get('/', validate(listBlogsSchema), listBlogs);
router.get('/:id', validate(blogIdSchema), getBlog);
router.patch('/:id', validate(updateBlogSchema), updateBlog);
router.delete('/:id', validate(blogIdSchema), deleteBlog);

export default router;
