const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  let token;


  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'daria elina',
        username: 'daria',
        password: 'salainen'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log In to application')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login'})).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'daria', 'salainen')

      await expect(page.getByText('daria elina logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'daria', 'wrong')

      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'daria', 'salainen')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('title-input').fill('blogs title')
      await page.getByTestId('author-input').fill('blogs author')
      await page.getByTestId('url-input').fill('blogs url')
      await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('blog blogs title added successfully')).toBeVisible()
      await expect(page.getByTestId('title')).toBeVisible()
      await expect(page.getByTestId('author')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'a blog created by playwright added successfully', 'a blog created by playwright', 'playwright', 'www.blog.com')
      })

      test('a blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()

        const likesCount = page.getByTestId('likes')
        await expect(likesCount).toHaveText('0')

        await page.getByLabel('like button').click()
        await expect(likesCount).toHaveText('1')
      })

      test('a blog can be deleted', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click();
        page.on('dialog', async dialog => {
          await dialog.accept();
        });
      
        await page.getByRole('button', { name: 'remove blog' }).click()
        await expect(page.getByTestId('title')).not.toBeVisible()
        await expect(page.getByTestId('author')).not.toBeVisible()
      })

      test('only the author sees the remove button', async ({ request, page }) => {
        await page.getByRole('button', { name: 'log out' }).click();
        await request.post('http://localhost:3003/api/users', {
          data: {
            name: 'new user',
            username: 'new user',
            password: 'sekret'
          }
        })
        await page.goto('http://localhost:5173')

        await loginWith(page, 'new user', 'sekret')
        await expect(page.getByText('new user logged in')).toBeVisible()

        await expect(page.getByTestId('title')).toBeVisible()
        await expect(page.getByTestId('author')).toBeVisible()

        await page.getByRole('button', { name: 'view' }).click();
        await expect(page.getByRole('button', { name: 'remove blog' })).not.toBeVisible()
      })
    })
    describe('When there are more blogs', () => {
      beforeEach(async ({ page, request }) => {
        const response = await request.post('http://localhost:3003/api/login', {
          data: {
            username: 'daria',
            password: 'salainen'
          }
        })
        const { token: authToken } = await response.json()
        token = authToken

        
        const blogs = [
          { title: 'First', author: 'playwright', url: 'http://blog1.com', likes: 1 },
          { title: 'Second', author: 'playwright', url: 'http://blog2.com', likes: 5 },
          { title: 'Third', author: 'playwright', url: 'http://blog3.com', likes: 23 },
          { title: 'Fourth', author: 'playwright', url: 'http://blog3.com', likes: 45 },
          { title: 'Fifth', author: 'playwright', url: 'http://blog3.com'}
        ];
  
        for (const blog of blogs) {
          await request.post('http://localhost:3003/api/blogs', {
            data: blog,
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
        await page.goto('http://localhost:5173');
      })
  
      test('and they are arranged by likes amount', async ({ page }) => {
        const blogs = await page.getByTestId('blog').all()
        const likes = [];

        for (const blog of blogs) {
          await blog.getByRole('button', { name: 'view' }).click();
          const likeText = await blog.getByTestId('likes').innerText();
          likes.push(Number(likeText))
        }

        const sortedLikes = [...likes].sort((a, b) => b - a);
        expect(likes).toEqual(sortedLikes)
      })
    })
  })
})