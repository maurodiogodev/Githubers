import { GithubUser } from './GithubUser.js'

// Lógica e estrutura dos dados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)

        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)

            if (userExists) {
                throw new Error('Usuário já cadastrado!')
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch (error) {
            alert(error.message)
        }

    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry =>
            entry.login !== user.login)

        this.entries = filteredEntries

        this.update()
        this.save()
    }
}

// Apresentação visual e eventos
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')
        this.tfoot = this.root.querySelector('table tfoot')

        this.update()
        this.onadd()
    }

    onadd() {
        const addbutton = this.root.querySelector('.search button')

        addbutton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        if (this.entries.length == 0) {
            this.tfoot.querySelector('tfoot td').classList.remove('empty')
            this.tfoot.querySelector('.empty').classList.remove('false')
            this.tfoot.querySelector('.empty').classList.add('true')
        } else {
            this.tfoot.querySelector('tfoot td').classList.add('empty')
            this.tfoot.querySelector('.empty').classList.remove('true')
            this.tfoot.querySelector('.empty').classList.add('false')
        }

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector(".user img").src = `https://github.com/${user.login}.png`
            row.querySelector(".user img").alt = `Imagem de ${user.name}`
            row.querySelector(".user a").href = `https://github.com/${user.login}`
            row.querySelector(".user p").textContent = user.name
            row.querySelector(".user span").textContent = user.login
            row.querySelector(".repositories").textContent = user.public_repos
            row.querySelector(".followers").textContent = user.followers

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Tem certeza que quer deletar essa linha?")

                if (isOk) {
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })

    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/diego3g.png" alt="Foto de Laurete">
                <a href="https://github.com/diego3g" target="_blank">
                    <p>Diego Fernandes</p>
                    <span>diego3g</span>
                </a>
            </td>
            <td class="repositories">
                42
            </td>
            <td class="followers">
                4232
            </td>
            <td><button class="remove"> Remover <span style="display:none">&times;</span></button></td>
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        });
    }
}