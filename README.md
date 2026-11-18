# Node.js, Express & MongoDB — Backend API Tutorial

## 1. Project Overview

`node-express-mongodb-api-lab` is a separate academic backend project for the assignment **Backend Tutorial (Node, Express and MongoDB)**. It registers users, verifies login credentials, and stores posts with create, read, update and delete operations. Postman sends requests; Express handles them; Mongoose communicates with MongoDB Atlas.

There is no frontend. Login checks a password but does not issue a token or create a session. Logout is an explicitly labelled demonstration. Post routes are accessible without logging in; this project does not implement authorization or ownership.

## 2. Assignment Objectives

- Create a Node.js project in its own Git repository and submit a separate public GitHub repository URL.
- Configure an online MongoDB Atlas database privately.
- Define User and Post schemas with Mongoose.
- Separate Express routes, controllers, models and database configuration.
- Implement and demonstrate all four CRUD operations using Postman desktop.
- Explain the source code and request flow during practical evaluation.

The source code and handoff files are provided here. Creating your Atlas account, testing against your own cluster in Postman desktop, and publishing the public GitHub repository require your own account actions. These steps are explained below.

## 3. Technologies Used

| Tool | Purpose |
| --- | --- |
| Node.js 22 or newer; Node.js 24 LTS recommended | Run JavaScript outside the browser |
| JavaScript ES Modules | Use `import` and `export` |
| Express 5 | HTTP server, JSON middleware and routes |
| MongoDB Atlas | Online document database |
| Mongoose 9 | Schemas, validation and database queries |
| bcrypt 6 | Hash and compare passwords |
| dotenv 18 | Read the private root `.env` file |
| nodemon 3 (development only) | Restart the server when code changes |
| Postman desktop | Manually test HTTP requests |
| Git and GitHub | Version control and public assignment submission |
| Node test runner and mongodb-memory-server (development only) | Repeatable tests using a disposable local MongoDB process |

Exact installed dependency versions are recorded in `package-lock.json`. `private: true` in package.json prevents accidental npm publishing; it does not prevent a public GitHub repository.

The package overrides update nodemon's development-only file watcher and pattern matcher to avoid dependency audit findings. The dev command watches JavaScript under `backend/src`; restart it manually after editing `.env`.

## 4. Features

- Case-normalized, trimmed usernames and emails, protected by unique database indexes.
- Password hashing before user saves, password comparison, and no password fields in user API responses.
- Passwords require at least 6 characters and at most 72 UTF-8 bytes, matching bcrypt's input limit. Password whitespace is preserved.
- Username length: 1–30; allowed characters: letters, digits, dots, underscores and hyphens. Email must have a reasonable email format and be at most 254 characters.
- Posts contain `name`, `description`, `age` and automatic timestamps. Name is limited to 100 characters, description to 2,000, and age to 1–150. Age must be a JSON number.
- Updates accept only those three post fields and run Mongoose validators.
- JSON error responses, strict ObjectId checks, safe startup failure, and database connection before HTTP listening.

## 5. Project Folder Structure

