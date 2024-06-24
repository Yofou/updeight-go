import { OrgFactory } from '#database/factories/org_factory'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Org, /orgs/all', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns empty array if account has no owned orgs', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/orgs/all').loginAs(user).send()

    response.assertBody([])
  })

  test('returns filled array if account has owned orgs', async ({ client }) => {
    const user = await UserFactory.create()
    const orgs = await OrgFactory.merge({ ownerId: user.id }).createMany(10)

    const response = await client.get('/orgs/all').loginAs(user).send()

    response.assertBody(orgs.map((org) => org.serialize()))
  })

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.get('/orgs/all').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })
})

test.group('Org, GET /orgs/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.get('/orgs/1').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns org if owned by user', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const response = await client.get(`/orgs/${org.id}`).loginAs(user).send()

    response.assertBody(org.serialize())
  })

  test('returns error org is not found', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get(`/orgs/9999999`).loginAs(user).send()

    response.assertBody({
      errors: [
        {
          field: 'id',
          message: 'The selected id is invalid',
          rule: 'database.exists',
        },
      ],
    })
  })

  test('returns error org is not found', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get(`/orgs/9999999`).loginAs(user).send()

    response.assertBody({
      errors: [
        {
          field: 'id',
          message: 'The selected id is invalid',
          rule: 'database.exists',
        },
      ],
    })
  })
})

test.group('Org, CREATE /orgs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.post('/orgs').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns new org', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client
      .post('/orgs')
      .loginAs(user)
      .json({
        name: 'new_org',
      })
      .send()

    response.assertBodyContains({
      name: 'new_org',
      ownerId: user.id,
    })
  })

  test('returns validation error for name if it does not exist', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post('/orgs').loginAs(user).send()

    response.assertBody({
      errors: [
        {
          field: 'name',
          message: 'The name field must be defined',
          rule: 'required',
        },
      ],
    })
  })

  test('returns validation error for name if it already exists', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const response = await client
      .post('/orgs')
      .loginAs(user)
      .json({
        name: org.name,
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'name',
          message: 'The name has already been taken',
          rule: 'database.unique',
        },
      ],
    })
  })
})

test.group('Org, PUT /orgs/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.put('/orgs/1').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if name is already taken', async ({ client }) => {
    const user = await UserFactory.create()
    const orgs = await OrgFactory.merge({ ownerId: user.id }).createMany(2)
    const response = await client
      .put(`/orgs/${orgs[0].id}`)
      .loginAs(user)
      .json({
        name: orgs[1].name,
      })
      .send()

    response.assertBody({
      errors: [
        {
          field: 'name',
          message: 'The name has already been taken',
          rule: 'database.unique',
        },
      ],
    })
  })

  test('returns error if user is not owner of org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const response = await client
      .put(`/orgs/${org.id}`)
      .loginAs(users[1])
      .json({
        name: 'some_unique_name',
      })
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })
})

test.group('Org, DELETE /orgs/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.delete('/orgs/1').send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if user is not the owner of the org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const response = await client.delete(`/orgs/${org.id}`).loginAs(users[1]).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns success if is owner', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const response = await client.delete(`/orgs/${org.id}`).loginAs(user).send()

    response.assertBody({
      success: true,
    })
  })
})
