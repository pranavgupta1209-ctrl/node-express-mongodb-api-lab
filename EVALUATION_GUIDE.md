# Practical Evaluation and Viva Guide

Ye guide Windows laptop par project chalane, professor ko demonstrate karne aur code samajhne ke liye hai. Commands PowerShell ke liye hain. Real database password ya connection string kisi ko chat mein mat bhejna.

## PART A — How to Demonstrate the Project

### 1. Open the correct project

1. Windows Start menu se **Visual Studio Code** kholo.
2. **File > Open Folder** par click karo.
3. `C:\Users\LENOVO\Desktop\new_backend\node-express-mongodb-api-lab` select karo, phir **Select Folder**.
4. Explorer mein `package.json`, `backend`, `postman`, README aur ye guide dikhne chahiye.
5. **Terminal > New Terminal** kholo. Terminal commands run karne ki jagah hai; file editor mein commands paste nahi karni.

### 2. Check tools and install dependencies

```powershell
node --version
npm.cmd --version
git --version
npm.cmd ci
```

Node.js installed hona chahiye; Node 24 LTS is project ke liye suitable hai. `npm ci` package-lock.json ke versions install karta hai. Pehli baar internet aur download time lag sakta hai. Dependencies install hone ke baad `node_modules` folder banta hai; is folder ko GitHub par upload nahi karna.

### 3. Configure MongoDB Atlas privately

Full click-by-click setup README ke **MongoDB Atlas Configuration** section mein hai. Short demonstration checklist:

1. Atlas website par account banao/sign in karo; organization aur project choose karo.
2. **Create / Build a Database** mein **Free / M0** select karo, agar available ho. Provider, region aur cluster name select karke create karo.
3. Security setup mein database username/password banao. Baad mein ye **Security > Database Access** mein manage hota hai. Database user Atlas website account se alag hai.
4. **Security > Network Access > Add IP Address > Add Current IP Address > Confirm** karo. College Wi-Fi par IP change ho to current IP dobara add karo.
5. Cluster ka **Connect > Drivers > Node.js** option kholo aur apna connection string copy karo.
6. Project terminal mein sirf pehli baar:

```powershell
Copy-Item .env.example .env
```

7. VS Code mein `.env` kholo. `PORT=8000` rehne do. `MONGODB_URI` ke placeholder ki jagah apna URI paste karo. Database username/password placeholders ko privately replace karo aur angle brackets hatao. Reserved characters ko URI-encode karo; example `@` → `%40`. Cluster hostname ke baad database path `api_lab` rakho, query parameters se pehle. README mein placement samjhaya gaya hai.
8. **Ctrl+S** se file save karo. Existing `.env` ko sample file se overwrite mat karo.
9. Professor ke saamne `.env` file, terminal mein URI, ya password reveal mat karo. `.env.example` dikhakar configuration samjha sakte ho.

### 4. Start and show the server

```powershell
npm.cmd start
```

Development mein `npm.cmd run dev` use kar sakte ho. Dono commands ek saath mat chalao.

Real successful connection par terminal mein ye messages aayenge:

```text
MongoDB connected successfully.
Server running at http://localhost:8000
```

Browser mein `http://localhost:8000/` kholo. JSON message server running dikhata hai. Ye frontend page nahi hai. Server ka terminal open rehna chahiye.

Bol sakte ho: **"Pehle dotenv configuration load hoti hai, phir database connect hota hai aur unique indexes ready hote hain. Uske baad hi HTTP server start hota hai."**

### 5. Open and import Postman desktop

1. Windows Start se **Postman desktop** kholo aur workspace open karo.
2. **Import** par click karo. New interface mein **Use resources or import > Import** ho sakta hai.
3. **Select Files** se project ka `postman/Backend-Tutorial.postman_collection.json` select karo, phir import confirm karo. File ko import window mein drag/drop bhi kar sakte ho.
4. Left sidebar mein collection kholo. **Variables** mein `baseUrl = http://localhost:8000` confirm karo aur save karo. Initially `postId` empty ho sakta hai.
5. Collection ke numbered requests order mein run karo. Body wale requests mein raw JSON aur Content-Type already configured hai.

### 6. Demonstrate registration, login and logout

