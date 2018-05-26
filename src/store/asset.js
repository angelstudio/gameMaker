// @flow
import { stateToGetters, trimFilename, getScriptObject } from '../common/util'
import AssetManager from '@/common/asset-manager'
import Script from '../classes/script'

const CLEAR_ASSETS = 'CLEAR_ASSETS'
const SET_ASSETS = 'SET_ASSETS'
const CREATE_ANIMATION = 'CREATE_ANIMATION'
const EDIT_ASSET_NAME = 'EDIT_ASSET_NAME'
const REMOVE_ASSET = 'REMOVE_ASSET'

export const getDefaultAssets = () => ({
    models: [],
    textures: [],
    scripts: [],
    prefabs: [],
    templates: [],
    animations: [],
    others: []
})

type State = {}

const state: State = {
    assets: getDefaultAssets()
}

export default {
    state,
    getters: stateToGetters(state),
    mutations: {
        [CLEAR_ASSETS](state) {
            state.assets = getDefaultAssets()
        },
        [SET_ASSETS](state, assets) {
            state.assets = assets
        },
        [CREATE_ANIMATION](state, name) {
            state.assets.animations.push(name)
        },
        [EDIT_ASSET_NAME](state, { oldName, name }) {
            Object.keys(state.assets).forEach(category => {
                const fileNames = state.assets[category]
                const index = fileNames.findIndex(fileName => fileName === oldName)
                if (index !== -1) fileNames[index] = name
            })
        },
        [REMOVE_ASSET](state, name) {
            Object.keys(state.assets).forEach(category => {
                const fileNames = state.assets[category]
                const index = fileNames.findIndex(fileName => fileName === name)
                if (index !== -1) fileNames.splice(index, 1)
            })
        }
    },
    actions: {
        clearAssets: ({ commit }) => commit(CLEAR_ASSETS),
        setAssets: ({ commit }, data) => commit(SET_ASSETS, data),
        createAnimation: ({ dispatch, commit }) => {
            const file = { name: 'newAnimation.anim', data: '' }
            commit(CREATE_ANIMATION, file.name)
            return dispatch('createFile', file)
        },
        editAssetName: ({ dispatch, commit }, data) => {
            commit(EDIT_ASSET_NAME, data)
            dispatch('editFileName', data)
        },
        removeAsset: ({ dispatch, commit, rootState: { scene: { game } } }, name) => {
            commit(REMOVE_ASSET, name)
            delete game.filesMap[name]
            dispatch('setCurrentFile', null)
        },
        uploadAssets: ({ state, rootState: { scene: { game } }, commit }, files) => {
            const isSingle = !files[0]
            const toReturn = Promise.all((isSingle ? [files] : [...files])
                .map(file => {
                    const extension = file.name.match(/\.([0-9a-z]+)$/i)[1].toLowerCase()
                    // set read mode
                    let mode = 'DataURL'
                    if (extension === 'js' || extension === 'obj' || extension === 'gltf' || extension === 'babylon') mode = 'Text'
                    else if (extension === 'stl') mode = 'ArrayBuffer'

                    return AssetManager.readLocalFile(file, mode) // load scripts as plain text and others as data url
                        .then(data => {
                            const fileData = { name: trimFilename(file.name), data }
                            const uploadFile = type => {
                                const assets = state.assets[type]
                                if (!assets.find(filename => filename === fileData.name))
                                    assets.push(fileData.name)
                                game.setFileValue(fileData.name, fileData.data)
                            }

                            switch (extension) {
                                case 'png':
                                case 'gif':
                                case 'jpg':
                                    uploadFile('textures')
                                    break
                                case 'js':
                                    uploadFile('scripts')
                                    break
                                case 'stl':
                                case 'obj':
                                case 'gltf':
                                case 'babylon':
                                    uploadFile('models')
                                    break
                                default:
                                    uploadFile('others')
                                    break
                            }
                            return fileData
                        })
                }))
            return isSingle
                ? toReturn.then(data => data[0])
                : toReturn
        },
        editFile({ rootState: { scene: { gameObjects, game } } }, { file, value }) {
            game.setFileValue(file, value)
            gameObjects && gameObjects.forEach(gameObject => gameObject.forEach(obj => {
                if (obj.scripts[file])
                    obj.addScript(new Script(getScriptObject(file, value, obj), obj))
            }))
        }
    }
}
