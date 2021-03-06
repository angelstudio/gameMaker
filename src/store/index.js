import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import asset from './asset'
import scene from './scene'

export default new Vuex.Store({
    modules: { asset, scene }
})
