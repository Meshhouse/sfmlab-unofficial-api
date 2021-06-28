# Getting started

Clone repository to your server

```bash
git clone https://github.com/Meshhouse/sfmlab-unofficial-api.git
```

Navigate to cloned folder and install dependencies

```bash
npm install
```

Create .env file in repository root folder with contents:

```
SFMLAB_LOGIN=<your_login>
SFMLAB_PASSWORD=<your_password>
PORT=8000
HOST=0.0.0.0
RESCAN=full
THREADS=4
```

Build API server

```bash
npm run build
```

Run full rescan at least one time (one for each site)

```bash
npm run rescan:sfmlab
npm run rescan:smutbase
npm run rescan:open3dlab
```

After rescanning run server

```bash
npm run start
```