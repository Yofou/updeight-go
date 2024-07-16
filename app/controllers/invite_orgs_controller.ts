import InviteOrgUser from '#models/invite_org_user'
import JoinedOrgUser from '#models/joined_org_user'
import Org from '#models/org'
import {
  createInviteOrgUserValidator,
  deleteInviteOrgUserValidator,
  readInviteOrgUserValidator,
} from '#validators/invite_org_user'
import type { HttpContext } from '@adonisjs/core/http'

export default class InviteOrgsController {
  async create(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(createInviteOrgUserValidator)
    const org = await Org.findOrFail(body.orgId)

    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot invite member to org you do not own',
          },
        ],
      })
    }

    return InviteOrgUser.create({
      email: body.email,
      orgId: body.orgId,
    })
  }

  async read(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(readInviteOrgUserValidator)
    const org = await Org.findOrFail(body.orgId)
    const joinedMember = await JoinedOrgUser.findBy({
      orgId: body.orgId,
      userId: ctx.auth.user!.id,
    })

    if (org.ownerId !== ctx.auth.user!.id && !joinedMember) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot read invited members to org you are not in',
          },
        ],
      })
    }

    return InviteOrgUser.findManyBy('ordId', body.orgId)
  }

  async delete(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(deleteInviteOrgUserValidator)

    const inviteMember = await InviteOrgUser.findOrFail(body.inviteId)
    const org = await Org.findOrFail(inviteMember.orgId)
    if (org.ownerId !== ctx.auth.user!.id) {
      return ctx.response.unauthorized({
        errors: [
          {
            field: 'orgId',
            message: 'cannot remove invited member to org you do not own',
          },
        ],
      })
    }

    await inviteMember.delete()
    return { success: true }
  }
}