| Step | Postman action | Expected observation |
| --- | --- | --- |
| Register | **1. Register User > Send** | 201; response mein user ID, username, email aur timestamps; password nahi |
| Duplicate | Same registration dobara Send | 409; duplicate account prevent hota hai |
| Login | **2. Login User > Send** | 200; credentials verify hote hain |
| Wrong password | Login mein `WrongPass123!` bhejo | 401; phir correct password restore karo |
| Logout | **3. Logout User > Send** | 200; educational demonstration message |

Username/email pehle se use ho chuke hon to register ke liye dono badlo, jaise `studentdemo2` aur `student2@example.com`. Login body mein bhi wahi naya email use karo. Example passwords invented hain; real accounts ke passwords use mat karo.

Bol sakte ho: **"Password MongoDB mein plain text nahi jaata; bcrypt hash save hota hai. Login mein bcrypt.compare use hota hai. Ye project token ya session nahi banata, isliye logout sirf demonstration hai. Post routes login se protected nahi hain."**

### 7. Demonstrate all four CRUD operations

| Operation | Postman request | What to show |
| --- | --- | --- |
| Create | **4. Create Post > Send** | 201; nested `post` object aur generated `_id` |
| Read | **5. Get All Posts > Send** | 200; JSON array mein created post |
| Update | **6. Update Post > Send** | 200; description `Updated using Postman`, other fields retained |
| Verify update | Get All Posts dobara | Updated description database se aa rahi hai |
| Delete | **7. Delete Post > Send** | 200; deletion message aur postId |
| Verify delete | Get All Posts dobara | Wahi ID absent; collection empty ho to `[]` |

Create request ka post-response script `post._id` automatically collection variable `postId` mein save karta hai. Update/Delete URLs mein `{{postId}}` use hota hai. Agar variable empty rahe, response se **post ka** `_id` copy karo, collection **Variables > postId** mein paste karke save karo. User ka ID mat use karo.

Delete dobara Send karne par 404 correct hai, kyunki document ab exist nahi karta. Naya Create request naya ID save karega. Update body `{}` par 400 aur age `151` par 400 dikhakar validation explain kar sakte ho.

### 8. Show changes in MongoDB Atlas

1. Atlas mein apna cluster kholo aur **Browse Collections / Data Explorer** select karo.
2. `api_lab` database expand karo. Agar alag database name URI mein diya tha, wahi choose karo.
3. `users` mein registered account dikhao. Password field bcrypt hash hota hai, actual sample password nahi. Private credentials wala URI screen par mat kholo.
4. `posts` collection refresh karke Create ke baad document dikhao.
5. Update ke baad refresh karke description change dikhao.
6. Delete ke baad refresh karke usi ID ka removal dikhao. Other existing posts delete nahi hote.

Collections first writes/index initialization ke baad appear hote hain. Browser page refresh/data refresh ki zaroorat ho sakti hai.

### 9. Show source, tests and submission

Routes → controllers → models → database module open karke PART D follow karo. Separate terminal mein automated tests run kar sakte ho:

```powershell
npm.cmd test
```

Ye disposable local MongoDB use karte hain; aapke Atlas data ko delete ya modify nahi karte. Manual Postman desktop evaluation phir bhi zaroor karni hai.

GitHub website par separate repository **Public** choose karke publish karo. Exact commands README ke **Publish a separate public GitHub repository** section mein hain. Professor ko actual public repository URL submit karo; local folder path submission URL nahi hai. Public access signed-out browser se check karo.

Finish karne ke baad server terminal mein **Ctrl+C** press karo.

## PART B — Beginner Explanation (Hinglish)

