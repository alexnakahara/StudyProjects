class User {

   constructor(name, gender, birth, country, email, password, photo, admin) {
      this._id;
      this._name = name;
      this._gender = gender;
      this._birth = birth;
      this._country = country;
      this._email = email;
      this._password = password;
      this._photo = photo;
      this._admin = admin
      this._register = new Date();
   }

   //MODIFICADORES DE ACESSO

   get id() {
      return this._id;
   }

   get register() {
      return this._register;
   }
   get name() {
      return this._name;
   }
   get gender() {
      return this._gender;
   }
   get birth() {
      return this._birth;
   }
   get country() {
      return this._country;
   }
   get email() {
      return this._email;
   }
   get password() {
      return this._password;
   }
   get photo() {
      return this._photo;
   }
   get admin() {
      return this._admin;
   }

   set photo(value) {
      this._photo = value;
   }

   loadFromJSON(dataJson) {
      for (let name in dataJson) {

         switch (name) {
            case '_register':
               this[name] = new Date(dataJson[name]);
               break;

            default:
               if (name.substring(0, 1) === '_')
                  this[name] = dataJson[name];
         }
      }
   }

   static getUsersStorage() {

      let users = [];

      if (localStorage.getItem("users")) {

         users = JSON.parse(localStorage.getItem("users"));
      }

      return users;
   }

   getNewId() {

      let usersID = parseInt(localStorage.getItem("usersID"));

      if (!usersID > 0) {

         usersID = 0;

      }

      usersID++;

      localStorage.setItem("usersID", usersID);

      return usersID;
   }

   toJson() {
      let json = {};
      Object.keys(this).forEach(key => {

         if (this[key] != undefined)
            json[key] = this[key]

      });
      return json;
   }

   save() {
      return new Promise((resolve, reject) => {

         let promise;

         if (this.id) {
            promise = HttpRequest.put('/users/' + this.id, this.toJson());
         } else {
            promise = HttpRequest.post('/users/', this.toJson());

         }

         promise.then(data => {
            this.loadFromJSON(data);
            resolve(this);
         }).catch(e => {
            reject(e);
         });

      });
   }

   remove() {

      let users = User.getUsersStorage();

      users.forEach((data, index) => {

         if (this._id == data._id) {

            users.splice(index, 1);

         }

      });

      localStorage.setItem("users", JSON.stringify(users));

   }
}