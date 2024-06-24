import Client from '#models/client'
import Org from '#models/org'
import {
  createClientValidator,
  readClientValidator,
  updateClientValidator,
} from '#validators/client'
import { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async create(ctx: HttpContext) {
    const { name, orgId } = await ctx.request.validateUsing(createClientValidator)

    const org = await Org.findOrFail(orgId)
    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    const client = await Client.create({
      name,
      orgId,
    })

    return client
  }

  async read(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readClientValidator, {
      data: {
        id: ctx.request.param('id'),
      },
    })
    const client = await Client.findOrFail(id)
    const org = await Org.findOrFail(client.orgId)

    // TODO: Check if user has joined
    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    return client
  }

  async update(ctx: HttpContext) {
    const { id, orgId, name } = await ctx.request.validateUsing(updateClientValidator, {
      data: {
        ...ctx.request.body(),
        id: ctx.request.param('id'),
      },
    })
    const client = await Client.findOrFail(id)
    const org = await Org.findOrFail(client.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    if (orgId !== undefined) {
      client.orgId = orgId
    }

    if (name !== undefined) {
      client.name = name
    }

    await client.save()

    return client
  }

  async delete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readClientValidator, {
      data: {
        id: ctx.request.param('id'),
      },
    })

    const client = await Client.findOrFail(id)
    const org = await Org.findOrFail(client.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    await client.delete()
    return { success: true }
  }
}
