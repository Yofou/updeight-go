import User from '#models/user'
import { test } from '@japa/runner'

test.group('Session, /login', () => {
  test('fails if password doesnt match', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({
        email: 'reach@yofou.dev',
        password: 'thisIsWrongPassword',
      })
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('fails if email doesnt match', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({
        email: 'wrongEmail@gmail.com',
        password: 'password123',
      })
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('passes if credentials match and ', async ({ client, assert }) => {
    const response = await client
      .post('/login')
      .json({
        email: 'reach@yofou.dev',
        password: 'password123',
      })
      .send()

    response.assertBody({
      id: 1,
      email: 'reach@yofou.dev',
      username: 'yofou',
      createdAt: '2024-06-09T22:17:46.193+00:00',
      updatedAt: '2024-06-09T22:17:46.194+00:00',
    })

    assert.exists(response.cookiesJar)
  })
})

test.group('Session, /register', () => {
  test('fails if fields are not supplied', async ({ client }) => {
    const response = await client.post('/register').json({}).send()

    response.assertBody({
      errors: [
        {
          field: 'username',
          message: 'The username field must be defined',
          rule: 'required',
        },
        {
          field: 'email',
          message: 'The email field must be defined',
          rule: 'required',
        },
        {
          field: 'password',
          message: 'The password field must be defined',
          rule: 'required',
        },
        {
          field: 'confirm',
          message: 'The confirm field must be defined',
          rule: 'required',
        },
      ],
    })
  })

  test('fails if email is not unique', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'reach@yofou.dev',
        username: 'yofou',
        password: 'password123',
        confirm: 'password123',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'email',
          message: 'The email has already been taken',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('fails if password does not match confirm', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou',
        password: 'password123',
        confirm: 'password12',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field and confirm field must be the same',
          rule: 'confirmed',
          meta: {
            otherField: 'confirm',
          },
        },
      ],
    })
  })

  test('fails if password is too long', async ({ client }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou',
        password: '0123456789012345678901234567891',
        confirm: '0123456789012345678901234567891',
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'password',
          message: 'The password field must not be greater than 30 characters',
          rule: 'maxLength',
          meta: {
            max: 30,
          },
        },
      ],
    })
  })

  test('passes and creates account', async ({ client, assert }) => {
    const response = await client
      .post('/register')
      .json({
        email: 'new@yofou.dev',
        username: 'yofou3',
        password: 'password123',
        confirm: 'password123',
      })
      .send()

    assert.containsSubset(response.body(), {
      email: 'new@yofou.dev',
      username: 'yofou3',
    })
  }).cleanup(async () => {
    const user = await User.query().where('email', 'new@yofou.dev').first()
    await user?.delete()
  })
})

test.group('Session, /me', () => {
  test('fails if not logged in', async ({ client }) => {
    const response = await client.get('/me').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('passed if logged in', async ({ client }) => {
    const loginResponse = await client
      .post('/login')
      .json({ email: 'reach@yofou.dev', password: 'password123' })
      .send()
    const response = await client
      .get('/me')
      .withCookie('remember_web', '')
      .withCookie('adonis-session', loginResponse.cookie('adonis-session')?.value)
      .withCookie(loginResponse.cookie('adonis-session')?.value, { auth_web: 1 })
      .send()

    response.assertBody({
      createdAt: '2024-06-09T22:17:46.193+00:00',
      email: 'reach@yofou.dev',
      id: 1,
      updatedAt: '2024-06-09T22:17:46.194+00:00',
      username: 'yofou',
    })
  })
})

test.group('Session, /logout', () => {
  test('fails if not logged in', async ({ client }) => {
    const response = await client.delete('/logout').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('passed if logged in', async ({ client }) => {
    const loginResponse = await client
      .post('/login')
      .json({ email: 'reach@yofou.dev', password: 'password123' })
      .send()
    const response = await client
      .delete('/logout')
      .withCookie('remember_web', '')
      .withCookie('adonis-session', loginResponse.cookie('adonis-session')?.value)
      .withCookie(loginResponse.cookie('adonis-session')?.value, { auth_web: 1 })
      .send()

    response.assertBody({ logout: true })
  })
})
