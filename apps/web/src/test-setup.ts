import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// JSDOM does not implement scrollIntoView or scrollTo
Element.prototype.scrollIntoView = () => {}
window.scrollTo = () => {}
