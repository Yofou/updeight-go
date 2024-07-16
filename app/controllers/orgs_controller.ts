import InviteOrgUser from '#models/invite_org_user'
import JoinedOrgUser from '#models/joined_org_user'
import Org from '#models/org'
import { createOrgValidator, readOrgValidator, updateOrgValidator } from '#validators/org'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrgsController {
  // all
  async readAll(ctx: HttpContext) {
    const allOrgs = await Org.findManyBy({
      ownerId: ctx.auth.user!.id,
    })

    return allOrgs
  }

  async create(ctx: HttpContext) {
    const { name } = await ctx.request.validateUsing(createOrgValidator)

    const org = await Org.create({
      name,
      ownerId: ctx.auth.user!.id,
    })

    return org.serialize()
  }

  async read(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator, {
      data: ctx.request.params(),
    })

    const org = await Org.find(id)
    return org?.serialize()
  }

  async update(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator, {
      data: ctx.request.params(),
    })

    const org = await Org.findOrFail(id)

    const { name } = await ctx.request.validateUsing(updateOrgValidator)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    org.name = name
    await org.save()

    return org?.serialize()
  }

  async delete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator, {
      data: ctx.request.params(),
    })

    const org = await Org.find(id)
    if (org?.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    await org?.delete()

    return { success: true }
  }

  async join(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator)

    const hasUserBeenInvited = await InviteOrgUser.findBy({
      email: ctx.auth.user!.email,
      orgId: id,
    })

    if (!hasUserBeenInvited) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    const joinedUser = await JoinedOrgUser.create({
      orgId: id,
      userId: ctx.auth.user!.id,
    })

    return joinedUser
  }

  async leave(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator)
    const hasUserJoined = await JoinedOrgUser.find({
      orgId: id,
      userId: ctx.auth.user!.id,
    })

    if (!hasUserJoined) {
      return ctx.response.unprocessableEntity({
        errors: [
          {
            message: 'Unauthorized access',
          },
        ],
      })
    }

    return { success: true }
  }
}
