class CrudModel {

    entry = {}
    items = []
    nextItemId = 1
    firstFieldRef = null
    context = null
    pagination = { rowsPerPage: 20 }

    constructor(options) {
        Object.assign(this, options)
    }

    addItem() {
        if (this.isNewItem()) {
            const item = Object.assign({}, this.entry)
            item.id = this.nextItemId++;
            this.items.push(item)
        } else {
            const item = this.items.find(it => it.id == this.entry.id)

            Object.assign(item, this.entry)
        }
        this.newItem()
    }

    newItem() {
        this.entry = {}
        this.setFocusFirstField()
    }

    isNewItem() {
        return this.entry.id == null
    }

    editItem(row) {
        this.entry = Object.assign({}, row);
        this.setFocusFirstField()
    }

    removeItem(row) {
        const index = this.items.indexOf(row)
        this.items.splice(index, 1)
    }

    setFocusFirstField() {
        const elementRef = this.firstFieldRef
        if (elementRef) {
            this.context.$nextTick(() => {
                this.context.$refs[elementRef].$el.focus()
            })
        }
    }        

    clear() {
        this.items = []
        this.entry = {}
        this.nextItemId = 1
    }

}

if (window.location.host == 'divide-conta-front.herokuapp.com') {
    axios.defaults.baseURL = 'https://divide-conta-api.herokuapp.com'
} else {
    axios.defaults.baseURL = 'http://localhost:8080'
}

const app = Vue.createApp({
	data() {
        return {
            itensModel: new CrudModel({ context: this, firstFieldRef: 'txtDescricaoItem' }),
            descontosModel: new CrudModel({ context: this, firstFieldRef: 'txtDescricaoDesconto' }),
            acrescimosModel: new CrudModel({ context: this, firstFieldRef: 'txtDescricaoAcrescimo' }),
            divisaoDTO: null,
            divisoesPagination: { rowsPerPage: 50 }
        }
    },
    methods: {
        calcular() {
            const contaDTO = {
                itens: this.itensModel.items,
                descontos: this.descontosModel.items,
                acrescimos: this.acrescimosModel.items
            }
            axios.post('/contas/dividir', contaDTO).then(response => {
                this.divisaoDTO = response.data
            })
        },
        limpar() {
            this.divisaoDTO = null
            this.itensModel.clear()
            this.descontosModel.clear()
            this.acrescimosModel.clear()
        },
        pagar(divisaoDetalheDTO) {
            alert('Não implementado')
        }
    }
})

app.use(Quasar)
var appInstance = app.mount('#q-app')