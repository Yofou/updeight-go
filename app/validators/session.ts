import User from '#models/user'
import vine from '@vinejs/vine'

const loginSchema = vine.object({
  email: vine.string(),
  password: vine.string(),
})

export const loginValidator = vine.compile(loginSchema)

const registerSchema = vine.object({
  username: vine.string(),
  email: vine
    .string()
    .email()
    .unique(async (_, value) => {
      return !(await User.findBy({
        email: value,
      }))
    }),
  password: vine.string().minLength(1).maxLength(30).confirmed({
    confirmationField: 'confirm',
  }),
  confirm: vine.string(),
})

export const registerValidator = vine.compile(registerSchema)

