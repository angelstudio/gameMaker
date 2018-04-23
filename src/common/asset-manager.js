// @flow

export default class AssetManager {
    static readFile = file => fetch(file).then(response => Promise.resolve(response.text()))

    static readFileSync = async file => await this.readFile(file)

    static readLocalFileByPath = file => new Promise(resolve => {
        const rawFile = new XMLHttpRequest()
        rawFile.open('GET', file, false)
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status === 0) {
                    resolve(rawFile.responseText)
                }
            }
        }
        rawFile.send(null)
    })

    static readLocalFile = file => new Promise(resolve => {
        const reader = new FileReader()

        // Closure to capture the file information.
        reader.onload = e => resolve(e.target.result)

        // Read in the image file as a data URL.
        reader.readAsText(file)
    })

    static writeFile = (filename, data) => {
        const file = new Blob([data])
        const a = document.createElement('a')
        const url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0)
    }

    static pickFile = (filters = '', { multiple, directory }) => new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = filters
        input.multiple = multiple
        input.directory = directory
        input.addEventListener('change', () => resolve(input.files))
        input.click()
    })
}

