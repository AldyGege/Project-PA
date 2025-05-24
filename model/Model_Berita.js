const connection = require('../config/Database');

class Model_Berita {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('SELECT berita.*, admin.nama_admin FROM berita INNER JOIN admin ON berita.id_admin = admin.id_admin ORDER BY berita.id_berita DESC', (err, rows) => {
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
            connection.query('SELECT berita.*, admin.nama_admin FROM berita INNER JOIN admin ON berita.id_admin = admin.id_admin WHERE id_berita = ?',
            [id], (err,rows) => {
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
        const sanitizedLimit = parseInt(limit);
        const query = `
            SELECT berita.*, admin.nama_admin 
            FROM berita 
            INNER JOIN admin ON berita.id_admin = admin.id_admin 
            WHERE berita.id_berita != ? 
            ORDER BY tanggal_upload DESC 
            LIMIT ?
        `;
        connection.query(query, [excludeId, sanitizedLimit], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


    
}





module.exports = Model_Berita;