const connection = require('../config/Database');

class Model_Pendaftaran {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT pendaftaran.*, users.nama_users FROM pendaftaran INNER JOIN users ON pendaftaran.id_users = users.id_users ORDER BY pendaftaran.waktu_pendaftaran ASC', 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
    

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into pendaftaran set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM pendaftaran WHERE id_pendaftaran = ?', 
                [parseInt(id)], 
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
    
    
    
      
    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update pendaftaran set ? where id_pendaftaran =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async UpdateStatus(id, status_pendaftaran) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE pendaftaran SET status_pendaftaran = ? WHERE id_pendaftaran = ?', 
                [status_pendaftaran, id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }
    
    static async getByUserId(id_users) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM pendaftaran WHERE id_users = ? ORDER BY waktu_pendaftaran DESC', 
                [id_users], 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
    
    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from pendaftaran where id_pendaftaran =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Pendaftaran;