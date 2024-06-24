import { ClientFactory } from '#database/factories/client_factory'
import { OrgFactory } from '#database/factories/org_factory'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Clients, GET /clients/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.get(`/clients/${clientModel.id}`).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error cannot find client', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get(`/clients/912999`).loginAs(user).send()

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

  test('returns error if is not owner or member of org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.get(`/clients/${clientModel.id}`).loginAs(users[1]).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns client', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.get(`/clients/${clientModel.id}`).loginAs(user).send()

    response.assertBody(clientModel.serialize())
  })
})

test.group('Clients, POST /clients', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const response = await client.post(`/clients/`).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if org is not found', async ({ client }) => {
    const user = await UserFactory.create()
    const clientModel = await ClientFactory.make()
    const response = await client
      .post(`/clients/`)
      .json({
        name: clientModel.name,
        orgId: 1000,
      })
      .loginAs(user)
      .send()

    response.assertBody({
      errors: [
        {
          field: 'orgId',
          message: 'The selected orgId is invalid',
          rule: 'database.exists',
        },
      ],
    })
  })

  test('returns error if not owner of org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const clientModel = await ClientFactory.make()
    const response = await client
      .post(`/clients/`)
      .json({
        name: clientModel.name,
        orgId: org.id,
      })
      .loginAs(users[1])
      .send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if name already exists', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client
      .post(`/clients/`)
      .json({
        name: clientModel.name,
        orgId: org.id,
      })
      .loginAs(user)
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

  test('returns error if values are not provided', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.post(`/clients/`).loginAs(user).send()

    response.assertBody({
      errors: [
        {
          field: 'name',
          message: 'The name field must be defined',
          rule: 'required',
        },
        {
          field: 'orgId',
          message: 'The orgId field must be defined',
          rule: 'required',
        },
      ],
    })
  })

  test('returns client', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).make()
    const response = await client
      .post(`/clients/`)
      .json({
        name: clientModel.name,
        orgId: org.id,
      })
      .loginAs(user)
      .send()

    response.assertBodyContains({
      name: clientModel.name,
      orgId: clientModel.orgId,
    })
  })
})

test.group('Clients, PUT /clients/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.put(`/clients/${clientModel.id}`).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if org is not found or if client is not found', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).make()
    const response = await client
      .put(`/clients/${org.id}`)
      .json({
        name: clientModel.name,
        orgId: 1000,
      })
      .loginAs(user)
      .send()

    response.assertBody({
      errors: [
        {
          field: 'id',
          message: 'The selected id is invalid',
          rule: 'database.exists',
        },
        {
          field: 'orgId',
          message: 'The selected orgId is invalid',
          rule: 'database.exists',
        },
      ],
    })
  })

  test('returns error if user is not owner of org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client
      .put(`/clients/${clientModel.id}`)
      .json({
        name: 'some new name',
      })
      .loginAs(users[1])
      .send()

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
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).createMany(2)
    const response = await client
      .put(`/clients/${clientModel[0].id}`)
      .json({
        name: clientModel[1].name,
      })
      .loginAs(user)
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

  test('returns new client', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client
      .put(`/clients/${clientModel.id}`)
      .json({
        name: 'new_org_name',
      })
      .loginAs(user)
      .send()

    await clientModel.refresh()
    response.assertBody(clientModel.serialize())
  })
})

test.group('Clients, DELETE /clients/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns error if not logged in', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.delete(`/clients/${clientModel.id}`).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns error if client not found', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.delete(`/clients/${100}`).loginAs(user).send()

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

  test('returns error if user is not owner of org', async ({ client }) => {
    const users = await UserFactory.createMany(2)
    const org = await OrgFactory.merge({ ownerId: users[0].id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.delete(`/clients/${clientModel.id}`).loginAs(users[1]).send()

    response.assertBody({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('returns success', async ({ client }) => {
    const user = await UserFactory.create()
    const org = await OrgFactory.merge({ ownerId: user.id }).create()
    const clientModel = await ClientFactory.merge({ orgId: org.id }).create()
    const response = await client.delete(`/clients/${clientModel.id}`).loginAs(user).send()

    response.assertBody({
      success: true,
    })
  })
})
