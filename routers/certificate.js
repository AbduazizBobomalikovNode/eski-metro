var crypto = require('crypto');
const express = require("express");
const router = express.Router();

var db = require('../db/mongodb');
var generateId = require('../resurs/functions/getid');
const validate = require("../resurs/validate/certificate");
var auth = require("../middlewire/auth");
var toPdf = require("../resurs/functions/pdf")
const formatDoc = require('../resurs/functions/formatDoc');
const action = require("../resurs/functions/action");
const fiil_up = require("../resurs/functions/fill_up");
const { unlinkSync } = require('fs');



setTimeout(async () => { db = await db }, 100);//

router.get("/", auth, async (req, res) => {
  let docs = await (await db).certificate.getCertificateAll();
  let tasks = await (await db).certificate.getCertificateAllFilter(0, 15, {});
  // toPdf();
  // let id = (await (await db).role.getRoleForObj({ name: "Qiyoslovchi" }))[0].id;
  let employee = (await (await db).user.getUserAll()).map((el) => {
    return el.name
  });
  // console.log(id,employee);
  let lang = {
    uz: "o'zbekcha",
    ru: "ruscha"
  };
  let doc_name = {
    1: 'qiyoslash guvohnomasi',
    2: 'yuqori aniqlikdagi qiyoslash guvohnomasi',
    3: 'avtosisterna qiyoslash guvohnomasi',
    4: 'attestatsiyadan o‘tkazish sertifikati',
    5: 'O‘lchash vositasining  yaroqsizlikgi',
    6: 'sinov vositasining yaroqsizligi',
    7: 'pasport',
  };
  let bolimlar = {
    update: false,
    deletes: false,
    deletesAll: false,
    add: false,
    view: false,
    role: false,
    user: false,
    certifcate: false,
    task: false,
    activeDocumentUpdate: false,
    activeDocumentDelete: false,
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
  if (req.user.rolePath.includes("/certifcate/update")) {
    bolimlar.update = true;
  }
  if (req.user.rolePath.includes("/certifcate/delete")) {
    bolimlar.deletes = true;
  }
  if (req.user.rolePath.includes("/certifcate/all/delete")) {
    bolimlar.deletesAll = true;
  }
  if (req.user.rolePath.includes("/certifcate/add")) {
    bolimlar.add = true;
  }
  if (req.user.rolePath.includes("/document")) {
    bolimlar.view = true;
  }
  if (req.user.rolePath.includes("activeDocumentUpdate")) {
    bolimlar.activeDocumentUpdate = true;
  }
  if (req.user.rolePath.includes("activeDocumentDelete")) {
    bolimlar.activeDocumentDelete = true;
  }
  // (await db).certificate.allDocUpdate();
  res.render('public/pages/certificate', {
    path: '',
    docs: tasks,
    count: docs.length,
    filter_count:docs.length,
    page: 1,
    lang: lang,
    doc_name: doc_name,
    employee: employee,
    queryString: '',
    ...bolimlar,
    user: req.user
  });
})


router.get("/page/:page", auth, async (req, res) => {
  let page = parseInt(req.params.page);
  let query = req.query;
  let fcount = null;
  // console.log(page, query);
  if (!page) {
    page = 1;
  }
  let certificate = await (await db).certificate.getCertificateAll();
  let certificates = null;
  if (query.search && query.search.length > 0) {
    certificates = await (await db).certificate.searchDocument(query.search);
    fcount = certificates.length;
  }else{
    fcount = await (await db).certificate.countCertificateFilter(query);
    certificates = await (await db).certificate.getCertificateAllFilter(page * 15 - 15, 15, query);
  }
  // let id = (await (await db).role.getRoleForObj({ name: "Qiyoslovchi" }))[0].id;
  let employee = (await (await db).user.getUserAll()).map((el) => {
    return el.name
  });
  // console.log(id,employee);
  let lang = { uz: "o'zbekcha", ru: "ruscha" };
  let doc_name = {
    1: 'qiyoslash guvohnomasi',
    2: 'yuqori aniqlikdagi qiyoslash guvohnomasi',
    3: 'avtosisterna qiyoslash guvohnomasi',
    4: 'attestatsiyadan o‘tkazish sertifikati',
    5: 'O‘lchash vositasining  yaroqsizlikgi',
    6: 'sinov vositasining yaroqsizligi',
    7: 'pasport',
  }
  let bolimlar = {
    update: false,
    deletes: false,
    deletesAll: false,
    add: false,
    view: false,
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
  if (req.user.rolePath.includes("/certifcate/update")) {
    bolimlar.update = true;
  }
  if (req.user.rolePath.includes("/certifcate/delete")) {
    bolimlar.deletes = true;
  }
  if (req.user.rolePath.includes("/certifcate/all/delete")) {
    bolimlar.deletesAll = true;
  }
  if (req.user.rolePath.includes("/certifcate/add")) {
    bolimlar.add = true;
  }
  if (req.user.rolePath.includes("/document")) {
    bolimlar.view = true;
  }
  if (req.user.rolePath.includes("activeDocumentUpdate")) {
    bolimlar.activeDocumentUpdate = true;
  }
  if (req.user.rolePath.includes("activeDocumentDelete")) {
    bolimlar.activeDocumentDelete = true;
  }
  // console.log(bolimlar,req.user.rolePath);
  // Query string ni saqlash (pagination uchun)
  let qsParts = [];
  if (query.doc && query.doc !== 'Hammasi') qsParts.push('doc=' + encodeURIComponent(query.doc));
  if (query.lang && query.lang !== 'Hammasi') qsParts.push('lang=' + encodeURIComponent(query.lang));
  if (query.date && query.date !== 'Hammasi') qsParts.push('date=' + encodeURIComponent(query.date));
  if (query.employee && query.employee !== 'Hammasi') qsParts.push('employee=' + encodeURIComponent(query.employee));
  if (query.search) qsParts.push('search=' + encodeURIComponent(query.search));
  let queryString = qsParts.length > 0 ? '?' + qsParts.join('&') : '';

  res.render('public/pages/certificate', {
    path: '../',
    docs: certificates,
    count: certificate.length,
    filter_count:fcount,
    page: page,
    lang: lang,
    doc_name: doc_name,
    employee: employee,
    queryString: queryString,
    ...bolimlar,
    user: req.user
  });

})

router.get("/active/:id", auth, async (req, res) => {
  let id = parseInt(req.params.id);

  if (!id) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'id xato berildi, id butun son qiymat bo\'lishi shart!',
      path: '/certifcate'
    });
  }
  let certifcate = await (await db).certificate.getCertificate(id);
  if (!certifcate) {
    return res.render('public/pages/erors/error-404', {
      status: 404,
      error: 'ushbu idga mos role to\'pilmadi!',
      path: '/certifcate'
    });
  }
  let result_format = formatDoc(certifcate.data);
  // console.log("result_format : ",result_format);
  result_format.id = certifcate.id;
  var name = generateId();
  var hash = crypto.createHash('md5').update(name + "").digest('hex');
  let result_pdf = await toPdf({ ...result_format }, hash, __dirname, certifcate.type, certifcate.lang, true);

  if (!result_pdf) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: "Hujjatni  tahrirlab bo'lmadi",
      path: '/certifcate'
    });
  } else {
    try {
      unlinkSync(certifcate.url);
    } catch (error) {
      console.error(error);
    }
  }
  certificate = {
    link: result_pdf.link,
    status: true
  }
  certificate.url = result_pdf.url;

  let result = await (await db).certificate.update(id, certificate);
  res.send(`<script>window.location.href='/certifcate';</script>`);
});