```text
node-express-mongodb-api-lab/
├── backend/
│   └── src/
│       ├── config/database.js
│       ├── controllers/
│       │   ├── user.controller.js
│       │   └── post.controller.js
│       ├── middleware/error-handler.js
│       ├── models/
│       │   ├── user.model.js
│       │   └── post.model.js
│       ├── routes/
│       │   ├── user.route.js
│       │   └── post.route.js
│       ├── app.js
│       └── index.js
├── postman/Backend-Tutorial.postman_collection.json
├── test/api.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

The locally created `.env` and installed `node_modules/` directory are ignored by Git. The small shared error handler avoids repeating error formatting. The test file verifies the database-backed behavior without adding complexity to the application.

## 6. Prerequisites

Install [Node.js](https://nodejs.org/en/download) with npm, [Git for Windows](https://git-scm.com/downloads/win), [VS Code](https://code.visualstudio.com/), and [Postman desktop](https://www.postman.com/downloads/). Node.js 24 is an LTS release; check the official [release list](https://nodejs.org/en/about/previous-releases) when installing. You also need internet access, an Atlas account and a GitHub account.

Open a new PowerShell terminal after installing tools and check:

```powershell
node --version
npm.cmd --version
git --version
```

The `.cmd` suffix uses the Windows npm command directly if PowerShell blocks `npm.ps1`. Plain `npm` also works when your PowerShell configuration permits it.

## 7. Installation and Setup

1. Open VS Code, choose **File > Open Folder**, and select `node-express-mongodb-api-lab` inside `C:\Users\LENOVO\Desktop\new_backend`.
2. Choose **Terminal > New Terminal**. Its current directory should contain `package.json`.
3. Install the versions from the lockfile and create your private environment file:

```powershell
cd C:\Users\LENOVO\Desktop\new_backend\node-express-mongodb-api-lab
npm.cmd ci
Copy-Item .env.example .env
```

Run the copy command only when `.env` does not already exist; otherwise open your existing file. `npm install` is also available when intentionally changing dependencies. The development test package may download a MongoDB executable during installation or the first test run; allow time and internet access for that download.

4. Click `.env` in VS Code and replace only its placeholder URI with the real Atlas URI, following the next section. Keep it local. Do not paste the secret into chat, screenshots or GitHub.

## 8. MongoDB Atlas Configuration

Atlas labels may vary as its interface changes. These steps follow the official [free-cluster guide](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/) and [application-connection guide](https://www.mongodb.com/docs/atlas/driver-connection/).

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), choose **Sign Up**, verify your account, and sign in. Complete the welcome questions.
2. Select or create an organization and a project. Use a separate project such as `Backend API Lab` if needed.
3. From **Project Overview** or **Database > Clusters**, choose **Create** / **Build a Database**. Select **Free / M0** if available, choose a supported provider and nearby region, name the cluster, and create it. Check that the selected tier is free before proceeding.
4. In the security setup, create a **database user** and a private password. If the wizard has already closed, open **Security > Database Access > Add New Database User**. Choose password authentication. For this lab, use the available read/write database role (for example **Read and write to any database**) and create the user. These are database credentials, separate from your Atlas website login. The distinction is explained in [Atlas database-user documentation](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/).
5. In **Security > Network Access**, choose **Add IP Address > Add Current IP Address > Confirm**. The wizard may call it **Add My Current IP Address**. Allow your current public IP; update the entry when you change networks. Atlas requires the connecting IP to be allowed in the [IP access list](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/).
6. Open your cluster, click **Connect**, choose **Drivers** (or **Connect your application**), and select **Node.js**. Copy the supplied connection string.
7. In the local `.env` file, replace the URI's username/password placeholders with your **database user's** values. Remove placeholder angle brackets. If a password has reserved URI characters such as `@`, `#`, `/` or `%`, percent-encode those characters in the URI. For example `@` becomes `%40`; do this privately, not in an online encoder.
8. Set the database path to `api_lab` immediately after the cluster hostname slash and before any `?` query parameters. Preserve the actual hostname and supplied query parameters. For an already supplied database name, replace that path rather than adding another slash.
9. Save `.env` and start the server. After registration or post creation, open **Browse Collections** / **Data Explorer**, choose `api_lab`, and refresh `users` or `posts` to inspect the changes. The database and collections appear as they are first created or written; a separate manual collection setup is not needed.

## 9. Environment Variables

The committed `.env.example` contains only:

```dotenv
PORT=8000
MONGODB_URI=your_mongodb_atlas_connection_string
```

Replace the placeholder in your private `.env` with the URI copied from Atlas. `PORT` is optional and defaults to 8000. If supplied, it must be an integer from 1 to 65535. The URI must begin with `mongodb+srv://` or `mongodb://`. The entry point resolves `.env` relative to the project so it is always the root environment file.

