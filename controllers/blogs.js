const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  return response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const blog = await Blog.findByIdAndDelete(request.params.id)
    if (blog) {
      response.status(204).end()
    } else response.status(404).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    if (updatedBlog) {
      response.json(updatedBlog)
    } else response.status(404).end()
})

module.exports = blogsRouter