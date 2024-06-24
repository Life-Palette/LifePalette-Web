import { useNProgress } from '@vueuse/integrations/useNProgress'
import { router } from './router'

// https://vueuse.org/integrations/useNProgress/
const { start, done } = useNProgress()

router.beforeEach(() => start())

router.afterEach(() => done(true))