The connection module reads `process.env.MONGODB_URI` and calls `mongoose.connect()`. Errors never print the URI. The HTTP server starts only after a successful database connection and user index initialization.

## 10. Running the Server

For normal execution:

```powershell
npm.cmd start
```

During editing:

```powershell
npm.cmd run dev
```

After a real connection succeeds, expect:

```text
MongoDB connected successfully.
Server running at http://localhost:8000
```

These are expected messages, not a claim that your Atlas cluster has already been connected. Open `http://localhost:8000/` to see the JSON health response. Keep the terminal open. Stop with **Ctrl+C**. Do not run both start commands together on the same port.

Run the automated checks separately:

```powershell
npm.cmd test
```

Tests launch their own disposable local MongoDB process and a temporary HTTP port. They do not read your Atlas data or need your Atlas password. They may download MongoDB on first use. They do not replace the assignment's Postman desktop demonstration.

## 11. API Endpoints

Base URL: `http://localhost:8000`

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/` | Server health | 200 |
| POST | `/api/v1/users/register` | Create a user | 201 |
| POST | `/api/v1/users/login` | Verify credentials | 200 |
| POST | `/api/v1/users/logout` | Logout demonstration | 200 |
| POST | `/api/v1/posts/create` | Create a post | 201 |
| GET | `/api/v1/posts/getPosts` | Return all posts as an array | 200 |
| PATCH | `/api/v1/posts/update/:id` | Update supplied post fields | 200 |
| DELETE | `/api/v1/posts/delete/:id` | Delete a post | 200 |

Use the paths exactly as written. This assignment preserves the tutorial's action-style route names while using HTTP methods for the operations.

## 12. Sample API Requests

For requests with a body, set **Body > raw > JSON** in Postman and use `Content-Type: application/json`. All account values below are invented examples.

**Register:** `POST http://localhost:8000/api/v1/users/register`

```json
{
  "username": "studentdemo",
  "email": "student@example.com",
  "password": "DemoPass123!"
}
```

Response shape: `{ "message": "User registered.", "user": { "_id": "...", "username": "studentdemo", "email": "student@example.com", "createdAt": "...", "updatedAt": "..." } }`. This is an illustrative shape; real IDs and timestamps are generated by MongoDB/Mongoose.

**Login:** `POST http://localhost:8000/api/v1/users/login`

```json
{
  "email": "student@example.com",
  "password": "DemoPass123!"
}
```

**Logout:** `POST http://localhost:8000/api/v1/users/logout`, with no body. Its message explains that there is no session or token to invalidate.

**Create:** `POST http://localhost:8000/api/v1/posts/create`

```json
{
  "name": "Backend Learning",
  "description": "My first MongoDB API project",
  "age": 20
}
```

Response shape: `{ "message": "Post created.", "post": { "_id": "...", "name": "Backend Learning", "description": "My first MongoDB API project", "age": 20, "createdAt": "...", "updatedAt": "...", "__v": 0 } }`. Copy the actual `post._id`.

**Read:** `GET http://localhost:8000/api/v1/posts/getPosts`, with no body. It returns an array such as `[]` or `[ { "_id": "...", "name": "Backend Learning", "description": "...", "age": 20, "createdAt": "...", "updatedAt": "...", "__v": 0 } ]`.

**Update:** `PATCH http://localhost:8000/api/v1/posts/update/ACTUAL_POST_ID`

```json
{
  "description": "Updated using Postman"
}
```

Replace `ACTUAL_POST_ID` with the actual 24-character hexadecimal ID, or use `{{postId}}` in the collection. The response includes the updated `post` with unchanged fields preserved.

**Delete:** `DELETE http://localhost:8000/api/v1/posts/delete/ACTUAL_POST_ID`, with no body. The response contains `message` and `postId`. Reading again confirms removal; deleting that ID again returns 404.

