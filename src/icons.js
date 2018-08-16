import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'

library.add(faTimes, faCheck, faExclamationTriangle)
dom.watch()
