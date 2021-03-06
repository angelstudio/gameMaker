// @flow
import styles from './style.css'
import { logger, camelToWords } from '../../common/util'
import Switch from '@/ui/switch'
import SelectField from '@/ui/select-field'
import MenuItem from '@/ui/menu-item'
import TextField from '@/ui/text-field'
import NumberInput from '@/components/number-input'
import FilePicker from '@/components/file-picker'

export const STRING_TYPE = 'STRING'
export const NUMBER_TYPE = 'NUMBER'
export const BOOLEAN_TYPE = 'BOOLEAN'
export const ENUM_TYPE = 'ENUM'
export const FILE_TYPE = 'FILE'
export const GAMEOBJECT_TYPE = 'GAMEOBJECT'
export const GROUP_TYPE = 'GROUP'

export type Field = {
    type: string,
    get: () => any,
    set: any => void,
    options: any
}

export default {
    name: 'script-field',
    props: {
        field: {
            type: Object,
            required: true
        }
    },
    methods: {
        setFieldValue(field, value) {
            field.set(value)
            const data = { fieldName: field.name, value, type: field.type }
            if (field.parent) data.groupName = field.parent
            this.$emit('input', data)
        },
        createScriptElement(h, component, props, field, children = []): any {
            const data = {
                props,
                on: {
                    input: value => {
                        this.setFieldValue(field, value)
                    }
                }
            }
            return h(component, data, children)
        },
        renderNumberInput(h: any, field): any {
            const { options } = field
            return this.createScriptElement(h, NumberInput, options, field)
        },
        renderTextField(h: any, field): any {
            const { options } = field
            options.hintText = options.hintText || 'Please input a string'
            return this.createScriptElement(h, TextField, options, field)
        },
        renderSwitch(h: any, field): any {
            const { options } = field
            return this.createScriptElement(h, Switch, { ...options, labelLeft: true, labelClass: styles.label }, field)
        },
        renderPicker(h: any, field): any {
            const { options } = field
            return this.createScriptElement(h, SelectField, options, field,
                options.options.map(option => <MenuItem title={option} value={option}/>))
        },
        renderInputGroup(h: any, field): any {
            const { options, children } = field

            return <div class={styles.inputGroup}>
                <div class={styles.groupLabel}>{options.label}</div>
                <div class={styles.container}>
                    {Object.keys(children).map(name => this.parseOption(h, { name, parent: field.name, ...children[name] }))}
                </div>
            </div>
        },
        renderFilePicker(h: any, field): any {
            const { options } = field
            return <div class={styles.filePicker}>
                <div class={styles.label}>{options.label}</div>
                <FilePicker type='file' initTitle={options.value || ''}
                            onInput={file => this.setFieldValue(field, file.path)}/>
            </div>
        },
        renderGameObjectPicker(h: any, field): any {
            const { options } = field
            return <div class={styles.filePicker}>
                <div class={styles.label}>{options.label}</div>
                <FilePicker initTitle={options.value && options.value.name || ''} type='gameObject' onInput={obj => {
                    field.set(obj)
                    this.$emit('input', { fieldName: field.name, value: obj.id })
                }}/>
            </div>
        },
        parseOption(h: any, field = this.field): any {
            if (!field) return
            this.getFieldValue(field)
            switch (field.type) {
                case NUMBER_TYPE:
                    return this.renderNumberInput(h, field)
                case STRING_TYPE:
                    return this.renderTextField(h, field)
                case BOOLEAN_TYPE:
                    return this.renderSwitch(h, field)
                case ENUM_TYPE:
                    return this.renderPicker(h, field)
                case FILE_TYPE:
                    return this.renderFilePicker(h, field)
                case GAMEOBJECT_TYPE:
                    return this.renderGameObjectPicker(h, field)
                case GROUP_TYPE:
                    return this.renderInputGroup(h, field)
                default:
                    logger.error('Error! Not a valid option type!')
                    return
            }
        },
        getFieldValue(field) {
            field.options = field.options || {}
            if (field.type !== GROUP_TYPE) field.options.value = field.get()
            field.options.label = camelToWords(field.name)
        }
    },
    render(h: any): any {
        return <div class={styles.scriptField}>{this.parseOption(h)}</div>
    }
}