## 13. CRUD Operations

| Operation | HTTP method | Controller | Mongoose operation |
| --- | --- | --- | --- |
| Create | POST | `createPost` | `Post.create()` |
| Read | GET | `getPosts` | `Post.find()` |
| Update | PATCH | `updatePost` | `Post.findByIdAndUpdate()` with `runValidators: true` |
| Delete | DELETE | `deletePost` | `Post.findByIdAndDelete()` |

`PATCH` changes only supplied fields. The controller checks input types and allowed names, then Mongoose checks schema rules. A malformed ObjectId is 400; a well-formed ID with no document is 404. The unique User indexes enforce uniqueness even when registration requests arrive at the same time.

## 14. Postman Testing

1. Start the server with a working Atlas configuration and keep its terminal open.
2. Open **Postman desktop** and a workspace. Choose **Import** (in newer versions, **Use resources or import > Import**), select `postman/Backend-Tutorial.postman_collection.json`, and confirm. You can also drag the file into the import window. See the official [Postman import guide](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data/).
3. Open the imported collection's **Variables**. Keep `baseUrl` at `http://localhost:8000`, without a trailing slash. Leave `postId` blank initially. Save any edits. Avoid an environment variable with the same name overriding the collection value.
4. Open **1. Register User**, then click **Send**. Expect 201. If it is already registered, 409 is correct: change both username and email for another registration, save, and use that email in Login.
5. Send **2. Login User**. Expect 200 and no password. Try a different password of at least six characters and expect 401; then restore the valid example.
6. Send **3. Logout User**. Expect 200 and the demonstration message.
7. Send **4. Create Post**. Expect 201. Its post-response script automatically saves the returned `post._id` into `postId`.
8. Send **5. Get All Posts**. Expect 200 and a JSON array containing your post.
9. Send **6. Update Post**. Expect 200 and the new description. Send Get All Posts again to see that it persisted.
10. Send **7. Delete Post**. Expect 200. Send Get All Posts again and check that this post is gone. Other posts, if any, remain.
11. Refresh Atlas collections after creating, updating and deleting. Inspect a user record privately to see the bcrypt hash, and show that responses omit it.
12. Review **Test Results** / **Scripts > Post-response**. A first successful run should pass the included status and response checks. Re-running Register or Delete has different expected statuses; these checks are designed for a fresh run in order.

If the ID was not saved automatically, copy `_id` from Create Post's nested `post` object, set the collection's `postId` variable to that value, and save. It is the post ID, not the registered user's ID.

Additional manual checks: empty body → 400; age 151 → 400; update with `{}` → 400; update/delete using `bad-id` → 400; valid but nonexistent ID → 404; duplicate username/email → 409; wrong route or HTTP method → 404. Do not intentionally break the database just to produce a 500 during evaluation.

## 15. Expected HTTP Status Codes

| Code | Meaning in this project |
| --- | --- |
| 200 | Successful health, login, logout, read, update or delete |
| 201 | User or post created |
| 400 | Missing/invalid input, malformed JSON, oversized body or invalid ObjectId |
| 401 | Well-formed login input with wrong email/password |
| 404 | Unknown route or a post does not exist |
| 409 | Duplicate username or email |
| 500 | Unexpected server/database failure; details remain private |

Errors have a `message`; schema validation errors also list affected field names in `fields`. They do not return raw database errors, supplied passwords or stack traces.

## 16. Important Concepts Learned

Routes map URLs and HTTP methods to controller functions. Controllers validate input and choose responses. Models describe documents and perform database operations. Middleware parses JSON or handles errors. `async`/`await` waits for database work without treating it as an immediate value. `bcrypt.hash()` makes a salted password hash; `bcrypt.compare()` verifies a candidate without decrypting anything.

Request flow:

```text
Postman → Express route → Controller → Mongoose model → MongoDB Atlas
        ← JSON response ← Controller ← Database result ←
```

