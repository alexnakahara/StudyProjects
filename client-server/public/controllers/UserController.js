class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();
        });


        this.formUpdateEl.addEventListener("submit", ev => {
            ev.preventDefault(); //cancela o comportamento padrão do form, não vai atualizar a pagina
            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo) {

                        result._photo = userOld._photo;

                    } else {

                        result._photo = content;
                    }

                    let user = new User();
                    user.loadFromJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);

                        this.updateCount();

                        btn.disabled = false;

                        this.formUpdateEl.reset();

                        this.showPanelCreate();
                    });

                },
                (e) => {
                    console.error(e);

                });
        });
    }

    onSubmit() {

        this.formEl.addEventListener("submit", submit => {
            submit.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) { return false; }

            this.getPhoto(this.formEl).then(
                (content) => {

                    values.photo = content;

                    values.save().then(user => {

                        this.addLine(user);

                        this.formEl.reset();

                        btn.disabled = false;
                    });

                },
                (e) => {
                    console.error(e);

                });

        });

    }

    getPhoto(form) {

        return new Promise((resolve, reject) => {


            let fileReader = new FileReader();

            let elements = [...form.elements].filter(item => {

                if (item.name === 'photo') {
                    return item;
                }

            });
            // console.log(elements[0].files[0]);
            let file = elements[0].files[0]

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e) => {
                reject(e);
            }

            if (file) {

                fileReader.readAsDataURL(file);

            } else {
                resolve('dist/img/boxed-bg.jpg');
            }
        });

    }

    getValues(form) {
        let user = {};
        let isValid = true;
        //Spread
        [...form.elements].forEach(item => {
            if (["name", "email", "password"].indexOf(item.name) > -1 && !item.value) {

                item.parentElement.classList.add("has-error");
                isValid = false;

            }
            if (item.name == "gender") {

                if (item.checked) {
                    user[item.name] = item.value;
                }

            } else if (item.name == 'admin') {

                user[item.name] = item.checked;

            } else {

                user[item.name] = item.value;

            }

        });

        if (!isValid) { return false; }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }

    selectAll() {

        User.getUsers().then(data => {

            data.users.forEach(dataUser => {

                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user);

            });
        });


    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataUser, tr = null) {

        if (tr === null) tr = document.createElement("tr");

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
        <td><img src="${dataUser.photo ? dataUser.photo : null}  " alt="User Image" class="img-circle img-sm"></td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
        <td>${Utils.dateFormat(dataUser.register)}</td>
        <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
        </td>`;

        this.addEventsTr(tr);

        return tr;
    }

    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove().then(data => {

                    tr.remove();
                    this.updateCount();
                    
                });

            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            for (let name in json) {

                let campo = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (campo) {
                    switch (campo.type) {

                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            campo = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            campo.checked = true;
                            break;

                        case 'checkbox':
                            campo.checked = json[name];
                            break;

                        default:
                            campo.value = json[name];

                    }
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo
            this.showPanelUpdate();

        });
    }

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    showPanelCreate() {
        document.querySelector("#box-user-update").style.display = "none";
        document.querySelector("#box-user-create").style.display = "block";
    }

    updateCount() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) { numberAdmin++; }

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }
}