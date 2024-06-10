import Org from '#models/org'
import { createOrgValidator, readOrgValidator } from '#validators/org'
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

  async delete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(readOrgValidator, {
      data: ctx.request.params(),
    })

    const org = await Org.find(id)
    return org?.serialize()
  }
}

