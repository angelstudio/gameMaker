import styles from './style.css'
import DesktopManager from '@/components/desktop-manager'
import ScriptWindow from '@/components/script-window'
import SceneWindow from '@/components/scene-window'
import ExplorerWindow from '@/components/explorer-window'
import CanvasWindow from '@/components/canvas-window'
import CodeEditor from '@/components/code-editor'
import AnimationEditor from '@/components/animation-editor'
import COLORS from '@/common/colors.css'

import { mapGetters } from 'vuex'

import * as API from './common/api'
import UndoableAction from './classes/undoableAction'

window.gm = API

export default {
    name: 'app',
    computed: {
        ...mapGetters(['game', 'gameObject']),
        windowLabels() {
            return [
                { icon: 'dashboard', title: 'Inspector', color: COLORS['Grey-50'], content: <ScriptWindow/> },
                { icon: 'subject', title: 'Scene', color: COLORS['Grey-100'], content: <SceneWindow ref='sceneWindow'/> },
                { icon: 'folder', title: 'Explorer', color: COLORS['Grey-200'], content: <ExplorerWindow/> },
                { icon: 'code', title: 'Code Editor', color: COLORS['Grey-300'], content: <CodeEditor/> },
                { icon: 'play_circle_filled', title: 'Animation Editor', color: COLORS['Grey-400'], content: <AnimationEditor/> }
            ]
        },
        defaultWindow() {
            return { color: '#fff', size: 4, content: <CanvasWindow/> }
        }
    },
    created() {
        window.$vm0 = this  // for debug
        document.onkeydown = e => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                // ctrl + d
                this.$store.dispatch('duplicateGameObject')
                    .then(() => this.$refs.sceneWindow.$refs.treeView.setTreeData())
            } else if (e.code === 'KeyF') {
                const { game, gameObject } = this
                game.setCameraTarget(gameObject)
            } else if (e.ctrlKey && e.shiftKey && e.code === 'KeyZ') {
                // ctrl + shift + z
                UndoableAction.redoAction()
            } else if (e.ctrlKey && e.code === 'KeyZ') {
                // ctrl + z
                UndoableAction.undoAction()
            }
        }
    },
    render() {
        const { windowLabels, defaultWindow } = this

        return <div id="app" class={styles.app}>
            <DesktopManager ref="desktopManager" windowLabels={windowLabels} defaultWindow={defaultWindow}/>
        </div>
    }
}