| Concept | Simple explanation |
| --- | --- |
| Backend development | App ka server-side kaam: request receive karna, rules check karna, database se data lena/save karna aur response bhejna. |
| Node.js | JavaScript ko browser ke bahar, jaise laptop/server par, run karne ka runtime. |
| Express.js | Node.js framework jo server, routes, middleware aur HTTP responses banana easy karta hai. |
| MongoDB | Document database; records BSON documents mein store hote hain aur app ko JSON jaise dikhte hain. |
| MongoDB Atlas | MongoDB ka managed cloud service; database online cluster mein run hota hai. |
| Mongoose | Node library jo MongoDB documents ke liye schemas, models, validation aur queries provide karti hai. |
| API | Application Programming Interface; client aur server ke beech defined request/response interface. |
| REST | APIs design karne ka architectural style, typically resources, HTTP methods aur stateless requests use karta hai. Hamare paths tutorial-compatible action names rakhte hain. |
| CRUD | Create, Read, Update, Delete: data add, dekhna, badalna aur remove karna. |
| Postman | API client; frontend banaye bina HTTP request bhejkar status aur JSON response inspect kar sakte hain. |
| Schema | Document ke fields, types aur validation rules ka definition. |
| Model | Schema se bana object/class jisse collection par create/find/update/delete queries karte hain. |
| Controller | Request ka actual logic: input check, model call aur response decide karna. |
| Route | HTTP method aur URL ko controller function se connect karta hai. |
| Middleware | Request-response pipeline mein chalne wala function; jaise express.json ya error handler. |
| Asynchronous function | `async` function Promise return karti hai. `await` pending database operation ka result wait karta hai, poore Node event loop ko block kiye bina. |
| bcrypt | Password ko salted, slow hash mein convert aur supplied password ko hash se compare karne ki library. |
| Password hashing | Password se one-way representation banana. Ye encryption nahi; hash ko decrypt karke original password nahi nikalte. |
| Environment variables | Configuration values jo source code se alag rakhi jaati hain, jaise PORT aur MONGODB_URI. dotenv local .env se unhe process.env mein load karta hai. |
| package.json | Project metadata, npm commands aur dependency version ranges ki file. |
| nodemon | Development tool jo watched JavaScript change hone par Node process restart karta hai. |

**Request flow:** Postman se request aati hai → Express route match hota hai → controller input validate karta hai → Mongoose model query chalata hai → MongoDB Atlas data save/read/update/delete karta hai → controller JSON response bhejta hai.

Har request database tak nahi jaati: invalid input pehle reject hota hai; logout demonstration aur health check database query nahi karte.

## PART C — Viva Preparation

