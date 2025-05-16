const connection = require('../config/database');

class Model_Berita {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('select * from berita order by id_berita desc', (err, rows) => {
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
            connection.query('insert into berita set ?', Data, function(err, result){
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
            connection.query('select * from berita where id_berita = ' + id, (err,rows) => {
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
            connection.query('update berita set ? where id_berita =' + id, Data, function(err, result){
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
            connection.query('delete from berita where id_berita =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getLimited(limit, excludeId) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM berita WHERE id_berita != ? ORDER BY tanggal_upload DESC LIMIT ?";
            connection.query(query, [excludeId, limit], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
    
    
}





module.exports = Model_Berita;