## 17. Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` / `npm` not recognized | Install Node.js with npm and reopen VS Code and its terminal |
| PowerShell blocks `npm.ps1` | Use `npm.cmd` as in this guide; no policy change is needed |
| `ERR_MODULE_NOT_FOUND` | Open the folder containing package.json and run `npm.cmd ci` |
| Startup fails with the placeholder URI | Edit the root `.env`, save the actual Atlas URI, then restart |
| Atlas authentication fails | Use the database user's credentials, remove `< >`, and encode reserved password characters |
| Atlas timeout / DNS failure | Check internet, cluster availability, the exact Atlas hostname and your current public IP access entry |
| Port already in use | Stop the other server with Ctrl+C or change PORT and Postman's baseUrl to the same new port |
| Invalid ObjectId | Copy `post._id` from Create Post; do not use an example ID or a user ID |
| Postman 404 | Check HTTP method, port, full path and whether postId refers to a document that still exists |
| Postman 400 | Choose raw JSON, check quotes/commas and field types; use an unquoted numeric age |
| Postman 409 | Use a new username and email or log in to the existing account |
| Unexpected 500 | Check the server terminal and Atlas availability; do not publish your `.env` while asking for help |
| Test executable download fails | Check access to MongoDB download servers and retry `npm.cmd test`; do not disable TLS verification |

### Publish a separate public GitHub repository

This project uses its own Git history, independent of the learning reference. There is no claimed public URL until you publish it. GitHub CLI is not available in the inspected environment, so use the website and Git commands:

1. Sign in to [GitHub](https://github.com/), click **+ > New repository**, name it `node-express-mongodb-api-lab`, and choose **Public**. Leave the README, .gitignore and license initialization options unchecked because the local project already contains its files. Click **Create repository**.
2. In the project's PowerShell terminal, review and commit your files:

```powershell
git status
git check-ignore .env node_modules/
git add .
git diff --cached --name-only
git commit -m "Implement backend tutorial assignment"
git branch -M main
```

If there is already an initial local commit and Git reports nothing to commit, continue. Confirm that `.env` and `node_modules` are absent from staged files. `package-lock.json`, `.env.example` and the Postman collection should be included. If Git requests your identity, set your own name and email for this repository (not globally):

```powershell
git config user.name "YOUR NAME"
git config user.email "YOUR GITHUB EMAIL OR NOREPLY ADDRESS"
git commit -m "Implement backend tutorial assignment"
```

3. Replace `YOUR_GITHUB_USERNAME` below with your account name. These are templates, not an existing submission URL:

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/node-express-mongodb-api-lab.git
git push -u origin main
```

Complete Git's browser sign-in if prompted. If origin already exists, inspect it with `git remote -v` and set the intended new repository with `git remote set-url origin ...` instead of adding it again. Do not use your GitHub account password as a Git HTTPS password; use the browser/Git Credential Manager flow.

4. Refresh the repository page, check that it says **Public**, verify all expected files are visible and `.env` is absent, and submit the actual repository URL from your browser. Opening the URL in a signed-out/incognito browser verifies public access.

## 18. Tutorial Reference

Learning credit: freeCodeCamp's [Intro to Backend Web Development – Node.js & Express Tutorial for Beginners](https://www.youtube.com/watch?v=KOutPbKc9UM). The assignment's [reference repository](https://github.com/akhil78-bit/backend-tutorial) was inspected to understand its scope and file organization. The video page was accessible, but its playback/transcript was not available for detailed inspection in this environment.

The reference uses separate config, models, controllers and routes under `backend/src`, with user registration/login/logout and post CRUD. This implementation preserves that organization, field contract and seven required API paths. It independently implements validation, duplicate handling, error responses and documentation. It also adds update validation, strict ID checks, password response filtering and an honest demonstration-only logout message. No reference Git history or source files were used as the starting codebase.