1. **Is project ka purpose kya hai?** Node/Express backend, MongoDB schemas aur Postman se CRUD demonstrate karna.
2. **Node.js aur Express mein difference?** Node JavaScript runtime hai; Express us runtime par HTTP APIs banane ka framework hai.
3. **Database online kaise hai?** MongoDB Atlas cloud cluster host karta hai; URI se Mongoose connect hota hai.
4. **MongoDB aur Atlas mein difference?** MongoDB database technology hai; Atlas us database ko host/manage karne ki service hai.
5. **Mongoose kyun use kiya?** Schema rules aur model methods se database data ko validate/manage karna simple hota hai.
6. **Do models kaunse hain?** User aur Post. User mein username/email/password; Post mein name/description/age.
7. **Timestamps kya karte hain?** Mongoose createdAt aur updatedAt automatically maintain karta hai.
8. **Route kya karta hai?** Method aur URL ko correct controller se map karta hai.
9. **Controller kya karta hai?** Input validate, model operation aur HTTP response handle karta hai.
10. **Middleware ka example?** express.json JSON request body parse karke req.body banata hai; error handler errors ko JSON mein format karta hai.
11. **JSON kya hai?** Data exchange ka text format, jisme quoted property names, strings, numbers, objects aur arrays hote hain.
12. **CRUD ka full form?** Create, Read, Update, Delete.
13. **Create ke liye kaunsa method hai?** POST, aur successful creation par 201.
14. **GET aur POST mein difference?** GET data read karta hai; POST yahan naya record create karta hai ya login input bhejta hai.
15. **PATCH kyun use kiya?** Partial update ke liye; sirf supplied post fields change hote hain.
16. **Update validation kaise hoti hai?** Controller types/allowlist check karta hai; Mongoose query mein runValidators: true schema rules check karta hai.
17. **ObjectId kya hai?** MongoDB document identifier; API URL mein iska 24 hexadecimal character form use hota hai.
18. **Invalid ID aur missing document mein difference?** ID format wrong ho to 400; format valid lekin document absent ho to 404.
19. **Password plain text mein save hota hai?** Nahi, User pre-save hook bcrypt hash save karta hai.
20. **Hashing aur encryption same hain?** Nahi. Encryption key se reverse ho sakti hai; password hashing one-way verification ke liye hai.
21. **Correct password kaise check hota hai?** Login stored hash select karta hai aur bcrypt.compare(candidate, hash) use karta hai.
22. **Har save par double hash hoga?** Nahi. Hook isModified("password") check karta hai; unchanged stored hash ko dobara hash nahi karta.
23. **Password API mein kaise hide hota hai?** Schema default query se password exclude karta hai, JSON transform remove karta hai, aur controller response mein public fields hi select karta hai.
24. **Duplicate email/username kaise roka?** Normalized values pe existing-user query aur database unique indexes. Concurrent conflict bhi 409 ban jaata hai.
25. **Kya unique: true normal validator hai?** Nahi, ye unique database index banane ka instruction hai; duplicate-key error handle karna padta hai.
26. **Login par JWT milta hai?** Nahi. Ye assignment credentials verify karta hai, token/session issue nahi karta.
27. **Logout kya invalidate karta hai?** Kuch nahi, kyunki persistent login state hai hi nahi. Response ise demonstration bolta hai.
28. **Posts protected hain?** Nahi. Is introductory assignment mein authentication/authorization middleware nahi hai.
29. **Environment file GitHub par kyun nahi?** Ismein private database credentials ho sakte hain. .gitignore ise exclude karta hai; .env.example safe template hai.
30. **Database connect hone se pehle listen kyun nahi?** Server ko ready tab dikhana chahiye jab required database aur user indexes available hon.
31. **async/await ka purpose?** Database Promises ke result ko readable order mein handle karna, aur try/catch se failure handle karna.
32. **HTTP 401, 409 aur 500 kya hain?** 401 invalid login credentials; 409 duplicate account; 500 unexpected server failure.
33. **Empty posts collection ka response?** HTTP 200 aur empty array []; ye normal successful read hai.
34. **package-lock.json kyun commit ki?** Dependencies ki resolved versions/integrity record hoti hai; npm ci same dependency tree install karta hai.
35. **nodemon aur node start mein difference?** Node server run karta hai; nodemon development mein file change par us process ko restart karta hai.
36. **Postman se kya verify kiya jaata hai?** Method, URL, JSON body, response status/body aur database changes.
37. **Reference se implementation copy ki?** Nahi. Scope, folder conventions aur API contract inspect kiya; application logic, checks aur docs fresh implement hue hain. Tutorial ko credit diya hai.
38. **Automated local tests Atlas connection prove karte hain?** Nahi. Ye temporary local MongoDB process use karte hain; Atlas credentials, network aur desktop Postman alag verify karne hain.

## PART D — Source Code Walkthrough

| File | What to explain |
| --- | --- |
| `package.json` | Project name, ES Module setting, start/dev/test scripts aur required packages. private flag npm publishing prevent karta hai, GitHub visibility nahi. |
| `package-lock.json` | Exact dependency resolution; npm ci is file ko use karta hai. |
| `.env.example` | Safe template: PORT aur MONGODB_URI names. |
| `.env` (local, ignored) | Aapki private actual configuration; repository mein nahi jaati. |
| `.gitignore` | .env variants, node_modules, logs aur local editor files Git se exclude karta hai; .env.example allowed hai. |
| `backend/src/index.js` | Root dotenv config load, PORT validate, DB connect, User.init se indexes ready, phir app.listen; startup/listener errors aur shutdown handle karta hai. |
| `backend/src/app.js` | Express app create, JSON parser, health route, router mounting, unknown-route response aur error handler. DB connect/listen yahan nahi hota, isliye tests app import kar sakte hain. |
| `backend/src/config/database.js` | process.env.MONGODB_URI validate karke mongoose.connect await karta hai; successful message secret ke bina print karta hai. |
| `backend/src/models/user.model.js` | User schema, normalized unique fields, timestamps, password validation/hiding, bcrypt pre-save hook aur comparePassword method. |
| `backend/src/models/post.model.js` | Post field types, trimmed strings, age limits aur timestamps. |
| `backend/src/controllers/user.controller.js` | Registration input/duplicates handle, user save, login compare aur honest logout demonstration; responses public user fields use karte hain. |
| `backend/src/controllers/post.controller.js` | Four CRUD functions; field allowlist/types, ID checks, model queries aur 201/200/400/404 responses. |
| `backend/src/routes/user.route.js` | /register, /login aur /logout ko controller functions se map karta hai. |
| `backend/src/routes/post.route.js` | /create, /getPosts, /update/:id aur /delete/:id map karta hai. |
| `backend/src/middleware/error-handler.js` | Duplicate-key, schema, cast, malformed/large JSON aur unexpected errors ko consistent safe response banata hai. Raw error/URI return nahi karta. |
| `postman/Backend-Tutorial.postman_collection.json` | Seven ready requests, baseUrl/postId variables, sample JSON aur response assertions. Create script postId save karta hai. |
| `test/api.test.js` | Node tests temporary real MongoDB launch karte hain, HTTP requests bhejte hain, persistence/passwords/status/errors verify karke cleanup karte hain. |
| `README.md` | English project overview, exact setup, API examples, Postman steps, troubleshooting aur GitHub publication. |
| `EVALUATION_GUIDE.md` | Ye practical script, Hinglish concepts, viva aur verification record. |

