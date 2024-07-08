import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author, but does not render URL or likes by default', () => {
  const blog = {
    title: 'Cute cats',
    author: 'Fluffy',
    url: 'http://cute_cats.com',
    likes: 100
  }

  const { container } = render(<Blog blog={blog} />)

  const div = container.querySelector('.blog')

  expect(div).toHaveTextContent(
    'Cute cats'
  )
  expect(div).toHaveTextContent(
    'Fluffy'
  )

  expect(div).not.toHaveTextContent(
    'http://cute_cats.com'
  )
  expect(div).not.toHaveTextContent(
    '100'
  )
})

test('url and likes are shown when the button is clicked', async () => {
  const blog = {
    title: 'Cute cats',
    author: 'Fluffy',
    url: 'http://cute_cats.com',
    likes: 100,
    user: {
      name: 'John',
      username: 'testuser'
    }
  }


  const loggedBlogappUser = JSON.stringify({ username: 'testuser' })
  window.localStorage.setItem('loggedBlogappUser', loggedBlogappUser)

  const { container } = render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const div = container.querySelector('.blog')
  expect(div).toHaveTextContent('http://cute_cats.com')
  expect(div).toHaveTextContent('100')
})

test('clicking the like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Cute cats',
    author: 'Fluffy',
    url: 'http://cute_cats.com',
    likes: 100,
    user: {
      name: 'John',
      username: 'testuser'
    }
  }

  const loggedBlogappUser = JSON.stringify({ username: 'testuser' })
  window.localStorage.setItem('loggedBlogappUser', loggedBlogappUser)

  const mockLikeHandler = vi.fn()

  render(
    <Blog blog={blog} likeBlog={mockLikeHandler} />
  )

  const user = userEvent.setup()
  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const likeButton = screen.getByLabelText('like button')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockLikeHandler).toHaveBeenCalledTimes(2)
})