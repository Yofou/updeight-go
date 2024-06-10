import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/session'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  // login
  async create(ctx: HttpContext) {
    const body = await ctx.request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(body.email, body.password)
    await ctx.auth.use('web').login(user)

    return user.serialize()
  }

  async register(ctx: HttpContext) {
    const { username, password, email } = await ctx.request.validateUsing(registerValidator)
    const user = await User.create({
      username,
      password,
      email,
    })

    await ctx.auth.use('web').login(user)

    return user.serialize()
  }

  // me
  read(ctx: HttpContext) {
    return ctx.auth.user?.serialize()
  }

  // logout
  async delete(ctx: HttpContext) {
    try {
      await ctx.auth.use('web').logout()
      return { logout: true }
    } catch {
      return {
        logout: false,
      }
    }
  }
}