### Follow one example through the files

`POST /api/v1/posts/create` par `app.js` base path `/api/v1/posts` select karta hai. `post.route.js` ka `/create` route `createPost` call karta hai. Controller JSON fields check karke `Post.create()` await karta hai. `post.model.js` schema required fields aur age range validate karti hai. Connected MongoDB Atlas document save karta hai. Controller 201 aur `{ message, post }` return karta hai. Validation fail ho to shared error handler 400 deta hai.

User registration mein extra step User model ka pre-save bcrypt hook hai. Plain password request body se aata hai, hash database mein jaata hai, aur public response mein password field nahi hoti.

## PART E — Common Errors

| Error or symptom | Simple solution |
| --- | --- |
| Node.js not installed | Official nodejs.org installer se Node 24 LTS aur npm install karo; VS Code reopen karke node --version check karo. |
| npm command not recognized | Node install mein npm included tha confirm karo; terminal reopen karo; npm.cmd --version try karo. PATH install setting check karo. |
| npm.ps1 cannot be loaded | npm ke badle npm.cmd use karo; scripts policy change karne ki zaroorat nahi. |
| Missing dependencies / ERR_MODULE_NOT_FOUND | Terminal correct package.json folder mein lao aur npm.cmd ci run karo. |
| Invalid MongoDB URI | Root .env mein real Atlas URI save karo; placeholder aur < > hatao; hostname/query parameters Atlas se copy karo. URI print mat karo. |
| Atlas network access problem | Current public IP Network Access mein add/confirm karo; cluster ready aur internet available ho. College firewall/DNS issue ho to allowed network try karo. |
| Invalid database credentials | Atlas website password nahi, database user password use karo; Database Access mein user check/reset karo; URI reserved characters encode karo. |
| Login returns 401 | Registered email aur correct sample password use karo; database account credentials aur application user credentials alag hain. |
| Port already in use | Dusra running server Ctrl+C se stop karo, ya .env PORT change karke Postman baseUrl bhi same port par update karo. |
| Invalid ObjectId | Create Post ke response se post._id copy karo; postId variable update/save karo. 24 hex characters chahiye. |
| Postman 404 | Full URL, HTTP method, port aur /api/v1 prefix check karo. Deleted/missing post bhi 404 deta hai. |
| Postman 400 | Raw JSON select karo; double quotes/commas check karo; age number bhejo, string nahi; empty update mat bhejo. |
| Postman 409 | Same username/email already hai; naya pair register karo ya existing user login karo. |
| Unexpected API 500 | Server terminal dekho, Atlas cluster/network availability check karo, valid request retry karo. Secret .env/URI public screenshot mein mat bhejo. |
| Postman cannot connect | Server terminal open aur successful startup messages check karo; http://localhost:8000 use karo, https nahi. |
| Tests cannot download MongoDB | Internet/proxy/download access check karo aur npm.cmd test retry karo. TLS verification disable mat karo. |
| Git asks for identity | README ke repository-local git config user.name/user.email commands apni identity ke saath run karo. |
| Git push rejected | Correct empty separate repository remote aur Git browser sign-in check karo; README ki exact publication steps follow karo. |

## Verification Record and Remaining Work

Actual checks on **18 November 2026**, using Windows, Node.js **v24.22.3**, npm **11.19.1**, and Git **2.54.0.windows.1**:

| Status | Check | Evidence / scope |
| --- | --- | --- |
| Passed | Reference inspection | GitHub folder tree, package.json, README, entry point, database, both models/controllers/routers read; implementation created independently. |
| Passed | Required project files and imports | Separate named directory; JavaScript syntax checks and real application imports succeeded. |
| Passed | Dependency installation | Express 5.3.0, Mongoose 9.12.2, bcrypt 6.0.0, dotenv 18.0.10; development nodemon 3.1.14 and mongodb-memory-server 11.3.0 installed. |
| Passed | Dependency audit | npm audit reported 0 vulnerabilities after development dependency overrides. This is the audit result at verification time. |
| Passed | Automated integration tests | **19 passed, 0 failed** via npm test, using a disposable local real MongoDB process. |
| Passed | User behavior | Invalid input, normalized registration, duplicate emails/usernames, simultaneous duplicate registrations, bcrypt comparison, hidden hashes, unchanged-password saves, changed passwords, successful/failed login, and honest logout checked. |
| Passed | Post behavior | Create/read/update/delete persisted correctly; empty reads, missing fields, wrong types, schema limits, unsafe updates, invalid IDs and nonexistent documents checked. |
| Passed | Error behavior | Malformed/oversized JSON, unknown routes, generic 500 response and no raw private error details checked. |
| Passed | Startup failure handling | Placeholder URI, unreachable database, invalid PORT and occupied port exited unsuccessfully without claiming the server started or printing the URI. |
| Passed | Real entry point and development restart | index.js connected to temporary MongoDB and served HTTP through nodemon; a source file timestamp change triggered automatic restart and a healthy HTTP response. |
| Passed | Postman format | JSON validated against the official Postman Collection v2.1 Draft-04 schema; all seven request bodies/definitions checked. |
| Passed | Collection execution through Newman 6.2.3 | **7 requests, 12 assertions, 0 failures**, including automatic postId reuse. Newman ran from npm's temporary execution cache; it is not an application dependency. |
| Passed | Local secret protection | .env and node_modules ignored; .env.example allowed; local .env contains only safe placeholders pending student configuration. |
| Not Tested | Your MongoDB Atlas connection | No real Atlas URI/account access supplied. Local test success does not verify your Atlas credentials or IP access. |
| Not Tested | Postman desktop import and execution | Collection schema and command-line execution passed; the actual desktop workflow must be performed by the student. |
| Not Published | Public GitHub repository and submission | Own local Git repository prepared; no remote URL or successful push is claimed. Follow README publication steps. |
| Limited access | Tutorial video content | Video page/title accessible, but playback/transcript not available for detailed inspection. |

Final automated failures: **none**. Earlier checks found an Express 5 listen-callback issue and a deprecated update option; both were corrected before the passing final checks. A temporary local database test is not an Atlas connection test, and Newman execution is not a Postman desktop demonstration.

### Final assignment checklist

- [x] Separate Node.js project and own local Git repository created.
- [x] Required folder organization, JavaScript ES Modules and package metadata configured.
- [x] Express app, routes/controllers, database connection and startup sequencing implemented.
- [x] User and Post models with timestamps and validation implemented.
- [x] Password hashing/comparison and password response filtering implemented and locally tested.
- [x] Registration, login and explicitly educational logout implemented and locally tested.
- [x] All four mandatory post CRUD routes implemented and locally tested.
- [x] Postman v2.1 collection created, schema-validated and executed with Newman.
- [x] Safe .env.example, ignored local .env, node_modules ignore and lockfile included.
- [x] Original README, Windows/Atlas/Postman instructions and this evaluation guide completed.
- [x] Syntax, runtime, database integration, startup, dev restart and dependency checks completed.
- [x] Atlas-dependent limitations and exact GitHub submission instructions documented.
- [ ] Student creates/configures a real Atlas cluster and verifies the connection.
- [ ] Student runs the collection in Postman desktop and shows Atlas changes.
- [ ] Student publishes a separate PUBLIC GitHub repository and submits the real URL.

The remaining personal-account steps are: create/configure Atlas, put the real URI in local `.env`, run every request in Postman desktop, inspect Atlas changes, publish a separate public GitHub repository, and submit its actual URL. No database account or public repository is claimed to have been created for you.