router.get("/get/certificate/:id", auth, async (req, res) => {
  let id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
  }
  let certificate = await (await db).certificate.getCertificate(id);
  if (!certificate) {
    return res.status(404).json({ error: 'ushbu idga mos certificate to\'pilmadi!' });
  }
  res.json(
    certificate
  );
})

// router.get("/get/certificate/:id",  auth,async (req, res) => {
//     let id = parseInt(req.params.id);
//     if (!id) {
//         return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
//     }
//     const certificate = await (await db).certificate.getCertificate(id);
//     if (!device) {
//         return res.status(404).json({ error: 'ushbu idga mos qurilma to\'pilmadi!' });
//     }
//     let users = await (await db).certificate.(id);
//     res.json(
//         users
//     );
// })


router.get('/get/all', auth, async (req, res) => {
  let certificate = await (await db).certificate.getCertificateAll();
  res.json(
    certificate
  );
})

router.get('/add', auth, async (req, res) => {
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
  res.render('public/pages/certifcate/add', { ...bolimlar, user: req.user });
})



router.post('/add', auth, async (req, res) => {
  // const { error } = validate(req.body, "add");
  // if (error) {
  //     return res.status(400).send(error.details[0].message)
  // }
  let body = req.body;
  let result_format = formatDoc(body);
  //console.log(result_format);

  // return res.send(`<!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <script>
  //           setInterval(()=>{window.location.href = '/certifcate';},1000);
  //       </script>
  //       <style>
  //         body{
  //           background-color:black;
  //         }
  //         .center{
  //           width: fit-content;
  //           height: fit-content;
  //           position: absolute;
  //           top: 50%;
  //           left: 50%;
  //           transform: translate(-50%,-50%);
  //           display: flex;
  //         }
  //         .left,.right,.left_right{
  //           margin-left: 5vw;
  //           width: fit-content;
  //           height: fit-content;
  //         }
  //         .right{
  //           padding-top: 8vh;
  //         }
  //         .loader {
  //           transform: translate(20%,20%) rotateZ(45deg);
  //           perspective: 1000px;
  //           border-radius: 50%;
  //           width: 150px;
  //           height: 150px;
  //           color: #0b5520;
  //         }

  //         .loader:before,
  //         .loader:after {
  //           content: '';
  //           display: block;
  //           position: absolute;
  //           top: 0;
  //           left: 0;
  //           width: inherit;
  //           height: inherit;
  //           border-radius: 50%;
  //           transform: rotateX(70deg);
  //           animation: 1s spin linear infinite;
  //         }

  //         .loader:after {
  //           color: #FF3D00;
  //           transform: rotateY(70deg);
  //           animation-delay: .4s;
  //         }

  //         @keyframes rotate {
  //           0% {
  //             transform: translate(-50%, -50%) rotateZ(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotateZ(360deg);
  //           }
  //         }

  //         @keyframes rotateccw {
  //           0% {
  //             transform: translate(-50%, -50%) rotate(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotate(-360deg);
  //           }
  //         }

  //         @keyframes spin {

  //           0%,
  //           100% {
  //             box-shadow: .2em 0px 0 0px currentcolor;
  //           }

  //           12% {
  //             box-shadow: .2em .2em 0 0 currentcolor;
  //           }

  //           25% {
  //             box-shadow: 0 .2em 0 0px currentcolor;
  //           }

  //           37% {
  //             box-shadow: -.2em .2em 0 0 currentcolor;
  //           }

  //           50% {
  //             box-shadow: -.2em 0 0 0 currentcolor;
  //           }

  //           62% {
  //             box-shadow: -.2em -.2em 0 0 currentcolor;
  //           }

  //           75% {
  //             box-shadow: 0px -.2em 0 0 currentcolor;
  //           }

  //           87% {
  //             box-shadow: .2em -.2em 0 0 currentcolor;
  //           }
  //         }
  //         .loader2 {
  //           font-size: 48px;
  //           display: inline-block;
  //           font-family: Arial, Helvetica, sans-serif;
  //           font-weight: bold;
  //           color: #FFF;
  //           letter-spacing: 2px;
  //           position: relative;
  //           box-sizing: border-box;
  //         }
  //         .loader2::after {
  //           content: 'Yuklanmoqda ...';
  //           position: absolute;
  //           left: 0;
  //           top: 0;
  //           color: #263238;
  //           text-shadow: 0 0 2px #FFF, 0 0 1px #FFF, 0 0 1px #FFF;
  //           width: 100%;
  //           height: 100%;
  //           overflow: hidden;
  //           box-sizing: border-box;
  //           animation: animloader2 6s linear infinite;
  //         }

  //         @keyframes animloader2 {
  //           0% {
  //             height: 100%;
  //           }
  //           100% {
  //             height: 0%;
  //           }
  //         }
  //       </style>
  //   </head>
  //   <body>
  //       <div class="center"> 
  //           <div class="left">
  //               <span class="loader"></span>
  //           </div>
  //           <div class="left_right">
  //           </div>
  //           <div class="right">
  //               <span class="loader2">Yuklanmoqda ...</span>
  //           </div>
  //       </div>
  //   </body>
  //   </html>`);

  let certificate = {
    ...result_format
  }
  let result_ = await (await db).certificate.getCertificateObj({ id: parseInt(body.ids) });
  if (parseInt(body.ids) && result_) {
    if (result_.length > 0) {
      certificate.id = parseInt(body.ids);
      certificate.son = result[0].son;
    } else {
      certificate.id = generateId();
      let raqami = await (await db).static.add(`doc${body.doc}`);
      // console.log("yaratilgan hujjat raqami :", raqami);
      certificate.son = raqami;
    }
  } else {
    certificate.id = generateId();
    let raqami = await (await db).static.add(`doc${body.doc}`);
    // console.log("yaratilgan hujjat raqami :", raqami);
    certificate.son = raqami;
  }

  var name = generateId();
  var hash = crypto.createHash('md5').update(name + "").digest('hex');
  let result_pdf = await toPdf(certificate, hash, __dirname, body.doc, body.lang);

  if (!result_pdf) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: "Hujjatni  yaratip bo'lmadi.",
      path: '/certifcate'
    });
  }
  certificate = {
    son: certificate.son,
    id: certificate.id,
    type: body.doc,
    lang: body.lang,
    status: false,
    date: (new Date()).toLocaleString().slice(0, 10).replace(',', ''),
    time: (new Date()).toLocaleTimeString().slice(0, 5),
    employee: req.user.name,
    data: body,
    link: result_pdf.link,
  }
  certificate.url = result_pdf.url;
  let add = fiil_up(body);
  if (add) {
    for (const key in add) {
      if (Object.hasOwnProperty.call(add, key)) {
        certificate[key] = add[key];
      }
    }
  }
  let result = await (await db).certificate.addCertificate(certificate);
  if (result.hasOwnProperty('error')) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: result,
      path: '/certifcate'
    });
  }
  action({
    user: req.user.name,
    module: "Sertiftikatlar",
    description: `${certificate.id} sonli  hujjatni  qo'shishdi!`
  });
  (await db).static.add(1);
  res.render('public/pages/loading', { link: result_pdf.link });
  // res.send(`<!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <script>
  //           setInterval(()=>{window.location.href = '/certifcate';window.open("${result_pdf.link}");},8*1000);
  //       </script>
  //       <style>
  //         body{
  //           background-color:black;
  //         }
  //         .center{
  //           width: fit-content;
  //           height: fit-content;
  //           position: absolute;
  //           top: 50%;
  //           left: 50%;
  //           transform: translate(-50%,-50%);
  //           display: flex;
  //         }
  //         .left,.right,.left_right{
  //           margin-left: 5vw;
  //           width: fit-content;
  //           height: fit-content;
  //         }
  //         .right{
  //           padding-top: 8vh;
  //         }
  //         .loader {
  //           transform: translate(20%,20%) rotateZ(45deg);
  //           perspective: 1000px;
  //           border-radius: 50%;
  //           width: 150px;
  //           height: 150px;
  //           color: #0b5520;
  //         }

  //         .loader:before,
  //         .loader:after {
  //           content: '';
  //           display: block;
  //           position: absolute;
  //           top: 0;
  //           left: 0;
  //           width: inherit;
  //           height: inherit;
  //           border-radius: 50%;
  //           transform: rotateX(70deg);
  //           animation: 1s spin linear infinite;
  //         }

  //         .loader:after {
  //           color: #FF3D00;
  //           transform: rotateY(70deg);
  //           animation-delay: .4s;
  //         }

  //         @keyframes rotate {
  //           0% {
  //             transform: translate(-50%, -50%) rotateZ(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotateZ(360deg);
  //           }
  //         }

  //         @keyframes rotateccw {
  //           0% {
  //             transform: translate(-50%, -50%) rotate(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotate(-360deg);
  //           }
  //         }

  //         @keyframes spin {

  //           0%,
  //           100% {
  //             box-shadow: .2em 0px 0 0px currentcolor;
  //           }

  //           12% {
  //             box-shadow: .2em .2em 0 0 currentcolor;
  //           }

  //           25% {
  //             box-shadow: 0 .2em 0 0px currentcolor;
  //           }

  //           37% {
  //             box-shadow: -.2em .2em 0 0 currentcolor;
  //           }

  //           50% {
  //             box-shadow: -.2em 0 0 0 currentcolor;
  //           }

  //           62% {
  //             box-shadow: -.2em -.2em 0 0 currentcolor;
  //           }

  //           75% {
  //             box-shadow: 0px -.2em 0 0 currentcolor;
  //           }

  //           87% {
  //             box-shadow: .2em -.2em 0 0 currentcolor;
  //           }
  //         }
  //         .loader2 {
  //           font-size: 48px;
  //           display: inline-block;
  //           font-family: Arial, Helvetica, sans-serif;
  //           font-weight: bold;
  //           color: #FFF;
  //           letter-spacing: 2px;
  //           position: relative;
  //           box-sizing: border-box;
  //         }
  //         .loader2::after {
  //           content: 'Yuklanmoqda ...';
  //           position: absolute;
  //           left: 0;
  //           top: 0;
  //           color: #263238;
  //           text-shadow: 0 0 2px #FFF, 0 0 1px #FFF, 0 0 1px #FFF;
  //           width: 100%;
  //           height: 100%;
  //           overflow: hidden;
  //           box-sizing: border-box;
  //           animation: animloader2 6s linear infinite;
  //         }

  //         @keyframes animloader2 {
  //           0% {
  //             height: 100%;
  //           }
  //           100% {
  //             height: 0%;
  //           }
  //         }
  //       </style>
  //   </head>
  //   <body>
  //       <div class="center"> 
  //           <div class="left">
  //               <span class="loader"></span>
  //           </div>
  //           <div class="left_right">
  //           </div>
  //           <div class="right">
  //               <span class="loader2">Yuklanmoqda ...</span>
  //           </div>
  //       </div>
  //   </body>
  //   </html>`);
})

