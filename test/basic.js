import './helpers/wx-globals'
import test from 'ava'
import sinon from 'sinon'

import MinaSandbox from './helpers/mina-sandbox'

import Tina from '..'

test.beforeEach((t) => {
  t.context.mina = new MinaSandbox({ Tina })
})
test.afterEach((t) => {
  t.context.mina.restore()
})

test('`onLoad`, `onReady`, `onShow`, `onHide`, `onUnload` should be called', (t) => {
  const options = {
    onLoad: sinon.spy(),
    onReady: sinon.spy(),
    onShow: sinon.spy(),
    onHide: sinon.spy(),
    onUnload: sinon.spy(),
    onNonexistentHook: sinon.spy(),
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)

  t.true(options.onLoad.notCalled)
  t.true(options.onReady.notCalled)
  t.true(options.onShow.notCalled)
  t.true(options.onHide.notCalled)
  t.true(options.onUnload.notCalled)
  t.true(options.onNonexistentHook.notCalled)

  page._emit('onLoad')
  t.true(options.onLoad.calledOnce)

  page._emit('onReady')
  t.true(options.onReady.calledOnce)

  page._emit('onShow')
  t.true(options.onShow.calledOnce)

  page._emit('onHide')
  t.true(options.onHide.calledOnce)

  page._emit('onUnload')
  t.true(options.onUnload.calledOnce)

  t.is(typeof page.onNonexistentHook, 'undefined')
  t.true(options.onNonexistentHook.notCalled)
})

test('`onPullDownRefresh`, `onReachBottom`, `onShareAppMessage`, `onPageScroll`, `onTabItemTap` should be called', (t) => {
  const options = {
    onPullDownRefresh: sinon.spy(),
    onReachBottom: sinon.spy(),
    onShareAppMessage: sinon.spy(),
    onPageScroll: sinon.spy(),
    onTabItemTap: sinon.spy(),
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)

  t.true(options.onPullDownRefresh.notCalled)
  t.true(options.onReachBottom.notCalled)
  t.true(options.onShareAppMessage.notCalled)
  t.true(options.onPageScroll.notCalled)
  t.true(options.onTabItemTap.notCalled)

  page._emit('onLoad')

  page._emit('onPullDownRefresh')
  t.true(options.onPullDownRefresh.calledOnce)

  page._emit('onReachBottom')
  t.true(options.onReachBottom.calledOnce)

  page._emit('onShareAppMessage')
  t.true(options.onShareAppMessage.calledOnce)

  page._emit('onPageScroll')
  t.true(options.onPageScroll.calledOnce)

  page._emit('onTabItemTap')
  t.true(options.onTabItemTap.calledOnce)
})

test('`before` hooks should called before `on` hooks', (t) => {
  const options = {
    beforeLoad: sinon.spy(),
    onLoad: sinon.spy(),
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)

  t.true(options.beforeLoad.notCalled)
  t.true(options.onLoad.notCalled)

  page._emit('onLoad')
  t.true(options.beforeLoad.calledOnce)
  t.true(options.onLoad.calledOnce)
  t.true(options.beforeLoad.calledBefore(options.onLoad))
})

test('`data` could be accessed in context of Page instance', (t) => {
  const spy = sinon.spy()
  const options = {
    data: {
      foo: 'bar',
    },
    onLoad () {
      spy(this.data)
    },
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)
  page._emit('onLoad')

  t.true(spy.calledWithExactly(options.data))
})

test('`route` could be accessed in context of Page instance', (t) => {
  const ROUTE = '/somewhere'
  const spy = sinon.spy()
  const options = {
    onLoad () {
      spy(this.route)
    },
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)
  page.route = ROUTE
  page._emit('onLoad')

  t.true(spy.calledWithExactly(ROUTE))
})

test('`data` should be defined with `Page.define({ data })`', (t) => {
  const options = {
    data: {
      foo: 'bar',
    },
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)

  t.deepEqual(page.data, options.data)
})

test('`data` should be merge with `Page.define({ compute })`', (t) => {
  const options = {
    data: {
      foo: 'bar',
    },
    compute (state) {
      return {
        foobar: state.foo + 'baz',
      }
    },
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)
  page._emit('onLoad')

  t.deepEqual(page.data, {
    foo: 'bar',
    foobar: 'barbaz',
  })
})

test('`methods` could be called in context of Page instance', (t) => {
  const options = {
    onLoad () {
      this.foo()
    },
    methods: {
      foo: sinon.stub().callsFake(function () {
        this.bar()
      }),
      bar: sinon.spy(),
    },
  }
  Tina.Page.define(options)

  const page = t.context.mina.getPage(-1)

  t.true(options.methods.foo.notCalled)
  t.true(options.methods.bar.notCalled)

  page._emit('onLoad')

  t.true(options.methods.foo.calledOnce)
  t.true(options.methods.bar.calledOnce)
})
