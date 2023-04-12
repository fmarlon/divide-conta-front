class CrudModel {

    entry = {}
    items = []
    nextItemId = 1
    firstFieldRef = null
    context = null
    pagination = { rowsPerPage: 20 }
    fieldSuffix = ''

    constructor(options) {
        Object.assign(this, options)
    }

    addItem() {
        if (this.entry.valor == null || this.entry.valor == 0) {
            this.setFocus('txtValor' + this.fieldSuffix)
            return
        }
        if (this.isNewItem()) {
            const item = Object.assign({}, this.entry)
            item.id = this.nextItemId++;
            this.items.push(item)
        } else {
            const item = this.items.find(it => it.id == this.entry.id)

            Object.assign(item, this.entry)
        }
        this.newItem()
        this.context.calcular()
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
        this.context.calcular()
    }

    setFocusFirstField() {
        this.setFocus('txtDescricao' + this.fieldSuffix)
    }        

    setFocus(elementRef) {
        this.context.$nextTick(() => {
            this.context.$refs[elementRef].$el.focus()
        })
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
            itensModel: new CrudModel({ context: this, fieldSuffix: 'Item' }),
            descontosModel: new CrudModel({ context: this, fieldSuffix: 'Desconto' }),
            acrescimosModel: new CrudModel({ context: this, fieldSuffix: 'Acrescimo' }),
            divisaoDTO: null,
            divisoesPagination: { rowsPerPage: 50 },
            divisaoDetalhe: {},
            tipoValorOptions: [ 'R$', '%' ]
        }
    },
    methods: {
        calcular() {
            const contaDTO = {
                itens: this.itensModel.items,
                descontos: this.descontosModel.items,
                acrescimos: this.acrescimosModel.items
            }

            if (contaDTO.itens.length == 0) {
                this.divisaoDTO = null
                return
            }
            
            axios.post('/contas/dividir', contaDTO).then(response => {
                this.divisaoDTO = response.data
            }).catch(error => {
                this.handleApiError(error)
            })
        },
        limpar() {
            this.divisaoDTO = null
            this.itensModel.clear()
            this.descontosModel.clear()
            this.acrescimosModel.clear()
            this.itensModel.setFocusFirstField()
        },
        pagar(divisaoDetalheDTO) {
            this.divisaoDetalhe = divisaoDetalheDTO
            this.$refs.dialog.show()

            if (divisaoDetalheDTO.cobranca == null) {
                const gerarCobrancaDTO = { valor: divisaoDetalheDTO.valorAPagar }

                axios.post('/pagamentos/gerar-cobranca', gerarCobrancaDTO).then(response => {
                    divisaoDetalheDTO.cobranca = response.data
                }).catch(error => {
                    this.handleApiError(error)
                })
            }
        },
        handleApiError(error) {
            const response = error.response
            const message = (response && response.data && response.data.message) || error.message
            this.$q.dialog({
                title: 'Erro',
                message: 'Erro ao chamar serviço: <p class="text-red">' + message + '</p>',
                html: true
            })
        }
    }
})

app.use(Quasar)
var appInstance = app.mount('#q-app')