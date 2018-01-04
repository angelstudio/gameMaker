// @flow
import Script from '../script-card'
import styles from './style.css'
import FileDropper from '@/ui/file-dropper'
import Icon from '@/ui/icon'
import fileDialog from 'file-dialog'
import { readScriptFromFile } from '../../common/util'

export default {
    name: 'script-window',
    props: {
        gameObject: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isDragOver: false,
            scripts: []
        }
    },
    watch: {
        gameObject: {
            handler(val, oldVal) {
                this.scripts = val.scripts
                console.log(oldVal, val)
            },
            immediate: true
        }
    },
    methods: {
        addScript(file) {
            readScriptFromFile(file).then(script => this.scripts.push(script))
            // TODO change back to gameObject
        },
        dropHandler(file) {
            this.addScript(file)
            this.isDragOver = false
        },
        dragOverHandler() {
            this.isDragOver = true
        },
        dragLeaveHandler() {
            this.isDragOver = false
        },
        pickFile() {
            fileDialog({ multiple: true, accept: '.js' })
                .then(fileList => {
                    for (const file of fileList)
                        this.addScript(file)
                })
        }
    },
    render() {
        const {
            gameObject,
            scripts,
            dropHandler,
            dragOverHandler,
            dragLeaveHandler,
            isDragOver,
            pickFile
        } = this

        console.log(gameObject)

        return <div class={styles.scriptWindow}>
            {scripts && scripts.map(script => <Script script={script} gameObject={gameObject}/>)}
            <FileDropper onFileDrop={dropHandler}
                         onFileDragOver={dragOverHandler}
                         onFileDragLeave={dragLeaveHandler}>
                <div class={{[styles.dropZone]: true, [styles.dragOver]: isDragOver}} onClick={pickFile}>
                    <Icon className={styles.addIcon} icon={'add'} size={48}/>
                </div>
            </FileDropper>
        </div>
    }
}
