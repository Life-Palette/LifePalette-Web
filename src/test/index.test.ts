import { assert, describe, expect, it } from 'vitest'

describe('suite name', () => {
	it('foo', () => {
		expect(1 + 1).toEqual(2)
		// eslint-disable-next-line ts/no-unused-expressions
		expect(true).to.be.true
	})

	it('bar', () => {
		assert.equal(Math.sqrt(4), 2)
	})

	it('snapshot', () => {
		expect({ foo: 'bar' }).toMatchSnapshot()
	})
})
