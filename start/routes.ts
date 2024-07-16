/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const SessionController = () => import('#controllers/session_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const BannedOrgsUsersController = () => import('#controllers/banned_orgs_users_controller')
const InviteOrgsController = () => import('#controllers/invite_orgs_controller')
const ClientsController = () => import('#controllers/clients_controller')
const OrgsController = () => import('#controllers/orgs_controller')

router.get('/me', [SessionController, 'read']).use(middleware.auth({ guards: ['web'] }))
router.post('/login', [SessionController, 'create'])
router.post('/register', [SessionController, 'register'])
router.delete('/logout', [SessionController, 'delete']).use(middleware.auth({ guards: ['web'] }))

router
  .group(() => {
    router.post('/orgs', [OrgsController, 'create'])
    router.get('/orgs/all', [OrgsController, 'readAll'])
    router.get('/orgs/:id', [OrgsController, 'read'])
    router.put('/orgs/:id', [OrgsController, 'update'])
    router.delete('/orgs/:id', [OrgsController, 'delete'])

    router.get('/orgs/invite', [InviteOrgsController, 'read'])
    router.post('/orgs/invite', [InviteOrgsController, 'create'])
    router.delete('/orgs/invite', [InviteOrgsController, 'delete'])

    router.post('/orgs/join', [OrgsController, 'join'])
    router.post('/orgs/leave', [OrgsController, 'leave'])

    router.get('/orgs/ban', [BannedOrgsUsersController, 'read'])
    router.post('/orgs/ban', [BannedOrgsUsersController, 'create'])
    router.delete('/orgs/ban', [BannedOrgsUsersController, 'delete'])

    router.post('/clients', [ClientsController, 'create'])
    router.get('/clients/:id', [ClientsController, 'read'])
    router.put('/clients/:id', [ClientsController, 'update'])
    router.delete('/clients/:id', [ClientsController, 'delete'])
  })
  .use(middleware.auth({ guards: ['web'] }))
