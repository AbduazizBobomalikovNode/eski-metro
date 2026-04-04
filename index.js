const express = require('express');
const cookieParser = require("cookie-parser");
var auth = require("./middlewire/auth");
var document = require("./middlewire/document");
const app = express();
const port = 3000; // yoki istalgan boshqa port

const taskRouter = require("./routers/task");
const roleRouter = require("./routers/role");
const userRouter = require("./routers/user");
const RHTRouter = require("./routers/role_has_task");
const certificateRouter = require("./routers/certificate");
const fileRouter = require("./routers/file");
const authRouter = require("./routers/auth");
var db = require('./db/mongodb');

setInterval(async () => { db = await db }, 100);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/task', taskRouter)
app.use('/role', roleRouter)
app.use('/user', userRouter)
app.use('/RHT', RHTRouter)
app.use('/certifcate', certificateRouter)
app.use('/file', fileRouter)
app.use('/signout', async (req, res, next) => {
  return res
    .cookie("x-web-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .send(`<script>setTimeout(()=>{window.location.href = '/login';},10);</script>`);
})
app.use('/login', authRouter);
// Pug templateni sozlash
app.set('view engine', 'pug');
app.set('views', './views'); // Pug fayllarini joylash

// Static fayllarni servis qilish (masalan: css, js)
app.use(express.static('views/public'));
app.use('/documents', document,async (req, res, next)=>{(await db).static.add(4);return next();},express.static('views/certifcate'));

app.get('/', auth,async (req, res) => {
  // Token tekshiruvi
  const x_token = req.cookies['x-web-token'];
  if (x_token) {
    console.log('x-token (birinchi 5 ta belgi):', x_token.substring(0, 5));
  } else {
    console.log('x-token topilmadi!');
  }
  
  let bolimlar = {
    role: false,
    user: false,
    certifcate: false,
    task: false
  };
  if (req.user.rolePath.includes("/certifcate")) {
    bolimlar.certifcate = true;
  }
  if (req.user.rolePath.includes("/role")) {
    bolimlar.role = true;
  }
  if (req.user.rolePath.includes("/task")) {
    bolimlar.task = true;
  }
  if (req.user.rolePath.includes("/user")) {
    bolimlar.user = true;
  }
  // console.log(bolimlar,!bolimlar.task && !bolimlar.role && !bolimlar.user);
  const actions = await (await db).action.getActionAll();
  const static = await (await db).static.getStatic();
  res.render('public/index',{
    static:static,
    ...bolimlar,
    user:req.user,
    actions:actions
  }); // 'login.pug' faylini ishlatish
});
// Login sahifasi uchun GET tarmoq so'rovini qo'llash
app.get('/login', (req, res) => {
  res.render('public/pages/login'); // 'login.pug' faylini ishlatish
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server http://localhost:${port} portda ishlayapti...`);
});
