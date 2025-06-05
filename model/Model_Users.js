const connection = require('../config/Database');

class Model_Users {
    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('select * from users order by id_users desc', (err, rows) => {
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
            connection.query('insert into users set ?', Data, function(err, result){
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
            connection.query('select * from users where email_users = ?', [email], function(err, result){
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
            connection.query('select * from users where id_users = ' + id, (err,rows) => {
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
            connection.query('update users set ? where id_users =' + id, Data, function(err, result){
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
            connection.query('delete from users where id_users =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

        static async findByPhone(no_telp_users) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE no_telp_users = ?";
            connection.query(sql, [no_telp_users], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async saveResetToken(id_users, token) {
        return new Promise((resolve, reject) => {
            const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 jam dari sekarang
            const sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id_users = ?";
            connection.query(sql, [token, expiry, id_users], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async findByToken(token) {
        return new Promise((resolve, reject) => {
            const now = new Date();
            const sql = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?";
            connection.query(sql, [token, now], (err, result) => {
                if (err) reject(err);
                else resolve(result[0]); // karena token seharusnya unik
            });
        });
    }

    static async updatePassword(id_users, hashedPassword) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE users SET password_users = ? WHERE id_users = ?";
            connection.query(sql, [hashedPassword, id_users], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async clearResetToken(id_users) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id_users = ?";
            connection.query(sql, [id_users], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
    
}

module.exports = Model_Users;