router.get('/update/:id', auth, async (req, res) => {
  let id = Number(req.params.id);
  if (!id) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'id xato berildi, id butun son qiymat bo\'lishi shart',
      path: '/certifcate'
    });
  }
  let certifcate = await (await db).certificate.getCertificate(id);
  // console.log(certifcate);
  if (!certifcate) {
    return res.render('public/pages/erors/error-404', {
      status: 404,
      error: 'ushbu idga mos role to\'pilmadi!',
      path: '/certifcate'
    });
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

  res.render('public/pages/certifcate/edit', {
    ...certifcate, ...bolimlar, user: req.user
  });
});

router.post('/update/:id', auth, async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message)
  // }
  let body = req.body;

  let id = parseInt(req.params.id);

  if (!id) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'id xato berildi, id butun son qiymat bo\'lishi shart!',
      path: '/certifcate'
    });
    // return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
  }

  if (!body) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'no\'tog\'ri so\'rov. bosh qiymat yuborilgan!',
      path: '/certifcate'
    });
    // return res.status(400).json({ error: 'no\'tog\'ri so\'rov. bosh qiymat yuborilgan.' });
  }

  if (body.hasOwnProperty("id")) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'id qiymatini o\'zgartirib bo\'lmaydi!',
      path: '/certifcate'
    });
    // return res.status(400).json({ error: 'id qiymatini o\'zgartirib bo\'lmaydi.' });
  }

  let certificate = await (await db).certificate.getCertificate(id);
  if (!certificate) {
    return res.render('public/pages/erors/error-404', {
      status: 404,
      error: 'ushbu idga mos certificate to\'pilmadi!',
      path: '/certifcate'
    });
    // return res.status(404).json({ error: 'ushbu idga mos certificate to\'pilmadi!' });
  }
  // console.log("certificate : ",certificate);

  let flag = false;
  if (certificate.status) {
    flag = true;
  }
  let result_format = formatDoc(body);
  // console.log("result_format : ",result_format);
  result_format.id = certificate.id;
  var name = generateId();
  var hash = crypto.createHash('md5').update(name + "").digest('hex');
  let result_pdf = await toPdf({ ...result_format }, hash, __dirname, body.doc, body.lang, flag);

  if (!result_pdf) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: "Hujjatni  tahrirlab bo'lmadi",
      path: '/certifcate'
    });
  } else {
    try {
      unlinkSync(certificate.url);
    } catch (error) {
      console.error(error);
    }
  }
  certificate = {
    data: body,
    link: result_pdf.link,
    real: true,
  }
  certificate.url = result_pdf.url;
  let add = fiil_up(body);
  if (add) {
    for (const key in add) {
      if (Object.hasOwnProperty.call(add, key)) {
        certificate[key] = add[key];
      }
    }
  }
  let result = await (await db).certificate.update(id, certificate);
  if (result.hasOwnProperty('error')) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: result,
      path: '/certifcate'
    });
    // return res.status(400).json(
    //   result
    // );
  }
  action({
    user: req.user.name,
    module: "Sertiftikatlar",
    description: `${certificate.id} sonli  hujjatni  tahrirladi!`
  });
  // (await db).static.add(2);
  res.render('public/pages/loading', { link: result_pdf.link });
  // res.send(`<!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <script>
  //           setInterval(()=>{window.location.href = '/certifcate';window.open("${result_pdf.link}");},8*1000);
  //       </script>
  //       <style>
  //         body{
  //           background-color:black;
  //         }
  //         .center{
  //           width: fit-content;
  //           height: fit-content;
  //           position: absolute;
  //           top: 50%;
  //           left: 50%;
  //           transform: translate(-50%,-50%);
  //           display: flex;
  //         }
  //         .left,.right,.left_right{
  //           margin-left: 5vw;
  //           width: fit-content;
  //           height: fit-content;
  //         }
  //         .right{
  //           padding-top: 8vh;
  //         }
  //         .loader {
  //           transform: translate(20%,20%) rotateZ(45deg);
  //           perspective: 1000px;
  //           border-radius: 50%;
  //           width: 150px;
  //           height: 150px;
  //           color: #0b5520;
  //         }

  //         .loader:before,
  //         .loader:after {
  //           content: '';
  //           display: block;
  //           position: absolute;
  //           top: 0;
  //           left: 0;
  //           width: inherit;
  //           height: inherit;
  //           border-radius: 50%;
  //           transform: rotateX(70deg);
  //           animation: 1s spin linear infinite;
  //         }

  //         .loader:after {
  //           color: #FF3D00;
  //           transform: rotateY(70deg);
  //           animation-delay: .4s;
  //         }

  //         @keyframes rotate {
  //           0% {
  //             transform: translate(-50%, -50%) rotateZ(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotateZ(360deg);
  //           }
  //         }

  //         @keyframes rotateccw {
  //           0% {
  //             transform: translate(-50%, -50%) rotate(0deg);
  //           }

  //           100% {
  //             transform: translate(-50%, -50%) rotate(-360deg);
  //           }
  //         }

  //         @keyframes spin {

  //           0%,
  //           100% {
  //             box-shadow: .2em 0px 0 0px currentcolor;
  //           }

  //           12% {
  //             box-shadow: .2em .2em 0 0 currentcolor;
  //           }

  //           25% {
  //             box-shadow: 0 .2em 0 0px currentcolor;
  //           }

  //           37% {
  //             box-shadow: -.2em .2em 0 0 currentcolor;
  //           }

  //           50% {
  //             box-shadow: -.2em 0 0 0 currentcolor;
  //           }

  //           62% {
  //             box-shadow: -.2em -.2em 0 0 currentcolor;
  //           }

  //           75% {
  //             box-shadow: 0px -.2em 0 0 currentcolor;
  //           }

  //           87% {
  //             box-shadow: .2em -.2em 0 0 currentcolor;
  //           }
  //         }
  //         .loader2 {
  //           font-size: 48px;
  //           display: inline-block;
  //           font-family: Arial, Helvetica, sans-serif;
  //           font-weight: bold;
  //           color: #FFF;
  //           letter-spacing: 2px;
  //           position: relative;
  //           box-sizing: border-box;
  //         }
  //         .loader2::after {
  //           content: 'Yuklanmoqda ...';
  //           position: absolute;
  //           left: 0;
  //           top: 0;
  //           color: #263238;
  //           text-shadow: 0 0 2px #FFF, 0 0 1px #FFF, 0 0 1px #FFF;
  //           width: 100%;
  //           height: 100%;
  //           overflow: hidden;
  //           box-sizing: border-box;
  //           animation: animloader2 6s linear infinite;
  //         }

  //         @keyframes animloader2 {
  //           0% {
  //             height: 100%;
  //           }
  //           100% {
  //             height: 0%;
  //           }
  //         }
  //       </style>
  //   </head>
  //   <body>
  //       <div class="center"> 
  //           <div class="left">
  //               <span class="loader"></span>
  //           </div>
  //           <div class="left_right">
  //           </div>
  //           <div class="right">
  //               <span class="loader2">Yuklanmoqda ...</span>
  //           </div>
  //       </div>
  //   </body>
  //   </html>`);
});

