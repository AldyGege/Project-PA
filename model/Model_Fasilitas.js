const connection = require('../config/Database');

class Model_Fasilitas {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('SELECT fasilitas.*, admin.nama_admin FROM fasilitas INNER JOIN admin ON fasilitas.id_admin = admin.id_admin ORDER BY fasilitas.id_fasilitas DESC', (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into fasilitas set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id){
        return new Promise((resolve, reject) => {
            connection.query('select * from fasilitas where id_fasilitas = ' + id, (err,rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }
    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update fasilitas set ? where id_fasilitas =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from fasilitas where id_fasilitas =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Fasilitas;