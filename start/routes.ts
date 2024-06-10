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
const OrgsController = () => import('#controllers/orgs_controller')

router.get('/me', [SessionController, 'read']).use(middleware.auth({ guards: ['web'] }))
router.post('/login', [SessionController, 'create'])
router.post('/register', [SessionController, 'register'])
router.delete('/logout', [SessionController, 'delete']).use(middleware.auth({ guards: ['web'] }))

router.get('/orgs/all', [OrgsController, 'readAll']).use(middleware.auth({ guards: ['web'] }))
router.post('/orgs', [OrgsController, 'create']).use(middleware.auth({ guards: ['web'] }))
router.get('/orgs/:id', [OrgsController, 'read']).use(middleware.auth({ guards: ['web'] }))
