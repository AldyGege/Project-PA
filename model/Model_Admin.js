const connection = require('../config/Database');

class Model_Admin {
    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('select * from admin order by id_admin desc', (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            });
        });
    }

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into admin set ?', Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async Login(email) {
        return new Promise((resolve, reject) => {
            connection.query('select * from admin where email_admin = ?', [email], function(err, result){
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    static async getId(id){
        return new Promise((resolve, reject) => {
            connection.query('select * from admin where id_admin = ' + id, (err,rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows);
                }
            })
        })
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update admin set ? where id_admin =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                    console.log(result);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from admin where id_admin =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }


}

module.exports = Model_Admin;