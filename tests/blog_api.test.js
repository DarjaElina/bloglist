const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
  
    const blogs = response.body
  
    blogs.forEach(blog => {
      assert(blog.hasOwnProperty('id')),
      assert(!blog.hasOwnProperty('_id'))
    })
  })

  describe('addition of a new blog', () => {

    test('succeeds if the data is valid', async () => {
      const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      }
    
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Type wars'))
    })

    test('fails with 400 Bad Request if there is no url', async () => {
      const blogWithNoUrl = {
        title: "Type wars",
        author: "Robert C. Martin",
      }
    
      await api
        .post('/api/blogs/')
        .send(blogWithNoUrl)
        .expect(400)
    })
    
    test('fails with 400 Bad Request if there is no title', async () => {
      const blogWithNoTitle = {
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        author: "Robert C. Martin",
      }
    
      await api
        .post('/api/blogs/')
        .send(blogWithNoTitle)
        .expect(400)
    })

    test('likes prop is set to zero if missing', async () => {
      const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      }

      await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()

      const likes = blogs.map(b => b.likes)

      assert.strictEqual(likes[likes.length - 1], 0)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with 400 if id is invalid', async () => {
      const invalidId = '5a422a851b54a676234d17f'
      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistingButValidId = '5a422ba71b54a676234d17fb'
      await api
        .delete(`/api/blogs/${nonExistingButValidId}`)
        .expect(404)
    })
  })
  describe('updating of a blog', () => {
    test('succeeds with if the id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const likesAtStart = blogToUpdate.likes;
      const newLikes = 18
    
      const updatedBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: newLikes
      }
    
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
    
      const blogsAtEnd = await helper.blogsInDb()
      const likesAtEnd = blogsAtEnd[0].likes
      
      assert(likesAtEnd !== likesAtStart)
      assert.strictEqual(newLikes, likesAtEnd)
    })

    test('fails with status code 400 if id is invalid', async ( )=> {
      const invalidId = '5a422a851b54a676234d17f'
      const newLikes = 18

      const updatedBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: newLikes
      }
  
      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async ( )=> {
      const nonExistingButValidId = '5a422ba71b54a676234d17fb'
      const newLikes = 18

      const updatedBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: newLikes
      }
  
      await api
        .put(`/api/blogs/${nonExistingButValidId}`)
        .send(updatedBlog)
        .expect(404)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})