router.get('/delete/:id', auth, async (req, res) => {
  let id = parseInt(req.params.id);
  if (!id) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'id xato berildi, id butun son qiymat bo\'lishi shart',
      path: '/certifcate'
    });
  }
  let certifcate = await (await db).certificate.getCertificate(id);
  if (!certifcate) {
    return res.render('public/pages/erors/error-404', {
      status: 404,
      error: 'ushbu idga mos Hujjat to\'pilmadi!',
      path: '/certifcate'
    });
  }
  let result = await (await db).certificate.delete(id);
  try {
    unlinkSync(certifcate.url);
  } catch (error) {
    console.error(error);
  }
  action({
    user: req.user.name,
    module: "Sertiftikatlar",
    description: `${id} sonli  hujjatni  o'chirdi!`
  });
  (await db).static.add(3);
  res.send(`<script> window.location.href = '/certifcate'; </script>`)
});

router.get('/all/delete/:id', auth, async (req, res) => {
  let ids = (req.params.id.split('+')).map((el) => { return parseInt(el) });
  // console.log(ids, req.params.id);
  if (!ids) {
    return res.render('public/pages/erors/error-404', {
      status: 400,
      error: 'idlar bo\'sh berildi, idlar bo\'sh bo\'lmasligi shart',
      path: '/certifcate'
    });
  }
  let roles = [];
  for (let index = 1; index < ids.length; index++) {
    const element = ids[index];
    (await db).static.add(3);
    let certificate = await (await db).certificate.getCertificate(element);
    if (!certificate) {
      continue;
    }
    let result = await (await db).certificate.delete(element);
    try {
      unlinkSync(certificate.url);
    } catch (error) {
      console.error(error);
    }
  }
  action({
    user: req.user.name,
    module: "Sertiftikatlar",
    description: `${ids.length - 1} ta   hujjatni  o'chirdi!`
  });
  res.send(`<script> window.location.href = '/certifcate'; </script>`)
});






module.exports = router;