class UserController {
    constructor(formId, tableId) {
        this.form1 = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
    }

    onSubmit() {

        this.form1.addEventListener("submit", submit => {
            submit.preventDefault();

            this.addLine(this.getValues());

        });

    }

    getValues() {
        let user = {};
        
        //Spread
        [...this.form1.elements].forEach(item => {
            if (item.name == "gender") {

                if (item.checked) {
                    user[item.name] = item.value;
                }

            } else {

                user[item.name] = item.value;

            }

        });

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

    addLine(dataUser) {
        this.tableEl.innerHTML = `
        <tr>
            <td><img src="dist/img/user1-128x128.jpg" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin}</td>
            <td>${dataUser.birth}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>`;
    }
}