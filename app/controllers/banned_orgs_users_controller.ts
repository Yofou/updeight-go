import BannedOrgUser from '#models/banned_org_user'
import Org from '#models/org'
import {
    createBannedOrgUserValidator,
  deleteBannedOrgUserValidator,
  readBannedOrgUserValidator,
} from '#validators/banned_orgs_user'
import type { HttpContext } from '@adonisjs/core/http'

export default class BannedOrgsUsersController {
  async create(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(createBannedOrgUserValidator)
    const org = await Org.findOrFail(body.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot read banned members to org you do not own',
          },
        ],
      })
    }

    return BannedOrgUser.create({
      userId: body.userId,
      orgId: body.orgId,
    })
  }

  async read(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(readBannedOrgUserValidator)
    const org = await Org.findOrFail(body.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot read banned members to org you do not own',
          },
        ],
      })
    }

    return BannedOrgUser.findManyBy({
      orgId: body.orgId,
    })
  }

  async delete(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(deleteBannedOrgUserValidator)
    const bannedOrgUser = await BannedOrgUser.findOrFail(body.bannedId)
    const org = await Org.findOrFail(bannedOrgUser.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot remove banned member to org you do not own',
          },
        ],
      })
    }

    await bannedOrgUser.delete()

    return { success: true }
  }
}
