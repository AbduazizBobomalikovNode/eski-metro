const jwt = require('jsonwebtoken');
const jwt_my_key = process.env.JWT_MY_KEY || "bu_dunyo_sinov_dunyo";

// let x = {
//     'user': ['get/user','get/device','get/role','get/all', 'add', 'uptade', 'delete'],
//     'role': ['get/role', 'get/all', 'add', 'uptade', 'delete'],
//     'task': ['get/task', 'get/user', 'get/device', 'get/all', 'add', 'uptade', 'delete'],
//     'device': ['get/device','get/all', 'add', 'uptade', 'delete'],
//     'history': ['get/history','get/device', 'get/all', 'add', 'uptade', 'delete']
// }
// let user = {
//     'task': ['get/task', 'get/user', 'get/device', 'get/all', 'add', 'uptade', 'delete']
// }



module.exports = async function (req, res, next) {
    const x_token = req.cookies['x-web-token'];
    if (!x_token) {
        console.log('cookies  ishlamadi');
        return res.send(`<script>setTimeout(()=>{window.location.href = '/login';},10);</script>`);
    }
    // console.log('cookies  ishladi:', x_token);
    let path_req = req.originalUrl.slice(0,req.originalUrl.lastIndexOf("/"));
    
    console.log(path_req);
    // return next();

    const token = req.cookies['x-web-token'];
    try {
        const expiredAt = jwt.decode(token).exp;
        const now = Math.floor(Date.now() / 1000);
        if (expiredAt < now) {
            console.log('Token yaroqsiz');
            return res.cookie("x-web-token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0
              })
              .status(200)
              .send(`<script>setTimeout(()=>{window.location.href = '/login';},10);</script>`);
        }
        const user = jwt.verify(token, jwt_my_key);
        if (!user.rolePath.includes(path_req)) {
            console.log("no",user.rolePath,path_req);
            return res.cookie("x-web-token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0
              })
              .status(200)
              .send(`<script>setTimeout(()=>{window.location.href = '/login';},10);</script>`);
        }
        req.user = user;
        return next();
    } catch (err) {
        console.log(err);
        return res.send(`<script>setTimeout(()=>{window.location.href = '/login';},1);</script>`);
    }
}

// const { message } = err;
// if (message == "jwt must be provided") {
//     return res.status(400).json({ error: "web token jonatilmagan!" })
// } else {
//     console.log(err);
//     return res.status(401).json({ error: "ushbu foydalanuvchi autorizatsiya qilmagan!" })
// }